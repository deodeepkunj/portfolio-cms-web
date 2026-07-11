"use client";

export const DASHBOARD_TABS = ["overview", "campaigns"] as const;
export type DashboardTab = (typeof DASHBOARD_TABS)[number];

const LABELS: Record<DashboardTab, string> = {
  overview: "Overview",
  campaigns: "Ad Campaigns",
};

interface Props {
  value: DashboardTab;
  onChange: (tab: DashboardTab) => void;
}

export default function DashboardTabs({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-0.5 rounded-lg bg-gray-100 p-0.5 dark:bg-gray-900">
      {DASHBOARD_TABS.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`px-4 py-2 font-medium w-full rounded-md text-theme-sm hover:text-gray-900 dark:hover:text-white ${
            value === tab
              ? "shadow-theme-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          {LABELS[tab]}
        </button>
      ))}
    </div>
  );
}
