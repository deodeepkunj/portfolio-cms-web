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

    let isTokenValid = false;
    if (token) {
        try {
            jwt.verify(token, process.env.JWT_SECRET!);
            isTokenValid = true;
        } catch {
            isTokenValid = false;
        }
    }

    // Everything under this matcher that isn't explicitly public is an admin
    // route — fail closed instead of enumerating protected path prefixes
    // (route groups like `(ui-elements)` don't show up in the URL, so an
    // allow-list of prefixes silently misses real pages).
    if (!isPublicRoute) {
        if (!isTokenValid) {
            return NextResponse.redirect(new URL('/signin', request.url));
        }
        return NextResponse.next();
    }

    // Already signed in and hitting a public-only page (e.g. /signin) → dashboard.
    if (isTokenValid) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Public route with no/invalid token: let it through, but drop a stale
    // cookie instead of redirecting back to the same public route (which
    // would loop).
    const response = NextResponse.next();
    if (token && !isTokenValid) {
        response.cookies.delete('token');
    }
    return response;
}

export const config = {
    matcher: ['/((?!api|_next|favicon.ico).*)'],
};
