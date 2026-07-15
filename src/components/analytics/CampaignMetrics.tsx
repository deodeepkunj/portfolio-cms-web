import Badge from "../ui/badge/Badge";
import { ArrowDownIcon, ArrowUpIcon, BoltIcon, DollarLineIcon, GridIcon, PieChartIcon, ShootingStarIcon, TimeIcon } from "@/icons";
import type { CampaignsOverview } from "@/lib/googleAnalytics";
import { formatCurrency, formatDelta, formatNumber, formatRoas } from "./utils";
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

export default function CampaignMetrics({ data }: { data: CampaignsOverview | null }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 md:gap-6">
      <MetricCard
        icon={<BoltIcon className="text-gray-800 dark:text-white/90" />}
        label="Ad Clicks"
        value={formatNumber(data?.clicks ?? 0)}
        delta={data?.deltas.clicks ?? null}
      />
      <MetricCard
        icon={<DollarLineIcon className="text-gray-800 dark:text-white/90" />}
        label="Ad Spend"
        value={formatCurrency(data?.cost ?? 0, data?.currencyCode)}
        delta={data?.deltas.cost ?? null}
      />
      <MetricCard
        icon={<GridIcon className="text-gray-800 dark:text-white/90" />}
        label="Impressions"
        value={formatNumber(data?.impressions ?? 0)}
        delta={data?.deltas.impressions ?? null}
      />
      <MetricCard
        icon={<ShootingStarIcon className="text-gray-800 dark:text-white/90" />}
        label="ROAS"
        value={formatRoas(data?.roas ?? 0)}
        delta={data?.deltas.roas ?? null}
      />
      <MetricCard
        icon={<PieChartIcon className="text-gray-800 dark:text-white/90" />}
        label="Click-Through Rate"
        value={`${(data?.ctr ?? 0).toFixed(2)}%`}
        delta={data?.deltas.ctr ?? null}
      />
      <MetricCard
        icon={<TimeIcon className="text-gray-800 dark:text-white/90" />}
        label="Avg CPC"
        value={formatCurrency(data?.avgCpc ?? 0, data?.currencyCode)}
        delta={data?.deltas.avgCpc ?? null}
      />
    </div>
  );
}
