import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getUserFromToken } from "@/lib/auth";
import { RecommendationUpdateSchema } from "@/lib/validators/recommendation.schema";
import Recommendation from "../../models/Recommendation";

/* ---------------- GET BY ID ---------------- */
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params; // ✅ FIX
    const recommendation = await Recommendation.findById(id);

    if (!recommendation) {
      return NextResponse.json(
        { message: "Recommendation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(recommendation, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Invalid recommendation ID" },
      { status: 400 }
    );
  }
}

/* ---------------- UPDATE ---------------- */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
    }

    const { id } = await params; // ✅ FIX

    const parsed = RecommendationUpdateSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Validation failed", errors: parsed.error.format() },
        { status: 400 }
      );
    }

    const updated = await Recommendation.findByIdAndUpdate(
      id,
      parsed.data,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return NextResponse.json(
        { message: "Recommendation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Recommendation updated successfully", data: updated },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { message: "Failed to update recommendation" },
      { status: 400 }
    );
  }
}

/* ---------------- DELETE ---------------- */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
    }

    const { id } = await params; // ✅ FIX
    const deleted = await Recommendation.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { message: "Recommendation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Recommendation deleted successfully" },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { message: "Failed to delete recommendation" },
      { status: 400 }
    );
  }
}
