import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getTicketsByEmail } from '@/db/queries/tickets';
import { getEventById } from '@/db/queries/events';
import MyTicketsClient from './MyTicketsClient';

export const metadata = { title: 'My Tickets' };

export default async function TicketsPage() {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect('/sign-in');

  const email = clerkUser.emailAddresses[0]?.emailAddress || '';
  const tickets = await getTicketsByEmail(email);

  // Hydrate event info for each ticket
  const ticketsWithEvent = await Promise.all(
    tickets.map(async (ticket) => {
      const event = await getEventById(ticket.eventId);
      return {
        ...ticket,
        eventTitle: event?.title || 'Unknown Event',
        eventDate: event?.startsAt || new Date(),
        eventVenue: event?.venueName || 'TBA',
        eventTimezone: event?.timezone || 'UTC',
      };
    })
  );

  return <MyTicketsClient tickets={ticketsWithEvent} userName={clerkUser.firstName || ''} />;
}
