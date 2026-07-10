import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getEventBySlug, getTiersForEvent } from '@/db/queries/events';
import { fmtDate, fmtTime } from '@/lib/utils';
import EventDetailsClient from './EventDetailsClient';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return { title: 'Event Not Found' };

  return {
    title: event.title,
    description: event.subtitle || event.description?.slice(0, 155) || '',
    openGraph: {
      title: event.title,
      description: event.subtitle || '',
      images: event.coverImageUrl ? [{ url: event.coverImageUrl }] : [],
      type: 'website',
    },
  };
}

export default async function EventPage({ params }: Props) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  const tiers = await getTiersForEvent(event.id);

  const legacyEvent = {
    id: event.id,
    title: event.title,
    subtitle: event.subtitle || '',
    description: event.description || '',
    date: fmtDate(event.startsAt, event.timezone),
    time: event.endsAt
      ? `${fmtTime(event.startsAt, event.timezone)} - ${fmtTime(event.endsAt, event.timezone)}`
      : fmtTime(event.startsAt, event.timezone),
    location: event.venueName || 'Online',
    image: event.coverImageUrl || '/placeholder.jpg',
    status: event.status === 'cancelled' ? ('completed' as const) : (event.status as 'draft' | 'active' | 'completed'),
    tags: event.tags,
    tiers: tiers.map((t) => ({
      id: t.id,
      name: t.name,
      price: t.priceCents / 100,
      capacity: t.capacity,
      soldCount: t.soldCount,
      description: t.description || undefined,
      status: t.status === 'hidden' ? ('paused' as const) : (t.status as 'available' | 'sold_out' | 'paused'),
    })),
  };

  return <EventDetailsClient event={legacyEvent} />;
}