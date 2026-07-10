'use client';

import { useRouter } from 'next/navigation';
import OrganizerDashboard from '@/components/OrganizerDashboard';
import { Event, Attendee } from '@/types';

export default function DashboardPageClient({
  events,
  attendees,
}: {
  events: Event[];
  attendees: Attendee[];
}) {
  const router = useRouter();

  return (
    <OrganizerDashboard
      events={events}
      attendees={attendees}
      onNavigateTab={(tab) => {
        const routes: Record<string, string> = {
          builder: '/dashboard/events',
          attendees: '/dashboard/attendees',
          financials: '/dashboard/financials',
          scanner: '/scan',
        };
        if (routes[tab]) router.push(routes[tab]);
      }}
      onSelectEvent={(event) => router.push(`/events/${event.id}`)}
    />
  );
}
