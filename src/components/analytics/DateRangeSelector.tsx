"use client";

import { useRouter, usePathname } from "next/navigation";
import type { DashboardTab } from "./DashboardTabs";

export const RANGE_OPTIONS = [7, 28, 90, "all"] as const;
export type RangeDays = (typeof RANGE_OPTIONS)[number];

const LABELS: Record<string, string> = {
  "7": "7d",
  "28": "28d",
  "90": "90d",
  "all": "All",
};

interface Props {
  value: RangeDays;
  tab: DashboardTab;
}

export default function DateRangeSelector({ value, tab }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const navigate = (days: RangeDays) => {
    const params = new URLSearchParams({ tab, days: String(days) });
    router.push(`${pathname}?${params}`);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="hidden text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500 sm:block">
        Period
      </span>
      <div className="flex items-center rounded-lg border border-gray-200 bg-white p-0.5 dark:border-gray-700 dark:bg-gray-900">
        {RANGE_OPTIONS.map((days) => (
          <button
            key={days}
            onClick={() => navigate(days)}
            className={[
              "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              value === days
                ? "bg-brand-500 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300",
            ].join(" ")}
          >
            {LABELS[String(days)]}
          </button>
        ))}
      </div>
    </div>
  );
}
