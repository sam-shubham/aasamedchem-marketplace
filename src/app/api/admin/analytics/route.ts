import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  // ── Run all DB queries in parallel ──────────────────────────────────────────
  const [
    allQuotations,
    monthQuotations,
    lastMonthQuotations,
    products,
    topProductItems,
    sellerStats,
    recentQuotations,
  ] = await Promise.all([
    // All-time financials
    prisma.quotation.aggregate({
      _sum: { totalAmount: true },
      _count: { id: true },
    }),

    // This month financials
    prisma.quotation.aggregate({
      where: { createdAt: { gte: startOfMonth } },
      _sum: { totalAmount: true },
      _count: { id: true },
    }),

    // Last month financials (for % change)
    prisma.quotation.aggregate({
      where: { createdAt: { gte: startOfLastMonth, lt: startOfMonth } },
      _sum: { totalAmount: true },
      _count: { id: true },
    }),

    // Product inventory stats
    prisma.product.findMany({
      select: {
        id: true,
        name: true,
        dimension: true,
        stockQuantity: true,
        reorderThreshold: true,
        pricePerBaseUnit: true,
        category: true,
      },
    }),

    // Top products by revenue (from quotation items)
    prisma.quotationItem.groupBy({
      by: ["productId"],
      _sum: { lineTotal: true, baseQty: true },
      orderBy: { _sum: { lineTotal: "desc" } },
      take: 5,
    }),

    // Top sellers by spend
    prisma.quotation.groupBy({
      by: ["requestedById"],
      _sum: { totalAmount: true },
      _count: { id: true },
      orderBy: { _sum: { totalAmount: "desc" } },
      take: 5,
    }),

    // Recent 5 pending quotations for the admin queue
    prisma.quotation.findMany({
      where: { status: "PENDING" },
      include: {
        requestedBy: { select: { name: true, email: true } },
        items: {
          include: { product: { select: { name: true, dimension: true } } },
          take: 3,
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  // ── Status breakdown ─────────────────────────────────────────────────────────
  const statusBreakdown = await prisma.quotation.groupBy({
    by: ["status"],
    _count: { id: true },
    _sum: { totalAmount: true },
  });

  // ── Enrich top products with names ──────────────────────────────────────────
  const productMap = new Map(products.map((p) => [p.id, p]));
  const topProducts = await Promise.all(
    topProductItems.map(async (item) => {
      const product = productMap.get(item.productId);
      return {
        productId: item.productId,
        name: product?.name ?? "Unknown",
        dimension: product?.dimension ?? "COUNT",
        category: product?.category ?? null,
        revenueInPaisa: item._sum.lineTotal ?? 0,
        totalBaseQty: Number(item._sum.baseQty ?? 0),
      };
    })
  );

  // ── Enrich top sellers with user names ──────────────────────────────────────
  const topSellers = await Promise.all(
    sellerStats.map(async (s) => {
      const user = await prisma.user.findUnique({
        where: { id: s.requestedById },
        select: { name: true, email: true },
      });
      return {
        userId: s.requestedById,
        name: user?.name ?? "Unknown",
        email: user?.email ?? "",
        totalSpentPaisa: s._sum.totalAmount ?? 0,
        orderCount: s._count.id,
      };
    })
  );

  // ── Stock health ─────────────────────────────────────────────────────────────
  const lowStockProducts = products.filter(
    (p) =>
      p.reorderThreshold !== null &&
      Number(p.stockQuantity) <= Number(p.reorderThreshold)
  );
  const outOfStockProducts = products.filter((p) => Number(p.stockQuantity) <= 0);

  // ── Revenue trend: last 7 days ───────────────────────────────────────────────
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const recentAll = await prisma.quotation.findMany({
    where: { createdAt: { gte: sevenDaysAgo } },
    select: { createdAt: true, totalAmount: true, status: true },
  });

  // Group by date
  const trendMap: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    trendMap[key] = 0;
  }
  for (const q of recentAll) {
    const key = q.createdAt.toISOString().slice(0, 10);
    if (key in trendMap) trendMap[key] += q.totalAmount;
  }
  const revenueTrend = Object.entries(trendMap).map(([date, paisa]) => ({
    date,
    label: new Date(date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric" }),
    paisa,
    inr: paisa / 100,
  }));

  // ── Month-over-month deltas ──────────────────────────────────────────────────
  const thisMonthRevenue = monthQuotations._sum.totalAmount ?? 0;
  const lastMonthRevenue = lastMonthQuotations._sum.totalAmount ?? 0;
  const revenueGrowth =
    lastMonthRevenue > 0
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : thisMonthRevenue > 0
      ? 100
      : 0;

  return NextResponse.json({
    overview: {
      totalRevenuePaisa: allQuotations._sum.totalAmount ?? 0,
      totalOrders: allQuotations._count.id,
      thisMonthRevenuePaisa: thisMonthRevenue,
      thisMonthOrders: monthQuotations._count.id,
      revenueGrowthPct: Math.round(revenueGrowth * 10) / 10,
    },
    statusBreakdown: statusBreakdown.map((s) => ({
      status: s.status,
      count: s._count.id,
      totalPaisa: s._sum.totalAmount ?? 0,
    })),
    topProducts,
    topSellers,
    stockHealth: {
      totalProducts: products.length,
      lowStockCount: lowStockProducts.length,
      outOfStockCount: outOfStockProducts.length,
      lowStockProducts: lowStockProducts.slice(0, 5).map((p) => ({
        id: p.id,
        name: p.name,
        dimension: p.dimension,
        stockQuantity: Number(p.stockQuantity),
        reorderThreshold: Number(p.reorderThreshold),
        category: p.category,
      })),
    },
    revenueTrend,
    pendingQuotations: recentQuotations.map((q) => ({
      id: q.id,
      reference: q.reference?.slice(0, 8).toUpperCase(),
      sellerName: q.requestedBy?.name ?? "Unknown",
      sellerEmail: q.requestedBy?.email ?? "",
      totalAmount: q.totalAmount,
      itemCount: q.items.length,
      createdAt: q.createdAt,
      previewItems: q.items.map((i) => ({
        productName: i.product?.name ?? "Unknown",
        dimension: i.product?.dimension ?? "COUNT",
      })),
    })),
  });
}
