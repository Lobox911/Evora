import { notFound } from 'next/navigation';
import { getOrgById, getOrgWithMembers } from '@/db/queries/organizations';
import { getEventsByOrg, getTiersForEvent } from '@/db/queries/events';
import { getTicketsByEvent } from '@/db/queries/tickets';
import { fmtDate, fmtTime, formatCents } from '@/lib/utils';
import OrgDetailClient from './OrgDetailClient';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrgDetailPage({ params }: Props) {
  const { id } = await params;
  const org = await getOrgById(id);
  if (!org) notFound();

  const members = await getOrgWithMembers(id);
  const events = await getEventsByOrg(id);

  const eventsWithStats = await Promise.all(
    events.map(async (e) => {
      const tiers = await getTiersForEvent(e.id);
      const tickets = await getTicketsByEvent(e.id);
      const revenue = tickets
        .filter((t) => t.status !== 'refunded')
        .reduce((sum, t) => sum + t.priceCents, 0);
      const checkedIn = tickets.filter((t) => t.status === 'checked_in').length;

      return {
        id: e.id,
        title: e.title,
        status: e.status,
        date: fmtDate(e.startsAt, e.timezone),
        venueName: e.venueName || 'Online',
        totalSold: tiers.reduce((s, t) => s + t.soldCount, 0),
        totalCapacity: tiers.reduce((s, t) => s + t.capacity, 0),
        checkedIn,
        revenue,
        ticketCount: tickets.length,
      };
    })
  );

  const totalRevenue = eventsWithStats.reduce((s, e) => s + e.revenue, 0);
  const totalTickets = eventsWithStats.reduce((s, e) => s + e.ticketCount, 0);

  return (
    <OrgDetailClient
      org={{
        id: org.id,
        name: org.name,
        slug: org.slug,
        plan: org.plan,
        currency: org.defaultCurrency,
        createdAt: org.createdAt.toISOString(),
      }}
      members={members.map((m) => ({
        name: m.user.fullName || m.user.email,
        email: m.user.email,
        role: m.role,
      }))}
      events={eventsWithStats}
      totalRevenue={totalRevenue}
      totalTickets={totalTickets}
    />
  );
}
