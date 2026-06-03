import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
 const session = await getSession();
 if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

 const { id } = await params;
 const product = await prisma.product.findUnique({
 where: { id },
 include: { units: true },
 });
 if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
 return NextResponse.json(product);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
 const session = await getSession();
 if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 if (session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

 const { id } = await params;
 const body = await req.json();
 const { name, description, category, sku, pricePerBaseUnit, stockQuantity, reorderThreshold, units } = body;

 const product = await prisma.product.update({
 where: { id },
 data: {
 ...(name !== undefined ? { name } : {}),
 ...(description !== undefined ? { description } : {}),
 ...(category !== undefined ? { category } : {}),
 ...(sku !== undefined ? { sku } : {}),
 ...(pricePerBaseUnit !== undefined ? { pricePerBaseUnit } : {}),
 ...(stockQuantity !== undefined ? { stockQuantity } : {}),
 ...(reorderThreshold !== undefined ? { reorderThreshold } : {}),
 },
 include: { units: true },
 });

 if (units) {
 await prisma.productUnit.deleteMany({ where: { productId: id } });
 await prisma.productUnit.createMany({
 data: units.map((u: any) => ({
 productId: id,
 unit: u.unit,
 label: u.label,
 amountInBase: u.amountInBase ?? (u.unit === "kg" ? "1000" : u.unit === "L" ? "1000" : "1"),
 })),
 });
 }

 return NextResponse.json(product);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
 const session = await getSession();
 if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 if (session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

 const { id } = await params;
 await prisma.product.delete({ where: { id } });
 return NextResponse.json({ ok: true });
}