import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Await the params since it can be asynchronous in Next.js 15
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Seller ID is required" }, { status: 400 });
  }

  try {
    // Verify target user is a seller
    const targetUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "Seller not found" }, { status: 444 });
    }

    if (targetUser.role !== "SELLER") {
      return NextResponse.json({ error: "Cannot delete a user with ADMIN role" }, { status: 400 });
    }

    // Run delete inside a transaction to cascade quotations
    await prisma.$transaction([
      prisma.quotation.deleteMany({
        where: { requestedById: id },
      }),
      prisma.user.delete({
        where: { id },
      }),
    ]);

    return NextResponse.json({ message: "Seller deleted successfully" });
  } catch (error: any) {
    console.error("Failed to delete seller:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
