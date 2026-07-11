'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import ClientEventDetails from '@/components/ClientEventDetails';

interface LegacyEvent {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image: string;
  status: 'draft' | 'active' | 'completed';
  tags: string[];
  tiers: {
    id: string;
    name: string;
    price: number;
    capacity: number;
    soldCount: number;
    description?: string;
    status: 'available' | 'sold_out' | 'paused';
  }[];
}

export default function EventDetailsClient({ event }: { event: LegacyEvent }) {
  const router = useRouter();
  const [currentEvent, setCurrentEvent] = useState(event);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-black transition-colors duration-300">
      <Navbar />
      <main className="flex-grow">
        <ClientEventDetails
          event={currentEvent}
          onBack={() => router.push('/')}
          onPurchaseSuccess={(attendees, updatedEvent) => {
            setCurrentEvent(updatedEvent);
          }}
        />
      </main>
    </div>
  );
}