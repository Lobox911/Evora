import { getAllOrganizations } from '@/db/queries/organizations';
import { getEventsByOrg, getTiersForEvent } from '@/db/queries/events';
import { getTicketsByEvent } from '@/db/queries/tickets';
import { fmtDate } from '@/lib/utils';
import AdminEventsClient from './AdminEventsClient';

export const metadata = { title: 'All Events — Admin' };

export default async function AdminEventsPage() {
  const orgs = await getAllOrganizations();

  const allEvents = [];
  for (const org of orgs) {
    const events = await getEventsByOrg(org.id);
    for (const e of events) {
      const tiers = await getTiersForEvent(e.id);
      const tickets = await getTicketsByEvent(e.id);
      const revenue = tickets
        .filter((t) => t.status !== 'refunded')
        .reduce((sum, t) => sum + t.priceCents, 0);

      allEvents.push({
        id: e.id,
        title: e.title,
        orgName: org.name,
        orgId: org.id,
        status: e.status,
        date: fmtDate(e.startsAt, e.timezone),
        totalSold: tiers.reduce((s, t) => s + t.soldCount, 0),
        revenue,
      });
    }
  }

  return <AdminEventsClient events={allEvents} />;
}
