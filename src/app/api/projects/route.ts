import {NextRequest, NextResponse} from "next/server";
import {connectDB} from "@/lib/mongodb";
import {getUserFromToken} from "@/lib/auth";

import {ProjectsSchema} from "@/lib/validators/projects.schema";
import Projects from "@/app/api/models/Projects";

export async function GET(req: NextRequest) {
    await connectDB();
    const {searchParams} = new URL(req.url);
    const mode = searchParams.get("mode");

    const query = mode === "cms" ? {} : {status: "published"};
    const data = await Projects.findOne(query).lean();

    return NextResponse.json(data ?? {items: []});
}

export async function PATCH(req: NextRequest) {
    try {
        await connectDB();

        const user = await getUserFromToken(req);
        if (!user) {
            return NextResponse.json({message: "Unauthenticated"}, {status: 401});
        }

        const body = await req.json();

        const parsed = ProjectsSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                {message: "Validation failed", errors: parsed.error.format()},
                {status: 400}
            );
        }

        const updatedData = await Projects.findOneAndUpdate(
            {}, 
            {$set: parsed.data},
            {upsert: true, new: true, runValidators: true}
        ).lean();

        return NextResponse.json({
            message: "Featured Projects saved successfully",
            projects: updatedData,
        });
    } catch (error: any) {
        console.error("Projects API Error:", error);
        return NextResponse.json(
            {message: "Internal Server Error", error: error.message},
            {status: 500}
        );
    }
}