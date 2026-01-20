import { connectDB } from '@/lib/mongodb';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import User from '../../models/User';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { message: 'No token provided' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      email: string;
    };

    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { user },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }
}