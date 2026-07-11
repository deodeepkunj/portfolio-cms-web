"use client";

import type { AnalyticsError } from "@/hooks/useAnalyticsApi";

interface Props {
  error: AnalyticsError;
  title: string;
}

export default function AnalyticsErrorCard({ error, title }: Props) {
  const message =
    error === "not-configured"
      ? "Google Analytics isn't connected. Add GA_PROPERTY_ID, GA_CLIENT_EMAIL and GA_PRIVATE_KEY to your environment."
      : "Couldn't load analytics data. Please try again later.";

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
        {title}
      </h3>
      <p className="mt-3 text-gray-500 text-theme-sm dark:text-gray-400">
        {message}
      </p>
    </div>
  );
}
