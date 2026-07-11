import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, tickets, ticketTiers } from '@/db/schema';
import { getEventById, getTiersForEvent } from '@/db/queries/events';
import { reserveTierCapacity, releaseTierCapacity } from '@/db/queries/tickets';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { eventId, buyerName, buyerEmail, items } = body;

  // items = [{ tierId: string, quantity: number }]
  if (!eventId || !buyerName || !buyerEmail || !items?.length) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const event = await getEventById(eventId);
  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

  const tiers = await getTiersForEvent(eventId);

  // Validate and calculate totals
  let subtotalCents = 0;
  const validatedItems: { tier: typeof tiers[0]; quantity: number }[] = [];

  for (const item of items) {
    const tier = tiers.find((t) => t.id === item.tierId);
    if (!tier) return NextResponse.json({ error: `Tier ${item.tierId} not found` }, { status: 400 });
    if (item.quantity < 1 || item.quantity > tier.maxPerOrder) {
      return NextResponse.json({ error: `Invalid quantity for ${tier.name}` }, { status: 400 });
    }
    subtotalCents += tier.priceCents * item.quantity;
    validatedItems.push({ tier, quantity: item.quantity });
  }

  // Reserve capacity atomically for each tier
  const reserved: { tierId: string; qty: number }[] = [];
  for (const { tier, quantity } of validatedItems) {
    const ok = await reserveTierCapacity(tier.id, quantity);
    if (!ok) {
      // Rollback any already-reserved tiers
      for (const r of reserved) {
        await releaseTierCapacity(r.tierId, r.qty);
      }
      return NextResponse.json(
        { error: `Not enough capacity for ${tier.name}. Only ${tier.capacity - tier.soldCount} left.` },
        { status: 409 }
      );
    }
    reserved.push({ tierId: tier.id, qty: quantity });
  }

  // Create order
  const [order] = await db
    .insert(orders)
    .values({
      eventId,
      organizationId: event.organizationId,
      buyerName,
      buyerEmail,
      subtotalCents,
      feesCents: 0,
      totalCents: subtotalCents,
      currency: event.currency,
      status: 'paid', // Sandbox mode: auto-mark as paid
      paidAt: new Date(),
    })
    .returning();

  // Create individual tickets
  const ticketRows = [];
  for (const { tier, quantity } of validatedItems) {
    for (let i = 0; i < quantity; i++) {
      ticketRows.push({
        orderId: order.id,
        eventId,
        tierId: tier.id,
        attendeeName: quantity > 1 ? `${buyerName} (Guest ${i + 1})` : buyerName,
        attendeeEmail: buyerEmail,
        priceCents: tier.priceCents,
        status: 'valid' as const,
      });
    }
  }

  const createdTickets = await db.insert(tickets).values(ticketRows).returning();

  return NextResponse.json({
    success: true,
    sandbox: true,
    orderId: order.id,
    ticketCount: createdTickets.length,
    totalCents: subtotalCents,
    currency: event.currency,
    tickets: createdTickets.map((t) => ({
      id: t.id,
      attendeeName: t.attendeeName,
      tierName: validatedItems.find((v) => v.tier.id === t.tierId)?.tier.name || '',
      priceCents: t.priceCents,
    })),
  });
}
