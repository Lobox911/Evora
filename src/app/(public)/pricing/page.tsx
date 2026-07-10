'use client';

import Navbar from '@/components/Navbar';
import PricingPage from '@/components/PricingPage';

export default function PricingRoute() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-black transition-colors duration-300">
      <Navbar />
      <main className="flex-grow">
        <PricingPage />
      </main>
    </div>
  );
}
