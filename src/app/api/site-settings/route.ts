import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getUserFromToken } from "@/lib/auth";
import SiteSettings from "@/app/api/models/SiteSettings";

/* =====================================================
   GET – PUBLIC
===================================================== */
export async function GET() {
  try {
    await connectDB();

    const settings = await SiteSettings.findOne({}).lean();
    return NextResponse.json(
      settings ?? {
        maintenanceMode: false,
        maintenance: {
          title: "We'll Be Right Back",
          message:
            "We're performing scheduled maintenance. We'll be back shortly.",
          estimatedTime: "",
        },
      }
    );
  } catch (error) {
    console.error("GET /api/site-settings error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

/* =====================================================
   PATCH – AUTHENTICATED CMS UPDATE
===================================================== */
export async function PATCH(req: NextRequest) {
  try {
    await connectDB();

    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
    }

    const body = await req.json();
    const { maintenanceMode, maintenance } = body ?? {};

    if (typeof maintenanceMode !== "boolean") {
      return NextResponse.json(
        { message: "maintenanceMode must be a boolean" },
        { status: 400 }
      );
    }

    const settings = await SiteSettings.findOneAndUpdate(
      {},
      {
        $set: {
          maintenanceMode,
          maintenance: {
            title: maintenance?.title ?? "We'll Be Right Back",
            message:
              maintenance?.message ??
              "We're performing scheduled maintenance. We'll be back shortly.",
            estimatedTime: maintenance?.estimatedTime ?? "",
          },
        },
      },
      { upsert: true, new: true }
    ).lean();

    return NextResponse.json({
      message: "Site settings updated successfully",
      settings,
    });
  } catch (error) {
    console.error("PATCH /api/site-settings error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
