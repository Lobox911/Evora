'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const [orgName, setOrgName] = useState('');
  const [orgSlug, setOrgSlug] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreateOrg = async () => {
    if (!orgName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: orgName,
          slug: orgSlug || orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40),
        }),
      });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="bg-zinc-50 dark:bg-black min-h-screen py-10 font-sans">
      <header className="max-w-[1000px] mx-auto px-4 sm:px-6 mb-12">
        <h1 className="font-serif text-4xl font-light text-zinc-900 dark:text-white">Settings</h1>
        <p className="text-sm text-zinc-500 font-light mt-2">
          Organization settings, team management, and billing.
        </p>
      </header>

      <div className="max-w-[600px] mx-auto px-4 sm:px-6 space-y-8">
        {/* Create Org section */}
        <div className="border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 p-8">
          <h2 className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-6">
            Create Organization
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
                Organization Name
              </label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => {
                  setOrgName(e.target.value);
                  setOrgSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40));
                }}
                placeholder="Acme Events"
                className="w-full border border-zinc-200 dark:border-zinc-800 bg-transparent px-4 py-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#D4573B]"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
                Slug
              </label>
              <input
                type="text"
                value={orgSlug}
                onChange={(e) => setOrgSlug(e.target.value)}
                placeholder="acme-events"
                className="w-full border border-zinc-200 dark:border-zinc-800 bg-transparent px-4 py-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#D4573B]"
              />
            </div>
            <button
              onClick={handleCreateOrg}
              disabled={creating || !orgName.trim()}
              className="w-full bg-zinc-900 dark:bg-white text-white dark:text-black font-mono text-[10px] font-bold py-3.5 uppercase tracking-wider hover:bg-[#D4573B] dark:hover:bg-[#D4573B] dark:hover:text-white transition-colors disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create Organization'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
