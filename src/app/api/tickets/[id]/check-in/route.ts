import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getUserByClerkId } from '@/db/queries/organizations';
import { checkInTicket, addScanLog, getTicketById } from '@/db/queries/tickets';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: ticketId } = await params;

  const clerkUser = await currentUser();
  if (!clerkUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const dbUser = await getUserByClerkId(clerkUser.id);
  if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const result = await checkInTicket(ticketId, dbUser.id);

  // Log the scan
  const ticket = await getTicketById(ticketId);
  if (ticket) {
    await addScanLog({
      eventId: ticket.eventId,
      ticketId: ticket.id,
      scannedBy: dbUser.id,
      result: result.success ? 'success' : result.reason || 'invalid',
    });
  }

  if (result.success) {
    return NextResponse.json({
      success: true,
      attendeeName: result.ticket?.attendeeName,
    });
  }

  return NextResponse.json({ success: false, reason: result.reason }, { status: 400 });
}
