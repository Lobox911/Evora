import React, { useState } from 'react';
import { Payout } from '../types';
import { 
  TrendingUp, 
  Landmark, 
  Calendar, 
  ShieldCheck, 
  Download, 
  Sparkles, 
  Layers, 
  FileSpreadsheet, 
  Activity, 
  ArrowUpRight, 
  Info,
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotification } from './NotificationProvider';

interface OrganizerFinancialsProps {
  payouts: Payout[];
  onRequestPayout: (amount: number) => void;
  attendeesCount: number;
  totalRevenue: number;
}

export default function OrganizerFinancials({
  payouts,
  onRequestPayout,
  attendeesCount,
  totalRevenue,
}: OrganizerFinancialsProps) {
  const { showAlert, showToast } = useNotification();
  
  // Initialize to the user's precise requested bento balance
  const [pendingBalance, setPendingBalance] = useState(24590.00);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Design system switcher: 'editorial' (from user's HTML) vs 'minimalist' (modern Swiss dark/light hybrid grid)
  const [activeDesign, setActiveDesign] = useState<'editorial' | 'minimalist'>('editorial');
  
  // Modernist design slider for instant payout control
  const [sliderAmount, setSliderAmount] = useState(12000);

  const handleInstantPayout = (amountToWithdraw: number) => {
    if (amountToWithdraw <= 0) {
      showAlert('Empty Balance', 'Your pending balance is currently $0.00. No payouts are available to request.', 'error');
      return;
    }

    if (amountToWithdraw > pendingBalance) {
      showAlert('Insufficient Funds', 'Requested amount exceeds the available pending balance.', 'error');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      onRequestPayout(amountToWithdraw);
      showToast(`Payout of $${amountToWithdraw.toLocaleString('en-US', { minimumFractionDigits: 2 })} requested!`, 'success');
      showAlert(
        'Instant Payout Successful', 
        `A payout of $${amountToWithdraw.toLocaleString('en-US', { minimumFractionDigits: 2 })} has been processed and dispatched securely to Wells Fargo (•••• 4242). Funds will settle in 1-2 hours.`, 
        'success'
      );
      setPendingBalance(prev => Math.max(0, prev - amountToWithdraw));
      setSliderAmount(prev => Math.max(0, Math.min(prev, pendingBalance - amountToWithdraw)));
      setIsProcessing(false);
    }, 1800);
  };

  // Lifetime Revenue matching the HTML base value + any sales in this session
  const basePastRevenue = 117460; // 142050 - 24590
  const lifetimeRevenue = basePastRevenue + totalRevenue + pendingBalance;

  // Real-time calculation of cleared vs processing balances (75% cleared, 25% processing)
  const clearedBalance = pendingBalance * 0.75;
  const processingBalance = pendingBalance * 0.25;

  // Real CSV Exporter
  const exportToCSV = () => {
    try {
      const csvContent = "data:text/csv;charset=utf-8," 
        + "Date,Amount,Status,Account\n"
        + payouts.map(p => `"${p.date}","$${p.amount.toFixed(2)}","${p.status.toUpperCase()}","${p.bankAccount}"`).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `evora_payout_history_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Payout history exported successfully as CSV', 'success');
    } catch (err) {
      showToast('Export failed. Please try again.', 'error');
    }
  };

  return (
    <div className="bg-transparent py-6 sm:py-8 transition-colors duration-300">
      {/* Inject custom Google Fonts so both designs look stunningly realistic and consistent */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;0,9..144,700;0,9..144,800;1,9..144,400&display=swap');
        
        .evora-editorial-font {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif !important;
        }
        .evora-editorial-font .font-serif-fraunces {
          font-family: 'Fraunces', Georgia, serif !important;
        }
      `}} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* DESIGN CHOICES TOGGLE CONTROLS BAR */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#f4f3f0] dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-none">
          <div className="space-y-0.5">
            <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest block">ADMIN DESIGN PORTFOLIO</span>
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
              Select Financial Dashboard Style
            </h4>
          </div>
          
          <div className="flex bg-white dark:bg-zinc-950 p-1 border border-zinc-200 dark:border-zinc-800 w-full sm:w-auto">
            {/* Design A Button */}
            <button
              onClick={() => setActiveDesign('editorial')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-wider transition-all duration-200 border-0 cursor-pointer ${
                activeDesign === 'editorial'
                  ? 'bg-[#a5351c] text-white'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white bg-transparent'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Design A: Editorial Bento</span>
            </button>

            {/* Design B Button */}
            <button
              onClick={() => {
                setActiveDesign('minimalist');
                // Cap default slider value to current pending balance
                setSliderAmount(Math.min(12000, pendingBalance));
              }}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-wider transition-all duration-200 border-0 cursor-pointer ${
                activeDesign === 'minimalist'
                  ? 'bg-zinc-950 dark:bg-white text-white dark:text-black'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white bg-transparent'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Design B: Swiss Modernist</span>
            </button>
          </div>
        </div>

        {/* DESIGN CANVAS CONTAINER */}
        <AnimatePresence mode="wait">
          {activeDesign === 'editorial' ? (
            
            /* =========================================================
               DESIGN A: EDITORIAL TERRACOTTA BENTO (USER'S EXACT HTML)
               ========================================================= */
            <motion.div
              key="editorial-bento"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="evora-editorial-font bg-[#faf9f6] text-[#1b1c1a] border border-[#dfbfb9]/40 p-6 sm:p-gutter shadow-sm space-y-12 transition-colors duration-300"
            >
              {/* Header Section */}
              <header className="border-b border-[#dfbfb9] pb-8 text-left">
                <h1 className="font-serif-fraunces text-4xl sm:text-5xl font-semibold text-[#1b1c1a] tracking-tight mb-3">
                  Payouts &amp; Financials
                </h1>
                <p className="text-sm text-[#58413c] max-w-2xl font-light leading-relaxed">
                  Transparent breakdown of your revenue streams, pending funds, and processing fees.
                </p>
              </header>

              {/* Bento Grid Layout for Financials */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                
                {/* Pending Funds Card (High Emphasis) */}
                <div className="col-span-1 md:col-span-5 bg-white border border-[#E5E5E5] p-6 sm:p-8 flex flex-col justify-between h-[400px] text-left">
                  <div>
                    <h3 className="font-mono text-[11px] font-bold text-[#58413c] uppercase tracking-wider mb-2">
                      Pending Balance
                    </h3>
                    <div className="font-serif-fraunces text-4xl sm:text-5xl text-[#1b1c1a] tracking-tighter mb-4 font-bold">
                      ${pendingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <p className="text-xs text-[#58413c] font-light">
                      Expected payout on Oct 15, 2023
                    </p>
                  </div>
                  
                  <div className="mt-8 space-y-4">
                    {/* Active Action Request Button for dynamic interactions */}
                    <button
                      onClick={() => handleInstantPayout(pendingBalance)}
                      disabled={pendingBalance <= 0 || isProcessing}
                      className="w-full bg-[#a5351c] text-white font-mono text-xs font-bold py-3 uppercase tracking-wider border-0 cursor-pointer hover:bg-[#872008] disabled:bg-zinc-100 disabled:text-zinc-400 transition-colors flex items-center justify-center gap-2"
                    >
                      {isProcessing ? (
                        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <Landmark className="h-4 w-4" />
                      )}
                      <span>Request Instant Transfer</span>
                    </button>

                    <div>
                      <div className="w-full bg-[#e3e2df] h-1.5 mb-3 relative">
                        <div 
                          className="absolute left-0 top-0 h-full bg-[#a5351c] transition-all duration-500" 
                          style={{ width: pendingBalance > 0 ? '75%' : '0%' }}
                        />
                      </div>
                      <div className="flex justify-between font-mono text-[10px] text-[#58413c] uppercase tracking-wider">
                        <span>Cleared: ${clearedBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        <span>Processing: ${processingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Total Revenue & Breakdown (Structural Split) */}
                <div className="col-span-1 md:col-span-7 grid grid-rows-2 gap-8 h-[400px] text-left">
                  
                  {/* Lifetime Revenue (Interactive Hover effect exact matching user request) */}
                  <div className="bg-white border border-[#E5E5E5] p-6 sm:p-8 flex justify-between items-center group hover:bg-[#0D0D0D] hover:text-white transition-all duration-350 cursor-pointer">
                    <div>
                      <h3 className="font-mono text-[11px] font-bold text-[#58413c] group-hover:text-zinc-400 uppercase mb-2 transition-colors">
                        Lifetime Net Revenue
                      </h3>
                      <div className="font-serif-fraunces text-3xl sm:text-4xl font-bold tracking-tight text-[#1b1c1a] group-hover:text-white transition-colors">
                        ${lifetimeRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div className="w-14 h-14 rounded-full border border-[#E5E5E5] group-hover:border-zinc-800 flex items-center justify-center transition-colors">
                      <TrendingUp className="h-6 w-6 text-[#a5351c] group-hover:text-emerald-400 transition-colors" />
                    </div>
                  </div>

                  {/* Fee Breakdown */}
                  <div className="bg-white border border-[#E5E5E5] p-6 sm:p-8 flex flex-col justify-center">
                    <h3 className="font-mono text-[11px] font-bold text-[#58413c] uppercase mb-4 tracking-wider">
                      Current Cycle Fee Breakdown
                    </h3>
                    
                    <div className="flex flex-col space-y-3">
                      <div className="flex justify-between items-center border-b border-[#E5E5E5] pb-3">
                        <span className="text-sm text-[#1b1c1a]">Gross Sales</span>
                        <span className="text-sm text-[#1b1c1a] font-semibold">
                          ${(pendingBalance * 1.057).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center text-[#58413c]">
                        <span className="text-xs flex items-center gap-2">
                          <span className="w-2 h-2 bg-[#e3e2df] inline-block"></span> 
                          Evora Platform Fee (2%)
                        </span>
                        <span className="text-xs font-mono font-medium">
                          -${(pendingBalance * 0.02).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center text-[#58413c]">
                        <span className="text-xs flex items-center gap-2">
                          <span className="w-2 h-2 bg-[#a5351c] inline-block"></span> 
                          Processing Fee (2.9% + 30¢)
                        </span>
                        <span className="text-xs font-mono font-medium">
                          -${(pendingBalance * 0.037).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Payout History Table */}
              <section className="space-y-6">
                <div className="flex justify-between items-end border-b border-[#dfbfb9]/40 pb-4">
                  <h2 className="font-serif-fraunces text-2xl text-[#1b1c1a] font-semibold text-left">
                    Payout History
                  </h2>
                  <button 
                    onClick={exportToCSV}
                    className="border border-[#E5E5E5] text-zinc-800 bg-white font-mono text-[11px] font-bold py-2 px-5 hover:bg-[#f4f3f0] transition-colors cursor-pointer"
                  >
                    Export CSV
                  </button>
                </div>
                
                <div className="w-full overflow-x-auto border border-[#E5E5E5] bg-white">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#E5E5E5] bg-[#faf9f6]">
                        <th className="py-5 px-6 font-mono text-[10px] text-[#58413c] uppercase tracking-widest font-bold">Date</th>
                        <th className="py-5 px-6 font-mono text-[10px] text-[#58413c] uppercase tracking-widest font-bold">Amount</th>
                        <th className="py-5 px-6 font-mono text-[10px] text-[#58413c] uppercase tracking-widest font-bold">Status</th>
                        <th className="py-5 px-6 font-mono text-[10px] text-[#58413c] uppercase tracking-widest font-bold">Account</th>
                        <th className="py-5 px-6 font-mono text-[10px] text-[#58413c] uppercase tracking-widest font-bold text-right">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs text-[#1b1c1a]">
                      {payouts.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-zinc-400 font-light">
                            No past ledger records found.
                          </td>
                        </tr>
                      ) : (
                        payouts.map((p) => (
                          <tr key={p.id} className="border-b border-[#E5E5E5] hover:bg-[#f4f3f0] transition-colors">
                            <td className="py-5 px-6 font-mono text-zinc-600">{p.date}</td>
                            <td className="py-5 px-6 font-semibold font-mono text-sm text-zinc-900">
                              ${p.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-5 px-6">
                              <span className="inline-block border border-[#1b1c1a] text-[#1b1c1a] font-mono text-[10px] uppercase px-2 py-0.5 font-bold tracking-widest">
                                {p.status === 'completed' ? 'Paid' : 'Pending'}
                              </span>
                            </td>
                            <td className="py-5 px-6 text-[#58413c] font-mono">
                              •••• {p.bankAccount.split('(').pop()?.replace(')', '').replace('****', '') || '4242'}
                            </td>
                            <td className="py-5 px-6 text-right">
                              <button 
                                onClick={() => showToast(`Receipt generated for record ${p.id}`, 'success')}
                                className="text-[#58413c] hover:text-[#a5351c] transition-colors bg-transparent border-0 cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-lg select-none">download</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </motion.div>

          ) : (

            /* =========================================================
               DESIGN B: SWISS MODERNIST MINIMALIST (STARK GRAPHIC GRID)
               ========================================================= */
            <motion.div
              key="modernist-grid"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-black text-zinc-950 dark:text-zinc-50 border border-zinc-900 dark:border-zinc-800 p-6 sm:p-8 space-y-12 transition-colors duration-300 font-mono text-left"
            >
              {/* Header Section */}
              <header className="border-b-2 border-zinc-900 dark:border-zinc-100 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                  <span className="text-[10px] font-bold tracking-[0.3em] text-zinc-500 uppercase block mb-1">
                    SYS.LOG // DISBURSEMENT LEDGER
                  </span>
                  <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter">
                    Payouts &amp; Economics
                  </h1>
                </div>
                <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-850 px-3 py-1.5 flex items-center gap-2 text-[10px] text-zinc-600 dark:text-zinc-400">
                  <Activity className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
                  <span>SECURE GATEWAY ACTIVE</span>
                </div>
              </header>

              {/* Swiss Dashboard Bento */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* INTERACTIVE PAYOUT SLIDER DRAWER */}
                <div className="border border-zinc-900 dark:border-zinc-800 p-6 flex flex-col justify-between h-[380px] bg-zinc-50 dark:bg-zinc-950">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">AVAILABLE AMOUNT</span>
                      <Info className="h-3.5 w-3.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer" />
                    </div>
                    
                    <div className="text-4xl font-extrabold tracking-tighter text-zinc-900 dark:text-white my-3">
                      ${pendingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>

                    <p className="text-[10px] text-zinc-500 leading-relaxed mb-6">
                      Customize instant deposit amounts below. Standard transfers settle automatically each Tuesday.
                    </p>
                  </div>

                  <div className="space-y-5">
                    {pendingBalance > 0 ? (
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] text-zinc-500 font-bold">
                          <span>REQUEST: ${sliderAmount.toLocaleString()}</span>
                          <span>MAX: ${Math.floor(pendingBalance).toLocaleString()}</span>
                        </div>
                        <input
                          type="range"
                          min="100"
                          max={Math.floor(pendingBalance)}
                          value={sliderAmount}
                          onChange={(e) => setSliderAmount(Number(e.target.value))}
                          className="w-full accent-zinc-900 dark:accent-white cursor-ew-resize"
                        />
                      </div>
                    ) : (
                      <div className="bg-zinc-100 dark:bg-zinc-900/40 p-4 border border-zinc-200 dark:border-zinc-800 text-[10px] text-center text-zinc-500">
                        PENDING BALANCE DEPLOYED COMPLETELY
                      </div>
                    )}

                    <button
                      onClick={() => handleInstantPayout(sliderAmount)}
                      disabled={pendingBalance <= 0 || isProcessing || sliderAmount <= 0}
                      className="w-full bg-zinc-950 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-100 font-bold text-[10px] uppercase tracking-widest py-3 border-0 cursor-pointer transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isProcessing ? (
                        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white dark:border-black border-t-transparent" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4" />
                      )}
                      <span>DISPATCH ${sliderAmount.toLocaleString()} INSTANTLY</span>
                    </button>
                  </div>
                </div>

                {/* LIFETIME METRICS GRAPHIC CARD */}
                <div className="border border-zinc-900 dark:border-zinc-800 p-6 flex flex-col justify-between h-[380px]">
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">CUMULATIVE NET INFLOW</span>
                    <div className="text-4xl font-extrabold tracking-tighter text-zinc-900 dark:text-white my-3">
                      ${lifetimeRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <p className="text-[10px] text-zinc-500 leading-relaxed">
                      Combined ledger statement showing total historical client transactions, processing fees deducted, and settled assets.
                    </p>
                  </div>

                  <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 space-y-3">
                    <div className="flex justify-between text-[11px] text-zinc-600 dark:text-zinc-400">
                      <span>Total Attendees</span>
                      <span className="font-bold text-zinc-900 dark:text-white">{attendeesCount} delegates</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-zinc-600 dark:text-zinc-400">
                      <span>Gateway Efficiency</span>
                      <span className="font-bold text-zinc-900 dark:text-white">99.98%</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-[#a5351c] dark:text-[#ffdad2]">
                      <span>Average Ticket Price</span>
                      <span className="font-bold">${attendeesCount > 0 ? (totalRevenue / attendeesCount).toFixed(2) : '0.00'}</span>
                    </div>
                  </div>
                </div>

                {/* COMPLIANCE & PROTOCOL DETAIL CARD */}
                <div className="border border-zinc-900 dark:border-zinc-800 p-6 flex flex-col justify-between h-[380px] bg-zinc-50 dark:bg-zinc-950">
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">COMPLIANCE PROTOCOLS</span>
                    <h3 className="text-base font-bold text-zinc-900 dark:text-white mt-2 mb-3">Fee Optimization</h3>
                    <p className="text-[10px] text-zinc-500 leading-relaxed mb-4">
                      All transaction logs are routed through merchant systems employing SSL-256 bit end-to-end tokenization algorithms.
                    </p>
                  </div>

                  <div className="space-y-2 text-[10px]">
                    <div className="flex justify-between border-b border-zinc-300 dark:border-zinc-800 pb-1.5">
                      <span className="text-zinc-500">Stripe Gateway</span>
                      <span className="font-bold text-zinc-800 dark:text-zinc-200">2.9% + $0.30</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-300 dark:border-zinc-800 pb-1.5">
                      <span className="text-zinc-500">Evora Core Platform</span>
                      <span className="font-bold text-zinc-800 dark:text-zinc-200">1.0% flat</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-300 dark:border-zinc-800 pb-1.5">
                      <span className="text-zinc-500">Chargeback Protocol</span>
                      <span className="text-emerald-500 font-bold">Compliant</span>
                    </div>
                  </div>

                  <div className="bg-zinc-200/50 dark:bg-zinc-900 p-3 flex items-center gap-2 border border-zinc-300 dark:border-zinc-850 text-[10px] text-zinc-500">
                    <ShieldCheck className="h-4 w-4 text-zinc-650 dark:text-zinc-400 shrink-0" />
                    <span>PCI-DSS Level 1 compliant gateway.</span>
                  </div>
                </div>

              </div>

              {/* Minimalist ledger log */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-black uppercase tracking-tight">LEDGER HISTORY</h3>
                  <button 
                    onClick={exportToCSV}
                    className="flex items-center gap-2 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-900 dark:text-white border border-zinc-900 dark:border-zinc-800 px-4 py-2 font-mono text-[10px] font-bold uppercase cursor-pointer transition-all"
                  >
                    <FileSpreadsheet className="h-3.5 w-3.5" />
                    <span>DOWNLOAD EXCEL/CSV</span>
                  </button>
                </div>

                <div className="w-full overflow-x-auto border border-zinc-900 dark:border-zinc-850">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b-2 border-zinc-900 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                        <th className="py-4 px-4">TRANSMITTED DATE</th>
                        <th className="py-4 px-4">TRANSMITTED AMOUNT</th>
                        <th className="py-4 px-4">TRANSACTION STATUS</th>
                        <th className="py-4 px-4">BANKING NETWORK</th>
                        <th className="py-4 px-4 text-right">HASH ID</th>
                      </tr>
                    </thead>
                    <tbody className="text-[11px] divide-y divide-zinc-200 dark:divide-zinc-900">
                      {payouts.map((p) => (
                        <tr key={p.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-950/50 transition-colors">
                          <td className="py-4 px-4 font-mono">{p.date.toUpperCase()}</td>
                          <td className="py-4 px-4 font-bold text-zinc-900 dark:text-white">
                            ${p.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-block px-2 py-0.5 font-bold uppercase tracking-widest border text-[9px] ${
                              p.status === 'completed'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                            }`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-zinc-500">{p.bankAccount}</td>
                          <td className="py-4 px-4 text-right font-mono text-zinc-400 select-all uppercase">
                            #{p.id}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
