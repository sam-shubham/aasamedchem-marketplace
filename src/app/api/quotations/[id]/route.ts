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

 // Create a notification for the seller on every status change
 const eventConfig: Record<string, { title: string; message: string; type: "INFO" | "WARNING" | "SUCCESS" }> = {
 APPROVED: {
 title: "Quotation Approved",
 message: `Your quotation #${quotation.reference?.slice(0, 8).toUpperCase() ?? id.slice(0, 8).toUpperCase()} has been approved.`,
 type: "SUCCESS",
 },
 REJECTED: {
 title: "Quotation Rejected",
 message: `Your quotation #${quotation.reference?.slice(0, 8).toUpperCase() ?? id.slice(0, 8).toUpperCase()} was not approved. Contact admin for more info.`,
 type: "WARNING",
 },
 FULFILLED: {
 title: "Order Fulfilled",
 message: `Order #${quotation.reference?.slice(0, 8).toUpperCase() ?? id.slice(0, 8).toUpperCase()} has been fulfilled and is on its way.`,
 type: "SUCCESS",
 },
 };

 const cfg = eventConfig[status];
 if (cfg) {
 await prisma.notification.create({
 data: {
 userId: quotation.requestedById,
 event: `QUOTATION_${status}`,
 title: cfg.title,
 message: cfg.message,
 type: cfg.type,
 link: `/seller/orders`,
 quotationId: quotation.id,
 },
 });
 }

 // Also notify admin on new pending quotation (seller submits a quotation)
 // This is handled in the POST /api/quotations route
 return NextResponse.json(quotation);
}