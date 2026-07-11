import React, { useState } from 'react';
import { Event, TicketTier, Attendee } from '../types';
import { ArrowLeft, Calendar, MapPin, Clock, Ticket, ShieldCheck, CreditCard, Sparkles, CheckCircle, Download } from 'lucide-react';
import { motion } from 'motion/react';
import { useNotification } from './NotificationProvider';

interface ClientEventDetailsProps {
  event: Event;
  onBack: () => void;
  onPurchaseSuccess: (attendees: Attendee[], updatedEvent: Event) => void;
}

export default function ClientEventDetails({ event, onBack, onPurchaseSuccess }: ClientEventDetailsProps) {
  const { showAlert, showToast } = useNotification();
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({});
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', cardNum: '4111 2222 3333 4444', cardExpiry: '12/28', cardCvc: '982' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [purchasedAttendees, setPurchasedAttendees] = useState<Attendee[] | null>(null);

  const handleQtyChange = (tierId: string, delta: number, tier: TicketTier) => {
    if (tier.status === 'sold_out') return;
    const current = selectedQuantities[tierId] || 0;
    const next = Math.max(0, current + delta);
    const available = tier.capacity - tier.soldCount;
    if (next > available) return; // Can't exceed remaining capacity
    if (next > 5) return; // Limit 5 per purchase
    
    setSelectedQuantities({
      ...selectedQuantities,
      [tierId]: next,
    });
  };

  const totalTickets = (Object.values(selectedQuantities) as number[]).reduce((a, b) => a + b, 0);
  const subtotal = event.tiers.reduce((sum, tier) => {
    const qty = selectedQuantities[tier.id] || 0;
    return sum + (qty * tier.price);
  }, 0);

  const serviceFee = subtotal > 0 ? Number((subtotal * 0.035 + 1.5).toFixed(2)) : 0;
  const orderTotal = subtotal + serviceFee;

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      showAlert('Required Information', 'Please enter your name and email address to proceed with the registration.', 'error');
      return;
    }

    const items = Object.entries(selectedQuantities)
      .filter(([_, qty]) => qty > 0)
      .map(([tierId, quantity]) => ({ tierId, quantity }));

    if (items.length === 0) {
      showAlert('No Tickets Selected', 'Please select at least one ticket.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          buyerName: formData.name,
          buyerEmail: formData.email,
          items,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showAlert('Checkout Failed', data.error || 'Something went wrong.', 'error');
        setIsSubmitting(false);
        return;
      }

      // Build legacy attendees from API response
      const newAttendees: Attendee[] = data.tickets.map((t: any) => ({
        id: t.id,
        name: t.attendeeName,
        email: formData.email,
        ticketClass: t.tierName,
        ticketPrice: t.priceCents / 100,
        purchaseDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        status: 'registered' as const,
        eventId: event.id,
        eventTitle: event.title,
      }));

      // Update tier counts locally
      const updatedTiers = event.tiers.map((t) => {
        const qty = selectedQuantities[t.id] || 0;
        if (qty > 0) {
          return {
            ...t,
            soldCount: t.soldCount + qty,
            status: t.soldCount + qty >= t.capacity ? 'sold_out' as const : t.status,
          };
        }
        return t;
      });

      const updatedEvent: Event = { ...event, tiers: updatedTiers };
      setPurchasedAttendees(newAttendees);
      setIsSubmitting(false);
      onPurchaseSuccess(newAttendees, updatedEvent);
    } catch (err) {
      showAlert('Network Error', 'Could not reach the server. Please try again.', 'error');
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelectedQuantities({});
    setPurchasedAttendees(null);
    setIsCheckoutOpen(false);
    onBack();
  };

  if (purchasedAttendees) {
    return (
      <div className="bg-transparent py-16 flex items-center justify-center transition-colors duration-300">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="max-w-lg w-full mx-auto px-4"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <div className="mx-auto h-12 w-12 border border-emerald-500 flex items-center justify-center mb-6">
              <CheckCircle className="h-6 w-6 text-emerald-500" />
            </div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-2">
              Confirmed
            </p>
            <h2 className="font-serif text-3xl font-light text-zinc-900 dark:text-white mb-3">
              You're In
            </h2>
            <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">
              Confirmation sent to{' '}
              <span className="text-zinc-900 dark:text-white">{formData.email}</span>
            </p>
          </div>

          {/* Tickets */}
          <div className="space-y-4 mb-10">
            {purchasedAttendees.map((at, i) => (
              <motion.div
                key={at.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.08, ease: [0.23, 1, 0.32, 1] }}
                className="border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950"
              >
                <div className="p-6 flex items-start justify-between gap-6">
                  <div className="space-y-3 flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400">
                        {at.ticketClass}
                      </span>
                    </div>
                    <h4 className="font-serif text-lg font-light text-zinc-900 dark:text-white">
                      {event.title}
                    </h4>
                    <div className="space-y-1">
                      <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">
                        {at.name}
                      </p>
                      <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">
                        {event.date} · {event.location}
                      </p>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="shrink-0 flex flex-col items-center">
                    <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
                      <svg width="56" height="56" viewBox="0 0 100 100" className="text-black dark:text-white">
                        <rect x="0" y="0" width="25" height="25" fill="currentColor" />
                        <rect x="3" y="3" width="19" height="19" fill="white" />
                        <rect x="7" y="7" width="11" height="11" fill="currentColor" />
                        <rect x="75" y="0" width="25" height="25" fill="currentColor" />
                        <rect x="78" y="3" width="19" height="19" fill="white" />
                        <rect x="82" y="7" width="11" height="11" fill="currentColor" />
                        <rect x="0" y="75" width="25" height="25" fill="currentColor" />
                        <rect x="3" y="78" width="19" height="19" fill="white" />
                        <rect x="7" y="82" width="11" height="11" fill="currentColor" />
                        <rect x="10" y="35" width="8" height="8" fill="currentColor" />
                        <rect x="25" y="45" width="12" height="6" fill="currentColor" />
                        <rect x="40" y="10" width="6" height="20" fill="currentColor" />
                        <rect x="50" y="5" width="15" height="8" fill="currentColor" />
                        <rect x="45" y="40" width="20" height="20" fill="currentColor" />
                        <rect x="70" y="45" width="8" height="12" fill="currentColor" />
                        <rect x="35" y="70" width="12" height="15" fill="currentColor" />
                        <rect x="60" y="75" width="25" height="5" fill="currentColor" />
                        <rect x="65" y="65" width="8" height="8" fill="currentColor" />
                        <rect x="15" y="55" width="15" height="12" fill="currentColor" />
                        <rect x="85" y="30" width="10" height="10" fill="currentColor" />
                        <rect x="55" y="85" width="15" height="10" fill="currentColor" />
                      </svg>
                    </div>
                    <p className="font-mono text-[8px] text-zinc-400 uppercase tracking-wider mt-1.5 truncate max-w-[80px]">
                      {at.id.slice(0, 8)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white py-3.5 font-mono text-[10px] font-bold uppercase tracking-wider hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
            >
              Back to Events
            </button>
            <button
              onClick={() => showToast('Ticket PDF saved to downloads.', 'success')}
              className="flex-1 bg-zinc-900 dark:bg-white text-white dark:text-black py-3.5 font-mono text-[10px] font-bold uppercase tracking-wider hover:bg-[#D4573B] dark:hover:bg-[#D4573B] dark:hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              <Download className="h-3.5 w-3.5" />
              Download PDF
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-transparent py-8 transition-colors duration-300"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <button
          onClick={onBack}
          className="group flex items-center text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white uppercase tracking-widest gap-2 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Grid</span>
        </button>

        <div className="grid lg:grid-cols-12 gap-10">
          
          {/* Main Info Column */}
          <div className="lg:col-span-7 space-y-8">
            <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-900 bg-white/20 dark:bg-zinc-950/20">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-80 object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                {event.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 py-1 text-4xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-zinc-900 dark:text-white mb-4 leading-tight">
                {event.title}
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm font-mono leading-normal max-w-2xl mb-6">
                {event.subtitle}
              </p>

              {/* Event Logistics Info */}
              <div className="grid sm:grid-cols-3 gap-4 border-y border-zinc-200 dark:border-zinc-900 py-6 my-8">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 p-2 text-zinc-600 dark:text-zinc-400 shadow-2xs">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-5xs text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Date</p>
                    <p className="text-2xs font-semibold text-zinc-800 dark:text-zinc-200">{event.date}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 p-2 text-zinc-600 dark:text-zinc-400 shadow-2xs">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-5xs text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Duration</p>
                    <p className="text-2xs font-semibold text-zinc-800 dark:text-zinc-200">{event.time}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 p-2 text-zinc-600 dark:text-zinc-400 shadow-2xs">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-5xs text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Venue</p>
                    <p className="text-2xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">{event.location}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-4">
                <h3 className="font-serif text-lg font-light tracking-tight text-zinc-900 dark:text-white">
                  The Experience
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm font-light leading-relaxed whitespace-pre-line">
                  {event.description}
                </p>
              </div>

              {/* Terms */}
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-950 bg-zinc-100/50 dark:bg-zinc-950/20 p-4 mt-8 space-y-2">
                <p className="text-5xs text-zinc-500 dark:text-zinc-400 font-mono uppercase tracking-widest flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-zinc-500" />
                  ENTRY CONTRACT
                </p>
                <p className="text-5xs text-zinc-500 leading-normal">
                  All sales are final. Over-18s only. High-fidelity earplugs are provided complimentary at the gate. Zero strobe policy inside, kinetic projection maps only.
                </p>
              </div>
            </div>
          </div>

          {/* Ticket Selection Panel Column */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 rounded-2xl border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 p-6 sm:p-8 space-y-6 shadow-sm">
              <div>
                <h3 className="font-serif text-xl font-light tracking-tight text-zinc-900 dark:text-white mb-1">
                  Access Admissions
                </h3>
                <p className="text-zinc-500 text-5xs font-mono uppercase tracking-[0.15em]">
                  Secure your passage to {event.title}.
                </p>
              </div>

              {/* Tiers List */}
              <div className="space-y-4">
                {event.tiers.map((tier) => {
                  const qty = selectedQuantities[tier.id] || 0;
                  const isSoldOut = tier.status === 'sold_out';
                  const remaining = tier.capacity - tier.soldCount;

                  return (
                    <div
                      key={tier.id}
                      className={`rounded-xl border p-4 transition-all duration-300 relative ${
                        isSoldOut
                          ? 'border-zinc-200 dark:border-zinc-900 bg-zinc-50 dark:bg-black/40 opacity-50'
                          : qty > 0
                          ? 'border-zinc-900 dark:border-white bg-zinc-50 dark:bg-zinc-950 shadow-xs'
                          : 'border-zinc-200 dark:border-zinc-900 bg-white dark:bg-black/60 hover:border-zinc-300 dark:hover:border-zinc-800'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-sans text-xs sm:text-sm font-medium text-zinc-900 dark:text-white">
                              {tier.name}
                            </span>
                            {remaining < 20 && remaining > 0 && (
                              <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-5xs font-mono uppercase tracking-widest text-amber-600 dark:text-amber-400">
                                Low Stock
                              </span>
                            )}
                          </div>
                          {tier.description && (
                            <p className="text-zinc-600 dark:text-zinc-400 text-4xs font-light max-w-xs leading-normal">
                              {tier.description}
                            </p>
                          )}
                        </div>

                        <div className="text-right shrink-0">
                          <p className={`font-mono text-sm font-semibold ${isSoldOut ? 'line-through text-zinc-400 dark:text-zinc-500' : 'text-zinc-900 dark:text-white'}`}>
                            ${tier.price}
                          </p>
                          {!isSoldOut && (
                            <p className="text-5xs font-mono text-zinc-500 uppercase mt-0.5">
                              {remaining} left
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Ticket Quantity Selector */}
                      <div className="mt-4 flex justify-between items-center border-t border-zinc-100 dark:border-zinc-900/80 pt-3">
                        <span className="text-5xs font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                          Quantity Limit: 5
                        </span>

                        {isSoldOut ? (
                          <span className="text-4xs font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-widest font-bold">
                            Sold Out
                          </span>
                        ) : (
                          <div className="flex items-center space-x-3.5">
                            <button
                              onClick={() => handleQtyChange(tier.id, -1, tier)}
                              disabled={qty === 0}
                              className="h-7 w-7 rounded-full border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-500 flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors disabled:opacity-30 disabled:hover:border-zinc-300"
                            >
                              -
                            </button>
                            <span className="font-mono text-xs font-semibold text-zinc-900 dark:text-white w-4 text-center">
                              {qty}
                            </span>
                            <button
                              onClick={() => handleQtyChange(tier.id, 1, tier)}
                              disabled={qty >= remaining}
                              className="h-7 w-7 rounded-full border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-500 flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors disabled:opacity-30 disabled:hover:border-zinc-300"
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selection Summary */}
              {totalTickets > 0 && (
                <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800 p-4 space-y-3.5 bg-zinc-50/50 dark:bg-black/40">
                  <div className="flex justify-between text-2xs text-zinc-600 dark:text-zinc-400">
                    <span>Admissions ({totalTickets})</span>
                    <span className="font-mono text-zinc-900 dark:text-white">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-2xs text-zinc-600 dark:text-zinc-400">
                    <span>Compliance & Service Fee</span>
                    <span className="font-mono text-zinc-900 dark:text-white">${serviceFee.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-zinc-200 dark:border-zinc-900 pt-3 flex justify-between text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                    <span>Grand Total</span>
                    <span className="font-mono text-base font-bold text-zinc-900 dark:text-white">${orderTotal.toFixed(2)}</span>
                  </div>

                  {!isCheckoutOpen ? (
                    <button
                      onClick={() => setIsCheckoutOpen(true)}
                      className="w-full rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-black py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm"
                    >
                      <Ticket className="h-4 w-4" />
                      Proceed to Checkout
                    </button>
                  ) : (
                    <form onSubmit={handleCheckoutSubmit} className="space-y-4 border-t border-zinc-200 dark:border-zinc-900 pt-4 text-left">
                      <div>
                        <label className="block text-4xs font-mono text-zinc-500 dark:text-zinc-500 uppercase tracking-widest mb-1.5">
                          Delegate Legal Name
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Sarah Jenkins"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-black px-3.5 py-2 text-xs font-light text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
                        />
                      </div>

                      <div>
                        <label className="block text-4xs font-mono text-zinc-500 dark:text-zinc-500 uppercase tracking-widest mb-1.5">
                          Delivery Email Address
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="sarah.j@ambientspace.co"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-black px-3.5 py-2 text-xs font-light text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
                        />
                      </div>

                      {/* Mock Credit Card Inputs */}
                      <div className="space-y-2 rounded-lg border border-zinc-200 dark:border-zinc-900 bg-zinc-100/60 dark:bg-black/60 p-3">
                        <p className="text-5xs font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                          <CreditCard className="h-3 w-3 text-zinc-400 dark:text-zinc-500" />
                          Complimentary Sandbox Card
                        </p>
                        
                        <div className="grid grid-cols-3 gap-2">
                          <div className="col-span-3">
                            <input
                              type="text"
                              value={formData.cardNum}
                              onChange={(e) => setFormData({ ...formData, cardNum: e.target.value })}
                              className="w-full border-none bg-transparent px-1 py-0.5 text-xs font-mono text-zinc-600 dark:text-zinc-400 focus:outline-none"
                              placeholder="Card Number"
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              value={formData.cardExpiry}
                              onChange={(e) => setFormData({ ...formData, cardExpiry: e.target.value })}
                              className="w-full border-none bg-transparent px-1 py-0.5 text-xs font-mono text-zinc-600 dark:text-zinc-400 focus:outline-none"
                              placeholder="Expiry"
                            />
                          </div>
                          <div className="col-span-2">
                            <input
                              type="text"
                              value={formData.cardCvc}
                              onChange={(e) => setFormData({ ...formData, cardCvc: e.target.value })}
                              className="w-full border-none bg-transparent px-1 py-0.5 text-xs font-mono text-zinc-600 dark:text-zinc-400 focus:outline-none text-right"
                              placeholder="CVC"
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 disabled:bg-zinc-200 dark:disabled:bg-zinc-800 text-white dark:text-black py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md"
                      >
                        {isSubmitting ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white dark:border-black border-t-transparent" />
                        ) : (
                          <Sparkles className="h-4 w-4" />
                        )}
                        <span>{isSubmitting ? 'Verifying Sandbox Payment...' : `Transmit $${orderTotal.toFixed(2)}`}</span>
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </motion.div>
  );
}
