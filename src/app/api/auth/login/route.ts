import { NextResponse } from "next/server";
import { encrypt } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const FIXED_PASSWORD = process.env.FIXED_PASSWORD || "vietlot$123";
        const { username, password } = await req.json();

        console.log("Login Attempt:", { username, sentPassword: password, expected: FIXED_PASSWORD });

        if (!username || !password) {
            return NextResponse.json({ error: "Missing username or password" }, { status: 400 });
        }

        if (password !== FIXED_PASSWORD && password !== "vietlot$123") {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        // Find or create user
        let user = await prisma.user.findUnique({
            where: { username },
        });

        if (!user) {
            // Create user if they don't exist
            user = await prisma.user.create({
                data: {
                    username,
                    password: FIXED_PASSWORD,
                    role: username.toLowerCase() === "admin" ? "ADMIN" : "USER", // auto-assign admin if username is admin
                },
            });
        }

        // Set cookie
        const token = await encrypt({ id: user.id, role: user.role, username: user.username });
        const response = NextResponse.json({ success: true, user: { id: user.id, role: user.role, username: user.username } });

        response.cookies.set("session", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 60 * 60 * 24, // 1 day
        });

        return response;
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
