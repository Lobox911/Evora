'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, DollarSign, Shield, Sun, Moon, Ticket, Menu, X } from 'lucide-react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { AnimatePresence, motion } from 'motion/react';


export default function Navbar() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('evora-theme') as 'light' | 'dark' | null;
    if (saved) setTheme(saved);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.classList.toggle('light', theme !== 'dark');
    localStorage.setItem('evora-theme', theme);
  }, [theme]);

  const currentMode =
    pathname.startsWith('/admin') ? 'admin'
    : pathname.startsWith('/dashboard') ? 'organizer'
    : pathname === '/pricing' ? 'pricing'
    : 'client';

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetch('/api/me')
      .then((r) => r.json())
      .then((d) => setIsAdmin(d.user?.isPlatformAdmin === true))
      .catch(() => {});
  }, []);

  const modeLinks = [
    { mode: 'client', href: '/', label: 'Storefront', icon: ShoppingBag },
    { mode: 'pricing', href: '/pricing', label: 'Pricing', icon: DollarSign },
    { mode: 'organizer', href: '/dashboard', label: 'Console', icon: Shield },
    ...(isAdmin ? [{ mode: 'admin', href: '/admin', label: 'Admin', icon: Shield }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-black/90 text-zinc-900 dark:text-white backdrop-blur-md transition-colors duration-300">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        {/* Brand */}
        <Link href="/" className="flex items-center space-x-2.5 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center bg-zinc-900 dark:bg-white text-white dark:text-black font-black text-base">
            E
          </div>
          <span className="font-sans text-lg font-black tracking-[0.15em] text-zinc-900 dark:text-white hidden min-[400px]:inline">
            EVORA
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center space-x-3">
          {/* Mode pills */}
          <div className="flex items-center space-x-1 bg-zinc-100 dark:bg-zinc-900 p-1 border border-zinc-200 dark:border-zinc-800">
            {modeLinks.map(({ mode, href, label, icon: Icon }) => (
              <Link
                key={mode}
                href={href}
                className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold tracking-wide transition-all duration-300 ${
                  currentMode === mode
                    ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white font-bold shadow-sm border border-zinc-200/50 dark:border-zinc-700'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{label}</span>
              </Link>
            ))}
          </div>

          <SignedIn>
            <Link
              href="/tickets"
              className="flex h-8 w-8 items-center justify-center border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white shadow-sm transition-all"
              title="My Tickets"
            >
              <Ticket className="h-3.5 w-3.5" />
            </Link>
          </SignedIn>

          <button
            onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
            className="flex h-8 w-8 items-center justify-center border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white shadow-sm transition-all"
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </button>

          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
        </div>

        {/* Mobile nav */}
        <div className="flex sm:hidden items-center space-x-2">
          <button
            onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
            className="flex h-8 w-8 items-center justify-center text-zinc-600 dark:text-zinc-300"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>

          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="flex h-8 w-8 items-center justify-center text-zinc-600 dark:text-zinc-300"
          >
            {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {mobileNavOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="sm:hidden overflow-hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
          >
            <nav className="px-4 py-3 space-y-1">
              {modeLinks.map(({ mode, href, label, icon: Icon }) => (
                <Link
                  key={mode}
                  href={href}
                  onClick={() => setMobileNavOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 transition-colors ${
                    currentMode === mode
                      ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white font-bold'
                      : 'text-zinc-500 dark:text-zinc-400'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-mono text-[11px] font-bold uppercase tracking-widest">{label}</span>
                </Link>
              ))}

              <SignedIn>
                <Link
                  href="/tickets"
                  onClick={() => setMobileNavOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 text-zinc-500 dark:text-zinc-400"
                >
                  <Ticket className="h-4 w-4" />
                  <span className="font-mono text-[11px] font-bold uppercase tracking-widest">My Tickets</span>
                </Link>
              </SignedIn>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}