'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Camera, CheckCircle2, XCircle, Search } from 'lucide-react';

export default function ScanPage() {
  const [ticketCode, setTicketCode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<{
    status: 'success' | 'failed';
    message: string;
    attendee?: string;
  } | null>(null);
  const [checkedInCount, setCheckedInCount] = useState(0);

  const handleManualScan = async () => {
    if (!ticketCode.trim()) return;
    setScanning(true);
    setResult(null);

    try {
      const res = await fetch(`/api/tickets/${ticketCode}/check-in`, { method: 'POST' });
      const data = await res.json();

      if (data.success) {
        setResult({ status: 'success', message: 'Checked in!', attendee: data.attendeeName });
        setCheckedInCount((c) => c + 1);
      } else {
        setResult({ status: 'failed', message: data.reason || 'Invalid ticket' });
      }
    } catch {
      setResult({ status: 'failed', message: 'Network error' });
    } finally {
      setScanning(false);
      setTicketCode('');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      {/* Counter */}
      <div className="absolute top-6 right-6 text-right">
        <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Checked In</p>
        <p className="font-serif text-4xl font-light">{checkedInCount}</p>
      </div>

      {/* Camera placeholder */}
      <div className="w-72 h-72 border-2 border-dashed border-zinc-700 flex items-center justify-center mb-8">
        <Camera className="h-16 w-16 text-zinc-700" />
      </div>

      <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-6">
        Point camera at QR code or enter ticket ID
      </p>

      {/* Manual entry */}
      <div className="flex gap-2 w-full max-w-sm mb-8">
        <input
          type="text"
          value={ticketCode}
          onChange={(e) => setTicketCode(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleManualScan()}
          placeholder="Ticket ID"
          className="flex-1 bg-zinc-900 border border-zinc-800 px-4 py-3 text-sm text-white focus:outline-none focus:border-zinc-600"
        />
        <button
          onClick={handleManualScan}
          disabled={scanning}
          className="bg-white text-black px-6 py-3 font-mono text-[10px] font-bold uppercase tracking-wider hover:bg-[#D4573B] hover:text-white transition-colors disabled:opacity-50"
        >
          {scanning ? '...' : 'Scan'}
        </button>
      </div>

      {/* Result flash */}
      {result && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
          className={`w-full max-w-sm p-6 text-center ${
            result.status === 'success'
              ? 'bg-emerald-950 border border-emerald-800'
              : 'bg-red-950 border border-red-800'
          }`}
        >
          {result.status === 'success' ? (
            <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
          ) : (
            <XCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
          )}
          <p className="font-mono text-sm font-bold uppercase">{result.message}</p>
          {result.attendee && (
            <p className="font-sans text-sm text-zinc-300 mt-1">{result.attendee}</p>
          )}
        </motion.div>
      )}
    </div>
  );
}
