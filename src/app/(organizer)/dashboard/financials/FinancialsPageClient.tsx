'use client';

import { useRouter } from 'next/navigation';
import OrganizerFinancials from '@/components/OrganizerFinancials';
import { Payout } from '@/types';

export default function FinancialsPageClient({
  payouts,
  attendeesCount,
  totalRevenue,
}: {
  payouts: Payout[];
  attendeesCount: number;
  totalRevenue: number;
}) {
  const router = useRouter();

  return (
    <OrganizerFinancials
      payouts={payouts}
      attendeesCount={attendeesCount}
      totalRevenue={totalRevenue}
      onRequestPayout={async (amount) => {
        router.refresh();
      }}
    />
  );
}
