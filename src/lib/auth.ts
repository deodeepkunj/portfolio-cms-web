// typescript
// File: `src/lib/auth.ts`
import {NextRequest} from "next/server";
import jwt from "jsonwebtoken";

type JwtPayloadLike = {
    id?: string;
    iat?: number;
    exp?: number;
    [key: string]: any;
};

function parseCookieHeader(cookieHeader: string | null): Record<string, string> {
    const out: Record<string, string> = {};
    if (!cookieHeader) return out;
    cookieHeader.split(";").forEach((c) => {
        const [k, ...v] = c.split("=");
        if (!k) return;
        out[k.trim()] = decodeURIComponent((v || []).join("=").trim());
    });
    return out;
}

/**
 * getUserFromToken
 * - Accepts an optional request (NextRequest or any Request-like)
 * - Looks for Bearer token in Authorization header or `token` cookie
 * - Verifies JWT with process.env.JWT_SECRET
 * - Returns decoded payload or null
 */
export async function getUserFromToken(req?: NextRequest | Request | null): Promise<JwtPayloadLike | null> {
    try {
        let token: string | null = null;

        // 1) Try Authorization header (Bearer)
        if (req && "headers" in req && typeof req.headers.get === "function") {
            const auth = req.headers.get("authorization") || req.headers.get("Authorization");
            if (auth && auth.toLowerCase().startsWith("bearer ")) {
                token = auth.split(/\s+/)[1];
            }
        }

        // 2) Try NextRequest.cookies API
        if (!token && req && "cookies" in req && typeof (req as any).cookies?.get === "function") {
            const cookie = (req as any).cookies.get("token");
            if (cookie) token = cookie?.value ?? null;
        }

        // 3) Fallback: parse Cookie header for plain Request
        if (!token && req && "headers" in req && typeof req.headers.get === "function") {
            const cookieHeader = req.headers.get("cookie") ?? null;
            const cookies = parseCookieHeader(cookieHeader);
            if (cookies["token"]) token = cookies["token"];
        }

        if (!token) return null;
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error("JWT_SECRET not set");
            return null;
        }

        const decoded = jwt.verify(token, secret) as JwtPayloadLike;
        return decoded ?? null;
    } catch (err) {
        // invalid token or verification error
        return null;
    }
}