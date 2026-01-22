import { connectDB } from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';
import Blog from '../../models/Blog';


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    const blog = await Blog.findById(id);

    if (!blog) {
      return NextResponse.json(
        { message: 'Blog not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { blog },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get blog error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const { title, slug, content, excerpt, status, seo } = await request.json();

    // Check if slug already exists (excluding current blog)
    const existingBlog = await Blog.findOne({ slug, _id: { $ne: id } });
    if (existingBlog) {
      return NextResponse.json(
        { message: 'Slug already exists' },
        { status: 409 }
      );
    }

    const blog = await Blog.findByIdAndUpdate(
      id,
      {
        title,
        slug,
        content,
        excerpt,
        status,
        publishedAt: status === 'published' ? new Date() : null,
        seo,
      },
      { new: true, runValidators: true }
    );

    if (!blog) {
      return NextResponse.json(
        { message: 'Blog not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Blog updated successfully', blog },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update blog error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    const blog = await Blog.findByIdAndDelete(id);

    if (!blog) {
      return NextResponse.json(
        { message: 'Blog not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Blog deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete blog error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}