"use client";

interface Props {
  height?: number;
}

export default function AnalyticsSkeleton({ height = 200 }: Props) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-4 w-1/3 rounded bg-gray-200 dark:bg-gray-800"></div>
        <div
          className="w-full rounded bg-gray-100 dark:bg-gray-800/60"
          style={{ height }}
        ></div>
      </div>
    </div>
  );
}
