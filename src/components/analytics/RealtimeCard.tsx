"use client";

import { useAnalyticsReport } from "@/hooks/useAnalyticsApi";
import type { RealtimeUsers } from "@/lib/googleAnalytics";
import AnalyticsErrorCard from "./AnalyticsErrorCard";
import AnalyticsSkeleton from "./AnalyticsSkeleton";
import { formatNumber } from "./utils";

const REFRESH_MS = 60 * 1000;

export default function RealtimeCard() {
  const { data, loading, error } = useAnalyticsReport<RealtimeUsers>(
    "realtime",
    undefined,
    REFRESH_MS
  );

  if (error) return <AnalyticsErrorCard error={error} title="Realtime" />;
  if (loading) return <AnalyticsSkeleton height={120} />;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="flex items-center gap-2">
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success-500 opacity-75"></span>
          <span className="relative inline-flex h-3 w-3 rounded-full bg-success-500"></span>
        </span>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Realtime
        </h3>
      </div>
      <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
        Active users on your site right now
      </p>

      <h2 className="mt-6 text-4xl font-bold text-gray-800 dark:text-white/90">
        {formatNumber(data?.activeUsers ?? 0)}
      </h2>
      <p className="mt-2 text-gray-500 text-theme-xs dark:text-gray-400">
        Updates every minute
      </p>
    </div>
  );
}
