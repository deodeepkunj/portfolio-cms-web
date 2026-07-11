import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getUserFromToken } from "@/lib/auth";
import { RecommendationCreateSchema } from "@/lib/validators/recommendation.schema";
import Recommendation from "../models/Recommendation";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("mode");

    const filter = mode === "cms" ? {} : { isActive: true };
    const recommendations = await Recommendation.find(filter).sort({ createdAt: -1 });

    return NextResponse.json(recommendations, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch recommendations" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
    }

    const parsed = RecommendationCreateSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Validation failed", errors: parsed.error.format() },
        { status: 400 }
      );
    }

    const recommendation = await Recommendation.create(parsed.data);

    return NextResponse.json(
      {
        message: "Recommendation created successfully",
        data: recommendation,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        message: "Failed to create recommendation",
        error: error.message,
      },
      { status: 400 }
    );
  }
}
