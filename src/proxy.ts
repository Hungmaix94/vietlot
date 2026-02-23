import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/auth";

export async function proxy(request: NextRequest) {
    const token = request.cookies.get("session")?.value;
    const { pathname } = request.nextUrl;

    const isAuthRoute = pathname.startsWith("/login");
    const isProtectedRoute = pathname.startsWith("/dashboard") || pathname.startsWith("/admin");
    const isAdminRoute = pathname.startsWith("/admin");

    if (isProtectedRoute) {
        if (!token) {
            return NextResponse.redirect(new URL("/login", request.url));
        }
        try {
            const session = await decrypt(token);
            if (isAdminRoute && session.role !== "ADMIN") {
                return NextResponse.redirect(new URL("/dashboard", request.url));
            }
        } catch (err) {
            return NextResponse.redirect(new URL("/login", request.url));
        }
    }

    if (isAuthRoute && token) {
        try {
            const session = await decrypt(token);
            if (session.role === "ADMIN") {
                return NextResponse.redirect(new URL("/admin", request.url));
            }
            return NextResponse.redirect(new URL("/dashboard", request.url));
        } catch (err) {
            // invalid token, let them login
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
