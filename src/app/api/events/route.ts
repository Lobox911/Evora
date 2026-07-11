import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getUserByClerkId, getUserOrgs } from '@/db/queries/organizations';
import { getEventsByOrg, createEvent } from '@/db/queries/events';
import { makeSlug } from '@/lib/utils';
import { db } from '@/db';
import { ticketTiers } from '@/db/schema';

export async function GET() {
  const clerkUser = await currentUser();
  if (!clerkUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const dbUser = await getUserByClerkId(clerkUser.id);
  if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const orgs = await getUserOrgs(dbUser.id);
  if (!orgs[0]) return NextResponse.json({ events: [] });

  const events = await getEventsByOrg(orgs[0].org.id);
  return NextResponse.json({ events });
}

export async function POST(req: NextRequest) {
  const clerkUser = await currentUser();
  if (!clerkUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const dbUser = await getUserByClerkId(clerkUser.id);
  if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const orgs = await getUserOrgs(dbUser.id);
  const currentOrg = orgs[0];
  if (!currentOrg) return NextResponse.json({ error: 'No organization' }, { status: 400 });

  const role = currentOrg.role;
  if (role !== 'owner' && role !== 'admin') {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  const body = await req.json();
  const { title, subtitle, description, startsAt, endsAt, timezone, venueName, address, city, tags, coverImageUrl, tiers } = body;

  if (!title || !startsAt) {
    return NextResponse.json({ error: 'Title and start date are required' }, { status: 400 });
  }

  // Create the event
  const event = await createEvent({
    organizationId: currentOrg.org.id,
    title,
    subtitle: subtitle || null,
    description: description || null,
    slug: makeSlug(title) + '-' + Date.now().toString(36),
    startsAt: new Date(startsAt),
    endsAt: endsAt ? new Date(endsAt) : null,
    timezone: timezone || 'America/Los_Angeles',
    venueName: venueName || null,
    address: address || null,
    city: city || null,
    tags: tags || [],
    coverImageUrl: coverImageUrl || null,
    status: 'active',
    currency: currentOrg.org.defaultCurrency,
    publishedAt: new Date(),
  });

  // Create ticket tiers if provided
  if (tiers && Array.isArray(tiers) && tiers.length > 0) {
    const tierValues = tiers.map((t: any, i: number) => ({
      eventId: event!.id,
      name: t.name,
      description: t.description || null,
      priceCents: Math.round((t.price || 0) * 100),
      capacity: t.capacity || 100,
      maxPerOrder: 10,
      status: 'available' as const,
      sortOrder: i,
      perks: t.perks || [],
    }));

    await db.insert(ticketTiers).values(tierValues);
  }

  return NextResponse.json({ event }, { status: 201 });
}