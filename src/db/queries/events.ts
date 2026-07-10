import { db } from '@/db';
import { events, ticketTiers } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function getActiveEvents() {
  return db
    .select()
    .from(events)
    .where(eq(events.status, 'active'))
    .orderBy(desc(events.startsAt));
}

export async function getEventBySlug(slug: string) {
  const rows = await db
    .select()
    .from(events)
    .where(eq(events.slug, slug))
    .limit(1);
  return rows[0] ?? null;
}

export async function getEventById(id: string) {
  const rows = await db
    .select()
    .from(events)
    .where(eq(events.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function getEventsByOrg(orgId: string) {
  return db
    .select()
    .from(events)
    .where(eq(events.organizationId, orgId))
    .orderBy(desc(events.createdAt));
}

export async function getTiersForEvent(eventId: string) {
  return db
    .select()
    .from(ticketTiers)
    .where(eq(ticketTiers.eventId, eventId))
    .orderBy(ticketTiers.sortOrder);
}

export async function createEvent(data: typeof events.$inferInsert) {
  const rows = await db.insert(events).values(data).returning();
  return rows[0];
}

export async function updateEvent(
  id: string,
  orgId: string,
  data: Partial<typeof events.$inferInsert>
) {
  const rows = await db
    .update(events)
    .set(data)
    .where(and(eq(events.id, id), eq(events.organizationId, orgId)))
    .returning();
  return rows[0] ?? null;
}
