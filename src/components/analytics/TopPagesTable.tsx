"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { useAnalyticsReport } from "@/hooks/useAnalyticsApi";
import type { TopPages } from "@/lib/googleAnalytics";
import AnalyticsErrorCard from "./AnalyticsErrorCard";
import AnalyticsSkeleton from "./AnalyticsSkeleton";
import { formatDuration, formatNumber } from "./utils";
import type { RangeDays } from "./DateRangeSelector";

export default function TopPagesTable({ days }: { days: RangeDays }) {
  const { data, loading, error } = useAnalyticsReport<TopPages>("top-pages", days);

  if (error) return <AnalyticsErrorCard error={error} title="Top Pages" />;
  if (loading) return <AnalyticsSkeleton height={280} />;

  const rows = data?.rows ?? [];

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Top Pages
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Most viewed pages in the last {days} days
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
                Page
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Views
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Users
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Avg Time
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {rows.length === 0 && (
              <TableRow>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  No data yet
                </TableCell>
                <TableCell className="py-3">{""}</TableCell>
                <TableCell className="py-3">{""}</TableCell>
                <TableCell className="py-3">{""}</TableCell>
              </TableRow>
            )}
            {rows.map((page) => (
              <TableRow key={page.path}>
                <TableCell className="py-3">
                  <div>
                    <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {page.title || page.path}
                    </p>
                    <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                      {page.path}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {formatNumber(page.views)}
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {formatNumber(page.users)}
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {formatDuration(page.avgDuration)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
