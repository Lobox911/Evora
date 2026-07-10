import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUserByClerkId } from '@/db/queries/organizations';
import Navbar from '@/components/Navbar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect('/sign-in');

  const dbUser = await getUserByClerkId(clerkUser.id);
  if (!dbUser || !dbUser.isPlatformAdmin) redirect('/');

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-black transition-colors duration-300">
      <Navbar />
      <div className="flex-1">{children}</div>
    </div>
  );
}
