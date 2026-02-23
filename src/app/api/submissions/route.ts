import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const ticketSchema = z.array(z.number().min(1).max(55)).length(6);
const submitSchema = z.object({
    spinResultId: z.string(),
    tickets: z.array(ticketSchema),
});

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const parsed = submitSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid payload", details: parsed.error }, { status: 400 });
        }

        const { spinResultId, tickets } = parsed.data;

        const spinResult = await prisma.spinResult.findUnique({
            where: { id: spinResultId },
        });

        if (!spinResult || spinResult.userId !== session.id) {
            return NextResponse.json({ error: "Invalid spin result" }, { status: 400 });
        }

        if (spinResult.isUsed) {
            return NextResponse.json({ error: "Spin result already used" }, { status: 400 });
        }

        if (tickets.length !== spinResult.tickets) {
            return NextResponse.json({ error: `You must submit exactly ${spinResult.tickets} tickets.` }, { status: 400 });
        }

        // Additional validation: unique numbers per ticket
        for (const ticket of tickets) {
            const uniqueNums = new Set(ticket);
            if (uniqueNums.size !== 6) {
                return NextResponse.json({ error: "Each ticket must have 6 distinct numbers." }, { status: 400 });
            }
        }

        // Save submission
        const submission = await prisma.ticketSubmission.create({
            data: {
                userId: session.id,
                spinResultId,
                tickets,
            },
        });

        // Mark spin as used
        await prisma.spinResult.update({
            where: { id: spinResultId },
            data: { isUsed: true },
        });

        return NextResponse.json({ success: true, submissionId: submission.id });
    } catch (error) {
        console.error("Submission error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// For Admin to see all submissions
export async function GET() {
    try {
        const session = await getSession();
        if (!session || session.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const submissions = await prisma.ticketSubmission.findMany({
            include: {
                user: { select: { username: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ submissions });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
