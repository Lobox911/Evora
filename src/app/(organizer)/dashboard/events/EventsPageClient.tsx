'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import OrganizerEventBuilder from '@/components/OrganizerEventBuilder';
import { Event } from '@/types';
import { Link2, Check, X } from 'lucide-react';

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
  const [shareModal, setShareModal] = useState<{ title: string; url: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (shareModal) {
      navigator.clipboard.writeText(shareModal.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <OrganizerEventBuilder
        key={isNew ? 'new-' + Date.now() : 'existing'}
        events={events}
        onAddEvent={async (newEvent: any) => {
          const locationParts = (newEvent.location || '').split(',').map((s: string) => s.trim());
          const venueName = locationParts[0] || '';
          const address = locationParts.slice(1).join(', ') || '';

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
              const data = await res.json();
              const slug = data.event?.slug;
              const baseUrl = window.location.origin;
              setShareModal({
                title: newEvent.title,
                url: `${baseUrl}/events/${slug}`,
              });
              router.refresh();
            }
          } catch (err) {
            console.error('Failed to create event:', err);
          }
        }}
      />

      {/* Share Modal */}
      {shareModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 max-w-md w-full p-6 sm:p-8 relative">
            <button
              onClick={() => setShareModal(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center mb-6">
              <div className="mx-auto h-12 w-12 border border-emerald-500 flex items-center justify-center mb-4">
                <Check className="h-6 w-6 text-emerald-500" />
              </div>
              <h3 className="font-serif text-2xl font-medium text-zinc-900 dark:text-white mb-2">
                Event Published!
              </h3>
              <p className="text-sm text-zinc-500">
                <span className="font-semibold text-zinc-900 dark:text-white">{shareModal.title}</span> is now live. Share the link with your audience.
              </p>
            </div>

            {/* Link display + copy */}
            <div className="flex items-center gap-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-1">
              <div className="flex-1 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 truncate font-mono">
                {shareModal.url}
              </div>
              <button
                onClick={handleCopy}
                className={`shrink-0 px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-wider transition-all ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-[#D4573B] dark:hover:bg-[#D4573B] dark:hover:text-white'
                }`}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            {/* Share buttons */}
            <div className="flex gap-2 mt-4">
              
               <a href={`https://wa.me/?text=${encodeURIComponent(`Check out this event: ${shareModal.title}\n${shareModal.url}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 border border-zinc-200 dark:border-zinc-800 py-3 text-center font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              >
                WhatsApp
              </a>
              
                <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${shareModal.title}`)}&url=${encodeURIComponent(shareModal.url)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 border border-zinc-200 dark:border-zinc-800 py-3 text-center font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              >
                Twitter / X
              </a>
              <button
                onClick={() => {
                  window.open(shareModal.url, '_blank');
                  setShareModal(null);
                }}
                className="flex-1 border border-zinc-200 dark:border-zinc-800 py-3 text-center font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              >
                Preview
              </button>
            </div>

            <button
              onClick={() => setShareModal(null)}
              className="w-full mt-4 py-3 font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
}