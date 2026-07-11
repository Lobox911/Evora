'use client';

import { useRouter, useSearchParams } from 'next/navigation';
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
  const searchParams = useSearchParams();
  const isNew = searchParams.get('new') === 'true';

  return (
    <OrganizerEventBuilder
      key={isNew ? 'new-' + Date.now() : 'existing'}
      events={events}
      onAddEvent={async (newEvent: any) => {
        const locationParts = (newEvent.location || '').split(',').map((s: string) => s.trim());
        const venueName = locationParts[0] || '';
        const address = locationParts.slice(1).join(', ') || '';

        // Use raw dates if available, otherwise try parsing the display date
        let startsAt = new Date().toISOString();
        let endsAt: string | null = null;

        if (newEvent.rawStartDate) {
          startsAt = new Date(newEvent.rawStartDate).toISOString();
        } else if (newEvent.date) {
          try {
            const parsed = new Date(newEvent.date);
            if (!isNaN(parsed.getTime())) startsAt = parsed.toISOString();
          } catch {}
        }

        if (newEvent.rawEndDate) {
          endsAt = new Date(newEvent.rawEndDate).toISOString();
        }

        try {
          const res = await fetch('/api/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: newEvent.title,
              subtitle: newEvent.subtitle,
              description: newEvent.description,
              startsAt,
              endsAt,
              venueName,
              address,
              tags: newEvent.tags,
              coverImageUrl: newEvent.image,
              tiers: newEvent.tiers.map((t: any) => ({
                name: t.name,
                price: t.price,
                capacity: t.capacity,
                description: t.description || '',
                perks: [],
              })),
            }),
          });

          if (res.ok) {
            router.push('/dashboard/events');
            router.refresh();
          }
        } catch (err) {
          console.error('Failed to create event:', err);
        }
      }}
    />
  );
}