# Evora

A premium, white-label event ticketing platform. Organizers create fully branded event pages, sell tiered tickets, manage attendees, track payouts, and check guests in with QR scanning.

## Stack

- **Next.js 14** (App Router) + TypeScript
- **Neon PostgreSQL** + Drizzle ORM
- **Clerk** — authentication & organizations
- **Stripe** — checkout & webhooks
- **Resend** — ticket delivery emails
- **Tailwind CSS 4** + Motion — Swiss/minimalist design system

## Getting Started

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in your keys
3. Run `evora-schema.sql` in the Neon SQL Editor (primary branch)
4. `npm run dev`

## Scripts

- `npm run dev` — local dev server
- `npm run build` — production build
- `npm run lint` — TypeScript check
- `npm run db:studio` — Drizzle Studio (browse your DB)
