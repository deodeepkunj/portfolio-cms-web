// Server-only GA4 Data API client. Import from route handlers only —
// never from client components.
import { BetaAnalyticsDataClient } from "@google-analytics/data";

export class GaConfigError extends Error {}

export function isGaConfigured(): boolean {
    return !!(
        process.env.GA_PROPERTY_ID &&
        process.env.GA_CLIENT_EMAIL &&
        process.env.GA_PRIVATE_KEY
    );
}

let client: BetaAnalyticsDataClient | null = null;

function getClient(): BetaAnalyticsDataClient {
    if (!isGaConfigured()) throw new GaConfigError("Google Analytics is not configured");
    if (!client) {
        client = new BetaAnalyticsDataClient({
            credentials: {
                client_email: process.env.GA_CLIENT_EMAIL!,
                // env stores flatten newlines to literal "\n"
                private_key: process.env.GA_PRIVATE_KEY!.replace(/\\n/g, "\n"),
            },
        });
    }
    return client;
}

const property = () => `properties/${process.env.GA_PROPERTY_ID}`;

export const ALLOWED_DAYS = [7, 28, 90] as const;
export type RangeDays = (typeof ALLOWED_DAYS)[number];

export function clampDays(days: number): RangeDays {
    return (ALLOWED_DAYS as readonly number[]).includes(days) ? (days as RangeDays) : 28;
}

// --- in-memory TTL cache (protects GA4 API quotas) ---
const cache = new Map<string, { data: unknown; expires: number }>();

async function cached<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
    const hit = cache.get(key);
    if (hit && hit.expires > Date.now()) return hit.data as T;
    const data = await fn();
    cache.set(key, { data, expires: Date.now() + ttlMs });
    return data;
}

const REPORT_TTL_MS = 5 * 60 * 1000;
const REALTIME_TTL_MS = 60 * 1000;

// --- row helpers (GA responses are deeply optional) ---
type GaRow = {
    dimensionValues?: Array<{ value?: string | null }> | null;
    metricValues?: Array<{ value?: string | null }> | null;
};

const dim = (row: GaRow | undefined, i: number) => row?.dimensionValues?.[i]?.value ?? "";
const num = (row: GaRow | undefined, i: number) => Number(row?.metricValues?.[i]?.value ?? 0);

function pctDelta(current: number, previous: number): number | null {
    if (!previous) return null;
    return ((current - previous) / previous) * 100;
}

// --- reports (each returns normalized plain JSON, never raw GA responses) ---

export type Overview = {
    activeUsers: number;
    sessions: number;
    pageViews: number;
    avgEngagementSecs: number;
    deltas: {
        activeUsers: number | null;
        sessions: number | null;
        pageViews: number | null;
        avgEngagementSecs: number | null;
    };
};

export async function getOverview(daysInput: number): Promise<Overview> {
    const days = clampDays(daysInput);
    return cached(`overview:${days}`, REPORT_TTL_MS, async () => {
        const [res] = await getClient().runReport({
            property: property(),
            // two ranges: current period + the one before it, for deltas.
            // GA adds a `dateRange` dimension tagging rows date_range_0/1.
            dateRanges: [
                { startDate: `${days}daysAgo`, endDate: "today" },
                { startDate: `${2 * days}daysAgo`, endDate: `${days + 1}daysAgo` },
            ],
            metrics: [
                { name: "activeUsers" },
                { name: "sessions" },
                { name: "screenPageViews" },
                { name: "averageSessionDuration" },
            ],
        });
        const rows = (res.rows ?? []) as GaRow[];
        const current = rows.find((r) => dim(r, 0) === "date_range_0");
        const previous = rows.find((r) => dim(r, 0) === "date_range_1");

        const activeUsers = num(current, 0);
        const sessions = num(current, 1);
        const pageViews = num(current, 2);
        const avgEngagementSecs = num(current, 3);

        return {
            activeUsers,
            sessions,
            pageViews,
            avgEngagementSecs,
            deltas: {
                activeUsers: pctDelta(activeUsers, num(previous, 0)),
                sessions: pctDelta(sessions, num(previous, 1)),
                pageViews: pctDelta(pageViews, num(previous, 2)),
                avgEngagementSecs: pctDelta(avgEngagementSecs, num(previous, 3)),
            },
        };
    });
}

export type RealtimeUsers = { activeUsers: number };

export async function getRealtimeUsers(): Promise<RealtimeUsers> {
    return cached("realtime", REALTIME_TTL_MS, async () => {
        const [res] = await getClient().runRealtimeReport({
            property: property(),
            metrics: [{ name: "activeUsers" }],
        });
        return { activeUsers: num((res.rows ?? [])[0] as GaRow, 0) };
    });
}

export type Trend = { dates: string[]; activeUsers: number[]; pageViews: number[] };

export async function getTrend(daysInput: number): Promise<Trend> {
    const days = clampDays(daysInput);
    return cached(`trend:${days}`, REPORT_TTL_MS, async () => {
        const [res] = await getClient().runReport({
            property: property(),
            dateRanges: [{ startDate: `${days}daysAgo`, endDate: "today" }],
            dimensions: [{ name: "date" }],
            metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }],
            orderBys: [{ dimension: { dimensionName: "date" } }],
        });

        // GA omits dates with no data, so index rows by date and fill gaps
        const byDate = new Map<string, GaRow>();
        for (const row of (res.rows ?? []) as GaRow[]) {
            byDate.set(dim(row, 0), row); // YYYYMMDD
        }

        const dates: string[] = [];
        const activeUsers: number[] = [];
        const pageViews: number[] = [];
        for (let i = days; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(
                d.getDate()
            ).padStart(2, "0")}`;
            const row = byDate.get(key);
            dates.push(`${key.slice(0, 4)}-${key.slice(4, 6)}-${key.slice(6, 8)}`);
            activeUsers.push(num(row, 0));
            pageViews.push(num(row, 1));
        }
        return { dates, activeUsers, pageViews };
    });
}

export type TopPages = {
    rows: Array<{ path: string; title: string; views: number; users: number; avgDuration: number }>;
};

export async function getTopPages(daysInput: number): Promise<TopPages> {
    const days = clampDays(daysInput);
    return cached(`top-pages:${days}`, REPORT_TTL_MS, async () => {
        const [res] = await getClient().runReport({
            property: property(),
            dateRanges: [{ startDate: `${days}daysAgo`, endDate: "today" }],
            dimensions: [{ name: "pagePath" }, { name: "pageTitle" }],
            metrics: [
                { name: "screenPageViews" },
                { name: "activeUsers" },
                { name: "averageSessionDuration" },
            ],
            orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
            limit: 10,
        });
        return {
            rows: ((res.rows ?? []) as GaRow[]).map((row) => ({
                path: dim(row, 0),
                title: dim(row, 1),
                views: num(row, 0),
                users: num(row, 1),
                avgDuration: num(row, 2),
            })),
        };
    });
}

export type Countries = {
    total: number;
    rows: Array<{ country: string; users: number; pct: number }>;
};

export async function getCountries(daysInput: number): Promise<Countries> {
    const days = clampDays(daysInput);
    return cached(`countries:${days}`, REPORT_TTL_MS, async () => {
        const [res] = await getClient().runReport({
            property: property(),
            dateRanges: [{ startDate: `${days}daysAgo`, endDate: "today" }],
            dimensions: [{ name: "country" }],
            metrics: [{ name: "activeUsers" }],
            orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
            limit: 8,
        });
        const rows = ((res.rows ?? []) as GaRow[]).map((row) => ({
            country: dim(row, 0),
            users: num(row, 0),
        }));
        const total = rows.reduce((sum, r) => sum + r.users, 0);
        return {
            total,
            rows: rows.map((r) => ({
                ...r,
                pct: total ? Math.round((r.users / total) * 100) : 0,
            })),
        };
    });
}

export type Devices = { rows: Array<{ device: string; users: number }> };

export async function getDevices(daysInput: number): Promise<Devices> {
    const days = clampDays(daysInput);
    return cached(`devices:${days}`, REPORT_TTL_MS, async () => {
        const [res] = await getClient().runReport({
            property: property(),
            dateRanges: [{ startDate: `${days}daysAgo`, endDate: "today" }],
            dimensions: [{ name: "deviceCategory" }],
            metrics: [{ name: "activeUsers" }],
            orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
        });
        return {
            rows: ((res.rows ?? []) as GaRow[]).map((row) => ({
                device: dim(row, 0),
                users: num(row, 0),
            })),
        };
    });
}

export type Channels = { rows: Array<{ channel: string; sessions: number }> };

export async function getChannels(daysInput: number): Promise<Channels> {
    const days = clampDays(daysInput);
    return cached(`channels:${days}`, REPORT_TTL_MS, async () => {
        const [res] = await getClient().runReport({
            property: property(),
            dateRanges: [{ startDate: `${days}daysAgo`, endDate: "today" }],
            dimensions: [{ name: "sessionDefaultChannelGroup" }],
            metrics: [{ name: "sessions" }],
            orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
            limit: 8,
        });
        return {
            rows: ((res.rows ?? []) as GaRow[]).map((row) => ({
                channel: dim(row, 0),
                sessions: num(row, 0),
            })),
        };
    });
}

// --- Google Ads campaign reports ---
// These use GA4's Google Ads-linked dimensions/metrics (advertiserAd*, returnOnAdSpend,
// sessionGoogleAdsCampaignName). They require the GA4 property to be linked to a Google
// Ads account in GA Admin -> Google Ads Links; no separate credentials are needed. If no
// link exists, GA returns empty/zeroed rows rather than an error.

export type CampaignsOverview = {
    clicks: number;
    cost: number;
    impressions: number;
    roas: number;
    currencyCode: string;
    deltas: {
        clicks: number | null;
        cost: number | null;
        impressions: number | null;
        roas: number | null;
    };
};

const CAMPAIGN_OVERVIEW_METRICS = [
    { name: "advertiserAdClicks" },
    { name: "advertiserAdCost" },
    { name: "advertiserAdImpressions" },
    { name: "returnOnAdSpend" },
];

export async function getCampaignsOverview(daysInput: number): Promise<CampaignsOverview> {
    const days = clampDays(daysInput);
    return cached(`campaigns-overview:${days}`, REPORT_TTL_MS, async () => {
        // Advertising metrics (advertiserAd*, returnOnAdSpend) don't support
        // multi-dateRange comparison requests, unlike core metrics in getOverview() —
        // so the current and previous periods are queried separately here.
        const [[currentRes], [previousRes]] = await Promise.all([
            getClient().runReport({
                property: property(),
                dateRanges: [{ startDate: `${days}daysAgo`, endDate: "today" }],
                metrics: CAMPAIGN_OVERVIEW_METRICS,
            }),
            getClient().runReport({
                property: property(),
                dateRanges: [{ startDate: `${2 * days}daysAgo`, endDate: `${days + 1}daysAgo` }],
                metrics: CAMPAIGN_OVERVIEW_METRICS,
            }),
        ]);

        const current = (currentRes.rows ?? [])[0] as GaRow | undefined;
        const previous = (previousRes.rows ?? [])[0] as GaRow | undefined;

        const clicks = num(current, 0);
        const cost = num(current, 1);
        const impressions = num(current, 2);
        const roas = num(current, 3);

        return {
            clicks,
            cost,
            impressions,
            roas,
            currencyCode: currentRes.metadata?.currencyCode ?? "USD",
            deltas: {
                clicks: pctDelta(clicks, num(previous, 0)),
                cost: pctDelta(cost, num(previous, 1)),
                impressions: pctDelta(impressions, num(previous, 2)),
                roas: pctDelta(roas, num(previous, 3)),
            },
        };
    });
}

export type Campaigns = {
    currencyCode: string;
    rows: Array<{
        campaign: string;
        clicks: number;
        cost: number;
        impressions: number;
        cpc: number;
        roas: number;
    }>;
};

export async function getCampaigns(daysInput: number): Promise<Campaigns> {
    const days = clampDays(daysInput);
    return cached(`campaigns:${days}`, REPORT_TTL_MS, async () => {
        const [res] = await getClient().runReport({
            property: property(),
            dateRanges: [{ startDate: `${days}daysAgo`, endDate: "today" }],
            dimensions: [{ name: "sessionGoogleAdsCampaignName" }],
            metrics: [
                { name: "advertiserAdClicks" },
                { name: "advertiserAdCost" },
                { name: "advertiserAdImpressions" },
                { name: "advertiserAdCostPerClick" },
                { name: "returnOnAdSpend" },
            ],
            orderBys: [{ metric: { metricName: "advertiserAdCost" }, desc: true }],
            limit: 10,
        });
        return {
            currencyCode: res.metadata?.currencyCode ?? "USD",
            rows: ((res.rows ?? []) as GaRow[]).map((row) => ({
                campaign: dim(row, 0) || "(not set)",
                clicks: num(row, 0),
                cost: num(row, 1),
                impressions: num(row, 2),
                cpc: num(row, 3),
                roas: num(row, 4),
            })),
        };
    });
}
