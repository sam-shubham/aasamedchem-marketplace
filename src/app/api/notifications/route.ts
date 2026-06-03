import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET: fetch recent notifications for current user
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const limitStr = searchParams.get("limit") ?? "30";
  const limit = parseInt(limitStr, 10) || 30;

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return NextResponse.json({ notifications });
  } catch (error: any) {
    console.error("Failed to fetch notifications:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH: mark one notification as read, or mark all as read (via ?all=true)
export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const all = searchParams.get("all") === "true";

  try {
    if (all) {
      await prisma.notification.updateMany({
        where: { userId: session.id, read: false },
        data: { read: true },
      });
      return NextResponse.json({ success: true });
    }

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const updated = await prisma.notification.update({
      where: { id, userId: session.id },
      data: { read: true },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Failed to update notification(s):", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}