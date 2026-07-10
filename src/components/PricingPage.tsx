import React, { useState } from 'react';
import { 
  Check, 
  Circle, 
  LayoutGrid, 
  TrendingUp, 
  Cpu, 
  Infinity as InfinityIcon, 
  ArrowUpRight, 
  Mail, 
  Globe, 
  Layers,
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';
import { useNotification } from './NotificationProvider';

interface PricingPageProps {
  onSelectTier?: (tierName: string) => void;
}

export default function PricingPage({ onSelectTier }: PricingPageProps) {
  const { showToast } = useNotification();
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const handleSelectTier = (tierName: string) => {
    showToast(`Initiating onboarding ledger for ${tierName} Tier.`, "success");
    if (onSelectTier) {
      onSelectTier(tierName);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="bg-[#FAFAF8] dark:bg-black text-[#1A1A1A] dark:text-zinc-100 min-h-screen pt-12 pb-24 transition-colors duration-300 font-sans"
    >
      {/* Hero Section */}
      <header className="px-6 md:px-8 max-w-7xl mx-auto mb-20 md:mb-28 text-left">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end border-b border-[#dfbfb9]/60 dark:border-zinc-900 pb-12">
          <div className="md:col-span-8 space-y-4">
            <span className="font-mono text-[11px] font-bold text-[#D4573B] uppercase tracking-[0.15em] block">
              Subscription Economics
            </span>
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-light italic text-[#1A1A1A] dark:text-white leading-[0.95] tracking-tighter">
              Scalable tools for the<br />new cultural economy.
            </h1>
          </div>
          <div className="md:col-span-4 pb-1">
            <p className="text-sm md:text-base text-zinc-650 dark:text-zinc-400 leading-relaxed font-light font-sans">
              Precision-engineered for the curated experience. Simple pricing models for complex organizational needs. No hidden percentages, pure absolute transparency.
            </p>
          </div>
        </div>
      </header>

      {/* Pricing Grid */}
      <section className="px-6 md:px-8 max-w-7xl mx-auto mb-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Emerging Tier (01 / Entry) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            onMouseEnter={() => setHoveredCard(1)}
            onMouseLeave={() => setHoveredCard(null)}
            className="group flex flex-col justify-between h-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 p-8 sm:p-10 lg:p-12 transition-all duration-300 rounded-none relative text-left"
            style={{
              transform: hoveredCard === 1 ? 'translateY(-8px)' : 'translateY(0px)',
              borderColor: hoveredCard === 1 ? 'rgba(212, 87, 59, 0.4)' : ''
            }}
          >
            <div>
              <span className="font-mono text-[10px] font-bold text-zinc-450 dark:text-zinc-550 uppercase tracking-widest mb-10 block">
                01 / Entry
              </span>
              <h2 className="font-serif text-3xl md:text-4xl italic mb-4 font-light text-[#1A1A1A] dark:text-white">
                The Emerging
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm mb-12 font-light leading-relaxed">
                Essential infrastructure for independent curators and boutique pop-ups.
              </p>
              
              <div className="mb-12 flex items-baseline">
                <span className="font-serif text-5xl italic font-light text-[#1A1A1A] dark:text-white">$0</span>
                <span className="font-sans text-[10px] text-zinc-500 dark:text-zinc-400 ml-2.5 uppercase tracking-widest font-bold">
                  per month
                </span>
              </div>

              <ul className="space-y-6 mb-16">
                <li className="flex items-center gap-4 text-xs sm:text-sm font-light">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#D4573B]" />
                  <span>Unlimited Basic Listings</span>
                </li>
                <li className="flex items-center gap-4 text-xs sm:text-sm font-light">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#D4573B]" />
                  <span>Mobile Check-in Access</span>
                </li>
                <li className="flex items-center gap-4 text-xs sm:text-sm font-light">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#D4573B]" />
                  <span>Standard Performance Data</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleSelectTier('Emerging')}
              className="w-full border border-zinc-900 dark:border-zinc-300 dark:hover:border-white hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-black py-4.5 font-sans text-[11px] font-bold uppercase tracking-widest transition-all duration-200 min-h-[44px]"
            >
              Select Tier
            </button>
          </motion.div>

          {/* Professional Tier (02 / Professional) - Highlighted */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            onMouseEnter={() => setHoveredCard(2)}
            onMouseLeave={() => setHoveredCard(null)}
            className="group flex flex-col justify-between h-full bg-[#1A1A1A] dark:bg-zinc-900 text-white p-8 sm:p-10 lg:p-12 transition-all duration-300 rounded-none relative text-left overflow-hidden shadow-xl"
            style={{
              transform: hoveredCard === 2 ? 'translateY(-8px)' : 'translateY(0px)',
              borderColor: hoveredCard === 2 ? 'rgba(212, 87, 59, 0.6)' : ''
            }}
          >
            {/* Preferred sticker */}
            <div className="absolute top-0 right-0">
              <div className="bg-[#D4573B] text-white text-[9px] font-bold uppercase tracking-widest px-4 py-1.5 font-sans">
                Preferred
              </div>
            </div>

            <div>
              <span className="font-mono text-[10px] font-bold text-[#D4573B] uppercase tracking-widest mb-10 block">
                02 / Professional
              </span>
              <h2 className="font-serif text-3xl md:text-4xl italic mb-4 font-light text-white">
                The Professional
              </h2>
              <p className="text-zinc-400 text-xs sm:text-sm mb-12 font-light leading-relaxed">
                High-performance tools for institutions and production venues.
              </p>
              
              <div className="mb-12 flex items-baseline">
                <span className="font-serif text-5xl italic font-light text-[#D4573B]">$149</span>
                <span className="font-sans text-[10px] text-zinc-400 ml-2.5 uppercase tracking-widest font-bold">
                  per month / billed annually
                </span>
              </div>

              <ul className="space-y-6 mb-16">
                <li className="flex items-start gap-4 text-xs sm:text-sm font-light">
                  <LayoutGrid className="h-5 w-5 text-[#D4573B] shrink-0 mt-0.5" />
                  <div className="space-y-0.5 text-left">
                    <span className="block font-bold uppercase text-[10px] tracking-wider text-white">CAD Seating Maps</span>
                    <span className="text-zinc-400 text-xs font-light">Precise spatial ticket allocation.</span>
                  </div>
                </li>
                <li className="flex items-start gap-4 text-xs sm:text-sm font-light">
                  <TrendingUp className="h-5 w-5 text-[#D4573B] shrink-0 mt-0.5" />
                  <div className="space-y-0.5 text-left">
                    <span className="block font-bold uppercase text-[10px] tracking-wider text-white">Behavioral CRM</span>
                    <span className="text-zinc-400 text-xs font-light">Deep audience lifecycle insights.</span>
                  </div>
                </li>
                <li className="flex items-start gap-4 text-xs sm:text-sm font-light">
                  <Cpu className="h-5 w-5 text-[#D4573B] shrink-0 mt-0.5" />
                  <div className="space-y-0.5 text-left">
                    <span className="block font-bold uppercase text-[10px] tracking-wider text-white">Full API Bridge</span>
                    <span className="text-zinc-400 text-xs font-light">Seamless backend integration.</span>
                  </div>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleSelectTier('Professional')}
              className="w-full bg-[#D4573B] hover:bg-[#c34c31] text-white py-4.5 font-sans text-[11px] font-bold uppercase tracking-widest transition-all duration-200 min-h-[44px]"
            >
              Elevate Platform
            </button>
          </motion.div>

          {/* Boutique Tier (03 / Growth) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            onMouseEnter={() => setHoveredCard(3)}
            onMouseLeave={() => setHoveredCard(null)}
            className="group flex flex-col justify-between h-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 p-8 sm:p-10 lg:p-12 transition-all duration-300 rounded-none relative text-left"
            style={{
              transform: hoveredCard === 3 ? 'translateY(-8px)' : 'translateY(0px)',
              borderColor: hoveredCard === 3 ? 'rgba(212, 87, 59, 0.4)' : ''
            }}
          >
            <div>
              <span className="font-mono text-[10px] font-bold text-zinc-450 dark:text-zinc-550 uppercase tracking-widest mb-10 block">
                03 / Growth
              </span>
              <h2 className="font-serif text-3xl md:text-4xl italic mb-4 font-light text-[#1A1A1A] dark:text-white">
                The Boutique
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm mb-12 font-light leading-relaxed">
                Optimized for high-velocity sales and rapid cycle events.
              </p>
              
              <div className="mb-12 flex items-baseline">
                <span className="font-serif text-5xl italic font-light text-[#1A1A1A] dark:text-white">$49</span>
                <span className="font-sans text-[10px] text-zinc-500 dark:text-zinc-400 ml-2.5 uppercase tracking-widest font-bold">
                  per month
                </span>
              </div>

              <ul className="space-y-6 mb-16">
                <li className="flex items-center gap-4 text-xs sm:text-sm font-light">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#D4573B]" />
                  <span>Lower Transaction Surcharge</span>
                </li>
                <li className="flex items-center gap-4 text-xs sm:text-sm font-light">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#D4573B]" />
                  <span>Custom Ticket Visual Identity</span>
                </li>
                <li className="flex items-center gap-4 text-xs sm:text-sm font-light">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#D4573B]" />
                  <span>Priority Concierge Support</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleSelectTier('Boutique')}
              className="w-full border border-zinc-900 dark:border-zinc-300 dark:hover:border-white hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-black py-4.5 font-sans text-[11px] font-bold uppercase tracking-widest transition-all duration-200 min-h-[44px]"
            >
              Select Tier
            </button>
          </motion.div>

        </div>
      </section>

      {/* Comparative Data Table */}
      <section className="bg-zinc-100 dark:bg-zinc-900/45 py-24 px-6 md:px-8 border-y border-zinc-200 dark:border-zinc-900">
        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-16 items-end text-left">
            <div className="md:col-span-6 space-y-3">
              <span className="font-mono text-[10px] font-bold text-[#D4573B] uppercase tracking-widest block">
                Comparative Analysis
              </span>
              <h3 className="font-serif text-4xl italic font-light text-[#1A1A1A] dark:text-white tracking-tight">
                Platform Transparency
              </h3>
            </div>
            <div className="md:col-span-6">
              <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-md font-light leading-relaxed">
                Our fee structure is immutable and radical in its transparency. We align our growth directly with yours, eliminating tiered gates.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[700px] text-left">
              <thead>
                <tr className="border-b border-zinc-900 dark:border-zinc-100 font-sans text-[11px] font-bold uppercase tracking-widest text-zinc-550 dark:text-zinc-350">
                  <th className="py-6 font-bold uppercase">Service Metric</th>
                  <th className="py-6 font-bold uppercase">Emerging</th>
                  <th className="py-6 font-bold uppercase text-[#D4573B]">Professional</th>
                  <th className="py-6 font-bold uppercase">Boutique</th>
                </tr>
              </thead>
              <tbody className="text-xs sm:text-sm font-light">
                <tr className="border-b border-zinc-200 dark:border-zinc-800/65 group hover:bg-white/40 dark:hover:bg-black/30 transition-colors">
                  <td className="py-8 font-sans text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-bold">
                    Evora Service Fee
                  </td>
                  <td className="py-8 text-zinc-700 dark:text-zinc-300">3.5% + $0.99</td>
                  <td className="py-8 text-zinc-900 dark:text-white font-bold">2.0% + $0.75</td>
                  <td className="py-8 text-zinc-700 dark:text-zinc-300">2.5% + $0.50</td>
                </tr>
                <tr className="border-b border-zinc-200 dark:border-zinc-800/65 group hover:bg-white/40 dark:hover:bg-black/30 transition-colors">
                  <td className="py-8 font-sans text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-bold">
                    Payment Processing
                  </td>
                  <td className="py-8 text-zinc-700 dark:text-zinc-300">2.9% + $0.30</td>
                  <td className="py-8 text-zinc-900 dark:text-white font-bold">2.9% + $0.30</td>
                  <td className="py-8 text-zinc-700 dark:text-zinc-300">2.9% + $0.30</td>
                </tr>
                <tr className="group hover:bg-white/40 dark:hover:bg-black/30 transition-colors">
                  <td className="py-8 font-sans text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-bold">
                    Payout Window
                  </td>
                  <td className="py-8 text-zinc-555 dark:text-zinc-400">3–5 Business Days</td>
                  <td className="py-8 text-[#D4573B] font-bold italic font-serif text-lg tracking-tight">
                    Instantaneous
                  </td>
                  <td className="py-8 text-zinc-700 dark:text-zinc-300">Next Day</td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </section>

      {/* Enterprise Architecture Section */}
      <section className="py-28 px-6 md:px-8 text-center max-w-4xl mx-auto">
        <div className="mb-10 inline-flex p-8 border border-zinc-200 dark:border-zinc-800 rotate-45 hover:rotate-0 transition-transform duration-700 cursor-pointer text-[#D4573B]">
          <InfinityIcon className="h-10 w-10 -rotate-45 hover:rotate-0 transition-transform shrink-0" />
        </div>
        
        <h4 className="font-serif text-4xl italic font-light mb-8 text-[#1A1A1A] dark:text-white">
          Beyond the Standard
        </h4>
        
        <p className="text-base sm:text-lg font-light text-zinc-600 dark:text-zinc-400 mb-12 leading-relaxed max-w-2xl mx-auto">
          For global festivals and heritage venues requiring custom architectural solutions. Our enterprise team builds bespoke infrastructure for scale that exceeds our standard tiers.
        </p>

        <button 
          onClick={() => showToast("Architectural consult request dispatched. We will contact you shortly.", "success")}
          className="inline-flex items-center gap-3 font-sans text-[11px] font-bold uppercase tracking-[0.15em] text-[#1A1A1A] dark:text-white border-b border-zinc-300 dark:border-zinc-700 hover:border-[#D4573B] dark:hover:border-[#D4573B] pb-2 transition-all duration-300 min-h-[44px]"
        >
          <span>Request Architectural Consult</span>
          <ArrowUpRight className="h-4 w-4 text-[#D4573B]" />
        </button>
      </section>

    </motion.div>
  );
}
