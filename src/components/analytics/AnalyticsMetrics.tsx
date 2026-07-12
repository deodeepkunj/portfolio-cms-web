import Badge from "../ui/badge/Badge";
import { ArrowDownIcon, ArrowUpIcon, BoltIcon, EyeIcon, GroupIcon, PieChartIcon, TimeIcon } from "@/icons";
import type { Overview } from "@/lib/googleAnalytics";
import { formatDelta, formatDuration, formatNumber } from "./utils";
import type { ReactNode } from "react";

interface MetricCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  delta: number | null;
}

function MetricCard({ icon, label, value, delta }: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
        {icon}
      </div>
      <div className="flex items-end justify-between mt-5">
        <div>
          <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
          <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">{value}</h4>
        </div>
        {delta !== null && (
          <Badge color={delta >= 0 ? "success" : "error"}>
            {delta >= 0 ? <ArrowUpIcon /> : <ArrowDownIcon className="text-error-500" />}
            {formatDelta(delta)}
          </Badge>
        )}
      </div>
    </div>
  );
}

export default function AnalyticsMetrics({ data }: { data: Overview | null }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:gap-6 xl:grid-cols-5">
      <MetricCard
        icon={<GroupIcon className="text-gray-800 size-6 dark:text-white/90" />}
        label="Active Users"
        value={formatNumber(data?.activeUsers ?? 0)}
        delta={data?.deltas.activeUsers ?? null}
      />
      <MetricCard
        icon={<PieChartIcon className="text-gray-800 size-6 dark:text-white/90" />}
        label="Sessions"
        value={formatNumber(data?.sessions ?? 0)}
        delta={data?.deltas.sessions ?? null}
      />
      <MetricCard
        icon={<EyeIcon className="text-gray-800 size-6 dark:text-white/90" />}
        label="Page Views"
        value={formatNumber(data?.pageViews ?? 0)}
        delta={data?.deltas.pageViews ?? null}
      />
      <MetricCard
        icon={<BoltIcon className="text-gray-800 size-6 dark:text-white/90" />}
        label="Event Count"
        value={formatNumber(data?.events ?? 0)}
        delta={data?.deltas.events ?? null}
      />
      <MetricCard
        icon={<TimeIcon className="text-gray-800 size-6 dark:text-white/90" />}
        label="Avg Engagement"
        value={formatDuration(data?.avgEngagementSecs ?? 0)}
        delta={data?.deltas.avgEngagementSecs ?? null}
      />
    </div>
  );
}
