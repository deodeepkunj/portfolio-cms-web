import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getUserFromToken } from "@/lib/auth";
import { ExperienceUpdateSchema } from "@/lib/validators/experience.schema";
import Experience from "../../models/Experience";

/* ---------------- GET BY ID ---------------- */
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const experience = await Experience.findById(id);

    if (!experience) {
      return NextResponse.json(
        { message: "Experience not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(experience, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Invalid experience ID" },
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

    const { id } = await params;

    const parsed = ExperienceUpdateSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Validation failed", errors: parsed.error.format() },
        { status: 400 }
      );
    }

    const updated = await Experience.findByIdAndUpdate(
      id,
      parsed.data,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return NextResponse.json(
        { message: "Experience not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Experience updated successfully", data: updated },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { message: "Failed to update experience" },
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

    const { id } = await params;
    const deleted = await Experience.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { message: "Experience not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Experience deleted successfully" },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { message: "Failed to delete experience" },
      { status: 400 }
    );
  }
}
