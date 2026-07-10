import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUserByClerkId, getUserOrgs } from '@/db/queries/organizations';
import { upsertUser } from '@/db/queries/organizations';
import DashboardShell from './DashboardShell';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect('/sign-in');

  // Sync Clerk user → our DB
  const dbUser = await upsertUser({
    clerkId: clerkUser.id,
    email: clerkUser.emailAddresses[0]?.emailAddress || '',
    fullName: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null,
    avatarUrl: clerkUser.imageUrl || null,
  });

  // Get user's orgs
  const orgs = await getUserOrgs(dbUser.id);

  // If no org yet, the shell will show an onboarding prompt
  const currentOrg = orgs[0] ?? null;
  const role = currentOrg?.role ?? null;

  return (
    <DashboardShell
      user={{ id: dbUser.id, name: dbUser.fullName || '', email: dbUser.email, avatar: dbUser.avatarUrl }}
      org={currentOrg ? { id: currentOrg.org.id, name: currentOrg.org.name, slug: currentOrg.org.slug } : null}
      role={role}
    >
      {children}
    </DashboardShell>
  );
}
