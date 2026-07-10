'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Ticket, QrCode, X } from 'lucide-react';
import { fmtDate, fmtTime, formatCents } from '@/lib/utils';

interface TicketWithEvent {
  id: string;
  attendeeName: string;
  attendeeEmail: string;
  priceCents: number;
  status: 'valid' | 'checked_in' | 'refunded' | 'void';
  eventTitle: string;
  eventDate: Date;
  eventVenue: string;
  eventTimezone: string;
}

export default function MyTicketsClient({
  tickets,
  userName,
}: {
  tickets: TicketWithEvent[];
  userName: string;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const upcoming = tickets.filter(
    (t) => t.status === 'valid' && new Date(t.eventDate) >= new Date()
  );
  const past = tickets.filter(
    (t) => t.status !== 'valid' || new Date(t.eventDate) < new Date()
  );

  const renderTicket = (ticket: TicketWithEvent, i: number) => {
    const isExpanded = expandedId === ticket.id;
    const isUsed = ticket.status === 'checked_in';
    const isRefunded = ticket.status === 'refunded';

    return (
      <motion.div
        key={ticket.id}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: i * 0.06, ease: [0.23, 1, 0.32, 1] }}
        onClick={() => setExpandedId(isExpanded ? null : ticket.id)}
        className={`border bg-white dark:bg-zinc-950 cursor-pointer transition-colors ${
          isRefunded
            ? 'border-red-200 dark:border-red-900 opacity-60'
            : isUsed
            ? 'border-zinc-200 dark:border-zinc-800 opacity-70'
            : 'border-zinc-200 dark:border-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-700'
        }`}
      >
        <div className="p-6 flex items-start justify-between gap-4">
          <div className="space-y-1 text-left">
            <p className="font-sans text-sm font-medium text-zinc-900 dark:text-white">
              {ticket.eventTitle}
            </p>
            <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">
              {fmtDate(ticket.eventDate, ticket.eventTimezone)} · {ticket.eventVenue}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span
                className={`font-mono text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 border ${
                  isRefunded
                    ? 'border-red-400 text-red-500'
                    : isUsed
                    ? 'border-emerald-400 text-emerald-500'
                    : 'border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                {ticket.status === 'valid' ? 'ACTIVE' : ticket.status.replace('_', ' ').toUpperCase()}
              </span>
              <span className="font-mono text-[10px] text-zinc-500">
                {formatCents(ticket.priceCents)}
              </span>
            </div>
          </div>
          <div className="shrink-0">
            {ticket.status === 'valid' ? (
              <QrCode className="h-8 w-8 text-zinc-400 dark:text-zinc-600" />
            ) : (
              <Ticket className="h-8 w-8 text-zinc-300 dark:text-zinc-700" />
            )}
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && ticket.status === 'valid' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              className="overflow-hidden border-t border-zinc-100 dark:border-zinc-900"
            >
              <div className="p-6 flex flex-col items-center gap-4">
                {/* QR placeholder — will be a real signed QR code */}
                <div className="w-48 h-48 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
                  <QrCode className="h-20 w-20 text-zinc-300 dark:text-zinc-700" />
                </div>
                <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider text-center">
                  Present this QR code at the door
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-10">
      <header className="max-w-lg mx-auto px-4 mb-10 text-center">
        <h1 className="font-serif text-3xl font-light text-zinc-900 dark:text-white">
          {userName ? `${userName}'s Tickets` : 'My Tickets'}
        </h1>
      </header>

      <div className="max-w-lg mx-auto px-4 space-y-8">
        {upcoming.length > 0 && (
          <div>
            <h2 className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4">
              Upcoming
            </h2>
            <div className="space-y-3">{upcoming.map(renderTicket)}</div>
          </div>
        )}

        {past.length > 0 && (
          <div>
            <h2 className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4">
              Past & Used
            </h2>
            <div className="space-y-3">{past.map(renderTicket)}</div>
          </div>
        )}

        {tickets.length === 0 && (
          <div className="text-center py-20">
            <Ticket className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-500 font-light">No tickets yet. Browse events to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
