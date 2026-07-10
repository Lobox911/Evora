-- =============================================================
-- EVORA — Event Ticketing Platform
-- Neon PostgreSQL Schema v1
-- Run this in the Neon SQL Editor (production/primary branch)
-- =============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- gen_random_uuid()

-- =============================================================
-- ENUMS
-- =============================================================
CREATE TYPE event_status    AS ENUM ('draft', 'active', 'completed', 'cancelled');
CREATE TYPE tier_status     AS ENUM ('available', 'sold_out', 'paused', 'hidden');
CREATE TYPE order_status    AS ENUM ('pending', 'paid', 'failed', 'refunded', 'partially_refunded');
CREATE TYPE ticket_status   AS ENUM ('valid', 'checked_in', 'refunded', 'void');
CREATE TYPE payout_status   AS ENUM ('requested', 'processing', 'completed', 'failed');
CREATE TYPE scan_result     AS ENUM ('success', 'already_checked_in', 'refunded', 'invalid', 'wrong_event');
CREATE TYPE member_role     AS ENUM ('owner', 'admin', 'staff', 'scanner');

-- =============================================================
-- ORGANIZATIONS & USERS (Clerk handles auth; we mirror users)
-- =============================================================
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id      TEXT UNIQUE NOT NULL,           -- Clerk user ID (user_xxx)
  email         TEXT UNIQUE NOT NULL,
  full_name     TEXT,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE organizations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,           -- evora.com/o/{slug}
  logo_url      TEXT,
  -- Payments
  stripe_account_id TEXT,                       -- Stripe Connect acct (future)
  default_currency  CHAR(3) NOT NULL DEFAULT 'USD',
  -- Plan (maps to PricingPage tiers)
  plan          TEXT NOT NULL DEFAULT 'free',   -- free | pro | scale
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE organization_members (
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role            member_role NOT NULL DEFAULT 'staff',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (organization_id, user_id)
);

-- =============================================================
-- EVENTS & TICKET TIERS
-- =============================================================
CREATE TABLE events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  subtitle      TEXT,
  description   TEXT,
  slug          TEXT NOT NULL,                  -- /events/{slug}
  -- Real timestamps (replaces the old display-string date/time)
  starts_at     TIMESTAMPTZ NOT NULL,
  ends_at       TIMESTAMPTZ,
  timezone      TEXT NOT NULL DEFAULT 'America/Los_Angeles',
  -- Location
  venue_name    TEXT,
  address       TEXT,
  city          TEXT,
  country       TEXT,
  is_online     BOOLEAN NOT NULL DEFAULT FALSE,
  online_url    TEXT,
  -- Media & discovery
  cover_image_url TEXT,
  tags          TEXT[] NOT NULL DEFAULT '{}',
  status        event_status NOT NULL DEFAULT 'draft',
  currency      CHAR(3) NOT NULL DEFAULT 'USD',
  published_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organization_id, slug)
);

CREATE INDEX idx_events_org       ON events(organization_id);
CREATE INDEX idx_events_status    ON events(status) WHERE status = 'active';
CREATE INDEX idx_events_starts_at ON events(starts_at);

CREATE TABLE ticket_tiers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id      UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  description   TEXT,
  -- Money stored in minor units (cents) to avoid float bugs
  price_cents   INTEGER NOT NULL CHECK (price_cents >= 0),
  capacity      INTEGER NOT NULL CHECK (capacity > 0),
  sold_count    INTEGER NOT NULL DEFAULT 0 CHECK (sold_count >= 0),
  max_per_order INTEGER NOT NULL DEFAULT 10,
  status        tier_status NOT NULL DEFAULT 'available',
  sales_start   TIMESTAMPTZ,
  sales_end     TIMESTAMPTZ,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (sold_count <= capacity)                -- DB-level oversell protection
);

CREATE INDEX idx_tiers_event ON ticket_tiers(event_id);

-- =============================================================
-- ORDERS & TICKETS (the checkout flow)
-- =============================================================
CREATE TABLE orders (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id      UUID NOT NULL REFERENCES events(id) ON DELETE RESTRICT,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  -- Buyer (guest checkout supported: user_id nullable)
  user_id       UUID REFERENCES users(id) ON DELETE SET NULL,
  buyer_name    TEXT NOT NULL,
  buyer_email   TEXT NOT NULL,
  -- Money
  subtotal_cents INTEGER NOT NULL DEFAULT 0,
  fees_cents     INTEGER NOT NULL DEFAULT 0,
  total_cents    INTEGER NOT NULL DEFAULT 0,
  currency       CHAR(3) NOT NULL DEFAULT 'USD',
  status         order_status NOT NULL DEFAULT 'pending',
  -- Stripe
  stripe_checkout_session_id TEXT UNIQUE,
  stripe_payment_intent_id   TEXT,
  refunded_cents INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at       TIMESTAMPTZ,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_event  ON orders(event_id);
CREATE INDEX idx_orders_email  ON orders(buyer_email);
CREATE INDEX idx_orders_status ON orders(status);

-- One row per individual ticket (replaces the old "Attendee")
CREATE TABLE tickets (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  event_id      UUID NOT NULL REFERENCES events(id) ON DELETE RESTRICT,
  tier_id       UUID NOT NULL REFERENCES ticket_tiers(id) ON DELETE RESTRICT,
  -- Attendee info (can differ from buyer for multi-ticket orders)
  attendee_name  TEXT NOT NULL,
  attendee_email TEXT NOT NULL,
  price_cents    INTEGER NOT NULL,
  status         ticket_status NOT NULL DEFAULT 'valid',
  -- QR security: server-generated random secret, HMAC-signed in the QR payload.
  -- Never expose qr_secret to the client; only the signed token.
  qr_secret      TEXT NOT NULL DEFAULT encode(gen_random_bytes(24), 'hex'),
  checked_in_at  TIMESTAMPTZ,
  checked_in_by  UUID REFERENCES users(id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tickets_event  ON tickets(event_id);
CREATE INDEX idx_tickets_order  ON tickets(order_id);
CREATE INDEX idx_tickets_email  ON tickets(attendee_email);
CREATE INDEX idx_tickets_status ON tickets(event_id, status);

-- =============================================================
-- CHECK-IN / SCAN LOGS
-- =============================================================
CREATE TABLE scan_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id      UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  ticket_id     UUID REFERENCES tickets(id) ON DELETE SET NULL,
  scanned_by    UUID REFERENCES users(id) ON DELETE SET NULL,
  result        scan_result NOT NULL,
  raw_payload   TEXT,                           -- what the QR actually contained
  scanned_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_scans_event ON scan_logs(event_id, scanned_at DESC);

-- =============================================================
-- PAYOUTS
-- =============================================================
CREATE TABLE payouts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  amount_cents  INTEGER NOT NULL CHECK (amount_cents > 0),
  currency      CHAR(3) NOT NULL DEFAULT 'USD',
  bank_account_last4 TEXT,                      -- display only; real details live in Stripe
  status        payout_status NOT NULL DEFAULT 'requested',
  requested_by  UUID REFERENCES users(id),
  requested_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at  TIMESTAMPTZ,
  notes         TEXT
);

CREATE INDEX idx_payouts_org ON payouts(organization_id, requested_at DESC);

-- =============================================================
-- WEBHOOK EVENT LOG (idempotency for Stripe webhooks)
-- =============================================================
CREATE TABLE webhook_events (
  id            TEXT PRIMARY KEY,               -- Stripe event ID (evt_xxx)
  type          TEXT NOT NULL,
  processed_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================
-- updated_at auto-touch trigger
-- =============================================================
CREATE OR REPLACE FUNCTION touch_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['users','organizations','events','ticket_tiers','orders','tickets']
  LOOP
    EXECUTE format(
      'CREATE TRIGGER trg_%s_touch BEFORE UPDATE ON %I
       FOR EACH ROW EXECUTE FUNCTION touch_updated_at()', t, t);
  END LOOP;
END $$;

-- =============================================================
-- ATOMIC TICKET RESERVATION (call inside checkout, prevents oversell)
-- Usage: SELECT reserve_tickets('tier-uuid', 2);
-- Returns TRUE if reserved, FALSE if not enough capacity.
-- =============================================================
CREATE OR REPLACE FUNCTION reserve_tickets(p_tier_id UUID, p_qty INTEGER)
RETURNS BOOLEAN AS $$
DECLARE updated INTEGER;
BEGIN
  UPDATE ticket_tiers
  SET sold_count = sold_count + p_qty,
      status = CASE WHEN sold_count + p_qty >= capacity THEN 'sold_out'::tier_status ELSE status END
  WHERE id = p_tier_id
    AND status = 'available'
    AND sold_count + p_qty <= capacity;
  GET DIAGNOSTICS updated = ROW_COUNT;
  RETURN updated = 1;
END;
$$ LANGUAGE plpgsql;

-- Release on failed/expired checkout or refund:
CREATE OR REPLACE FUNCTION release_tickets(p_tier_id UUID, p_qty INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE ticket_tiers
  SET sold_count = GREATEST(sold_count - p_qty, 0),
      status = CASE WHEN status = 'sold_out' THEN 'available'::tier_status ELSE status END
  WHERE id = p_tier_id;
END;
$$ LANGUAGE plpgsql;
