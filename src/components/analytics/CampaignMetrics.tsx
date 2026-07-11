"use client";

import React from "react";
import Badge from "../ui/badge/Badge";
import { ArrowDownIcon, ArrowUpIcon, BoltIcon, DollarLineIcon, GridIcon, ShootingStarIcon } from "@/icons";
import { useAnalyticsReport } from "@/hooks/useAnalyticsApi";
import type { CampaignsOverview } from "@/lib/googleAnalytics";
import AnalyticsErrorCard from "./AnalyticsErrorCard";
import { formatCurrency, formatDelta, formatNumber, formatRoas } from "./utils";
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

export default function CampaignMetrics({ days }: { days: RangeDays }) {
  const { data, loading, error } = useAnalyticsReport<CampaignsOverview>(
    "campaigns-overview",
    days
  );

  if (error) return <AnalyticsErrorCard error={error} title="Ad Campaigns Overview" />;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      <MetricCard
        icon={<BoltIcon className="text-gray-800 dark:text-white/90" />}
        label="Ad Clicks"
        value={formatNumber(data?.clicks ?? 0)}
        delta={data?.deltas.clicks ?? null}
        loading={loading}
      />
      <MetricCard
        icon={<DollarLineIcon className="text-gray-800 dark:text-white/90" />}
        label="Ad Spend"
        value={formatCurrency(data?.cost ?? 0, data?.currencyCode)}
        delta={data?.deltas.cost ?? null}
        loading={loading}
      />
      <MetricCard
        icon={<GridIcon className="text-gray-800 dark:text-white/90" />}
        label="Impressions"
        value={formatNumber(data?.impressions ?? 0)}
        delta={data?.deltas.impressions ?? null}
        loading={loading}
      />
      <MetricCard
        icon={<ShootingStarIcon className="text-gray-800 dark:text-white/90" />}
        label="Return on Ad Spend"
        value={formatRoas(data?.roas ?? 0)}
        delta={data?.deltas.roas ?? null}
        loading={loading}
      />
    </div>
  );
}
