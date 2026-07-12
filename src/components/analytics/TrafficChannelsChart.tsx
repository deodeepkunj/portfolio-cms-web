"use client";

import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import type { Channels } from "@/lib/googleAnalytics";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function TrafficChannelsChart({ data }: { data: Channels | null }) {
  const rows = data?.rows ?? [];

  const options: ApexOptions = {
    colors: ["#465fff"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: "39%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: rows.map((r) => r.channel),
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    legend: { show: false },
    grid: {
      yaxis: { lines: { show: false } },
      xaxis: { lines: { show: true } },
    },
    fill: { opacity: 1 },
    tooltip: {
      y: {
        formatter: (val: number) => `${val.toLocaleString("en-US")} sessions`,
      },
    },
  };

  const series = [{ name: "Sessions", data: rows.map((r) => r.sessions) }];

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Traffic Channels</h3>
        <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
          Sessions by acquisition channel
        </p>
      </div>
      <div className="mt-2 max-w-full overflow-x-auto custom-scrollbar">
        {rows.length === 0 ? (
          <p className="py-4 text-gray-500 text-theme-sm dark:text-gray-400">No data yet</p>
        ) : (
          <ReactApexChart
            options={options}
            series={series}
            type="bar"
            height={Math.max(180, rows.length * 44)}
          />
        )}
      </div>
    </div>
  );
}
