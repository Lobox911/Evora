'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { Building2, Calendar, Users, DollarSign, ChevronRight } from 'lucide-react';

interface OrgWithStats {
  id: string;
  name: string;
  slug: string;
  plan: string;
  createdAt: string;
  eventCount: number;
  activeEvents: number;
  totalTickets: number;
  totalRevenue: number;
}

interface PlatformStats {
  totalOrgs: number;
  totalEvents: number;
  totalTickets: number;
  totalRevenue: number;
}

function formatCents(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
}

export default function AdminOverviewClient({
  orgs,
  stats,
}: {
  orgs: OrgWithStats[];
  stats: PlatformStats;
}) {
  const metrics = [
    { label: 'Organizations', value: stats.totalOrgs.toString(), icon: Building2 },
    { label: 'Total Events', value: stats.totalEvents.toString(), icon: Calendar },
    { label: 'Tickets Sold', value: stats.totalTickets.toLocaleString(), icon: Users },
    { label: 'Platform Revenue', value: formatCents(stats.totalRevenue), icon: DollarSign },
  ];

  return (
    <div className="py-10">
      <header className="max-w-[1100px] mx-auto px-4 sm:px-6 mb-12">
        <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#D4573B] mb-2">
          Platform Admin
        </p>
        <h1 className="font-serif text-4xl md:text-5xl font-light text-zinc-900 dark:text-white">
          Dashboard
        </h1>
      </header>

      {/* Metrics */}
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08, ease: [0.23, 1, 0.32, 1] }}
            className="border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <m.icon className="h-4 w-4 text-zinc-400" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                {m.label}
              </span>
            </div>
            <p className="font-serif text-3xl font-light text-zinc-900 dark:text-white">{m.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Orgs list */}
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6">
        <h2 className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-6">
          All Organizations
        </h2>
        <div className="space-y-3">
          {orgs.map((org, i) => (
            <motion.div
              key={org.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 0.3 + i * 0.05, ease: [0.23, 1, 0.32, 1] }}
            >
              <Link
                href={`/admin/organizers/${org.id}`}
                className="flex items-center justify-between p-5 border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 hover:border-zinc-400 dark:hover:border-zinc-700 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shrink-0">
                    <span className="font-mono text-xs font-bold text-zinc-500">
                      {org.name.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-sans text-sm font-medium text-zinc-900 dark:text-white">
                      {org.name}
                    </p>
                    <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider mt-0.5">
                      {org.activeEvents} active · {org.totalTickets} tickets · {formatCents(org.totalRevenue)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[9px] font-bold uppercase tracking-widest px-3 py-1 border border-zinc-200 dark:border-zinc-800 text-zinc-500">
                    {org.plan}
                  </span>
                  <ChevronRight className="h-4 w-4 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
