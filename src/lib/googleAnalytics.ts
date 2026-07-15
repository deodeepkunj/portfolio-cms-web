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

export const ALLOWED_DAYS = [1, 7, 28, 90] as const;
export type RangeDays = (typeof ALLOWED_DAYS)[number] | "all";

export function clampDays(days: number): RangeDays {
    return (ALLOWED_DAYS as readonly number[]).includes(days) ? (days as RangeDays) : 28;
}

const ALL_TIME_DAYS = 365;

function getDateRange(daysInput: number | "all") {
    if (daysInput === "all") return [{ startDate: `${ALL_TIME_DAYS}daysAgo`, endDate: "today" }];
    if (daysInput === 1) return [{ startDate: "today", endDate: "today" }];
    const days = clampDays(daysInput);
    return [{ startDate: `${days}daysAgo`, endDate: "today" }];
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
    events: number;
    avgEngagementSecs: number;
    deltas: {
        activeUsers: number | null;
        sessions: number | null;
        pageViews: number | null;
        events: number | null;
        avgEngagementSecs: number | null;
    };
};

export async function getOverview(daysInput: number | "all"): Promise<Overview> {
    const cacheKey = daysInput === "all" ? "overview:all" : `overview:${clampDays(daysInput)}`;
    return cached(cacheKey, REPORT_TTL_MS, async () => {
        if (daysInput === "all") {
            const [res] = await getClient().runReport({
                property: property(),
                dateRanges: getDateRange(daysInput),
                metrics: [
                    { name: "activeUsers" },
                    { name: "sessions" },
                    { name: "screenPageViews" },
                    { name: "eventCount" },
                    { name: "averageSessionDuration" },
                ],
            });

            const row = (res.rows ?? [])[0] as GaRow | undefined;
            const activeUsers = num(row, 0);
            const sessions = num(row, 1);
            const pageViews = num(row, 2);
            const events = num(row, 3);
            const avgEngagementSecs = num(row, 4);

            return {
                activeUsers,
                sessions,
                pageViews,
                events,
                avgEngagementSecs,
                deltas: {
                    activeUsers: null,
                    sessions: null,
                    pageViews: null,
                    events: null,
                    avgEngagementSecs: null,
                },
            };
        }

        const days = clampDays(daysInput) as number;
        // two ranges: current period + the one before it, for deltas.
        // GA adds a `dateRange` dimension tagging rows date_range_0/1.
        const dateRanges = days === 1
            ? [{ startDate: "today", endDate: "today" }, { startDate: "yesterday", endDate: "yesterday" }]
            : [{ startDate: `${days}daysAgo`, endDate: "today" }, { startDate: `${2 * days}daysAgo`, endDate: `${days + 1}daysAgo` }];
        const [res] = await getClient().runReport({
            property: property(),
            dateRanges,
            metrics: [
                { name: "activeUsers" },
                { name: "sessions" },
                { name: "screenPageViews" },
                { name: "eventCount" },
                { name: "averageSessionDuration" },
            ],
        });
        const rows = (res.rows ?? []) as GaRow[];
        const current = rows.find((r) => dim(r, 0) === "date_range_0");
        const previous = rows.find((r) => dim(r, 0) === "date_range_1");

        const activeUsers = num(current, 0);
        const sessions = num(current, 1);
        const pageViews = num(current, 2);
        const events = num(current, 3);
        const avgEngagementSecs = num(current, 4);

        return {
            activeUsers,
            sessions,
            pageViews,
            events,
            avgEngagementSecs,
            deltas: {
                activeUsers: pctDelta(activeUsers, num(previous, 0)),
                sessions: pctDelta(sessions, num(previous, 1)),
                pageViews: pctDelta(pageViews, num(previous, 2)),
                events: pctDelta(events, num(previous, 3)),
                avgEngagementSecs: pctDelta(avgEngagementSecs, num(previous, 4)),
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

export async function getTrend(daysInput: number | "all"): Promise<Trend> {
    const cacheKey = daysInput === "all" ? "trend:all" : `trend:${clampDays(daysInput)}`;
    return cached(cacheKey, REPORT_TTL_MS, async () => {
        const hourly = daysInput === 1;
        const dimName = hourly ? "dateHour" : "date";
        const [res] = await getClient().runReport({
            property: property(),
            dateRanges: getDateRange(daysInput),
            dimensions: [{ name: dimName }],
            metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }],
            orderBys: [{ dimension: { dimensionName: dimName } }],
        });

        const rows = (res.rows ?? []) as GaRow[];
        const dates: string[] = [];
        const activeUsers: number[] = [];
        const pageViews: number[] = [];

        for (const row of rows) {
            const key = dim(row, 0);
            if (hourly) {
                // dateHour format: YYYYMMDDHH → ISO datetime for ApexCharts
                dates.push(`${key.slice(0, 4)}-${key.slice(4, 6)}-${key.slice(6, 8)}T${key.slice(8, 10)}:00:00`);
            } else {
                dates.push(`${key.slice(0, 4)}-${key.slice(4, 6)}-${key.slice(6, 8)}`);
            }
            activeUsers.push(num(row, 0));
            pageViews.push(num(row, 1));
        }

        return { dates, activeUsers, pageViews };
    });
}

export type TopPages = {
    rows: Array<{ path: string; title: string; views: number; users: number; avgDuration: number }>;
};

export async function getTopPages(daysInput: number | "all"): Promise<TopPages> {
    const cacheKey = daysInput === "all" ? `top-pages:all` : `top-pages:${clampDays(daysInput)}`;
    return cached(cacheKey, REPORT_TTL_MS, async () => {
        const [res] = await getClient().runReport({
            property: property(),
            dateRanges: getDateRange(daysInput),
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

export async function getCountries(daysInput: number | "all"): Promise<Countries> {
    const cacheKey = daysInput === "all" ? `countries:all` : `countries:${clampDays(daysInput)}`;
    return cached(cacheKey, REPORT_TTL_MS, async () => {
        const [res] = await getClient().runReport({
            property: property(),
            dateRanges: getDateRange(daysInput),
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

export async function getDevices(daysInput: number | "all"): Promise<Devices> {
    const cacheKey = daysInput === "all" ? `devices:all` : `devices:${clampDays(daysInput)}`;
    return cached(cacheKey, REPORT_TTL_MS, async () => {
        const [res] = await getClient().runReport({
            property: property(),
            dateRanges: getDateRange(daysInput),
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

export async function getChannels(daysInput: number | "all"): Promise<Channels> {
    const cacheKey = daysInput === "all" ? `channels:all` : `channels:${clampDays(daysInput)}`;
    return cached(cacheKey, REPORT_TTL_MS, async () => {
        const [res] = await getClient().runReport({
            property: property(),
            dateRanges: getDateRange(daysInput),
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

export type Events = {
    currencyCode: string;
    rows: Array<{
        eventName: string;
        eventCount: number;
        users: number;
        eventCountPerUser: number;
        revenue: number;
    }>;
};

export async function getEvents(daysInput: number | "all"): Promise<Events> {
    const cacheKey = daysInput === "all" ? `events:all` : `events:${clampDays(daysInput)}`;
    return cached(cacheKey, REPORT_TTL_MS, async () => {
        const [res] = await getClient().runReport({
            property: property(),
            dateRanges: getDateRange(daysInput),
            dimensions: [{ name: "eventName" }],
            metrics: [
                { name: "eventCount" },
                { name: "totalUsers" },
                { name: "eventCountPerUser" },
                { name: "purchaseRevenue" },
            ],
            orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
            limit: 10,
        });
        return {
            currencyCode: res.metadata?.currencyCode ?? "USD",
            rows: ((res.rows ?? []) as GaRow[]).map((row) => ({
                eventName: dim(row, 0) || "(not set)",
                eventCount: num(row, 0),
                users: num(row, 1),
                eventCountPerUser: num(row, 2),
                revenue: num(row, 3),
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

export async function getCampaignsOverview(daysInput: number | "all"): Promise<CampaignsOverview> {
    const cacheKey = daysInput === "all" ? `campaigns-overview:all` : `campaigns-overview:${clampDays(daysInput)}`;
    return cached(cacheKey, REPORT_TTL_MS, async () => {
        // Advertising metrics (advertiserAd*, returnOnAdSpend) require a
        // compatible campaign dimension in the report request.
        if (daysInput === "all") {
            const [currentRes] = await getClient().runReport({
                property: property(),
                dateRanges: getDateRange(daysInput),
                dimensions: [{ name: "sessionCampaignName" }],
                metrics: CAMPAIGN_OVERVIEW_METRICS,
            });

            const current = (currentRes.rows ?? [])[0] as GaRow | undefined;
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
                    clicks: null,
                    cost: null,
                    impressions: null,
                    roas: null,
                },
            };
        }

        const days = clampDays(daysInput) as number;
        const [currentRange, previousRange] = days === 1
            ? [{ startDate: "today", endDate: "today" }, { startDate: "yesterday", endDate: "yesterday" }]
            : [{ startDate: `${days}daysAgo`, endDate: "today" }, { startDate: `${2 * days}daysAgo`, endDate: `${days + 1}daysAgo` }];
        const [[currentRes], [previousRes]] = await Promise.all([
            getClient().runReport({
                property: property(),
                dateRanges: [currentRange],
                dimensions: [{ name: "sessionCampaignName" }],
                metrics: CAMPAIGN_OVERVIEW_METRICS,
            }),
            getClient().runReport({
                property: property(),
                dateRanges: [previousRange],
                dimensions: [{ name: "sessionCampaignName" }],
                metrics: CAMPAIGN_OVERVIEW_METRICS,
            }),
        ]);

        const currentRows = (currentRes.rows ?? []) as GaRow[];
        const previousRows = (previousRes.rows ?? []) as GaRow[];

        const currentTotals = currentRows.reduce(
            (totals, row) => {
                const clicks = num(row, 0);
                const cost = num(row, 1);
                const impressions = num(row, 2);
                const roas = num(row, 3);
                return {
                    clicks: totals.clicks + clicks,
                    cost: totals.cost + cost,
                    impressions: totals.impressions + impressions,
                    roasRevenue: totals.roasRevenue + cost * roas,
                };
            },
            { clicks: 0, cost: 0, impressions: 0, roasRevenue: 0 }
        );

        const previousTotals = previousRows.reduce(
            (totals, row) => {
                const clicks = num(row, 0);
                const cost = num(row, 1);
                const impressions = num(row, 2);
                const roas = num(row, 3);
                return {
                    clicks: totals.clicks + clicks,
                    cost: totals.cost + cost,
                    impressions: totals.impressions + impressions,
                    roasRevenue: totals.roasRevenue + cost * roas,
                };
            },
            { clicks: 0, cost: 0, impressions: 0, roasRevenue: 0 }
        );

        const roas = currentTotals.cost ? currentTotals.roasRevenue / currentTotals.cost : 0;
        const previousRoas = previousTotals.cost ? previousTotals.roasRevenue / previousTotals.cost : 0;

        return {
            clicks: currentTotals.clicks,
            cost: currentTotals.cost,
            impressions: currentTotals.impressions,
            roas,
            currencyCode: currentRes.metadata?.currencyCode ?? "USD",
            deltas: {
                clicks: pctDelta(currentTotals.clicks, previousTotals.clicks),
                cost: pctDelta(currentTotals.cost, previousTotals.cost),
                impressions: pctDelta(currentTotals.impressions, previousTotals.impressions),
                roas: pctDelta(roas, previousRoas),
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

export async function getCampaigns(daysInput: number | "all"): Promise<Campaigns> {
    const cacheKey = daysInput === "all" ? `campaigns:all` : `campaigns:${clampDays(daysInput)}`;
    return cached(cacheKey, REPORT_TTL_MS, async () => {
        const [res] = await getClient().runReport({
            property: property(),
            dateRanges: getDateRange(daysInput),
            dimensions: [{ name: "sessionCampaignName" }],
            metrics: [
                { name: "advertiserAdClicks" },
                { name: "advertiserAdCost" },
                { name: "advertiserAdImpressions" },
                { name: "advertiserAdCostPerClick" },
                { name: "returnOnAdSpend" },
            ],
            orderBys: [{ metric: { metricName: "advertiserAdCost" }, desc: true }],
            limit: 1000,
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
