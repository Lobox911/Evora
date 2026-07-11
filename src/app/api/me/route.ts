import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getUserByClerkId } from '@/db/queries/organizations';

export async function GET() {
  const clerkUser = await currentUser();
  if (!clerkUser) return NextResponse.json({ user: null });

  const dbUser = await getUserByClerkId(clerkUser.id);
  return NextResponse.json({
    user: dbUser ? {
      id: dbUser.id,
      email: dbUser.email,
      isPlatformAdmin: dbUser.isPlatformAdmin,
    } : null,
  });
}