import React, { useState } from 'react';
import { Attendee, ScanLog } from '../types';
import { Camera, Zap, RotateCw, CheckCircle2, XCircle, Search, RefreshCw, Sparkles, UserCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { useNotification } from './NotificationProvider';

interface OrganizerScannerProps {
  attendees: Attendee[];
  onCheckInAttendee: (id: string) => void;
  scanLogs: ScanLog[];
  onAddScanLog: (log: ScanLog) => void;
}

export default function OrganizerScanner({
  attendees,
  onCheckInAttendee,
  scanLogs,
  onAddScanLog,
}: OrganizerScannerProps) {
  const { showToast } = useNotification();
  const [selectedAttendeeId, setSelectedAttendeeId] = useState('');
  const [flashlight, setFlashlight] = useState(false);
  const [cameraActive, setCameraActive] = useState(true);
  const [scanStatus, setScanStatus] = useState<{ status: 'idle' | 'success' | 'failed'; message: string } | null>(null);

  // Filter attendees that are registered or checked in for simulation dropdown
  // We want to list all of them so they can see failures too
  const registeredAttendees = attendees.filter((a) => a.status !== 'refunded');

  const handleSimulateScan = () => {
    if (!selectedAttendeeId) return;

    const attendee = attendees.find((a) => a.id === selectedAttendeeId);
    if (!attendee) return;

    // Simulate laser swipe delay
    setScanStatus(null);
    
    setTimeout(() => {
      if (attendee.status === 'checked_in') {
        const errorMsg = `FAILED: ${attendee.name} already checked in.`;
        setScanStatus({
          status: 'failed',
          message: errorMsg,
        });
        onAddScanLog({
          id: `scan-${Math.floor(10000 + Math.random() * 90000)}`,
          attendeeName: attendee.name,
          ticketClass: attendee.ticketClass,
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
          status: 'failed',
          errorReason: 'Already Checked In',
        });
      } else if (attendee.status === 'refunded') {
        const errorMsg = `INVALID: Ticket ID is refunded.`;
        setScanStatus({
          status: 'failed',
          message: errorMsg,
        });
        onAddScanLog({
          id: `scan-${Math.floor(10000 + Math.random() * 90000)}`,
          attendeeName: attendee.name,
          ticketClass: attendee.ticketClass,
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
          status: 'failed',
          errorReason: 'Ticket Voided / Refunded',
        });
      } else {
        // Success
        setScanStatus({
          status: 'success',
          message: `SUCCESS: ${attendee.name} validated!`,
        });
        onCheckInAttendee(attendee.id);
        onAddScanLog({
          id: `scan-${Math.floor(10000 + Math.random() * 90000)}`,
          attendeeName: attendee.name,
          ticketClass: attendee.ticketClass,
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
          status: 'success',
        });
      }
    }, 600);
  };

  // Stats calculation
  const totalRosterCount = attendees.filter((a) => a.status !== 'refunded').length;
  const totalCheckedIn = attendees.filter((a) => a.status === 'checked_in').length;
  const percentageCheckedIn = totalRosterCount > 0 ? Math.round((totalCheckedIn / totalRosterCount) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-transparent py-8 transition-colors duration-300"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="border-b border-zinc-200 dark:border-zinc-900 pb-5">
          <p className="text-4xs font-mono uppercase tracking-[0.25em] text-zinc-500 mb-1">
            INTELLIGENT DOOR ACCESS
          </p>
          <h1 className="font-serif text-3xl font-light tracking-tight text-zinc-900 dark:text-white">
            Check-In Scanner
          </h1>
          <p className="text-zinc-500 text-xs sm:text-sm font-light mt-1">
            Deploy dynamic QR scanners to authorize admission tickets in real-time.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Side Viewport */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Viewport Card */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 overflow-hidden shadow-md relative">
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-900 flex items-center justify-between bg-zinc-50/50 dark:bg-black/40">
                <div className="flex items-center space-x-2 text-2xs font-mono text-zinc-500 dark:text-zinc-400">
                  <span className={`h-2.5 w-2.5 rounded-full ${cameraActive ? 'bg-indigo-500 animate-pulse' : 'bg-zinc-300 dark:bg-zinc-800'}`} />
                  <span>{cameraActive ? 'FEED_LIVE: PRIMARY_WEB_CAMERA' : 'FEED_STALE: CAMERA_DISABLED'}</span>
                </div>

                {/* Viewport Control Buttons */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setFlashlight(!flashlight)}
                    className={`p-2 rounded-lg border transition-all ${
                      flashlight
                        ? 'bg-amber-400/10 border-amber-400 text-amber-500 dark:text-amber-400'
                        : 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                    title="Toggle Flashlight Simulator"
                  >
                    <Zap className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => showToast('Switched camera sensor. Calibrating zoom...', 'info')}
                    className="p-2 rounded-lg border bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all"
                    title="Rotate Camera"
                  >
                    <RotateCw className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Viewport Stage */}
              <div className="h-96 w-full bg-zinc-950 relative flex items-center justify-center overflow-hidden">
                {/* Simulated ambient lighting overlay based on flashlight */}
                <div className={`absolute inset-0 transition-opacity duration-300 pointer-events-none ${flashlight ? 'bg-white/5' : 'bg-black/60'}`} />

                {/* Video camera canvas simulator with grid */}
                <div className="absolute inset-0 opacity-15 pointer-events-none text-zinc-200 dark:text-zinc-800" 
                     style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', backgroundSize: '16px 16px' }} />

                {/* Target reticle */}
                <div className="relative h-56 w-56 border border-dashed border-zinc-700 dark:border-zinc-800 rounded-2xl flex items-center justify-center">
                  <div className="absolute -top-1 -left-1 h-6 w-6 border-t-2 border-l-2 border-white rounded-tl-lg" />
                  <div className="absolute -top-1 -right-1 h-6 w-6 border-t-2 border-r-2 border-white rounded-tr-lg" />
                  <div className="absolute -bottom-1 -left-1 h-6 w-6 border-b-2 border-l-2 border-white rounded-bl-lg" />
                  <div className="absolute -bottom-1 -right-1 h-6 w-6 border-b-2 border-r-2 border-white rounded-br-lg" />

                  {/* Scan Laser Animation Line */}
                  {cameraActive && (
                    <motion.div
                      animate={{ top: ['4%', '94%', '4%'] }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute left-[4%] right-[4%] h-[2.5px] bg-indigo-500 shadow-[0_0_10px_#6366f1] rounded-full z-10"
                    />
                  )}

                  {/* Scanning Status overlay */}
                  {scanStatus && (
                    <div className={`absolute inset-4 rounded-xl backdrop-blur-md flex flex-col items-center justify-center p-4 text-center z-20 ${
                      scanStatus.status === 'success'
                        ? 'bg-emerald-950/90 border border-emerald-500/30 text-emerald-400'
                        : 'bg-rose-950/90 border border-rose-500/30 text-rose-400'
                    }`}>
                      {scanStatus.status === 'success' ? (
                        <CheckCircle2 className="h-10 w-10 mb-2 animate-bounce" />
                      ) : (
                        <XCircle className="h-10 w-10 mb-2 animate-shake" />
                      )}
                      <p className="text-2xs font-mono uppercase tracking-widest font-bold">
                        {scanStatus.status === 'success' ? 'Validated' : 'Void / Repeat'}
                      </p>
                      <p className="text-3xs font-light mt-1 text-zinc-300">
                        {scanStatus.message}
                      </p>
                    </div>
                  )}

                  {!scanStatus && (
                    <div className="text-center space-y-1.5 text-zinc-400 dark:text-zinc-500">
                      <Camera className="h-9 w-9 mx-auto stroke-[1.2px]" />
                      <p className="text-5xs font-mono uppercase tracking-[0.2em]">Align QR Code</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Interactive Controller Card */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 p-6 space-y-4 shadow-sm">
              <div>
                <h3 className="font-serif text-lg font-light tracking-tight text-zinc-900 dark:text-white mb-1">
                  Sandbox Scan Simulator
                </h3>
                <p className="text-zinc-500 dark:text-zinc-500 text-xs sm:text-sm font-light">
                  Select a delegate name from your database to trigger a simulated ticket scan at the gate.
                </p>
              </div>

              <div className="grid sm:grid-cols-12 gap-3.5">
                <div className="sm:col-span-9">
                  <select
                    value={selectedAttendeeId}
                    onChange={(e) => {
                      setSelectedAttendeeId(e.target.value);
                      setScanStatus(null);
                    }}
                    className="w-full rounded-lg border border-zinc-200 dark:border-zinc-900 bg-zinc-50 dark:bg-black px-3.5 py-2.5 text-2xs font-light text-zinc-800 dark:text-zinc-300 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 cursor-pointer"
                  >
                    <option value="">-- Choose Delegate to Scan --</option>
                    {registeredAttendees.map((at) => (
                      <option key={at.id} value={at.id}>
                        {at.name} ({at.ticketClass} · {at.status.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleSimulateScan}
                  disabled={!selectedAttendeeId}
                  className="sm:col-span-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 disabled:bg-zinc-100 dark:disabled:bg-zinc-900 disabled:text-zinc-400 dark:disabled:text-zinc-600 text-white dark:text-black py-2.5 text-5xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Scan QR Code</span>
                </button>
              </div>
            </div>

          </div>

          {/* Right Side Stats & Recent Scans */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Realtime Checkin Progress Ring / Stats */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 p-6 space-y-4 shadow-sm">
              <span className="text-5xs font-mono text-zinc-500 uppercase tracking-widest border-b border-zinc-200 dark:border-zinc-900 pb-2.5 block">
                GATE CAPACITY PROGRESS
              </span>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {totalCheckedIn} / {totalRosterCount}
                  </p>
                  <p className="text-5xs font-mono text-zinc-500 uppercase tracking-wider mt-0.5">
                    Delegates checked in inside
                  </p>
                </div>

                <div className="text-right font-mono">
                  <p className="text-lg font-bold text-zinc-900 dark:text-white">{percentageCheckedIn}%</p>
                  <p className="text-5xs text-zinc-500 uppercase font-semibold">Utilized</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500"
                  style={{ width: `${percentageCheckedIn}%` }}
                />
              </div>
            </div>

            {/* Recent Scans ledger */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 p-6 space-y-4 shadow-sm">
              <span className="text-5xs font-mono text-zinc-500 uppercase tracking-widest border-b border-zinc-200 dark:border-zinc-900 pb-2.5 block">
                RECENT SCAN LOGS ({scanLogs.length})
              </span>

              <div className="space-y-3.5 max-h-[250px] overflow-y-auto no-scrollbar">
                {scanLogs.length === 0 ? (
                  <p className="text-center text-zinc-500 text-5xs font-mono uppercase py-8">
                    No scans registered yet.
                  </p>
                ) : (
                  scanLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-900 pb-3"
                    >
                      <div className="min-w-0">
                        <p className="text-2xs font-semibold text-zinc-900 dark:text-white truncate">{log.attendeeName}</p>
                        <p className="text-5xs text-zinc-500 font-mono mt-0.5 truncate uppercase">
                          {log.ticketClass} · {log.timestamp}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`inline-block rounded px-2 py-0.5 text-5xs font-bold uppercase tracking-widest ${
                          log.status === 'success'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        }`}>
                          {log.status === 'success' ? 'authorized' : log.errorReason || 'rejected'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </motion.div>
  );
}
