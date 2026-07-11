import { connectDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { getUserFromToken } from "@/lib/auth";
import { BlogCreateSchema } from "@/lib/validators/blog.schema";
import Blog from "../models/Blog";

/* ---------------- CREATE BLOG ---------------- */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
    }

    const parsed = BlogCreateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Validation failed", errors: parsed.error.format() },
        { status: 400 }
      );
    }

    const {
      title,
      slug,
      content,
      excerpt,
      bannerImage,
      categories,
      status,
      seo,
    } = parsed.data;

    const existingBlog = await Blog.findOne({ slug });
    if (existingBlog) {
      return NextResponse.json(
        { message: "Slug already exists" },
        { status: 409 }
      );
    }

    const blog = await Blog.create({
      title,
      slug,
      content,
      excerpt,
      bannerImage: bannerImage || "",
      categories: categories || [],
      status: status || "draft",
      publishedAt: status === "published" ? new Date() : null,
      seo,
    });

    return NextResponse.json(
      { message: "Blog created successfully", blog },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create blog error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

/* ---------------- GET BLOGS (LIST) ---------------- */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const filter: any = {};
    if (status) filter.status = status;
    if (category) filter.categories = category;

    const skip = (page - 1) * limit;

    const blogs = await Blog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Blog.countDocuments(filter);

    return NextResponse.json(
      {
        blogs,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get blogs error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
