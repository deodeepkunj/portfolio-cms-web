import {NextRequest, NextResponse} from 'next/server';
import jwt from "jsonwebtoken"

export function proxy(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const {pathname} = request.nextUrl;

    const publicRoutes = [
        '/signin',
        '/signup',
        '/reset-password',
        '/',
    ];

    const isPublicRoute = publicRoutes.some(route =>
        pathname === route || pathname.startsWith(route + '/')
    );

    const isProtectedRoute =
        pathname.startsWith('/dashboard') ||
        pathname.startsWith('/ui-elements') ||
        pathname.startsWith('/others-pages') ||
        pathname.startsWith('/calendar') ||
        pathname.startsWith('/profile') ||
        pathname.startsWith('/ecommerce') ||
        pathname.startsWith('/blogs') ||
        pathname.startsWith('/about') ||
        pathname.startsWith('/projects') ||
        pathname.startsWith('/techstack') ||
        pathname.startsWith('/banner');

    // 🔐 Block unauthenticated users
    if (isProtectedRoute && !token) {
        return NextResponse.redirect(new URL('/signin', request.url));
    }

    // 🔁 Prevent logged-in users from seeing signin
    if (isPublicRoute && token) {
        try {
            jwt.verify(token, process.env.JWT_SECRET!);
            return NextResponse.redirect(new URL('/dashboard', request.url));
        } catch {
            // invalid token → allow access
            return NextResponse.redirect(new URL('/signin', request.url));
        }
    }

    // 🔎 Verify token on protected routes
    if (isProtectedRoute && token) {
        try {
            jwt.verify(token, process.env.JWT_SECRET!);
        } catch {
            return NextResponse.redirect(new URL('/signin', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next|favicon.ico).*)'],
};