import { NextRequest, NextResponse } from "next/server";
import { getUserFromToken } from "@/lib/auth";
import {
    GaConfigError,
    getCampaigns,
    getCampaignsOverview,
    getChannels,
    getCountries,
    getDevices,
    getOverview,
    getRealtimeUsers,
    getTopPages,
    getTrend,
    isGaConfigured,
} from "@/lib/googleAnalytics";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    const user = await getUserFromToken(req);
    if (!user) {
        return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
    }

    if (!isGaConfigured()) {
        return NextResponse.json({ message: "Analytics not configured" }, { status: 503 });
    }

    const { searchParams } = new URL(req.url);
    const report = searchParams.get("report");
    const days = Number(searchParams.get("days")) || 28;

    try {
        switch (report) {
            case "overview":
                return NextResponse.json(await getOverview(days));
            case "realtime":
                return NextResponse.json(await getRealtimeUsers());
            case "trend":
                return NextResponse.json(await getTrend(days));
            case "top-pages":
                return NextResponse.json(await getTopPages(days));
            case "countries":
                return NextResponse.json(await getCountries(days));
            case "devices":
                return NextResponse.json(await getDevices(days));
            case "channels":
                return NextResponse.json(await getChannels(days));
            case "campaigns-overview":
                return NextResponse.json(await getCampaignsOverview(days));
            case "campaigns":
                return NextResponse.json(await getCampaigns(days));
            default:
                return NextResponse.json({ message: "Unknown report" }, { status: 400 });
        }
    } catch (err) {
        if (err instanceof GaConfigError) {
            return NextResponse.json({ message: "Analytics not configured" }, { status: 503 });
        }
        console.error("GA analytics fetch failed:", err);
        return NextResponse.json({ message: "Failed to fetch analytics" }, { status: 502 });
    }
}
