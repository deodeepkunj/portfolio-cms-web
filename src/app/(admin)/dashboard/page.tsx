import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import AnalyticsDashboard from "@/components/analytics/AnalyticsDashboard";
import type { DashboardTab } from "@/components/analytics/DashboardTabs";
import type { RangeDays } from "@/components/analytics/DateRangeSelector";
import {
  getCampaigns,
  getCampaignsOverview,
  getChannels,
  getCountries,
  getDevices,
  getEvents,
  getOverview,
  getTrend,
  getTopPages,
  isGaConfigured,
} from "@/lib/googleAnalytics";

export const metadata: Metadata = {
  title: "Portfolio CMS",
  description: "",
};

function parseTab(raw?: string): DashboardTab {
  return raw === "campaigns" ? "campaigns" : "overview";
}

function parseDays(raw?: string): RangeDays {
  if (raw === "all") return "all";
  const n = Number(raw);
  if (n === 1 || n === 7 || n === 28 || n === 90) return n;
  return 28;
}

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; days?: string }>;
}) {
  // Auth check — redirect to sign-in if no valid JWT cookie
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) redirect("/signin");
  try {
    jwt.verify(token, process.env.JWT_SECRET ?? "");
  } catch {
    redirect("/signin");
  }

  const { tab: rawTab, days: rawDays } = await searchParams;
  const tab = parseTab(rawTab);
  const days = parseDays(rawDays);

  if (!isGaConfigured()) {
    return (
      <AnalyticsDashboard
        tab={tab}
        days={days}
        overview={null}
        trend={null}
        topPages={null}
        countries={null}
        devices={null}
        channels={null}
        events={null}
        campaignsOverview={null}
        campaigns={null}
      />
    );
  }

  // Fetch all data in parallel; individual failures return null
  const [
    overview,
    trend,
    topPages,
    countries,
    devices,
    channels,
    events,
    campaignsOverview,
    campaigns,
  ] = await Promise.all([
    getOverview(days).catch(() => null),
    getTrend(days).catch(() => null),
    getTopPages(days).catch(() => null),
    getCountries(days).catch(() => null),
    getDevices(days).catch(() => null),
    getChannels(days).catch(() => null),
    getEvents(days).catch(() => null),
    getCampaignsOverview(days).catch(() => null),
    getCampaigns(days).catch(() => null),
  ]);

  return (
    <AnalyticsDashboard
      tab={tab}
      days={days}
      overview={overview}
      trend={trend}
      topPages={topPages}
      countries={countries}
      devices={devices}
      channels={channels}
      events={events}
      campaignsOverview={campaignsOverview}
      campaigns={campaigns}
    />
  );
}
