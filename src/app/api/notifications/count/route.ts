import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET /api/notifications/count — lightweight unread count for polling
export async function GET(req: NextRequest) {
 const session = await getSession();
 if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

 const count = await prisma.notification.count({
 where: { userId: session.id, read: false },
 });

 return NextResponse.json({ count });
}