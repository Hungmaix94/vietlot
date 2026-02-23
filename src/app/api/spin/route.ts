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

        // Weighted randomness (1-8 tickets)
        // 1 ticket: 5%
        // 2 tickets: 10%
        // 3 tickets: 20%
        // 4 tickets: 25%
        // 5 tickets: 20%
        // 6 tickets: 10%
        // 7 tickets: 7%
        // 8 tickets: 3%
        const rand = Math.random() * 100;
        let tickets = 1;
        if (rand < 5) tickets = 1;
        else if (rand < 15) tickets = 2;  // 5 + 10
        else if (rand < 35) tickets = 3;  // 15 + 20
        else if (rand < 60) tickets = 4;  // 35 + 25
        else if (rand < 80) tickets = 5;  // 60 + 20
        else if (rand < 90) tickets = 6;  // 80 + 10
        else if (rand < 97) tickets = 7;  // 90 + 7
        else tickets = 8;                 // 97 + 3

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
