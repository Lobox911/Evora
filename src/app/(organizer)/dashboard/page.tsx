import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUserByClerkId, getUserOrgs } from '@/db/queries/organizations';
import { getEventsByOrg, getTiersForEvent } from '@/db/queries/events';
import { getTicketsByEvent } from '@/db/queries/tickets';
import { fmtDate, fmtTime } from '@/lib/utils';
import DashboardPageClient from './DashboardPageClient';

export const metadata = { title: 'Dashboard' };

export default async function DashboardPage() {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect('/sign-in');

  const dbUser = await getUserByClerkId(clerkUser.id);
  if (!dbUser) redirect('/sign-in');

  const orgs = await getUserOrgs(dbUser.id);
  const currentOrg = orgs[0];
  if (!currentOrg) redirect('/dashboard/settings');

  const events = await getEventsByOrg(currentOrg.org.id);

  const legacyEvents = await Promise.all(
    events.map(async (e) => {
      const tiers = await getTiersForEvent(e.id);
      return {
        id: e.id,
        title: e.title,
        subtitle: e.subtitle || '',
        description: e.description || '',
        date: fmtDate(e.startsAt, e.timezone),
        time: e.endsAt
          ? `${fmtTime(e.startsAt, e.timezone)} - ${fmtTime(e.endsAt, e.timezone)}`
          : fmtTime(e.startsAt, e.timezone),
        location: e.venueName || 'Online',
        image: e.coverImageUrl || '/placeholder.jpg',
        status: (e.status === 'cancelled' ? 'completed' : e.status) as 'draft' | 'active' | 'completed',
        tags: e.tags,
        tiers: tiers.map((t) => ({
          id: t.id,
          name: t.name,
          price: t.priceCents / 100,
          capacity: t.capacity,
          soldCount: t.soldCount,
          description: t.description || undefined,
          status: (t.status === 'hidden' ? 'paused' : t.status) as 'available' | 'sold_out' | 'paused',
        })),
      };
    })
  );

  // Build legacy attendees from tickets
  const allAttendees = [];
  for (const event of events) {
    const tickets = await getTicketsByEvent(event.id);
    for (const t of tickets) {
      allAttendees.push({
        id: t.id,
        name: t.attendeeName,
        email: t.attendeeEmail,
        ticketClass: 'General',
        ticketPrice: t.priceCents / 100,
        purchaseDate: t.createdAt.toISOString().split('T')[0],
        status: (t.status === 'checked_in' ? 'checked_in' : t.status === 'refunded' ? 'refunded' : 'registered') as 'registered' | 'checked_in' | 'refunded',
        eventId: t.eventId,
        eventTitle: event.title,
      });
    }
  }

  return <DashboardPageClient events={legacyEvents} attendees={allAttendees} />;
}