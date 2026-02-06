import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
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
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params; // ✅ FIX
    const body = await req.json();

    const updated = await Recommendation.findByIdAndUpdate(
      id,
      body,
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
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

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
