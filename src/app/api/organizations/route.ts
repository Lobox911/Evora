import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getUserByClerkId, createOrganization, getOrgBySlug, upsertUser } from '@/db/queries/organizations';

export async function POST(req: NextRequest) {
  const clerkUser = await currentUser();
  if (!clerkUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Ensure user exists in DB
  const dbUser = await upsertUser({
    clerkId: clerkUser.id,
    email: clerkUser.emailAddresses[0]?.emailAddress || '',
    fullName: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null,
    avatarUrl: clerkUser.imageUrl || null,
  });

  const { name, slug } = await req.json();
  if (!name || !slug) {
    return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
  }

  // Check slug uniqueness
  const existing = await getOrgBySlug(slug);
  if (existing) {
    return NextResponse.json({ error: 'Slug already taken' }, { status: 409 });
  }

  const org = await createOrganization({ name, slug }, dbUser.id);
  return NextResponse.json({ org }, { status: 201 });
}
