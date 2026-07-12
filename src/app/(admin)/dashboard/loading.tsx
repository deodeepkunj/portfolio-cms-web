export default function DashboardLoading() {
  return (
    <div className="animate-pulse">
      {/* Tab bar skeleton */}
      <div className="mb-6 flex items-end justify-between border-b border-gray-200 pb-0 dark:border-gray-800">
        <div className="flex gap-1">
          <div className="mx-4 mb-3 h-4 w-16 rounded bg-gray-200 dark:bg-gray-800" />
          <div className="mx-4 mb-3 h-4 w-24 rounded bg-gray-200 dark:bg-gray-800" />
        </div>
        <div className="mb-2 h-8 w-40 rounded-lg bg-gray-200 dark:bg-gray-800" />
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 xl:col-span-7 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-32 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]"
              />
            ))}
          </div>
          <div className="h-56 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]" />
        </div>
        <div className="col-span-12 xl:col-span-5 space-y-6">
          <div className="h-32 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]" />
          <div className="h-64 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]" />
        </div>
        <div className="col-span-12 h-80 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]" />
        <div className="col-span-12 xl:col-span-5 h-64 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]" />
        <div className="col-span-12 xl:col-span-7 h-64 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]" />
      </div>
    </div>
  );
}
