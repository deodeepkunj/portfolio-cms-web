"use client";

import { useState } from "react";
import AnalyticsMetrics from "./AnalyticsMetrics";
import RealtimeCard from "./RealtimeCard";
import VisitorsTrendChart from "./VisitorsTrendChart";
import TopPagesTable from "./TopPagesTable";
import CountriesCard from "./CountriesCard";
import DevicesDonut from "./DevicesDonut";
import TrafficChannelsChart from "./TrafficChannelsChart";
import CampaignMetrics from "./CampaignMetrics";
import CampaignsTable from "./CampaignsTable";
import DateRangeSelector, { RangeDays } from "./DateRangeSelector";
import DashboardTabs, { DashboardTab } from "./DashboardTabs";

export default function AnalyticsDashboard() {
  const [days, setDays] = useState<RangeDays>(28);
  const [tab, setTab] = useState<DashboardTab>("overview");

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <DashboardTabs value={tab} onChange={setTab} />
        <DateRangeSelector value={days} onChange={setDays} />
      </div>

      {tab === "overview" && (
        <div className="grid grid-cols-12 gap-4 md:gap-6">
          <div className="col-span-12 space-y-6 xl:col-span-7">
            <AnalyticsMetrics days={days} />

            <TrafficChannelsChart days={days} />
          </div>

          <div className="col-span-12 space-y-6 xl:col-span-5">
            <RealtimeCard />

            <DevicesDonut days={days} />
          </div>

          <div className="col-span-12">
            <VisitorsTrendChart days={days} />
          </div>

          <div className="col-span-12 xl:col-span-5">
            <CountriesCard days={days} />
          </div>

          <div className="col-span-12 xl:col-span-7">
            <TopPagesTable days={days} />
          </div>
        </div>
      )}

      {tab === "campaigns" && (
        <div className="grid grid-cols-12 gap-4 md:gap-6">
          <div className="col-span-12">
            <CampaignMetrics days={days} />
          </div>

          <div className="col-span-12">
            <CampaignsTable days={days} />
          </div>
        </div>
      )}
    </div>
  );
}
