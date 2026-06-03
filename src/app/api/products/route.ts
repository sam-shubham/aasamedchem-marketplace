import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
 const session = await getSession();
 if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

 const { searchParams } = new URL(req.url);
 const q = searchParams.get("q") ?? "";
 const dimension = searchParams.get("dimension") ?? "";

 const products = await prisma.product.findMany({
 where: {
 ...(q ? { OR: [
 { name: { contains: q, mode: "insensitive" } },
 { sku: { contains: q, mode: "insensitive" } },
 { category: { contains: q, mode: "insensitive" } },
 ] } : {}),
 ...(dimension ? { dimension: dimension as any } : {}),
 },
 include: { units: true },
 orderBy: { name: "asc" },
 });

 return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
 const session = await getSession();
 if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 if (session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

 const body = await req.json();
 const { name, description, category, sku, dimension, pricePerBaseUnit, stockQuantity, reorderThreshold, units } = body;

 if (!name || !dimension || pricePerBaseUnit === undefined) {
 return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
 }

 const product = await prisma.product.create({
 data: {
 name,
 description: description ?? null,
 category: category ?? null,
 sku: sku ?? null,
 dimension,
 baseUnitAmount: "1",
 pricePerBaseUnit,
 stockQuantity: stockQuantity ?? "0",
 reorderThreshold: reorderThreshold ?? null,
 units: units ? {
 create: units.map((u: any) => ({
 unit: u.unit,
 label: u.label,
 amountInBase: u.amountInBase ?? u.unit === "kg" ? "1000" : u.unit === "L" ? "1000" : "1",
 })),
 } : undefined,
 },
 include: { units: true },
 });

 return NextResponse.json(product, { status: 201 });
}