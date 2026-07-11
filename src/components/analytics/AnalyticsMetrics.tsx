"use client";

import React from "react";
import Badge from "../ui/badge/Badge";
import { ArrowDownIcon, ArrowUpIcon, EyeIcon, GroupIcon, PieChartIcon, TimeIcon } from "@/icons";
import { useAnalyticsReport } from "@/hooks/useAnalyticsApi";
import type { Overview } from "@/lib/googleAnalytics";
import AnalyticsErrorCard from "./AnalyticsErrorCard";
import { formatDelta, formatDuration, formatNumber } from "./utils";
import type { RangeDays } from "./DateRangeSelector";

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  delta: number | null;
  loading: boolean;
}

function MetricCard({ icon, label, value, delta, loading }: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
        {icon}
      </div>

      <div className="flex items-end justify-between mt-5">
        <div>
          <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
          {loading ? (
            <div className="mt-2 h-7 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-800"></div>
          ) : (
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {value}
            </h4>
          )}
        </div>
        {!loading && delta !== null && (
          <Badge color={delta >= 0 ? "success" : "error"}>
            {delta >= 0 ? <ArrowUpIcon /> : <ArrowDownIcon className="text-error-500" />}
            {formatDelta(delta)}
          </Badge>
        )}
      </div>
    </div>
  );
}

export default function AnalyticsMetrics({ days }: { days: RangeDays }) {
  const { data, loading, error } = useAnalyticsReport<Overview>("overview", days);

  if (error) return <AnalyticsErrorCard error={error} title="Audience Overview" />;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      <MetricCard
        icon={<GroupIcon className="text-gray-800 size-6 dark:text-white/90" />}
        label="Active Users"
        value={formatNumber(data?.activeUsers ?? 0)}
        delta={data?.deltas.activeUsers ?? null}
        loading={loading}
      />
      <MetricCard
        icon={<PieChartIcon className="text-gray-800 size-6 dark:text-white/90" />}
        label="Sessions"
        value={formatNumber(data?.sessions ?? 0)}
        delta={data?.deltas.sessions ?? null}
        loading={loading}
      />
      <MetricCard
        icon={<EyeIcon className="text-gray-800 size-6 dark:text-white/90" />}
        label="Page Views"
        value={formatNumber(data?.pageViews ?? 0)}
        delta={data?.deltas.pageViews ?? null}
        loading={loading}
      />
      <MetricCard
        icon={<TimeIcon className="text-gray-800 size-6 dark:text-white/90" />}
        label="Avg Engagement"
        value={formatDuration(data?.avgEngagementSecs ?? 0)}
        delta={data?.deltas.avgEngagementSecs ?? null}
        loading={loading}
      />
    </div>
  );
}
