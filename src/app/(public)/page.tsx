import { getActiveEvents, getTiersForEvent } from '@/db/queries/events';
import StorefrontClient from './StorefrontClient';

export const revalidate = 60;

export default async function StorefrontPage() {
  const events = await getActiveEvents();

  const eventsWithTiers = await Promise.all(
    events.map(async (event) => {
      const tiers = await getTiersForEvent(event.id);
      return {
        ...event,
        // Serialize dates to ISO strings so they survive the server→client boundary
        startsAt: event.startsAt.toISOString(),
        endsAt: event.endsAt?.toISOString() ?? null,
        createdAt: event.createdAt.toISOString(),
        updatedAt: event.updatedAt.toISOString(),
        publishedAt: event.publishedAt?.toISOString() ?? null,
        tiers: tiers.map((t) => ({
          ...t,
          createdAt: t.createdAt.toISOString(),
          updatedAt: t.updatedAt.toISOString(),
          salesStart: t.salesStart?.toISOString() ?? null,
          salesEnd: t.salesEnd?.toISOString() ?? null,
        })),
      };
    })
  );

  return <StorefrontClient events={eventsWithTiers} />;
}