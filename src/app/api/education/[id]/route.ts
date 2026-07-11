import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getUserFromToken } from "@/lib/auth";
import { EducationUpdateSchema } from "@/lib/validators/education.schema";
import Education from "../../models/Education";

/* ---------------- GET BY ID ---------------- */
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const education = await Education.findById(id);

    if (!education) {
      return NextResponse.json(
        { message: "Education not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(education, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Invalid education ID" },
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

    const parsed = EducationUpdateSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Validation failed", errors: parsed.error.format() },
        { status: 400 }
      );
    }

    const updated = await Education.findByIdAndUpdate(
      id,
      parsed.data,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return NextResponse.json(
        { message: "Education not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Education updated successfully", data: updated },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { message: "Failed to update education" },
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
    const deleted = await Education.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { message: "Education not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Education deleted successfully" },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { message: "Failed to delete education" },
      { status: 400 }
    );
  }
}
