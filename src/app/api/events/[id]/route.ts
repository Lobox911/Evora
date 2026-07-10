import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getUserByClerkId, getUserOrgs } from '@/db/queries/organizations';
import { getEventById, updateEvent, getTiersForEvent } from '@/db/queries/events';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEventById(id);
  if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const tiers = await getTiersForEvent(id);
  return NextResponse.json({ event, tiers });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const clerkUser = await currentUser();
  if (!clerkUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const dbUser = await getUserByClerkId(clerkUser.id);
  if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const orgs = await getUserOrgs(dbUser.id);
  const currentOrg = orgs[0];
  if (!currentOrg || (currentOrg.role !== 'owner' && currentOrg.role !== 'admin')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const updated = await updateEvent(id, currentOrg.org.id, body);
  if (!updated) return NextResponse.json({ error: 'Not found or no access' }, { status: 404 });

  return NextResponse.json({ event: updated });
}
