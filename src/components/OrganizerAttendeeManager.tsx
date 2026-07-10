import React, { useState } from 'react';
import { Attendee, Event } from '../types';
import { 
  Search, 
  UserCheck, 
  UserMinus, 
  ShieldAlert, 
  Filter, 
  UserX, 
  Download, 
  Mail, 
  RefreshCw, 
  Plus, 
  X, 
  CheckCircle, 
  Check, 
  HelpCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotification } from './NotificationProvider';

interface OrganizerAttendeeManagerProps {
  attendees: Attendee[];
  onUpdateAttendeeStatus: (id: string, nextStatus: 'registered' | 'checked_in' | 'refunded') => void;
  events: Event[];
  onAddAttendee: (newAt: Attendee) => void;
}

export default function OrganizerAttendeeManager({
  attendees,
  onUpdateAttendeeStatus,
  events,
  onAddAttendee,
}: OrganizerAttendeeManagerProps) {
  const { showConfirm, showToast } = useNotification();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'registered' | 'checked_in' | 'refunded'>('all');
  const [ticketFilter, setTicketFilter] = useState<string>('all');
  const [visibleCount, setVisibleCount] = useState(6);
  
  // Add Attendee Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [selectedEventId, setSelectedEventId] = useState(events[0]?.id || '');
  const [selectedTierName, setSelectedTierName] = useState('');

  // Selected event object & its ticket tiers
  const selectedEvent = events.find(e => e.id === selectedEventId) || events[0];
  const availableTiers = selectedEvent ? selectedEvent.tiers : [];

  // Automatically select first tier when event changes
  React.useEffect(() => {
    if (availableTiers.length > 0) {
      setSelectedTierName(availableTiers[0].name);
    } else {
      setSelectedTierName('');
    }
  }, [selectedEventId, availableTiers]);

  // Get ticket classes dynamically for dropdown
  const uniqueTicketClasses = Array.from(new Set(attendees.map((a) => a.ticketClass)));

  // Calculate high-fidelity metrics
  const activeAttendees = attendees.filter((a) => a.status !== 'refunded');
  const totalRegistrations = activeAttendees.length;
  const checkedInCount = attendees.filter((a) => a.status === 'checked_in').length;
  const netSalesValue = activeAttendees.reduce((sum, a) => sum + a.ticketPrice, 0);

  // Apply filters
  const filteredAttendees = attendees.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase()) ||
      a.id.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    const matchesTicket = ticketFilter === 'all' || a.ticketClass === ticketFilter;

    return matchesSearch && matchesStatus && matchesTicket;
  });

  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,ID,Delegate Name,Email,Ticket Class,Price,Purchase Date,Status\n';
    filteredAttendees.forEach((a) => {
      csvContent += `${a.id},"${a.name}",${a.email},"${a.ticketClass}",$${a.ticketPrice},${a.purchaseDate},${a.status}\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `evora_roster_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Roster CSV downloaded successfully", "success");
  };

  const handleCreateAttendeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim() || !selectedEventId || !selectedTierName) {
      showToast("Please fill in all requested fields", "error");
      return;
    }

    const selectedTier = availableTiers.find(t => t.name === selectedTierName);
    const price = selectedTier ? selectedTier.price : 0;

    const newAttendee: Attendee = {
      id: `at-${Math.floor(1000 + Math.random() * 9000)}`,
      name: newName.trim(),
      email: newEmail.trim(),
      ticketClass: selectedTierName,
      ticketPrice: price,
      purchaseDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      status: 'registered',
      eventId: selectedEventId,
      eventTitle: selectedEvent ? selectedEvent.title : 'Sonic Ritual',
    };

    onAddAttendee(newAttendee);
    showToast(`Registered delegate: ${newName}`, "success");
    
    // Reset state
    setNewName('');
    setNewEmail('');
    setIsAddModalOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-[#faf9f6] dark:bg-black/10 min-h-screen py-12 transition-colors duration-300 font-sans"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Editorial Header Structure */}
        <div className="grid grid-cols-12 gap-8 items-end border-b border-[#dfbfb9]/80 dark:border-zinc-800 pb-10">
          <div className="col-span-12 md:col-span-8 text-left space-y-4">
            <p className="text-label-bold font-bold uppercase tracking-[0.25em] text-[#a5351c] dark:text-[#ffb4a3] text-[11px]">
              {selectedEvent ? selectedEvent.title : 'Global Design Summit 2024'}
            </p>
            <h1 className="font-serif text-4xl md:text-5xl font-light tracking-tighter text-[#0d0d0d] dark:text-white leading-none">
              Attendee Roster
            </h1>
            <p className="text-[#5f5e5e] dark:text-zinc-400 text-sm md:text-base font-light max-w-2xl leading-relaxed">
              Manage your guest list, monitor check-in progress in real-time, and ensure a seamless arrival experience for every delegate.
            </p>
          </div>

          {/* Metrics Alignment */}
          <div className="col-span-12 md:col-span-4 flex justify-start md:justify-end gap-12 border-t md:border-t-0 md:border-l border-[#dfbfb9]/85 dark:border-zinc-800 pt-8 md:pt-0 md:pl-12">
            <div className="text-left">
              <p className="text-[10px] font-bold text-[#5f5e5e] dark:text-zinc-500 uppercase tracking-widest mb-1.5 font-sans">
                Total Registrations
              </p>
              <p className="font-serif text-3xl md:text-4xl text-[#0d0d0d] dark:text-white font-light">
                {totalRegistrations.toLocaleString()}
              </p>
            </div>
            <div className="text-left">
              <p className="text-[10px] font-bold text-[#5f5e5e] dark:text-zinc-500 uppercase tracking-widest mb-1.5 font-sans">
                Checked In
              </p>
              <p className="font-serif text-3xl md:text-4xl text-[#a5351c] dark:text-[#ffb4a3] font-light">
                {checkedInCount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Toolbar & Actions */}
        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-6 border-b border-[#dfbfb9]/60 dark:border-zinc-900 pb-8">
          
          {/* Filter Cluster */}
          <div className="flex flex-wrap items-center gap-4 text-left">
            
            {/* Ticket class Filter Dropdown */}
            <div className="relative min-w-[160px]">
              <select
                value={ticketFilter}
                onChange={(e) => setTicketFilter(e.target.value)}
                className="w-full appearance-none bg-transparent border border-[#dfbfb9] dark:border-zinc-800 text-[#0d0d0d] dark:text-zinc-200 text-[12px] font-bold uppercase tracking-wider px-4 py-3 pr-10 focus:outline-none focus:ring-1 focus:ring-[#0d0d0d] focus:border-[#0d0d0d] dark:focus:ring-white dark:focus:border-white rounded-none cursor-pointer"
              >
                <option value="all" className="bg-[#faf9f6] dark:bg-zinc-950 text-[#0d0d0d] dark:text-zinc-200">All Ticket Types</option>
                {uniqueTicketClasses.map((cl) => (
                  <option key={cl} value={cl} className="bg-[#faf9f6] dark:bg-zinc-950 text-[#0d0d0d] dark:text-zinc-200">
                    {cl}
                  </option>
                ))}
              </select>
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#5f5e5e] text-xs font-mono font-bold">↓</span>
            </div>

            {/* Status Filter Dropdown */}
            <div className="relative min-w-[160px]">
              <select
                value={statusFilter}
                onChange={(e: any) => setStatusFilter(e.target.value)}
                className="w-full appearance-none bg-transparent border border-[#dfbfb9] dark:border-zinc-800 text-[#0d0d0d] dark:text-zinc-200 text-[12px] font-bold uppercase tracking-wider px-4 py-3 pr-10 focus:outline-none focus:ring-1 focus:ring-[#0d0d0d] focus:border-[#0d0d0d] dark:focus:ring-white dark:focus:border-white rounded-none cursor-pointer"
              >
                <option value="all" className="bg-[#faf9f6] dark:bg-zinc-950 text-[#0d0d0d] dark:text-zinc-200">Status: All</option>
                <option value="registered" className="bg-[#faf9f6] dark:bg-zinc-950 text-[#0d0d0d] dark:text-zinc-200">Registered</option>
                <option value="checked_in" className="bg-[#faf9f6] dark:bg-zinc-950 text-[#0d0d0d] dark:text-zinc-200">Checked In</option>
                <option value="refunded" className="bg-[#faf9f6] dark:bg-zinc-950 text-[#0d0d0d] dark:text-zinc-200">Refunded</option>
              </select>
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#5f5e5e] text-xs font-mono font-bold">↓</span>
            </div>

            {/* Inline live search */}
            <div className="relative min-w-[220px]">
              <input
                type="text"
                placeholder="Search attendees..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent border border-[#dfbfb9] dark:border-zinc-800 text-[#0d0d0d] dark:text-zinc-200 text-[12px] font-bold uppercase tracking-wider px-4 py-3 pl-9 placeholder:text-[#5f5e5e]/80 focus:outline-none focus:ring-1 focus:ring-[#0d0d0d] focus:border-[#0d0d0d] dark:focus:ring-white dark:focus:border-white rounded-none"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5f5e5e] stroke-[1.5]" />
              {search && (
                <button 
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5f5e5e] hover:text-[#0d0d0d] dark:hover:text-white"
                >
                  <X className="h-4.5 w-4.5 stroke-[1.5]" />
                </button>
              )}
            </div>

          </div>

          {/* Action Cluster */}
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={handleExportCSV}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 py-3 px-6 bg-transparent border border-[#dfbfb9] dark:border-zinc-800 text-[#0d0d0d] dark:text-zinc-200 text-[13px] font-bold uppercase tracking-wider rounded-none hover:bg-[#efeeeb] dark:hover:bg-zinc-900 transition-colors duration-200"
            >
              <Download className="h-4 w-4 stroke-[1.5]" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 py-3 px-6 bg-[#0d0d0d] dark:bg-[#a5351c] text-white text-[13px] font-bold uppercase tracking-wider rounded-none border border-transparent hover:bg-[#a5351c] dark:hover:bg-[#8e2e18] transition-colors duration-200"
            >
              <Plus className="h-4 w-4 stroke-[2]" />
              <span>Add Attendee</span>
            </button>
          </div>

        </div>

        {/* High-Fidelity Table Structure */}
        <div className="w-full overflow-x-auto">
          
          {/* Desktop Table */}
          <table className="w-full text-left border-collapse min-w-[950px] hidden md:table">
            <thead>
              <tr className="border-b border-[#dfbfb9] dark:border-zinc-900">
                <th className="py-6 px-4 text-label-bold text-[#5f5e5e] dark:text-zinc-500 uppercase tracking-widest text-[11px] w-12">
                  <span className="material-symbols-outlined text-[18px]">tag</span>
                </th>
                <th className="py-6 px-4 text-label-bold text-[#5f5e5e] dark:text-zinc-500 uppercase tracking-widest text-[11px]">Delegate Name</th>
                <th className="py-6 px-4 text-label-bold text-[#5f5e5e] dark:text-zinc-500 uppercase tracking-widest text-[11px]">Event Assignment</th>
                <th className="py-6 px-4 text-label-bold text-[#5f5e5e] dark:text-zinc-500 uppercase tracking-widest text-[11px]">Ticket Class</th>
                <th className="py-6 px-4 text-label-bold text-[#5f5e5e] dark:text-zinc-500 uppercase tracking-widest text-[11px]">Purchase Date</th>
                <th className="py-6 px-4 text-label-bold text-[#5f5e5e] dark:text-zinc-500 uppercase tracking-widest text-[11px]">Status</th>
                <th className="py-6 px-4 text-label-bold text-[#5f5e5e] dark:text-zinc-500 uppercase tracking-widest text-[11px] text-right">System Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredAttendees.length > 0 ? (
                filteredAttendees.slice(0, visibleCount).map((at, idx) => (
                  <motion.tr
                    key={at.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-[#dfbfb9]/40 dark:border-zinc-900/40 hover:bg-[#efeeeb]/50 dark:hover:bg-zinc-950/40 transition-colors group"
                  >
                    {/* ID Index column */}
                    <td className="py-5 px-4 font-mono text-[11px] text-[#5f5e5e]/80">
                      {(idx + 1).toString().padStart(2, '0')}
                    </td>

                    {/* Delegate Name & Contact */}
                    <td className="py-5 px-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-none bg-zinc-200 dark:bg-zinc-850 border border-[#dfbfb9]/60 dark:border-zinc-800 overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {at.qrCodeUrl ? (
                            <img 
                              src={at.qrCodeUrl} 
                              alt="Avatar" 
                              className="w-full h-full object-cover grayscale opacity-90 group-hover:grayscale-0 transition-all duration-300" 
                            />
                          ) : (
                            <div className="font-serif font-light text-sm text-[#a5351c] dark:text-[#ffb4a3]">
                              {at.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-[#0d0d0d] dark:text-zinc-100 text-[14px] leading-snug mb-0.5">
                            {at.name}
                          </p>
                          <p className="text-[12px] text-[#5f5e5e] dark:text-zinc-500 font-mono tracking-tight leading-none">
                            {at.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Event Assignment */}
                    <td className="py-5 px-4 text-left">
                      <p className="font-serif text-[14px] text-[#0d0d0d] dark:text-zinc-200">
                        {at.eventTitle || 'Sonic Ritual: Echoes'}
                      </p>
                      <p className="text-[10px] text-[#5f5e5e] dark:text-zinc-500 font-mono uppercase tracking-widest mt-1">
                        ID: {at.id}
                      </p>
                    </td>

                    {/* Ticket Class badge */}
                    <td className="py-5 px-4">
                      <span className={`inline-block px-3 py-1 border text-[10px] font-bold uppercase tracking-wider ${
                        at.ticketClass.toLowerCase().includes('vip') 
                          ? 'border-[#0d0d0d] dark:border-white text-[#0d0d0d] dark:text-white font-extrabold'
                          : at.ticketClass.toLowerCase().includes('speaker')
                          ? 'bg-[#a5351c] text-white border-transparent'
                          : 'border-[#dfbfb9] dark:border-zinc-800 text-[#5f5e5e] dark:text-zinc-400'
                      }`}>
                        {at.ticketClass}
                      </span>
                    </td>

                    {/* Purchase Date */}
                    <td className="py-5 px-4 font-mono text-[12px] text-[#5f5e5e]">
                      {at.purchaseDate}
                    </td>

                    {/* Status badge */}
                    <td className="py-5 px-4">
                      <div className="flex items-center gap-2">
                        {at.status === 'checked_in' ? (
                          <div className="flex items-center gap-1.5 text-[#a5351c] dark:text-[#ffb4a3]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#a5351c] dark:bg-[#ffb4a3] animate-pulse" />
                            <span className="font-bold text-[12px] tracking-wide uppercase">Checked In</span>
                          </div>
                        ) : at.status === 'refunded' ? (
                          <div className="flex items-center gap-1.5 text-[#5f5e5e]/60">
                            <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                            <span className="font-light text-[12px] tracking-wide uppercase italic line-through">Refunded</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-[#5f5e5e] dark:text-zinc-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                            <span className="font-semibold text-[12px] tracking-wide uppercase">Registered</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Row Action Panel */}
                    <td className="py-5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        
                        {/* Check-In Action */}
                        {at.status === 'registered' && (
                          <button
                            onClick={() => onUpdateAttendeeStatus(at.id, 'checked_in')}
                            className="p-2 border border-[#dfbfb9] dark:border-zinc-800 text-[#0d0d0d] dark:text-zinc-300 hover:bg-[#0d0d0d] hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors duration-150"
                            title="Confirm Manual Entry Check-In"
                          >
                            <UserCheck className="h-4 w-4" />
                          </button>
                        )}

                        {/* Undo check-in */}
                        {at.status === 'checked_in' && (
                          <button
                            onClick={() => onUpdateAttendeeStatus(at.id, 'registered')}
                            className="p-2 border border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-white transition-colors duration-150"
                            title="Undo Entrance Entry Check-In"
                          >
                            <UserMinus className="h-4 w-4" />
                          </button>
                        )}

                        {/* Dispatch email */}
                        {at.status !== 'refunded' && (
                          <button
                            onClick={() => showToast(`Ticket dispatch protocol completed for: ${at.email}`, 'success')}
                            className="p-2 border border-[#dfbfb9] dark:border-zinc-800 text-[#0d0d0d] dark:text-zinc-300 hover:bg-[#a5351c] hover:text-white dark:hover:bg-zinc-800 dark:hover:text-white transition-colors duration-150"
                            title="Dispatch PASS via email"
                          >
                            <Mail className="h-4 w-4" />
                          </button>
                        )}

                        {/* Issue Refund */}
                        {at.status !== 'refunded' ? (
                          <button
                            onClick={() => {
                              showConfirm(
                                'Confirm pass revocation?',
                                `You are initiating a final ledger revocation for ${at.name}. Voiding this $${at.ticketPrice} registration will lock their QR pass immediately at all terminal gates. This operation cannot be undone.`,
                                () => {
                                  onUpdateAttendeeStatus(at.id, 'refunded');
                                  showToast(`Refund authorized for ${at.name}`, 'success');
                                },
                                'Confirm & Refund'
                              );
                            }}
                            className="p-2 border border-red-200 hover:border-red-600 text-red-500 hover:text-white hover:bg-red-600 transition-all duration-150"
                            title="Revoke and Issue Refund"
                          >
                            <UserX className="h-4 w-4" />
                          </button>
                        ) : (
                          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-600 px-2.5 py-2">
                            Processed
                          </span>
                        )}

                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-16 text-center font-serif text-[#5f5e5e] text-lg font-light italic">
                    No matching delegate registrations found on active registers.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Mobile Card List View */}
          <div className="block md:hidden divide-y divide-[#dfbfb9]/40 dark:divide-zinc-900">
            {filteredAttendees.length > 0 ? (
              filteredAttendees.slice(0, visibleCount).map((at) => (
                <div key={at.id} className="py-6 space-y-4 text-left">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1.5">
                      <span className={`inline-block px-2 py-0.5 border text-[9px] font-bold uppercase tracking-wider ${
                        at.ticketClass.toLowerCase().includes('vip') 
                          ? 'border-[#0d0d0d] dark:border-white text-[#0d0d0d] dark:text-white'
                          : 'border-[#dfbfb9] dark:border-zinc-800 text-[#5f5e5e]'
                      }`}>
                        {at.ticketClass}
                      </span>
                      <h4 className="font-bold text-[#0d0d0d] dark:text-white text-base leading-snug">{at.name}</h4>
                      <p className="font-mono text-xs text-[#5f5e5e] dark:text-zinc-500">{at.email}</p>
                      <p className="font-serif text-sm text-[#0d0d0d] dark:text-zinc-300 font-light italic">{at.eventTitle || 'Sonic Ritual: Echoes'}</p>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className="font-mono text-[14px] font-bold text-[#0d0d0d] dark:text-white">${at.ticketPrice}</span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${
                        at.status === 'checked_in'
                          ? 'text-[#a5351c] dark:text-[#ffb4a3]'
                          : at.status === 'refunded'
                          ? 'text-zinc-400 line-through'
                          : 'text-[#5f5e5e]'
                      }`}>
                        {at.status === 'checked_in' ? 'In' : at.status === 'refunded' ? 'Refunded' : 'Registered'}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[11px] font-mono text-[#5f5e5e] border-t border-[#dfbfb9]/30 pt-3">
                    <span>{at.purchaseDate}</span>

                    <div className="flex items-center gap-2">
                      {at.status === 'registered' && (
                        <button
                          onClick={() => onUpdateAttendeeStatus(at.id, 'checked_in')}
                          className="px-3 py-1.5 border border-[#dfbfb9] dark:border-zinc-800 text-[#0d0d0d] dark:text-white text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all min-h-[44px]"
                        >
                          Check In
                        </button>
                      )}

                      {at.status === 'checked_in' && (
                        <button
                          onClick={() => onUpdateAttendeeStatus(at.id, 'registered')}
                          className="px-3 py-1.5 border border-amber-500/40 text-amber-600 text-[10px] font-bold uppercase tracking-widest hover:bg-amber-500 hover:text-white transition-all min-h-[44px]"
                        >
                          Undo
                        </button>
                      )}

                      {at.status !== 'refunded' && (
                        <button
                          onClick={() => showToast(`Dispatched pass successfully to: ${at.email}`, 'success')}
                          className="p-2 border border-[#dfbfb9] dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 min-h-[44px] min-w-[44px] flex items-center justify-center"
                          title="Mail Pass"
                        >
                          <Mail className="h-4 w-4" />
                        </button>
                      )}

                      {at.status !== 'refunded' ? (
                        <button
                          onClick={() => {
                            showConfirm(
                              'Revoke pass?',
                              `Are you sure you want to void this pass? This action voids their access credentials immediately.`,
                              () => onUpdateAttendeeStatus(at.id, 'refunded'),
                              'Revoke and Refund'
                            );
                          }}
                          className="p-2 border border-red-200 text-red-500 min-h-[44px] min-w-[44px] flex items-center justify-center"
                        >
                          <UserX className="h-4 w-4" />
                        </button>
                      ) : (
                        <span className="text-[10px] font-mono uppercase text-zinc-400">Refunded</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-[#5f5e5e] text-sm font-light italic">
                No matching registrations found on active rosters.
              </div>
            )}
          </div>

          {/* Pagination Load More */}
          {filteredAttendees.length > visibleCount && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => setVisibleCount(prev => prev + 6)}
                className="py-3 px-8 border border-[#dfbfb9] dark:border-zinc-800 text-[#0d0d0d] dark:text-zinc-200 font-bold text-[13px] uppercase tracking-wider rounded-none hover:bg-[#efeeeb] dark:hover:bg-zinc-900 transition-colors duration-200 flex items-center gap-2"
              >
                <RefreshCw className="h-3.5 w-3.5 stroke-[1.5]" />
                <span>Load More Attendees</span>
              </button>
            </div>
          )}

        </div>

        {/* Void Registrations warning banner */}
        <div className="rounded-none border border-[#dfbfb9] dark:border-zinc-800 bg-[#faf9f6] dark:bg-zinc-950 p-6 flex gap-4 text-left">
          <ShieldAlert className="h-5 w-5 text-[#a5351c] dark:text-[#ffb4a3] shrink-0 mt-0.5" />
          <div className="text-xs text-[#5f5e5e] dark:text-zinc-400 space-y-1">
            <p className="font-bold text-[#0d0d0d] dark:text-zinc-200 uppercase tracking-widest text-[10px] font-sans">
              VOID REGISTRATIONS WARNING
            </p>
            <p className="leading-relaxed">
              Refunding a delegate’s transaction automatically triggers high-fidelity ticket revocation. If their QR pass is scanned at the entrance, the system will output a loud RED DENIAL warning. Compliance parameters cannot be overridden at gates.
            </p>
          </div>
        </div>

      </div>

      {/* Add Attendee Editorial Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="fixed inset-0 bg-[#0d0d0d]/80 backdrop-blur-sm"
            />

            {/* Modal Card content */}
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="bg-[#faf9f6] dark:bg-zinc-950 border border-[#dfbfb9] dark:border-zinc-800 rounded-none w-full max-w-lg p-8 relative z-10 text-left shadow-2xl"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="absolute top-6 right-6 text-[#5f5e5e] hover:text-[#0d0d0d] dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-bold text-[#a5351c] dark:text-[#ffb4a3] uppercase tracking-[0.25em] mb-1.5 font-sans">
                    ADMINISTRATIVE DELEGATE GATEWAY
                  </p>
                  <h3 className="font-serif text-3xl font-light text-[#0d0d0d] dark:text-white tracking-tight">
                    Add Delegate
                  </h3>
                  <p className="text-xs text-[#5f5e5e] dark:text-zinc-400 font-light mt-1">
                    Register a new participant directly into the global secure check-in registry.
                  </p>
                </div>

                <form onSubmit={handleCreateAttendeeSubmit} className="space-y-5">
                  
                  {/* Name field */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-[#0d0d0d] dark:text-zinc-300 uppercase tracking-widest font-sans">
                      Delegate Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Eleanor Vance"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full bg-transparent border border-[#dfbfb9] dark:border-zinc-800 px-4 py-3 text-sm text-[#0d0d0d] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0d0d0d] dark:focus:ring-white rounded-none"
                    />
                  </div>

                  {/* Email field */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-[#0d0d0d] dark:text-zinc-300 uppercase tracking-widest font-sans">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. eleanor.v@designco.com"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full bg-transparent border border-[#dfbfb9] dark:border-zinc-800 px-4 py-3 text-sm text-[#0d0d0d] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0d0d0d] dark:focus:ring-white rounded-none"
                    />
                  </div>

                  {/* Event selection */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-[#0d0d0d] dark:text-zinc-300 uppercase tracking-widest font-sans">
                      Assigned Immersion Event
                    </label>
                    <div className="relative">
                      <select
                        value={selectedEventId}
                        onChange={(e) => setSelectedEventId(e.target.value)}
                        className="w-full appearance-none bg-transparent border border-[#dfbfb9] dark:border-zinc-800 text-[#0d0d0d] dark:text-white px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-[#0d0d0d] dark:focus:ring-white rounded-none cursor-pointer"
                      >
                        {events.map((evt) => (
                          <option key={evt.id} value={evt.id} className="bg-[#faf9f6] dark:bg-zinc-950 text-[#0d0d0d] dark:text-white">
                            {evt.title}
                          </option>
                        ))}
                      </select>
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#5f5e5e] text-xs font-mono font-bold">↓</span>
                    </div>
                  </div>

                  {/* Ticket Tier selection */}
                  {availableTiers.length > 0 && (
                    <div className="space-y-1.5 animate-fadeIn">
                      <label className="block text-[10px] font-bold text-[#0d0d0d] dark:text-zinc-300 uppercase tracking-widest font-sans">
                        Admission Pass Tier
                      </label>
                      <div className="relative">
                        <select
                          value={selectedTierName}
                          onChange={(e) => setSelectedTierName(e.target.value)}
                          className="w-full appearance-none bg-transparent border border-[#dfbfb9] dark:border-zinc-800 text-[#0d0d0d] dark:text-white px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-[#0d0d0d] dark:focus:ring-white rounded-none cursor-pointer"
                        >
                          {availableTiers.map((t) => (
                            <option key={t.name} value={t.name} className="bg-[#faf9f6] dark:bg-zinc-950 text-[#0d0d0d] dark:text-white">
                              {t.name} — ${t.price} (capacity: {t.capacity - t.soldCount} available)
                            </option>
                          ))}
                        </select>
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#5f5e5e] text-xs font-mono font-bold">↓</span>
                      </div>
                    </div>
                  )}

                  {/* Display value notice */}
                  <div className="bg-[#efeeeb] dark:bg-zinc-900 border border-[#dfbfb9]/60 dark:border-zinc-800 p-4 font-mono text-[11px] text-[#5f5e5e] dark:text-zinc-400 space-y-1">
                    <p className="font-bold text-[#0d0d0d] dark:text-zinc-200">ACQUISITION SUMMARY:</p>
                    <p>REGISTERING PASS: {selectedTierName || 'General Admission'}</p>
                    <p>FACE VALUE COMPLIANCE: ${availableTiers.find(t => t.name === selectedTierName)?.price || 0}.00 USD</p>
                  </div>

                  {/* Form actions */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-[#dfbfb9]/40 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="py-3 px-6 bg-transparent border border-[#dfbfb9] dark:border-zinc-800 text-[#0d0d0d] dark:text-zinc-200 text-xs font-bold uppercase tracking-wider rounded-none hover:bg-[#efeeeb] dark:hover:bg-zinc-900 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="py-3 px-6 bg-[#0d0d0d] dark:bg-[#a5351c] text-white text-xs font-bold uppercase tracking-wider rounded-none hover:bg-[#a5351c] dark:hover:bg-[#8e2e18] transition-colors"
                    >
                      Issue Pass & Close
                    </button>
                  </div>

                </form>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
