'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { motion } from 'motion/react';
import Navbar from '@/components/Navbar';
import {
  Sliders,
  Calendar,
  Users,
  DollarSign,
  Settings,
  Plus,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

interface DashboardShellProps {
  user: { id: string; name: string; email: string; avatar: string | null };
  org: { id: string; name: string; slug: string } | null;
  role: 'owner' | 'admin' | 'staff' | 'scanner' | null;
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { id: 'dashboard', name: 'Overview', icon: Sliders, href: '/dashboard', roles: ['owner', 'admin', 'staff'] },
  { id: 'events', name: 'Events', icon: Calendar, href: '/dashboard/events', roles: ['owner', 'admin', 'staff'] },
  { id: 'attendees', name: 'Attendees', icon: Users, href: '/dashboard/attendees', roles: ['owner', 'admin', 'staff'] },
  { id: 'financials', name: 'Financials', icon: DollarSign, href: '/dashboard/financials', roles: ['owner', 'admin'] },
  { id: 'settings', name: 'Settings', icon: Settings, href: '/dashboard/settings', roles: ['owner', 'admin'] },
];

export default function DashboardShell({ user, org, role, children }: DashboardShellProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  if (role === 'scanner') {
    if (typeof window !== 'undefined') window.location.href = '/scan';
    return null;
  }

  if (!org) {
    return (
      <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-black transition-colors duration-300">
        <Navbar />
        <div className="flex-1">{children}</div>
      </div>
    );
  }

  const visibleNav = NAV_ITEMS.filter((item) => role && item.roles.includes(role));
  const sidebarWidth = collapsed ? 'w-[68px]' : 'w-64';
  const contentPadding = collapsed ? 'md:pl-[68px]' : 'md:pl-64';

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      <Navbar />
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={`${sidebarWidth} bg-zinc-50 dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-900 flex-col fixed left-0 top-16 bottom-0 hidden md:flex p-4 z-20 transition-all duration-300`}
        >
          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="absolute -right-3 top-6 w-6 h-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white shadow-sm z-30 transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-3 w-3" />
            ) : (
              <PanelLeftClose className="h-3 w-3" />
            )}
          </button>

          {/* Org header */}
          <div className={`px-3 py-5 border-b border-zinc-200 dark:border-zinc-800 mb-4 flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-9 h-9 bg-zinc-200 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
              <span className="font-mono text-xs font-bold text-zinc-600 dark:text-zinc-400">
                {org.name.slice(0, 2).toUpperCase()}
              </span>
            </div>
            {!collapsed && (
              <div className="text-left overflow-hidden">
                <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-900 dark:text-white truncate max-w-[140px]">
                  {org.name}
                </p>
                <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider">{role}</p>
              </div>
            )}
          </div>

          {/* Nav */}
          <nav className="flex-1 flex flex-col gap-0.5">
            {visibleNav.map(({ id, name, icon: Icon, href }) => {
              const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
              return (
                <Link
                  key={id}
                  href={href}
                  title={collapsed ? name : undefined}
                  className={`flex items-center gap-3 px-4 py-3 transition-all duration-150 ${collapsed ? 'justify-center px-2' : ''} ${
                    isActive
                      ? 'bg-[#D4573B] text-white font-bold scale-95 shadow-sm'
                      : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-150 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="h-4.5 w-4.5 shrink-0" />
                  {!collapsed && (
                    <span className="font-mono text-[10px] font-bold uppercase tracking-widest">{name}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* CTA + user */}
          <div className="mt-auto pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <Link
              href="/dashboard/events?new=true"
              className={`w-full bg-zinc-900 dark:bg-zinc-900 text-white font-mono text-[10px] font-bold py-3.5 px-4 hover:bg-[#D4573B] dark:hover:bg-[#D4573B] transition-colors mb-4 uppercase tracking-wider flex justify-center items-center gap-2 ${collapsed ? 'px-2' : ''}`}
            >
              <Plus className="h-4 w-4 shrink-0" />
              {!collapsed && <span>Create Event</span>}
            </Link>
            <div className={`flex items-center gap-3 px-3 py-2 ${collapsed ? 'justify-center px-0' : ''}`}>
              <UserButton afterSignOutUrl="/" />
              {!collapsed && (
                <span className="font-mono text-[9px] text-zinc-500 truncate">{user.email}</span>
              )}
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className={`flex-1 ${contentPadding} flex flex-col w-full transition-all duration-300`}>
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="flex flex-col flex-1"
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
}