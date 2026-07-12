import type { Countries } from "@/lib/googleAnalytics";
import { formatNumber } from "./utils";
import type { RangeDays } from "./DateRangeSelector";

interface Props {
  data: Countries | null;
  days: RangeDays;
}

export default function CountriesCard({ data, days }: Props) {
  const rows = data?.rows ?? [];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Visitors by Country</h3>
        <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
          Active users by country in the last {days === "all" ? 365 : days} days
        </p>
      </div>
      <div className="mt-6 space-y-5">
        {rows.length === 0 && (
          <p className="text-gray-500 text-theme-sm dark:text-gray-400">No data yet</p>
        )}
        {rows.map((row) => (
          <div key={row.country} className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-800 text-theme-sm dark:text-white/90">{row.country}</p>
              <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                {formatNumber(row.users)} Users
              </span>
            </div>
            <div className="flex w-full max-w-[140px] items-center gap-3">
              <div className="relative block h-2 w-full max-w-[100px] rounded-sm bg-gray-200 dark:bg-gray-800">
                <div
                  className="absolute left-0 top-0 flex h-full items-center justify-center rounded-sm bg-brand-500 text-xs font-medium text-white"
                  style={{ width: `${row.pct}%` }}
                />
              </div>
              <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">{row.pct}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
