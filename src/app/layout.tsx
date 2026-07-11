import React from 'react';
import { Inter, Playfair_Display, JetBrains_Mono } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import { NotificationProvider } from '@/components/NotificationProvider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata = {
  title: {
    default: 'Evora — Premium Event Ticketing',
    template: '%s | Evora',
  },
  description:
    'Create beautifully branded event pages, sell tiered tickets, and check guests in with QR scanning.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    siteName: 'Evora',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${inter.variable} ${playfairDisplay.variable} ${jetbrainsMono.variable} dark`}
      >
        <head>
          <link href="https://fonts.googleapis.com/icon?family=Material+Symbols+Outlined" rel="stylesheet" />
        </head>
        <body className="antialiased">
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}