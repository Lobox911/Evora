'use client';

import { useRouter } from 'next/navigation';
import OrganizerAttendeeManager from '@/components/OrganizerAttendeeManager';
import { Event, Attendee } from '@/types';

export default function AttendeesPageClient({
  attendees,
  events,
}: {
  attendees: Attendee[];
  events: Event[];
}) {
  const router = useRouter();

  return (
    <OrganizerAttendeeManager
      attendees={attendees}
      events={events}
      onUpdateAttendeeStatus={async (id, nextStatus) => {
        if (nextStatus === 'checked_in') {
          await fetch(`/api/tickets/${id}/check-in`, { method: 'POST' });
        }
        router.refresh();
      }}
      onAddAttendee={() => {
        router.refresh();
      }}
    />
  );
}
