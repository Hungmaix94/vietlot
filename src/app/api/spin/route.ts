import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST() {
    try {
        const session = await getSession();
        if (!session || !session.id) {
            console.error("Invalid session:", session);
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check if the user has EVER spun the wheel
        const existing = await prisma.spinResult.findFirst({
            where: {
                userId: session.id,
            },
            orderBy: { createdAt: "desc" }
        });

        if (existing) {
            return NextResponse.json(
                { message: "Bạn chỉ được quay một lần duy nhất.", tickets: existing.tickets, spinResultId: existing.id, alreadySpun: true },
                { status: 200 }
            );
        }

        // Weighted randomness
        // 1 ticket: 10%
        // 2 tickets: 20%
        // 3 tickets: 30%
        // 4 tickets: 25%
        // 5 tickets: 15%
        const rand = Math.random() * 100;
        let tickets = 1;
        if (rand < 10) tickets = 1;
        else if (rand < 30) tickets = 2; // 10 + 20
        else if (rand < 60) tickets = 3; // 30 + 30
        else if (rand < 85) tickets = 4; // 60 + 25
        else tickets = 5; // 85 + 15

        const newSpin = await prisma.spinResult.create({
            data: {
                userId: session.id,
                tickets,
            },
        });

        return NextResponse.json({ success: true, tickets, spinResultId: newSpin.id });
    } catch (error) {
        console.error("Spin error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
