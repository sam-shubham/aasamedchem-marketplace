import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "SELLER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    allTimeStats,
    thisMonthStats,
    lastMonthStats,
    statusBreakdown,
    recentOrders,
    topProducts,
  ] = await Promise.all([
    // All-time totals for this seller
    prisma.quotation.aggregate({
      where: { requestedById: session.id },
      _sum: { totalAmount: true },
      _count: { id: true },
    }),

    // This month
    prisma.quotation.aggregate({
      where: { requestedById: session.id, createdAt: { gte: startOfMonth } },
      _sum: { totalAmount: true },
      _count: { id: true },
    }),

    // Last month (for growth %)
    prisma.quotation.aggregate({
      where: {
        requestedById: session.id,
        createdAt: { gte: startOfLastMonth, lt: startOfMonth },
      },
      _sum: { totalAmount: true },
      _count: { id: true },
    }),

    // Breakdown by status
    prisma.quotation.groupBy({
      by: ["status"],
      where: { requestedById: session.id },
      _count: { id: true },
      _sum: { totalAmount: true },
    }),

    // 5 most recent orders with items
    prisma.quotation.findMany({
      where: { requestedById: session.id },
      include: {
        items: {
          include: {
            product: { select: { name: true, dimension: true, category: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),

    // Top products ordered by this seller (by base qty)
    prisma.quotationItem.groupBy({
      by: ["productId"],
      where: {
        quotation: { requestedById: session.id },
      },
      _sum: { baseQty: true, lineTotal: true },
      _count: { id: true },
      orderBy: { _sum: { lineTotal: "desc" } },
      take: 5,
    }),
  ]);

  // Enrich top products with names
  const productDetails = await prisma.product.findMany({
    where: { id: { in: topProducts.map((p) => p.productId) } },
    select: { id: true, name: true, dimension: true, category: true },
  });
  const productMap = new Map(productDetails.map((p) => [p.id, p]));

  const enrichedTopProducts = topProducts.map((item) => {
    const p = productMap.get(item.productId);
    return {
      productId: item.productId,
      name: p?.name ?? "Unknown",
      dimension: p?.dimension ?? "COUNT",
      category: p?.category ?? null,
      totalBaseQty: Number(item._sum.baseQty ?? 0),
      totalSpentPaisa: item._sum.lineTotal ?? 0,
      orderCount: item._count.id,
    };
  });

  // Month-over-month spend change
  const thisMonth = thisMonthStats._sum.totalAmount ?? 0;
  const lastMonth = lastMonthStats._sum.totalAmount ?? 0;
  const spendGrowthPct =
    lastMonth > 0
      ? ((thisMonth - lastMonth) / lastMonth) * 100
      : thisMonth > 0
      ? 100
      : 0;

  // Pending / approved (upcoming)
  const pendingCount =
    statusBreakdown.find((s) => s.status === "PENDING")?._count.id ?? 0;
  const approvedCount =
    statusBreakdown.find((s) => s.status === "APPROVED")?._count.id ?? 0;

  return NextResponse.json({
    overview: {
      totalSpentPaisa: allTimeStats._sum.totalAmount ?? 0,
      totalOrders: allTimeStats._count.id,
      thisMonthSpentPaisa: thisMonth,
      thisMonthOrders: thisMonthStats._count.id,
      spendGrowthPct: Math.round(spendGrowthPct * 10) / 10,
      pendingCount,
      approvedCount,
    },
    statusBreakdown: statusBreakdown.map((s) => ({
      status: s.status,
      count: s._count.id,
      totalPaisa: s._sum.totalAmount ?? 0,
    })),
    recentOrders: recentOrders.map((q) => ({
      id: q.id,
      reference: q.reference?.slice(0, 8).toUpperCase(),
      status: q.status,
      totalAmount: q.totalAmount,
      subtotal: q.subtotal,
      taxAmount: q.taxAmount,
      createdAt: q.createdAt,
      notes: q.notes,
      items: q.items.map((i) => ({
        id: i.id,
        productName: i.product?.name ?? "Unknown",
        dimension: i.product?.dimension ?? "COUNT",
        category: i.product?.category ?? null,
        orderUnit: i.orderUnit,
        orderQty: Number(i.orderQty),
        baseQty: Number(i.baseQty),
        pricePerBase: Number(i.pricePerBase),
        lineTotal: i.lineTotal,
      })),
    })),
    topProducts: enrichedTopProducts,
  });
}
