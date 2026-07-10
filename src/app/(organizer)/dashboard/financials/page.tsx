import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUserByClerkId, getUserOrgs, getPayoutsByOrg } from '@/db/queries/organizations';
import { getEventsByOrg } from '@/db/queries/events';
import { getTicketsByEvent } from '@/db/queries/tickets';
import FinancialsPageClient from './FinancialsPageClient';

export const metadata = { title: 'Financials' };

export default async function FinancialsPage() {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect('/sign-in');

  const dbUser = await getUserByClerkId(clerkUser.id);
  if (!dbUser) redirect('/sign-in');

  const orgs = await getUserOrgs(dbUser.id);
  const currentOrg = orgs[0];
  if (!currentOrg) redirect('/dashboard/settings');

  const events = await getEventsByOrg(currentOrg.org.id);
  const payouts = await getPayoutsByOrg(currentOrg.org.id);

  let totalRevenue = 0;
  let attendeesCount = 0;

  for (const event of events) {
    const tickets = await getTicketsByEvent(event.id);
    attendeesCount += tickets.length;
    totalRevenue += tickets
      .filter((t) => t.status !== 'refunded')
      .reduce((sum, t) => sum + t.priceCents, 0);
  }

  const legacyPayouts = payouts.map((p) => ({
    id: p.id,
    date: p.requestedAt.toISOString().split('T')[0],
    amount: p.amountCents / 100,
    bankAccount: p.bankAccountLast4 ? `****${p.bankAccountLast4}` : '****0000',
    status: (p.status === 'completed' ? 'completed' : 'processing') as 'completed' | 'processing',
  }));

  return (
    <FinancialsPageClient
      payouts={legacyPayouts}
      attendeesCount={attendeesCount}
      totalRevenue={totalRevenue / 100}
    />
  );
}
