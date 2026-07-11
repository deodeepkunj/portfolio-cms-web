import { connectDB } from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';
import User from '../../models/User';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // This is a single-owner CMS: once an account exists, public signup is closed.
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      return NextResponse.json(
        { message: 'Sign up is disabled' },
        { status: 403 }
      );
    }

    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 409 }
      );
    }

    const user = new User({ email, password, name });
    await user.save();

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: { id: user._id, email: user.email, name: user.name },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Sign up error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}