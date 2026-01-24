import {NextRequest, NextResponse} from "next/server";
import {connectDB} from "@/lib/mongodb";
import {getUserFromToken} from "@/lib/auth";
import AboutUs from "@/app/api/models/AboutUs";
import {AboutUsSchema} from "@/lib/validators/aboutus.schema";


/* ================= GET (Public – only published) ================= */
export async function GET() {
    await connectDB();
    const about = await AboutUs.findOne({status: "published"}).lean();
    return NextResponse.json(about ?? {});
}

/* ================= PATCH (CMS) ================= */
export async function PATCH(req: NextRequest) {
    await connectDB();

    const user = await getUserFromToken(req);
    if (!user) {
        return NextResponse.json({message: "Unauthenticated"}, {status: 401});
    }

    const body = await req.json();

    const parsed = AboutUsSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            {message: "Validation failed", errors: parsed.error.format()},
            {status: 400}
        );
    }

    const about = await AboutUs.findOneAndUpdate(
        {},
        {$set: parsed.data},
        {upsert: true, new: true}
    ).lean();

    return NextResponse.json({message: "About Us saved", about});
}