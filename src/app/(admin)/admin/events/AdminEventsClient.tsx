'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';

interface PlatformEvent {
  id: string;
  title: string;
  orgName: string;
  orgId: string;
  status: string;
  date: string;
  totalSold: number;
  revenue: number;
}

function formatCents(cents: number) {
  return '₦' + Math.round(cents / 100).toLocaleString();
}

export default function AdminEventsClient({ events }: { events: PlatformEvent[] }) {
  return (
    <div className="py-10">
      <header className="max-w-[1100px] mx-auto px-4 sm:px-6 mb-12">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to Admin
        </Link>
        <h1 className="font-serif text-4xl font-light text-zinc-900 dark:text-white">All Events</h1>
        <p className="text-sm text-zinc-500 mt-2">{events.length} events across all organizers</p>
      </header>

      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 space-y-3">
        {events.map((event, i) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: i * 0.04, ease: [0.23, 1, 0.32, 1] }}
            className="flex items-center justify-between p-5 border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950"
          >
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-white">{event.title}</p>
              <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider mt-1">
                <Link href={`/admin/organizers/${event.orgId}`} className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                  {event.orgName}
                </Link>
                {' · '}{event.date} · {event.totalSold} sold · {formatCents(event.revenue)}
              </p>
            </div>
            <span
              className={`font-mono text-[9px] font-bold uppercase tracking-widest px-3 py-1 border ${
                event.status === 'active'
                  ? 'border-emerald-500 text-emerald-600'
                  : event.status === 'draft'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-zinc-300 text-zinc-500'
              }`}
            >
              {event.status}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
