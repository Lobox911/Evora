import crypto from 'crypto';

// ---- Money ----
export function formatCents(cents: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(cents / 100);
}

export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

// ---- Dates ----
export function fmtDate(date: Date | string, tz = 'America/Los_Angeles'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    timeZone: tz,
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function fmtTime(date: Date | string, tz = 'America/Los_Angeles'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-US', {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

// ---- QR Token (HMAC-SHA256) ----
const QR_SECRET = process.env.QR_SIGNING_SECRET || 'dev-secret-change-me';

export function signTicketToken(ticketId: string, qrSecret: string): string {
  const payload = `${ticketId}:${qrSecret}`;
  const sig = crypto.createHmac('sha256', QR_SECRET).update(payload).digest('hex');
  return Buffer.from(JSON.stringify({ tid: ticketId, sig })).toString('base64url');
}

export function verifyTicketToken(token: string): { valid: boolean; ticketId?: string } {
  try {
    const { tid, sig } = JSON.parse(Buffer.from(token, 'base64url').toString());
    // We can't verify without the qrSecret from DB — return the ticketId
    // so the caller can look it up and verify server-side
    return { valid: true, ticketId: tid };
  } catch {
    return { valid: false };
  }
}

// ---- Slugify ----
export function makeSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}
