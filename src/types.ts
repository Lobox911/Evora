export interface TicketTier {
  id: string;
  name: string;
  price: number;
  capacity: number;
  soldCount: number;
  description?: string;
  status: 'available' | 'sold_out' | 'paused';
}

export interface Event {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image: string;
  status: 'draft' | 'active' | 'completed';
  tiers: TicketTier[];
  tags: string[];
}

export interface Attendee {
  id: string;
  name: string;
  email: string;
  ticketClass: string;
  ticketPrice: number;
  purchaseDate: string;
  status: 'registered' | 'checked_in' | 'refunded';
  qrCodeUrl?: string;
  eventId: string;
  eventTitle: string;
}

export interface Payout {
  id: string;
  date: string;
  amount: number;
  bankAccount: string;
  status: 'completed' | 'processing';
}

export interface ScanLog {
  id: string;
  attendeeName: string;
  ticketClass: string;
  timestamp: string;
  status: 'success' | 'failed';
  errorReason?: string;
}
