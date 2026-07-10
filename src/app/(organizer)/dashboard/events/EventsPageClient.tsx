'use client';

import { useRouter } from 'next/navigation';
import OrganizerEventBuilder from '@/components/OrganizerEventBuilder';
import { Event } from '@/types';

export default function EventsPageClient({
  events,
  orgId,
}: {
  events: Event[];
  orgId: string;
}) {
  const router = useRouter();

  return (
    <OrganizerEventBuilder
      events={events}
      onAddEvent={async (newEvent) => {
        await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: newEvent.title,
            subtitle: newEvent.subtitle,
            description: newEvent.description,
            startsAt: new Date().toISOString(),
            venueName: newEvent.location,
            tags: newEvent.tags,
            coverImageUrl: newEvent.image,
          }),
        });
        router.refresh();
      }}
    />
  );
}
