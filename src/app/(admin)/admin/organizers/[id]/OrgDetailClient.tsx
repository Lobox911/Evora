'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowLeft, Users, Calendar, DollarSign, CheckCircle2 } from 'lucide-react';

interface OrgInfo {
  id: string;
  name: string;
  slug: string;
  plan: string;
  currency: string;
  createdAt: string;
}

interface Member {
  name: string;
  email: string;
  role: string;
}

interface EventWithStats {
  id: string;
  title: string;
  status: string;
  date: string;
  venueName: string;
  totalSold: number;
  totalCapacity: number;
  checkedIn: number;
  revenue: number;
  ticketCount: number;
}

function formatCents(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
}

export default function OrgDetailClient({
  org,
  members,
  events,
  totalRevenue,
  totalTickets,
}: {
  org: OrgInfo;
  members: Member[];
  events: EventWithStats[];
  totalRevenue: number;
  totalTickets: number;
}) {
  const metrics = [
    { label: 'Revenue', value: formatCents(totalRevenue), icon: DollarSign },
    { label: 'Tickets Sold', value: totalTickets.toLocaleString(), icon: Users },
    { label: 'Events', value: events.length.toString(), icon: Calendar },
    { label: 'Checked In', value: events.reduce((s, e) => s + e.checkedIn, 0).toLocaleString(), icon: CheckCircle2 },
  ];

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
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
            <span className="font-mono text-sm font-bold text-zinc-500">
              {org.name.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="font-serif text-3xl font-light text-zinc-900 dark:text-white">{org.name}</h1>
            <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider mt-1">
              {org.slug} · {org.plan} plan · since {new Date(org.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </header>

      {/* Metrics */}
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.06, ease: [0.23, 1, 0.32, 1] }}
            className="border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <m.icon className="h-3.5 w-3.5 text-zinc-400" />
              <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-zinc-500">{m.label}</span>
            </div>
            <p className="font-serif text-2xl font-light text-zinc-900 dark:text-white">{m.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Team */}
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 mb-12">
        <h2 className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4">
          Team Members
        </h2>
        <div className="border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 divide-y divide-zinc-100 dark:divide-zinc-900">
          {members.map((m) => (
            <div key={m.email} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-white">{m.name}</p>
                <p className="font-mono text-[10px] text-zinc-500">{m.email}</p>
              </div>
              <span className="font-mono text-[9px] font-bold uppercase tracking-widest px-3 py-1 border border-zinc-200 dark:border-zinc-800 text-zinc-500">
                {m.role}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Events */}
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6">
        <h2 className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4">
          Events
        </h2>
        <div className="space-y-3">
          {events.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 0.2 + i * 0.05, ease: [0.23, 1, 0.32, 1] }}
              className="flex items-center justify-between p-5 border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950"
            >
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-white">{event.title}</p>
                <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider mt-1">
                  {event.date} · {event.venueName} · {event.totalSold}/{event.totalCapacity} sold · {formatCents(event.revenue)}
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
    </div>
  );
}
