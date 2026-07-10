'use client';

import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ClientStorefront from '@/components/ClientStorefront';
import { fmtDate, fmtTime } from '@/lib/utils';

interface Tier {
  id: string;
  name: string;
  priceCents: number;
  capacity: number;
  soldCount: number;
  description: string | null;
  status: string;
}

interface SerializedEvent {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  slug: string;
  startsAt: string;
  endsAt: string | null;
  timezone: string;
  venueName: string | null;
  coverImageUrl: string | null;
  tags: string[];
  status: string;
  tiers: Tier[];
}

function toLegacyEvent(e: SerializedEvent) {
  return {
    id: e.id,
    title: e.title,
    subtitle: e.subtitle || '',
    description: e.description || '',
    date: fmtDate(e.startsAt, e.timezone),
    time: e.endsAt
      ? `${fmtTime(e.startsAt, e.timezone)} - ${fmtTime(e.endsAt, e.timezone)}`
      : fmtTime(e.startsAt, e.timezone),
    location: e.venueName || 'Online',
    image: e.coverImageUrl || '/placeholder.jpg',
    status: e.status === 'cancelled' ? ('completed' as const) : (e.status as 'draft' | 'active' | 'completed'),
    tags: e.tags,
    slug: e.slug,
    tiers: e.tiers.map((t) => ({
      id: t.id,
      name: t.name,
      price: t.priceCents / 100,
      capacity: t.capacity,
      soldCount: t.soldCount,
      description: t.description || undefined,
      status: t.status === 'hidden' ? ('paused' as const) : (t.status as 'available' | 'sold_out' | 'paused'),
    })),
  };
}

export default function StorefrontClient({ events }: { events: SerializedEvent[] }) {
  const router = useRouter();
  const legacyEvents = events.map(toLegacyEvent);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-black transition-colors duration-300">
      <Navbar />
      <main className="flex-grow">
        <ClientStorefront
          events={legacyEvents}
          onSelectEvent={(event) => {
            const e = events.find((ev) => ev.id === event.id);
            router.push(`/events/${e?.slug || event.id}`);
          }}
        />
      </main>
      <footer className="border-t border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 py-6 text-center font-mono text-xs text-zinc-500 dark:text-zinc-600 uppercase tracking-widest mt-auto transition-colors duration-300">
        <p>© 2026 Evora. All rights reserved.</p>
      </footer>
    </div>
  );
}