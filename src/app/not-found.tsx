import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center p-6">
      <div className="text-center space-y-4">
        <h1 className="font-serif text-6xl font-light text-zinc-900 dark:text-white">404</h1>
        <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
          This page does not exist.
        </p>
        <Link
          href="/"
          className="inline-block mt-4 border border-zinc-300 dark:border-zinc-700 px-6 py-3 font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-900 dark:text-white hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
        >
          Back to Events
        </Link>
      </div>
    </div>
  );
}
