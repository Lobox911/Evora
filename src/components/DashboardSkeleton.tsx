'use client';

export default function DashboardSkeleton() {
  return (
    <div className="bg-zinc-50 dark:bg-black min-h-screen py-10 animate-pulse">
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="h-10 w-48 bg-zinc-200 dark:bg-zinc-800 mb-3" />
        <div className="h-4 w-72 bg-zinc-100 dark:bg-zinc-900 mb-12" />

        {/* Metric cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 p-6">
              <div className="h-3 w-20 bg-zinc-100 dark:bg-zinc-900 mb-4" />
              <div className="h-8 w-28 bg-zinc-200 dark:bg-zinc-800" />
            </div>
          ))}
        </div>

        {/* List items */}
        <div className="h-3 w-24 bg-zinc-100 dark:bg-zinc-900 mb-6" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-5 border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950">
              <div className="space-y-2">
                <div className="h-4 w-48 bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-3 w-64 bg-zinc-100 dark:bg-zinc-900" />
              </div>
              <div className="h-6 w-16 bg-zinc-100 dark:bg-zinc-900" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}