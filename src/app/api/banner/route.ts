import {NextRequest, NextResponse} from "next/server";
import {connectDB} from "@/lib/mongodb";
import {getUserFromToken} from "@/lib/auth";
import Banner from "@/app/api/models/Banner";

/* =====================================================
   GET – PUBLIC
===================================================== */
export async function GET() {
    try {
        await connectDB();

        const banner = await Banner.findOne({}).lean();
        return NextResponse.json(banner ?? {});
    } catch (error) {
        console.error("GET /api/banner error:", error);
        return NextResponse.json(
            {message: "Internal server error"},
            {status: 500}
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
            return NextResponse.json(
                {message: "Unauthenticated"},
                {status: 401}
            );
        }

        const body = await req.json();
        const {section, data} = body ?? {};

        if (section !== "banner" || !data) {
            return NextResponse.json(
                {message: "Invalid request payload"},
                {status: 400}
            );
        }

        const {
            badge,
            headline,
            description,
            ctas,
            featured,
        } = data;

        /* --------- STRICT VALIDATION --------- */
        if (
            !badge ||
            !headline?.line1 ||
            !headline?.line2 ||
            !description ||
            !Array.isArray(ctas) ||
            !featured?.title ||
            !featured?.description
        ) {
            return NextResponse.json(
                {message: "Invalid banner payload"},
                {status: 400}
            );
        }

        const banner = await Banner.findOneAndUpdate(
            {},
            {
                $set: {
                    badge,
                    headline,
                    description,
                    ctas,
                    featured,
                },
            },
            {upsert: true, new: true}
        ).lean();

        return NextResponse.json({
            message: "Banner updated successfully",
            banner,
        });
    } catch (error) {
        console.error("PATCH /api/banner error:", error);
        return NextResponse.json(
            {message: "Internal server error"},
            {status: 500}
        );
    }
}