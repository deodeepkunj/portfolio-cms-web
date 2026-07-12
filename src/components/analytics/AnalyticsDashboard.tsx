import DashboardTabs, { DashboardTab } from "./DashboardTabs";
import DateRangeSelector, { RangeDays } from "./DateRangeSelector";
import AnalyticsMetrics from "./AnalyticsMetrics";
import RealtimeCard from "./RealtimeCard";
import VisitorsTrendChart from "./VisitorsTrendChart";
import TopPagesTable from "./TopPagesTable";
import EventBreakdownTable from "./EventBreakdownTable";
import CountriesCard from "./CountriesCard";
import DevicesDonut from "./DevicesDonut";
import TrafficChannelsChart from "./TrafficChannelsChart";
import CampaignMetrics from "./CampaignMetrics";
import CampaignsTable from "./CampaignsTable";
import type {
  Overview,
  Trend,
  TopPages,
  Countries,
  Devices,
  Channels,
  Events,
  CampaignsOverview,
  Campaigns,
} from "@/lib/googleAnalytics";

interface Props {
  tab: DashboardTab;
  days: RangeDays;
  overview: Overview | null;
  trend: Trend | null;
  topPages: TopPages | null;
  countries: Countries | null;
  devices: Devices | null;
  channels: Channels | null;
  events: Events | null;
  campaignsOverview: CampaignsOverview | null;
  campaigns: Campaigns | null;
}

export default function AnalyticsDashboard({
  tab,
  days,
  overview,
  trend,
  topPages,
  countries,
  devices,
  channels,
  events,
  campaignsOverview,
  campaigns,
}: Props) {
  return (
    <div>
      {/* Header: underline tabs left, period filter right */}
      <div className="mb-6 flex items-end justify-between border-b border-gray-200 dark:border-gray-800">
        <DashboardTabs value={tab} days={days} />
        <div className="pb-2">
          <DateRangeSelector value={days} tab={tab} />
        </div>
      </div>

      {tab === "overview" && (
        <div className="grid grid-cols-12 gap-4 md:gap-6">
          {/* Row 1: 5 stat cards — full width, 5-up on xl */}
          <div className="col-span-12">
            <AnalyticsMetrics data={overview} />
          </div>

          {/* Row 2: traffic channels (wide) + realtime (narrow) */}
          <div className="col-span-12 xl:col-span-8">
            <TrafficChannelsChart data={channels} />
          </div>
          <div className="col-span-12 xl:col-span-4">
            <RealtimeCard />
          </div>

          {/* Row 3: trend chart full width */}
          <div className="col-span-12">
            <VisitorsTrendChart data={trend} days={days} />
          </div>

          {/* Row 4: countries + devices + top pages */}
          <div className="col-span-12 xl:col-span-4">
            <CountriesCard data={countries} days={days} />
          </div>
          <div className="col-span-12 xl:col-span-3">
            <DevicesDonut data={devices} />
          </div>
          <div className="col-span-12 xl:col-span-5">
            <TopPagesTable data={topPages} days={days} />
          </div>

          {/* Row 5: event breakdown */}
          <div className="col-span-12">
            <EventBreakdownTable data={events} days={days} />
          </div>
        </div>
      )}

      {tab === "campaigns" && (
        <div className="grid grid-cols-12 gap-4 md:gap-6">
          <div className="col-span-12">
            <CampaignMetrics data={campaignsOverview} />
          </div>
          <div className="col-span-12">
            <CampaignsTable data={campaigns} days={days} />
          </div>
        </div>
      )}
    </div>
  );
}
