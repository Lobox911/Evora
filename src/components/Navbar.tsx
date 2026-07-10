'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, DollarSign, Shield, Sun, Moon, Ticket } from 'lucide-react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';

export default function Navbar() {
  const pathname = usePathname();

  const [theme, setTheme] = useState<'light' | 'dark'>('light');

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
    pathname.startsWith('/dashboard') ? 'organizer'
    : pathname === '/pricing' ? 'pricing'
    : 'client';

  const modeLinks = [
    { mode: 'client', href: '/', label: 'Storefront', icon: ShoppingBag },
    { mode: 'pricing', href: '/pricing', label: 'Pricing', icon: DollarSign },
    { mode: 'organizer', href: '/dashboard', label: 'Organizer Console', icon: Shield },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-black/90 text-zinc-900 dark:text-white backdrop-blur-md transition-colors duration-300">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-black font-black tracking-tighter text-lg shadow-sm">
            E
          </div>
          <span className="font-sans text-xl font-bold tracking-[0.25em] text-zinc-900 dark:text-white">
            EVORA
          </span>
        </Link>

        {/* Right Nav */}
        <div className="flex items-center space-x-3">
          {/* Mode Selector */}
          <div className="flex items-center space-x-1 rounded-full bg-zinc-100 dark:bg-zinc-900 p-1 border border-zinc-200 dark:border-zinc-800">
            {modeLinks.map(({ mode, href, label, icon: Icon }) => (
              <Link
                key={mode}
                href={href}
                className={`flex items-center space-x-1.5 rounded-full px-2 py-1 sm:px-3 sm:py-1.5 text-xs font-semibold tracking-wide transition-all duration-300 ${
                  currentMode === mode
                    ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white font-bold shadow-sm border border-zinc-200/50 dark:border-zinc-700'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden min-[520px]:inline">{label}</span>
              </Link>
            ))}
          </div>

          {/* My Tickets link */}
          <SignedIn>
            <Link
              href="/tickets"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white shadow-sm transition-all"
              title="My Tickets"
            >
              <Ticket className="h-4 w-4" />
            </Link>
          </SignedIn>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white shadow-sm transition-all duration-300"
            title={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
          >
            {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
          </button>

          {/* Auth */}
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </header>
  );
}
