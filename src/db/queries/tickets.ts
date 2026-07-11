import { db } from '@/db';
import { tickets, orders, scanLogs, ticketTiers } from '@/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

// ---- Orders ----
export async function createOrder(data: typeof orders.$inferInsert) {
  const rows = await db.insert(orders).values(data).returning();
  return rows[0];
}

export async function getOrderById(id: string) {
  const rows = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function updateOrderStatus(
  id: string,
  status: 'paid' | 'failed' | 'refunded',
  extra?: Partial<typeof orders.$inferInsert>
) {
  return db
    .update(orders)
    .set({ status, ...extra })
    .where(eq(orders.id, id))
    .returning();
}

// ---- Tickets ----
export async function createTicket(data: typeof tickets.$inferInsert) {
  const rows = await db.insert(tickets).values(data).returning();
  return rows[0];
}

export async function getTicketById(id: string) {
  const rows = await db.select().from(tickets).where(eq(tickets.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getTicketsByEvent(eventId: string) {
  return db
    .select()
    .from(tickets)
    .where(eq(tickets.eventId, eventId))
    .orderBy(desc(tickets.createdAt));
}

export async function getTicketsByEmail(email: string) {
  return db
    .select()
    .from(tickets)
    .where(eq(tickets.attendeeEmail, email))
    .orderBy(desc(tickets.createdAt));
}

export async function checkInTicket(ticketId: string, scannedBy: string) {
  const ticket = await getTicketById(ticketId);
  if (!ticket) return { success: false, reason: 'invalid' as const };
  if (ticket.status === 'checked_in') return { success: false, reason: 'already_checked_in' as const };
  if (ticket.status === 'refunded') return { success: false, reason: 'refunded' as const };
  if (ticket.status === 'void') return { success: false, reason: 'invalid' as const };

  await db
    .update(tickets)
    .set({ status: 'checked_in', checkedInAt: new Date(), checkedInBy: scannedBy })
    .where(eq(tickets.id, ticketId));

  return { success: true, ticket };
}

// ---- Tier Reservation (atomic) ----
export async function reserveTierCapacity(tierId: string, qty: number) {
  const result = await db.execute(
    sql`SELECT reserve_tickets(${tierId}::uuid, ${qty}::integer) as reserved`
  );
  const rows = (result as any).rows ?? result;
  return rows?.[0]?.reserved === true;
}

export async function releaseTierCapacity(tierId: string, qty: number) {
  await db.execute(sql`SELECT release_tickets(${tierId}::uuid, ${qty}::integer)`);
}

// ---- Scan Logs ----
export async function addScanLog(data: typeof scanLogs.$inferInsert) {
  const rows = await db.insert(scanLogs).values(data).returning();
  return rows[0];
}

export async function getScanLogsByEvent(eventId: string, limit = 50) {
  return db
    .select()
    .from(scanLogs)
    .where(eq(scanLogs.eventId, eventId))
    .orderBy(desc(scanLogs.scannedAt))
    .limit(limit);
}

// ---- Stats ----
export async function getEventStats(eventId: string) {
  const tiers = await db
    .select()
    .from(ticketTiers)
    .where(eq(ticketTiers.eventId, eventId));

  const totalCapacity = tiers.reduce((s, t) => s + t.capacity, 0);
  const totalSold = tiers.reduce((s, t) => s + t.soldCount, 0);

  const ticketRows = await db
    .select()
    .from(tickets)
    .where(eq(tickets.eventId, eventId));

  const checkedIn = ticketRows.filter((t) => t.status === 'checked_in').length;
  const revenue = ticketRows
    .filter((t) => t.status !== 'refunded')
    .reduce((s, t) => s + t.priceCents, 0);

  return { totalCapacity, totalSold, checkedIn, revenue, tiers, ticketCount: ticketRows.length };
}
