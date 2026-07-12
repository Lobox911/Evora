import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  char,
  primaryKey,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// ---------- Enums ----------
export const eventStatus = pgEnum('event_status', ['draft', 'active', 'completed', 'cancelled']);
export const tierStatus = pgEnum('tier_status', ['available', 'sold_out', 'paused', 'hidden']);
export const orderStatus = pgEnum('order_status', ['pending', 'paid', 'failed', 'refunded', 'partially_refunded']);
export const ticketStatus = pgEnum('ticket_status', ['valid', 'checked_in', 'refunded', 'void']);
export const payoutStatus = pgEnum('payout_status', ['requested', 'processing', 'completed', 'failed']);
export const scanResult = pgEnum('scan_result', ['success', 'already_checked_in', 'refunded', 'invalid', 'wrong_event']);
export const memberRole = pgEnum('member_role', ['owner', 'admin', 'staff', 'scanner']);

// ---------- Users & Organizations ----------
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkId: text('clerk_id').notNull().unique(),
  email: text('email').notNull().unique(),
  fullName: text('full_name'),
  avatarUrl: text('avatar_url'),
  isPlatformAdmin: boolean('is_platform_admin').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  logoUrl: text('logo_url'),
  paystackPublicKey: text('paystack_public_key'),
  paystackSecretKey: text('paystack_secret_key'),
  defaultCurrency: char('default_currency', { length: 3 }).notNull().default('NGN'),
  plan: text('plan').notNull().default('free'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const organizationMembers = pgTable(
  'organization_members',
  {
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: memberRole('role').notNull().default('staff'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.organizationId, t.userId] })]
);

// ---------- Events & Tiers ----------
export const events = pgTable(
  'events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    subtitle: text('subtitle'),
    description: text('description'),
    slug: text('slug').notNull(),
    startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
    endsAt: timestamp('ends_at', { withTimezone: true }),
    timezone: text('timezone').notNull().default('America/Los_Angeles'),
    venueName: text('venue_name'),
    address: text('address'),
    city: text('city'),
    country: text('country'),
    isOnline: boolean('is_online').notNull().default(false),
    onlineUrl: text('online_url'),
    coverImageUrl: text('cover_image_url'),
    tags: text('tags').array().notNull().default(sql`'{}'`),
    status: eventStatus('status').notNull().default('draft'),
    currency: char('currency', { length: 3 }).notNull().default('NGN'),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('uq_events_org_slug').on(t.organizationId, t.slug),
    index('ix_events_starts_at').on(t.startsAt),
  ]
);

export const ticketTiers = pgTable(
  'ticket_tiers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    eventId: uuid('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description'),
    priceCents: integer('price_cents').notNull(),
    capacity: integer('capacity').notNull(),
    soldCount: integer('sold_count').notNull().default(0),
    maxPerOrder: integer('max_per_order').notNull().default(10),
    status: tierStatus('status').notNull().default('available'),
    salesStart: timestamp('sales_start', { withTimezone: true }),
    salesEnd: timestamp('sales_end', { withTimezone: true }),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    perks: text('perks').array().notNull().default(sql`'{}'`),
  },
  (t) => [index('ix_tiers_event').on(t.eventId)]
);

// ---------- Orders & Tickets ----------
export const orders = pgTable(
  'orders',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    eventId: uuid('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'restrict' }),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'restrict' }),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
    buyerName: text('buyer_name').notNull(),
    buyerEmail: text('buyer_email').notNull(),
    subtotalCents: integer('subtotal_cents').notNull().default(0),
    feesCents: integer('fees_cents').notNull().default(0),
    totalCents: integer('total_cents').notNull().default(0),
    currency: char('currency', { length: 3 }).notNull().default('NGN'),
    status: orderStatus('status').notNull().default('pending'),
    paystackReference: text('paystack_reference').unique(),
    paystackAccessCode: text('paystack_access_code'),
    refundedCents: integer('refunded_cents').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    paidAt: timestamp('paid_at', { withTimezone: true }),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('ix_orders_event').on(t.eventId), index('ix_orders_email').on(t.buyerEmail)]
);

export const tickets = pgTable(
  'tickets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    eventId: uuid('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'restrict' }),
    tierId: uuid('tier_id')
      .notNull()
      .references(() => ticketTiers.id, { onDelete: 'restrict' }),
    attendeeName: text('attendee_name').notNull(),
    attendeeEmail: text('attendee_email').notNull(),
    priceCents: integer('price_cents').notNull(),
    status: ticketStatus('status').notNull().default('valid'),
    qrSecret: text('qr_secret')
      .notNull()
      .default(sql`encode(gen_random_bytes(24), 'hex')`),
    checkedInAt: timestamp('checked_in_at', { withTimezone: true }),
    checkedInBy: uuid('checked_in_by').references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('ix_tickets_event').on(t.eventId),
    index('ix_tickets_order').on(t.orderId),
    index('ix_tickets_email').on(t.attendeeEmail),
  ]
);

// ---------- Scan Logs & Payouts ----------
export const scanLogs = pgTable(
  'scan_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    eventId: uuid('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    ticketId: uuid('ticket_id').references(() => tickets.id, { onDelete: 'set null' }),
    scannedBy: uuid('scanned_by').references(() => users.id, { onDelete: 'set null' }),
    result: scanResult('result').notNull(),
    rawPayload: text('raw_payload'),
    scannedAt: timestamp('scanned_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('ix_scans_event').on(t.eventId, t.scannedAt)]
);

export const payouts = pgTable('payouts', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  amountCents: integer('amount_cents').notNull(),
  currency: char('currency', { length: 3 }).notNull().default('NGN'),
  bankAccountLast4: text('bank_account_last4'),
  status: payoutStatus('status').notNull().default('requested'),
  requestedBy: uuid('requested_by').references(() => users.id),
  requestedAt: timestamp('requested_at', { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  notes: text('notes'),
});

export const webhookEvents = pgTable('webhook_events', {
  id: text('id').primaryKey(),
  type: text('type').notNull(),
  processedAt: timestamp('processed_at', { withTimezone: true }).notNull().defaultNow(),
});
