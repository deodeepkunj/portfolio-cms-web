"use client";

import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import type { Trend } from "@/lib/googleAnalytics";
import type { RangeDays } from "./DateRangeSelector";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface Props {
  data: Trend | null;
  days: RangeDays;
}

export default function VisitorsTrendChart({ data, days }: Props) {
  const options: ApexOptions = {
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit, sans-serif",
    },
    colors: ["#465FFF", "#9CB9FF"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 310,
      type: "area",
      toolbar: { show: false },
    },
    stroke: {
      curve: "smooth",
      width: [2, 2],
    },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.55,
        opacityTo: 0,
      },
    },
    markers: {
      size: 0,
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: { size: 6 },
    },
    grid: {
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    dataLabels: { enabled: false },
    tooltip: {
      enabled: true,
      x: { format: days === 1 ? "HH:mm dd MMM" : "dd MMM yyyy" },
    },
    xaxis: {
      type: "datetime",
      categories: data?.dates ?? [],
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false },
    },
    yaxis: {
      labels: {
        style: { fontSize: "12px", colors: ["#6B7280"] },
      },
    },
  };

  const series = [
    { name: "Active Users", data: data?.activeUsers ?? [] },
    { name: "Page Views", data: data?.pageViews ?? [] },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Visitors Trend</h3>
        <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
          {days === 1
            ? "Active users and page views by hour today"
            : `Active users and page views over the last ${days === "all" ? 365 : days} days`}
        </p>
      </div>
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[1000px] xl:min-w-full">
          <Chart options={options} series={series} type="area" height={310} />
        </div>
      </div>
    </div>
  );
}
