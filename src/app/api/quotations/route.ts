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
 include: { product: { include: { units: true } } },
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

 // Stock deduction
 for (const item of lineItems) {
 await prisma.product.update({
 where: { id: item.productId },
 data: { stockQuantity: { decrement: item.baseQty } },
 });
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

 return NextResponse.json(quotation, { status: 201 });
}