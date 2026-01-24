import {NextRequest, NextResponse} from "next/server";
import {connectDB} from "@/lib/mongodb";
import {getUserFromToken} from "@/lib/auth";
import Services from "@/app/api/models/Services";

export async function GET(req: NextRequest) {
    await connectDB();

    // Check if we want only published or all (for CMS)
    const {searchParams} = new URL(req.url);
    const mode = searchParams.get("mode");

    const query = mode === "cms" ? {} : {status: "published"};
    const services = await Services.findOne(query).lean();

    return NextResponse.json(services ?? {items: []});
}

export async function PATCH(req: NextRequest) {
    try {
        await connectDB();

        // 1. Auth Guard
        const user = await getUserFromToken(req);
        if (!user) {
            return NextResponse.json({message: "Unauthenticated"}, {status: 401});
        }

        const body = await req.json();

        // 2. Database Upsert (updates existing or creates if empty)
        const updatedServices = await Services.findOneAndUpdate(
            {},
            {$set: body},
            {upsert: true, new: true}
        ).lean();

        return NextResponse.json({
            message: "services updated successfully",
            data: updatedServices
        });
    } catch (error: any) {
        return NextResponse.json(
            {message: "Internal Server Error", error: error.message},
            {status: 500}
        );
    }
}