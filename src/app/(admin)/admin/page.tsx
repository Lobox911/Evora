import { getAllOrganizations } from '@/db/queries/organizations';
import { getEventsByOrg } from '@/db/queries/events';
import { getTicketsByEvent } from '@/db/queries/tickets';
import AdminOverviewClient from './AdminOverviewClient';

export const metadata = { title: 'Platform Admin' };

export default async function AdminPage() {
  const orgs = await getAllOrganizations();

  const orgsWithStats = await Promise.all(
    orgs.map(async (org) => {
      const events = await getEventsByOrg(org.id);
      let totalRevenue = 0;
      let totalTickets = 0;

      for (const event of events) {
        const tickets = await getTicketsByEvent(event.id);
        totalTickets += tickets.length;
        totalRevenue += tickets
          .filter((t) => t.status !== 'refunded')
          .reduce((sum, t) => sum + t.priceCents, 0);
      }

      return {
        id: org.id,
        name: org.name,
        slug: org.slug,
        plan: org.plan,
        createdAt: org.createdAt.toISOString(),
        eventCount: events.length,
        activeEvents: events.filter((e) => e.status === 'active').length,
        totalTickets,
        totalRevenue,
      };
    })
  );

  const platformStats = {
    totalOrgs: orgs.length,
    totalEvents: orgsWithStats.reduce((s, o) => s + o.eventCount, 0),
    totalTickets: orgsWithStats.reduce((s, o) => s + o.totalTickets, 0),
    totalRevenue: orgsWithStats.reduce((s, o) => s + o.totalRevenue, 0),
  };

  return <AdminOverviewClient orgs={orgsWithStats} stats={platformStats} />;
}
