"use client";

import { useRouter, usePathname } from "next/navigation";

export const DASHBOARD_TABS = ["overview", "campaigns"] as const;
export type DashboardTab = (typeof DASHBOARD_TABS)[number];

const LABELS: Record<DashboardTab, string> = {
  overview: "Overview",
  campaigns: "Ad Campaigns",
};

interface Props {
  value: DashboardTab;
  days: string | number;
}

export default function DashboardTabs({ value, days }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const navigate = (tab: DashboardTab) => {
    const params = new URLSearchParams({ tab, days: String(days) });
    router.push(`${pathname}?${params}`);
  };

  return (
    <div className="flex">
      {DASHBOARD_TABS.map((tab) => (
        <button
          key={tab}
          onClick={() => navigate(tab)}
          className={[
            "px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap",
            value === tab
              ? "border-brand-500 text-brand-600 dark:text-brand-400 dark:border-brand-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300",
          ].join(" ")}
        >
          {LABELS[tab]}
        </button>
      ))}
    </div>
  );
}
