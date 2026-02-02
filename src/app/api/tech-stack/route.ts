import {NextRequest, NextResponse} from "next/server";
import {connectDB} from "@/lib/mongodb";
import {getUserFromToken} from "@/lib/auth";
import TechStack from "../models/TechStack";


// --- API Handlers ---
export async function GET(req: NextRequest) {
    await connectDB();
    const {searchParams} = new URL(req.url);
    const data = await TechStack.findOne(searchParams.get("mode") === "cms" ? {} : {status: "published"}).lean();
    return NextResponse.json(data ?? {tools: []});
}

export async function PATCH(req: NextRequest) {
    try {
        await connectDB();
        const user = await getUserFromToken(req);
        if (!user) return NextResponse.json({message: "Unauthorized"}, {status: 401});

        const body = await req.json();
        const updated = await TechStack.findOneAndUpdate({}, {$set: body}, {upsert: true, new: true}).lean();

        return NextResponse.json({message: "Tech stack updated", data: updated});
    } catch (error: any) {
        return NextResponse.json({message: error.message}, {status: 500});
    }
}