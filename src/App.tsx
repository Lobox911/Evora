"use client";

import React, { useState, useEffect } from 'react';
import { Event, Attendee, Payout, ScanLog } from './types';
import { INITIAL_EVENTS, INITIAL_ATTENDEES, INITIAL_PAYOUTS } from './data';
import Navbar from './components/Navbar';
import ClientStorefront from './components/ClientStorefront';
import ClientEventDetails from './components/ClientEventDetails';
import OrganizerDashboard from './components/OrganizerDashboard';
import OrganizerEventBuilder from './components/OrganizerEventBuilder';
import OrganizerAttendeeManager from './components/OrganizerAttendeeManager';
import OrganizerFinancials from './components/OrganizerFinancials';
import OrganizerScanner from './components/OrganizerScanner';
import PricingPage from './components/PricingPage';
import { NotificationProvider } from './components/NotificationProvider';
import { Sliders, Calendar, Users, DollarSign, Camera, HelpCircle, Plus } from 'lucide-react';
import { motion } from 'motion/react';

export default function App() {
  return (
    <NotificationProvider>
      <AppContent />
    </NotificationProvider>
  );
}

function AppContent() {
  const [currentMode, setCurrentMode] = useState<'client' | 'organizer' | 'pricing'>('client');
  const [organizerTab, setOrganizerTab] = useState<string>('dashboard');

  // Theme support
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('evora-theme');
      return (saved as 'light' | 'dark') || 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('evora-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Core global State (simulates local secure cloud database)
  const [events, setEvents] = useState<Event[]>(INITIAL_EVENTS);
  const [attendees, setAttendees] = useState<Attendee[]>(INITIAL_ATTENDEES);
  const [payouts, setPayouts] = useState<Payout[]>(INITIAL_PAYOUTS);
  const [scanLogs, setScanLogs] = useState<ScanLog[]>([]);

  // Navigation within the client storefront
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Handlers for state mutations (reactive architecture)
  
  // 1. Purchase tickets
  const handlePurchaseSuccess = (newAttendees: Attendee[], updatedEvent: Event) => {
    // Append newly booked delegates to roster
    setAttendees([...newAttendees, ...attendees]);

    // Update event capacities / details in global store
    const updatedEvents = events.map((e) => (e.id === updatedEvent.id ? updatedEvent : e));
    setEvents(updatedEvents);
    
    // Update the currently viewed event state to reflect new counts
    setSelectedEvent(updatedEvent);
  };

  // 2. Add newly built event from builder
  const handleAddEvent = (newEvent: Event) => {
    setEvents([newEvent, ...events]);
    // Redirect to the dashboard to see published results
    setOrganizerTab('dashboard');
  };

  // 2b. Add newly registered attendee from roster manager
  const handleAddAttendee = (newAt: Attendee) => {
    setAttendees([newAt, ...attendees]);
    adjustEventTicketSoldCount(newAt.eventId, newAt.ticketClass, 1);
  };

  // 3. Update single attendee check-in / refund status
  const handleUpdateAttendeeStatus = (
    id: string,
    nextStatus: 'registered' | 'checked_in' | 'refunded'
  ) => {
    const updated = attendees.map((at) => {
      if (at.id === id) {
        // Adjust ticket soldCount in events if status is refunded
        if (nextStatus === 'refunded' && at.status !== 'refunded') {
          adjustEventTicketSoldCount(at.eventId, at.ticketClass, -1);
        } else if (at.status === 'refunded' && nextStatus !== 'refunded') {
          adjustEventTicketSoldCount(at.eventId, at.ticketClass, 1);
        }
        return { ...at, status: nextStatus };
      }
      return at;
    });
    setAttendees(updated);
  };

  // Helper to adjust soldCount dynamically on refund/reactivate
  const adjustEventTicketSoldCount = (eventId: string, ticketClass: string, delta: number) => {
    setEvents((prevEvents) =>
      prevEvents.map((evt) => {
        if (evt.id === eventId) {
          return {
            ...evt,
            tiers: evt.tiers.map((t) => {
              if (t.name === ticketClass) {
                return {
                  ...t,
                  soldCount: Math.max(0, t.soldCount + delta),
                  status: t.soldCount + delta >= t.capacity ? ('sold_out' as const) : ('available' as const),
                };
              }
              return t;
            }),
          };
        }
        return evt;
      })
    );
  };

  // 4. Scanner check-in action
  const handleCheckInAttendee = (id: string) => {
    setAttendees((prev) =>
      prev.map((at) => (at.id === id ? { ...at, status: 'checked_in' } : at))
    );
  };

  // 5. Add scanner log entries
  const handleAddScanLog = (newLog: ScanLog) => {
    setScanLogs([newLog, ...scanLogs]);
  };

  // 6. Handle Instant Payout request
  const handleRequestPayout = (amount: number) => {
    const newPayout: Payout = {
      id: `p-new-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      amount,
      bankAccount: 'WELLS FARGO (****4829)',
      status: 'processing',
    };
    setPayouts([newPayout, ...payouts]);
  };

  return (
    <div className="bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white min-h-screen flex flex-col font-sans transition-colors duration-300">
      
      {/* Navigation bar */}
      <Navbar />

      {/* Primary Display Screen Frame */}
      <main className="flex-grow">
        
        {/* MODE A: CLIENT STOREFRONT & DETAILS */}
        {currentMode === 'client' && (
          <>
            {selectedEvent ? (
              <ClientEventDetails
                event={selectedEvent}
                onBack={() => setSelectedEvent(null)}
                onPurchaseSuccess={handlePurchaseSuccess}
              />
            ) : (
              <ClientStorefront
                events={events}
                onSelectEvent={(event) => setSelectedEvent(event)}
              />
            )}
          </>
        )}

        {/* MODE: SUBSCRIPTION ECONOMICS PRICING */}
        {currentMode === 'pricing' && (
          <PricingPage />
        )}

        {/* MODE B: ORGANIZER PORTAL */}
        {currentMode === 'organizer' && (
          <div className="min-h-[calc(100vh-4rem)] flex relative">
            {/* Left SideNavBar */}
            <aside className="w-64 bg-zinc-50 dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-900 flex-col fixed left-0 top-16 bottom-0 hidden md:flex p-4 z-20 transition-all duration-300">
              {/* Header */}
              <div className="px-3 py-5 border-b border-zinc-200 dark:border-zinc-800 mb-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-none bg-zinc-200 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-850 flex items-center justify-center overflow-hidden">
                  <Users className="h-4.5 w-4.5 text-zinc-650 dark:text-zinc-400" />
                </div>
                <div>
                  <h2 className="font-serif text-sm font-semibold tracking-tight text-zinc-900 dark:text-white leading-tight">Evora Admin</h2>
                  <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest mt-0.5">Management Suite</p>
                </div>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 flex flex-col gap-1 px-1">
                {[
                  { id: 'dashboard', name: 'Dashboard', icon: Sliders },
                  { id: 'builder', name: 'Events', icon: Calendar },
                  { id: 'attendees', name: 'Orders', icon: Users },
                  { id: 'financials', name: 'Financials', icon: DollarSign },
                  { id: 'scanner', name: 'Gate Scanner', icon: Camera },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = organizerTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setOrganizerTab(item.id)}
                      className={`flex items-center gap-3 px-4 py-3 text-left transition-all duration-150 border-0 outline-none rounded-none cursor-pointer ${
                        isActive
                          ? 'bg-[#D4573B] text-white font-bold scale-95 shadow-sm'
                          : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-150 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white'
                      }`}
                    >
                      <Icon className="h-4.5 w-4.5 shrink-0" />
                      <span className="font-mono text-[10px] font-bold uppercase tracking-widest">{item.name}</span>
                    </button>
                  );
                })}
              </nav>

              {/* CTA & Footer */}
              <div className="mt-auto pt-4 border-t border-zinc-200 dark:border-zinc-850">
                <button
                  onClick={() => setOrganizerTab('builder')}
                  className="w-full bg-[#1A1A1A] dark:bg-zinc-900 text-white font-mono text-[10px] font-bold py-3.5 px-4 rounded-none hover:bg-[#D4573B] dark:hover:bg-[#D4573B] transition-colors mb-4 uppercase tracking-wider flex justify-center items-center gap-2 border-0 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Event</span>
                </button>
                <div className="flex items-center gap-2.5 px-3 py-2 text-zinc-400 dark:text-zinc-500 font-mono text-[9px] uppercase tracking-wider">
                  <HelpCircle className="h-3.5 w-3.5" />
                  <span>Help Center</span>
                </div>
              </div>
            </aside>

            {/* Main Content Pane */}
            <div className="flex-1 md:pl-64 flex flex-col w-full">
              <motion.div
                key={organizerTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                className="flex flex-col flex-1"
              >
              {organizerTab === 'dashboard' && (
                <OrganizerDashboard
                  events={events}
                  attendees={attendees}
                  onNavigateTab={setOrganizerTab}
                  onSelectEvent={(evt) => {
                    setOrganizerTab('builder');
                  }}
                />
              )}

              {organizerTab === 'builder' && (
                <OrganizerEventBuilder
                  events={events}
                  onAddEvent={handleAddEvent}
                />
              )}

              {organizerTab === 'attendees' && (
                <OrganizerAttendeeManager
                  attendees={attendees}
                  onUpdateAttendeeStatus={handleUpdateAttendeeStatus}
                  events={events}
                  onAddAttendee={handleAddAttendee}
                />
              )}

              {organizerTab === 'financials' && (
                <OrganizerFinancials
                  payouts={payouts}
                  onRequestPayout={handleRequestPayout}
                  attendeesCount={attendees.length}
                  totalRevenue={attendees
                    .filter((a) => a.status !== 'refunded')
                    .reduce((sum, a) => sum + a.ticketPrice, 0)}
                />
              )}

              {organizerTab === 'scanner' && (
                <OrganizerScanner
                  attendees={attendees}
                  onCheckInAttendee={handleCheckInAttendee}
                  scanLogs={scanLogs}
                  onAddScanLog={handleAddScanLog}
                />
              )}
              </motion.div>
            </div>
          </div>
        )}

      </main>

      {/* Elegant minimalist footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 py-6 text-center text-5xs font-mono text-zinc-500 dark:text-zinc-600 uppercase tracking-widest mt-auto transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p>© 2026 EVORA INC. All rights reserved.</p>
          <p>STYLING ARCHITECTURE: SWISS / MINIMALIST TECH</p>
        </div>
      </footer>

    </div>
  );
}

