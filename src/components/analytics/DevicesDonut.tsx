"use client";

import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import type { Devices } from "@/lib/googleAnalytics";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const capitalize = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

export default function DevicesDonut({ data }: { data: Devices | null }) {
  const rows = data?.rows ?? [];

  const options: ApexOptions = {
    colors: ["#465FFF", "#9CB9FF", "#12B76A", "#F79009"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "donut",
    },
    labels: rows.map((r) => capitalize(r.device)),
    legend: {
      show: true,
      position: "bottom",
      fontFamily: "Outfit",
    },
    dataLabels: { enabled: false },
    stroke: { show: false },
    plotOptions: {
      pie: { donut: { size: "70%" } },
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val.toLocaleString("en-US")} users`,
      },
    },
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Devices</h3>
        <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
          Active users by device category
        </p>
      </div>
      <div className="mt-6">
        {rows.length === 0 ? (
          <p className="text-gray-500 text-theme-sm dark:text-gray-400">No data yet</p>
        ) : (
          <ReactApexChart
            options={options}
            series={rows.map((r) => r.users)}
            type="donut"
            height={240}
          />
        )}
      </div>
    </div>
  );
}
