import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getUserFromToken } from "@/lib/auth";
import { EducationCreateSchema } from "@/lib/validators/education.schema";
import Education from "../models/Education";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("mode");

    const filter = mode === "cms" ? {} : { isActive: true };
    const education = await Education.find(filter).sort({ order: 1, createdAt: -1 });

    return NextResponse.json(education, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch education" },
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

    const parsed = EducationCreateSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Validation failed", errors: parsed.error.format() },
        { status: 400 }
      );
    }

    const last = await Education.findOne().sort({ id: -1 }).select("id");
    const nextId = last ? last.id + 1 : 0;

    const education = await Education.create({ ...parsed.data, id: nextId });

    return NextResponse.json(
      {
        message: "Education created successfully",
        data: education,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        message: "Failed to create education",
        error: error.message,
      },
      { status: 400 }
    );
  }
}
