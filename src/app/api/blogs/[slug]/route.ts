import { connectDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import Blog from "../../models/Blog";

/* ---------------- GET BLOG BY SLUG ---------------- */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();

    const { slug } = await params;

    const blog = await Blog.findOne({ slug, status: "published" });

    if (!blog) {
      return NextResponse.json(
        { message: "Blog not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ blog }, { status: 200 });
  } catch (error) {
    console.error("Get blog error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

/* ---------------- UPDATE BLOG BY SLUG ---------------- */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();

    const { slug } = await params;
    const body = await request.json();

    const {
      title,
      newSlug,
      content,
      excerpt,
      bannerImage,
      categories,
      status,
      seo,
    } = body;

    // ❗ Prevent duplicate slug
    if (newSlug && newSlug !== slug) {
      const existing = await Blog.findOne({ slug: newSlug });
      if (existing) {
        return NextResponse.json(
          { message: "Slug already exists" },
          { status: 409 }
        );
      }
    }

    const blog = await Blog.findOneAndUpdate(
      { slug },
      {
        title,
        slug: newSlug ?? slug,
        content,
        excerpt,
        bannerImage,
        categories,
        status,
        publishedAt: status === "published" ? new Date() : null,
        seo,
      },
      { new: true, runValidators: true }
    );

    if (!blog) {
      return NextResponse.json(
        { message: "Blog not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Blog updated successfully", blog },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update blog error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

/* ---------------- DELETE BLOG BY SLUG ---------------- */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();

    const { slug } = await params;

    const blog = await Blog.findOneAndDelete({ slug });

    if (!blog) {
      return NextResponse.json(
        { message: "Blog not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Blog deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete blog error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
