import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { toBaseQty } from "@/lib/units";

export async function GET(req: NextRequest) {
 const session = await getSession();
 if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

 const { searchParams } = new URL(req.url);
 const status = searchParams.get("status") ?? "";
 const myOnly = searchParams.get("mine") === "1";

 const quotations = await prisma.quotation.findMany({
 where: {
 ...(status ? { status: status as any } : {}),
 ...(myOnly ? { requestedById: session.id } : {}),
 },
 include: {
 requestedBy: { select: { name: true, email: true } },
 items: {
 include: {
 product: {
 select: { name: true, dimension: true, category: true },
 },
 },
 },
 },
 orderBy: { createdAt: "desc" },
 });

 return NextResponse.json(quotations);
}

export async function POST(req: NextRequest) {
 const session = await getSession();
 if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

 const body = await req.json();
 const { items, notes } = body;

 if (!items?.length) {
 return NextResponse.json({ error: "No items" }, { status: 400 });
 }

 // Build quotation items with base qty and line totals
 const lineItems = await Promise.all(
 items.map(async (item: any) => {
 const product = await prisma.product.findUnique({
 where: { id: item.productId },
 include: { units: true },
 });
 if (!product) throw new Error(`Product ${item.productId} not found`);

 const pricePerBase = parseFloat(product.pricePerBaseUnit.toString());
 const baseQty = toBaseQty(item.quantity.toString(), item.unit);
 const lineTotal = Math.round(baseQty * pricePerBase * 100); // paisa

 return {
 productId: item.productId,
 orderUnit: item.unit,
 orderQty: item.quantity,
 baseQty: baseQty.toString(),
 pricePerBase: pricePerBase.toString(),
 lineTotal,
 };
 })
 );

 // Stock deduction + low-stock alert
 for (const item of lineItems) {
 const updated = await prisma.product.update({
 where: { id: item.productId },
 data: { stockQuantity: { decrement: item.baseQty } },
 });

 // Check if stock fell below reorder threshold
 if (updated.reorderThreshold) {
 const currentStock = parseFloat(updated.stockQuantity.toString());
 const threshold = parseFloat(updated.reorderThreshold.toString());
 if (currentStock < threshold) {
 const admins = await prisma.user.findMany({
 where: { role: "ADMIN" },
 select: { id: true },
 });
 await prisma.notification.createMany({
 data: admins.map((a) => ({
 userId: a.id,
 event: "LOW_STOCK",
 title: "Low Stock Alert",
 message: `${updated.name} is below reorder threshold (${currentStock.toFixed(2)} remaining).`,
 type: "WARNING",
 link: "/admin/products",
 })),
 });
 }
 }
 }

 const subtotal = lineItems.reduce((s, i) => s + i.lineTotal, 0);
 const taxAmount = Math.round(subtotal * 0.18); // 18% GST
 const totalAmount = subtotal + taxAmount;

 const quotation = await prisma.quotation.create({
 data: {
 requestedById: session.id,
 status: "PENDING",
 subtotal,
 taxAmount,
 totalAmount,
 notes: notes ?? null,
 items: {
 create: lineItems,
 },
 },
 include: {
 requestedBy: { select: { name: true, email: true } },
 items: { include: { product: { include: { units: true } } } },
 },
 });

 // Notify all admins when a new quotation is submitted
 const admins = await prisma.user.findMany({
 where: { role: "ADMIN" },
 select: { id: true },
 });
 const ref = quotation.reference?.slice(0, 8).toUpperCase() ?? quotation.id.slice(0, 8).toUpperCase();
 await prisma.notification.createMany({
 data: admins.map((a) => ({
 userId: a.id,
 event: "QUOTATION_SUBMITTED",
 title: "New Quotation Received",
 message: `${session.user.name} submitted quotation #${ref} for ₹${(totalAmount / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}.`,
 type: "INFO",
 link: "/admin/quotations",
 quotationId: quotation.id,
 })),
 });

 return NextResponse.json(quotation, { status: 201 });
}