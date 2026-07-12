"use client";

export const RANGE_OPTIONS = [7, 28, 90, "all"] as const;
export type RangeDays = (typeof RANGE_OPTIONS)[number];

interface Props {
  value: RangeDays;
  onChange: (days: RangeDays) => void;
}

export default function DateRangeSelector({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-0.5 rounded-lg bg-gray-100 p-0.5 dark:bg-gray-900">
      {RANGE_OPTIONS.map((days) => (
        <button
          key={days}
          onClick={() => onChange(days)}
          className={`px-3 py-2 font-medium w-full rounded-md text-theme-sm hover:text-gray-900 dark:hover:text-white ${
            value === days
              ? "shadow-theme-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          {days === "all" ? "All the time" : `${days}d`}
        </button>
      ))}
    </div>
  );
}
