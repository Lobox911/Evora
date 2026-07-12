import React, { useState } from 'react';
import { 
  Check, 
  LayoutGrid, 
  TrendingUp, 
  Cpu, 
  Infinity as InfinityIcon, 
  ArrowUpRight, 
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
    showToast(`Starting setup for the ${tierName} plan. We'll reach out shortly!`, "success");
    if (onSelectTier) {
      onSelectTier(tierName);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="bg-[#FAFAF8] dark:bg-black text-[#1A1A1A] dark:text-zinc-100 min-h-screen pt-10 sm:pt-12 pb-20 sm:pb-24 transition-colors duration-300 font-sans"
    >
      {/* Hero Section */}
      <header className="px-4 sm:px-6 md:px-8 max-w-7xl mx-auto mb-14 sm:mb-20 md:mb-28 text-left">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-end border-b border-zinc-200 dark:border-zinc-900 pb-10 sm:pb-12">
          <div className="md:col-span-8 space-y-4">
            <span className="font-mono text-[11px] font-bold text-[#D4573B] uppercase tracking-[0.15em] block">
              Simple Pricing
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium text-[#1A1A1A] dark:text-white leading-tight tracking-tight">
              Sell tickets. Grow your events.<br className="hidden sm:block" /> No hidden charges.
            </h1>
          </div>
          <div className="md:col-span-4 pb-1">
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
              Whether you're organizing an owambe, a tech meetup, or a Detty December concert — pick the plan that fits. Upgrade anytime as your events grow.
            </p>
          </div>
        </div>
      </header>

      {/* Pricing Grid */}
      <section className="px-4 sm:px-6 md:px-8 max-w-7xl mx-auto mb-20 sm:mb-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          
          {/* Starter Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            onMouseEnter={() => setHoveredCard(1)}
            onMouseLeave={() => setHoveredCard(null)}
            className="group flex flex-col justify-between h-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 p-6 sm:p-8 lg:p-10 transition-all duration-300 text-left"
            style={{
              transform: hoveredCard === 1 ? 'translateY(-8px)' : 'translateY(0px)',
              borderColor: hoveredCard === 1 ? 'rgba(212, 87, 59, 0.4)' : ''
            }}
          >
            <div>
              <span className="font-mono text-[10px] font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest mb-8 block">
                Starter
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-medium mb-3 text-[#1A1A1A] dark:text-white">
                Free Forever
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-8 font-normal leading-relaxed">
                Perfect for small events, birthday parties, and first-time organizers.
              </p>
              
              <div className="mb-8 flex items-baseline">
                <span className="font-serif text-4xl sm:text-5xl font-medium text-[#1A1A1A] dark:text-white">₦0</span>
                <span className="font-mono text-[10px] text-zinc-500 dark:text-zinc-400 ml-2.5 uppercase tracking-widest font-bold">
                  per month
                </span>
              </div>

              <ul className="space-y-4 mb-12">
                <li className="flex items-center gap-3 text-sm font-normal">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#D4573B] shrink-0" />
                  <span>Up to 3 events per month</span>
                </li>
                <li className="flex items-center gap-3 text-sm font-normal">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#D4573B] shrink-0" />
                  <span>QR code check-in</span>
                </li>
                <li className="flex items-center gap-3 text-sm font-normal">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#D4573B] shrink-0" />
                  <span>Basic sales dashboard</span>
                </li>
                <li className="flex items-center gap-3 text-sm font-normal">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#D4573B] shrink-0" />
                  <span>Email ticket delivery</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleSelectTier('Starter')}
              className="w-full border border-zinc-900 dark:border-zinc-300 dark:hover:border-white hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-black py-4 font-mono text-[11px] font-bold uppercase tracking-widest transition-all duration-200"
            >
              Get Started Free
            </button>
          </motion.div>

          {/* Pro Plan — Highlighted */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            onMouseEnter={() => setHoveredCard(2)}
            onMouseLeave={() => setHoveredCard(null)}
            className="group flex flex-col justify-between h-full bg-[#1A1A1A] dark:bg-zinc-900 text-white p-6 sm:p-8 lg:p-10 transition-all duration-300 relative text-left overflow-hidden shadow-xl"
            style={{
              transform: hoveredCard === 2 ? 'translateY(-8px)' : 'translateY(0px)',
            }}
          >
            {/* Popular badge */}
            <div className="absolute top-0 right-0">
              <div className="bg-[#D4573B] text-white text-[9px] font-bold uppercase tracking-widest px-4 py-1.5 font-mono">
                Most Popular
              </div>
            </div>

            <div>
              <span className="font-mono text-[10px] font-bold text-[#D4573B] uppercase tracking-widest mb-8 block">
                Pro
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-medium mb-3 text-white">
                For Serious Organizers
              </h2>
              <p className="text-zinc-400 text-sm mb-8 font-normal leading-relaxed">
                For event planners, venues, and businesses running regular ticketed events.
              </p>
              
              <div className="mb-8 flex items-baseline">
                <span className="font-serif text-4xl sm:text-5xl font-medium text-[#D4573B]">₦15,000</span>
                <span className="font-mono text-[10px] text-zinc-400 ml-2.5 uppercase tracking-widest font-bold">
                  per month
                </span>
              </div>

              <ul className="space-y-4 mb-12">
                <li className="flex items-start gap-3 text-sm font-normal">
                  <LayoutGrid className="h-5 w-5 text-[#D4573B] shrink-0 mt-0.5" />
                  <div className="text-left">
                    <span className="block font-bold text-[11px] uppercase tracking-wider text-white">Unlimited Events</span>
                    <span className="text-zinc-400 text-xs">No cap on how many events you run.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-sm font-normal">
                  <TrendingUp className="h-5 w-5 text-[#D4573B] shrink-0 mt-0.5" />
                  <div className="text-left">
                    <span className="block font-bold text-[11px] uppercase tracking-wider text-white">Advanced Analytics</span>
                    <span className="text-zinc-400 text-xs">Track sales, attendance, and revenue trends.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-sm font-normal">
                  <Cpu className="h-5 w-5 text-[#D4573B] shrink-0 mt-0.5" />
                  <div className="text-left">
                    <span className="block font-bold text-[11px] uppercase tracking-wider text-white">Custom Branding</span>
                    <span className="text-zinc-400 text-xs">Your logo, colors, and domain on event pages.</span>
                  </div>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleSelectTier('Pro')}
              className="w-full bg-[#D4573B] hover:bg-[#c34c31] text-white py-4 font-mono text-[11px] font-bold uppercase tracking-widest transition-all duration-200"
            >
              Start Pro Plan
            </button>
          </motion.div>

          {/* Business Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            onMouseEnter={() => setHoveredCard(3)}
            onMouseLeave={() => setHoveredCard(null)}
            className="group flex flex-col justify-between h-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 p-6 sm:p-8 lg:p-10 transition-all duration-300 text-left"
            style={{
              transform: hoveredCard === 3 ? 'translateY(-8px)' : 'translateY(0px)',
              borderColor: hoveredCard === 3 ? 'rgba(212, 87, 59, 0.4)' : ''
            }}
          >
            <div>
              <span className="font-mono text-[10px] font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest mb-8 block">
                Business
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-medium mb-3 text-[#1A1A1A] dark:text-white">
                Scale Without Limits
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-8 font-normal leading-relaxed">
                For festivals, concert promoters, and high-volume event businesses.
              </p>
              
              <div className="mb-8 flex items-baseline">
                <span className="font-serif text-4xl sm:text-5xl font-medium text-[#1A1A1A] dark:text-white">₦50,000</span>
                <span className="font-mono text-[10px] text-zinc-500 dark:text-zinc-400 ml-2.5 uppercase tracking-widest font-bold">
                  per month
                </span>
              </div>

              <ul className="space-y-4 mb-12">
                <li className="flex items-center gap-3 text-sm font-normal">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#D4573B] shrink-0" />
                  <span>Lower transaction fees (1.5%)</span>
                </li>
                <li className="flex items-center gap-3 text-sm font-normal">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#D4573B] shrink-0" />
                  <span>Team accounts (up to 10 staff)</span>
                </li>
                <li className="flex items-center gap-3 text-sm font-normal">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#D4573B] shrink-0" />
                  <span>Priority support (WhatsApp + Email)</span>
                </li>
                <li className="flex items-center gap-3 text-sm font-normal">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#D4573B] shrink-0" />
                  <span>Dedicated account manager</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleSelectTier('Business')}
              className="w-full border border-zinc-900 dark:border-zinc-300 dark:hover:border-white hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-black py-4 font-mono text-[11px] font-bold uppercase tracking-widest transition-all duration-200"
            >
              Contact Sales
            </button>
          </motion.div>

        </div>
      </section>

      {/* Fee Comparison Table */}
      <section className="bg-zinc-100 dark:bg-zinc-900/45 py-16 sm:py-24 px-4 sm:px-6 md:px-8 border-y border-zinc-200 dark:border-zinc-900">
        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 mb-12 sm:mb-16 items-end text-left">
            <div className="md:col-span-6 space-y-3">
              <span className="font-mono text-[11px] font-bold text-[#D4573B] uppercase tracking-widest block">
                Fee Breakdown
              </span>
              <h3 className="font-serif text-3xl sm:text-4xl font-medium text-[#1A1A1A] dark:text-white tracking-tight">
                What You Pay, Clearly
              </h3>
            </div>
            <div className="md:col-span-6">
              <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-md font-normal leading-relaxed">
                No surprises. Every kobo is accounted for. You see exactly what goes to processing and what comes to us — and you keep the rest.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto -mx-4 px-4">
            <table className="w-full border-collapse min-w-[600px] text-left">
              <thead>
                <tr className="border-b border-zinc-900 dark:border-zinc-100 font-mono text-[11px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                  <th className="py-5 font-bold">Fee Type</th>
                  <th className="py-5 font-bold">Starter</th>
                  <th className="py-5 font-bold text-[#D4573B]">Pro</th>
                  <th className="py-5 font-bold">Business</th>
                </tr>
              </thead>
              <tbody className="text-sm font-normal">
                <tr className="border-b border-zinc-200 dark:border-zinc-800/65 hover:bg-white/40 dark:hover:bg-black/30 transition-colors">
                  <td className="py-6 font-mono text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-bold">
                    Evora Fee
                  </td>
                  <td className="py-6 text-zinc-700 dark:text-zinc-300">5% per ticket</td>
                  <td className="py-6 text-zinc-900 dark:text-white font-bold">3% per ticket</td>
                  <td className="py-6 text-zinc-700 dark:text-zinc-300">1.5% per ticket</td>
                </tr>
                <tr className="border-b border-zinc-200 dark:border-zinc-800/65 hover:bg-white/40 dark:hover:bg-black/30 transition-colors">
                  <td className="py-6 font-mono text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-bold">
                    Payment Processing
                  </td>
                  <td className="py-6 text-zinc-700 dark:text-zinc-300">1.5% + ₦100</td>
                  <td className="py-6 text-zinc-900 dark:text-white font-bold">1.5% + ₦100</td>
                  <td className="py-6 text-zinc-700 dark:text-zinc-300">1.5% + ₦100</td>
                </tr>
                <tr className="hover:bg-white/40 dark:hover:bg-black/30 transition-colors">
                  <td className="py-6 font-mono text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-bold">
                    Payout Speed
                  </td>
                  <td className="py-6 text-zinc-500 dark:text-zinc-400">3–5 Business Days</td>
                  <td className="py-6 text-[#D4573B] font-bold font-serif text-lg tracking-tight">
                    Next Day
                  </td>
                  <td className="py-6 text-zinc-700 dark:text-zinc-300">Same Day</td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </section>

      {/* Enterprise / Custom Section */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 md:px-8 text-center max-w-4xl mx-auto">
        <div className="mb-8 inline-flex p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 text-[#D4573B]">
          <InfinityIcon className="h-8 w-8 sm:h-10 sm:w-10 shrink-0" />
        </div>
        
        <h4 className="font-serif text-3xl sm:text-4xl font-medium mb-6 text-[#1A1A1A] dark:text-white">
          Need Something Custom?
        </h4>
        
        <p className="text-sm sm:text-base font-normal text-zinc-600 dark:text-zinc-400 mb-10 leading-relaxed max-w-2xl mx-auto">
          Running a major festival like Flytime Fest, a corporate conference, or a multi-city concert tour? We'll build a custom solution with dedicated support, white-label branding, and volume pricing.
        </p>

        <button 
          onClick={() => showToast("Request received! Our team will contact you within 24 hours.", "success")}
          className="inline-flex items-center gap-3 font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-[#1A1A1A] dark:text-white border-b-2 border-zinc-300 dark:border-zinc-700 hover:border-[#D4573B] dark:hover:border-[#D4573B] pb-2 transition-all duration-300"
        >
          <span>Talk to Our Team</span>
          <ArrowUpRight className="h-4 w-4 text-[#D4573B]" />
        </button>
      </section>

    </motion.div>
  );
}