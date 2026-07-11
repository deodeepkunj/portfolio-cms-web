"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { useAnalyticsReport } from "@/hooks/useAnalyticsApi";
import type { Campaigns } from "@/lib/googleAnalytics";
import AnalyticsErrorCard from "./AnalyticsErrorCard";
import AnalyticsSkeleton from "./AnalyticsSkeleton";
import { formatCurrency, formatNumber, formatRoas } from "./utils";
import type { RangeDays } from "./DateRangeSelector";

export default function CampaignsTable({ days }: { days: RangeDays }) {
  const { data, loading, error } = useAnalyticsReport<Campaigns>("campaigns", days);

  if (error) return <AnalyticsErrorCard error={error} title="Campaigns" />;
  if (loading) return <AnalyticsSkeleton height={280} />;

  const rows = data?.rows ?? [];
  const currencyCode = data?.currencyCode;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Campaigns
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Google Ads campaign performance in the last {days} days
          </p>
        </div>
      </div>
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Campaign
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Clicks
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Cost
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Impressions
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                CPC
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                ROAS
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {rows.length === 0 && (
              <TableRow>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  No campaign data yet
                </TableCell>
                <TableCell className="py-3">{""}</TableCell>
                <TableCell className="py-3">{""}</TableCell>
                <TableCell className="py-3">{""}</TableCell>
                <TableCell className="py-3">{""}</TableCell>
                <TableCell className="py-3">{""}</TableCell>
              </TableRow>
            )}
            {rows.map((row) => (
              <TableRow key={row.campaign}>
                <TableCell className="py-3">
                  <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                    {row.campaign}
                  </p>
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {formatNumber(row.clicks)}
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {formatCurrency(row.cost, currencyCode)}
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {formatNumber(row.impressions)}
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {formatCurrency(row.cpc, currencyCode)}
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {formatRoas(row.roas)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
