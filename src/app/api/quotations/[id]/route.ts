import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
 const session = await getSession();
 if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

 const { id } = await params;
 const quotation = await prisma.quotation.findUnique({
 where: { id },
 include: {
 requestedBy: { select: { name: true, email: true } },
 items: { include: { product: { include: { units: true } } } },
 },
 });
 if (!quotation) return NextResponse.json({ error: "Not found" }, { status: 404 });
 return NextResponse.json(quotation);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
 const session = await getSession();
 if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 if (session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

 const { id } = await params;
 const { status } = await req.json();

 if (!["PENDING", "APPROVED", "REJECTED", "FULFILLED"].includes(status)) {
 return NextResponse.json({ error: "Invalid status" }, { status: 400 });
 }

 const quotation = await prisma.quotation.update({
 where: { id },
 data: { status },
 include: {
 requestedBy: { select: { name: true, email: true } },
 items: { include: { product: { include: { units: true } } } },
 },
 });

 return NextResponse.json(quotation);
}