import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Recommendation from "../models/Recommendation";

export async function GET() {
  try {
    await connectDB();

    const recommendations = await Recommendation.find({ isActive: true })
      .sort({ createdAt: -1 });

    return NextResponse.json(recommendations, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch recommendations" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();

    const recommendation = await Recommendation.create(body);

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
