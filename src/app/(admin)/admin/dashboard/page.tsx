"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  TrendingUpIcon,
  TrendingDownIcon,
  PackageIcon,
  FileTextIcon,
  AlertTriangleIcon,
  UsersIcon,
  IndianRupeeIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  CheckIcon,
  ArrowRightIcon,
  BarChart3Icon,
  BoxIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { smartFormatQty } from "@/lib/units";

// ── Types ──────────────────────────────────────────────────────────────────────
type Analytics = {
  overview: {
    totalRevenuePaisa: number;
    totalOrders: number;
    thisMonthRevenuePaisa: number;
    thisMonthOrders: number;
    revenueGrowthPct: number;
  };
  statusBreakdown: { status: string; count: number; totalPaisa: number }[];
  topProducts: {
    productId: string;
    name: string;
    dimension: string;
    category: string | null;
    revenueInPaisa: number;
    totalBaseQty: number;
  }[];
  topSellers: {
    userId: string;
    name: string;
    email: string;
    totalSpentPaisa: number;
    orderCount: number;
  }[];
  stockHealth: {
    totalProducts: number;
    lowStockCount: number;
    outOfStockCount: number;
    lowStockProducts: {
      id: string;
      name: string;
      dimension: string;
      stockQuantity: number;
      reorderThreshold: number;
      category: string | null;
    }[];
  };
  revenueTrend: { date: string; label: string; paisa: number; inr: number }[];
  pendingQuotations: {
    id: string;
    reference: string;
    sellerName: string;
    sellerEmail: string;
    totalAmount: number;
    itemCount: number;
    createdAt: string;
    previewItems: { productName: string; dimension: string }[];
  }[];
};

// ── Helpers ────────────────────────────────────────────────────────────────────
function formatInr(paisa: number) {
  const amount = paisa / 100;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}
function formatInrFull(paisa: number) {
  return `₹${(paisa / 100).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  PENDING:   { label: "Pending",   color: "text-amber-600",   bg: "bg-amber-500/10",   icon: ClockIcon },
  APPROVED:  { label: "Approved",  color: "text-emerald-600", bg: "bg-emerald-500/10", icon: CheckCircleIcon },
  REJECTED:  { label: "Rejected",  color: "text-red-600",     bg: "bg-red-500/10",     icon: XCircleIcon },
  FULFILLED: { label: "Fulfilled", color: "text-blue-600",    bg: "bg-blue-500/10",    icon: CheckIcon },
};

// ── Skeleton loaders ───────────────────────────────────────────────────────────
function StatCardSkeleton() {
  return (
    <Card className="p-5 border-border space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28 rounded" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-32 rounded" />
      <Skeleton className="h-3 w-24 rounded" />
    </Card>
  );
}

// ── Stat Card ──────────────────────────────────────────────────────────────────
function StatCard({
  title, value, sub, icon: Icon, iconBg, iconColor, trend, trendValue,
}: {
  title: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}) {
  return (
    <Card className="p-5 border-border hover:shadow-md transition-all duration-200 group">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
          <Icon className={`size-4.5 ${iconColor}`} strokeWidth={1.75} />
        </div>
      </div>
      <p className="text-2xl font-bold text-foreground mt-2 font-mono tracking-tight">{value}</p>
      {(sub || trendValue) && (
        <div className="flex items-center gap-1.5 mt-1">
          {trend && trendValue && (
            <span className={`flex items-center gap-0.5 text-xs font-semibold ${trend === "up" ? "text-emerald-600" : trend === "down" ? "text-red-500" : "text-muted-foreground"}`}>
              {trend === "up" ? <TrendingUpIcon className="size-3" /> : trend === "down" ? <TrendingDownIcon className="size-3" /> : null}
              {trendValue}
            </span>
          )}
          {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
        </div>
      )}
    </Card>
  );
}

// ── Mini bar chart (pure CSS) ──────────────────────────────────────────────────
function RevenueTrend({ data }: { data: Analytics["revenueTrend"] }) {
  const max = Math.max(...data.map((d) => d.paisa), 1);
  return (
    <div className="flex items-end gap-1.5 h-16">
      {data.map((d) => {
        const pct = (d.paisa / max) * 100;
        return (
          <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group/bar">
            <div className="relative w-full flex items-end" style={{ height: 48 }}>
              <div
                className="w-full rounded-t-md transition-all duration-500 cursor-default"
                style={{
                  height: `${Math.max(pct, 4)}%`,
                  background: d.paisa > 0
                    ? "linear-gradient(180deg, var(--primary), oklch(0.52 0.22 278 / 60%))"
                    : "var(--muted)",
                }}
                title={`${d.label}: ${formatInrFull(d.paisa)}`}
              />
              {/* Tooltip */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover border border-border rounded-lg px-2 py-1 text-[10px] font-mono text-foreground shadow-md whitespace-nowrap opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none z-10">
                {formatInrFull(d.paisa)}
              </div>
            </div>
            <span className="text-[9px] text-muted-foreground/60 truncate w-full text-center">{d.label.split(" ")[0]}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Donut chart (pure CSS / SVG) ──────────────────────────────────────────────
function StatusDonut({ data }: { data: Analytics["statusBreakdown"] }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  const COLORS: Record<string, string> = {
    PENDING: "#f59e0b",
    APPROVED: "#10b981",
    REJECTED: "#ef4444",
    FULFILLED: "#3b82f6",
  };
  const ORDER = ["PENDING", "APPROVED", "FULFILLED", "REJECTED"];
  const sorted = ORDER.map((s) => data.find((d) => d.status === s)).filter(Boolean) as typeof data;

  let cumulative = 0;
  const segments = sorted.map((d) => {
    const pct = total > 0 ? d.count / total : 0;
    const startAngle = cumulative * 360;
    const endAngle = (cumulative + pct) * 360;
    cumulative += pct;
    return { ...d, pct, startAngle, endAngle, color: COLORS[d.status] ?? "#888" };
  });

  const polarToCartesian = (cx: number, cy: number, r: number, angle: number) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  const describeArc = (cx: number, cy: number, r: number, startAngle: number, endAngle: number) => {
    if (endAngle - startAngle >= 360) endAngle = 359.99;
    const s = polarToCartesian(cx, cy, r, startAngle);
    const e = polarToCartesian(cx, cy, r, endAngle);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y}`;
  };

  return (
    <div className="flex items-center gap-6">
      <div className="relative shrink-0">
        <svg width={80} height={80} viewBox="0 0 80 80">
          {total === 0 ? (
            <circle cx={40} cy={40} r={30} fill="none" stroke="var(--muted)" strokeWidth={12} />
          ) : (
            segments.map((seg, i) => (
              <path
                key={i}
                d={describeArc(40, 40, 30, seg.startAngle, seg.endAngle)}
                fill="none"
                stroke={seg.color}
                strokeWidth={12}
                strokeLinecap="butt"
              />
            ))
          )}
          <text x={40} y={40} textAnchor="middle" dominantBaseline="middle" fontSize={14} fontWeight="700" fill="currentColor" className="fill-foreground">
            {total}
          </text>
          <text x={40} y={54} textAnchor="middle" dominantBaseline="middle" fontSize={7} fill="currentColor" className="fill-muted-foreground">
            total
          </text>
        </svg>
      </div>
      <div className="space-y-1.5 flex-1 min-w-0">
        {sorted.map((d) => {
          const cfg = STATUS_CONFIG[d.status];
          const Icon = cfg?.icon ?? ClockIcon;
          return (
            <div key={d.status} className="flex items-center gap-2">
              <span className="size-2 rounded-full shrink-0" style={{ background: COLORS[d.status] }} />
              <span className="text-xs text-muted-foreground flex-1 truncate">{cfg?.label}</span>
              <span className="text-xs font-bold text-foreground font-mono">{d.count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const growth = data?.overview.revenueGrowthPct ?? 0;

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
              style={{ background: "linear-gradient(135deg, var(--primary), oklch(0.55 0.22 280))" }}>
              <BarChart3Icon className="size-4 text-white" strokeWidth={1.5} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
          </div>
          <p className="text-sm text-muted-foreground pl-[2.625rem]">
            Business overview &amp; analytics
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-xl gap-1.5 shrink-0">
          <Link href="/admin/quotations">
            View All Orders <ArrowRightIcon className="size-3.5" />
          </Link>
        </Button>
      </div>

      {/* ── Stat Cards ── */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Revenue This Month"
            value={formatInr(data?.overview.thisMonthRevenuePaisa ?? 0)}
            sub="vs last month"
            icon={IndianRupeeIcon}
            iconBg="bg-primary/10"
            iconColor="text-primary"
            trend={growth > 0 ? "up" : growth < 0 ? "down" : "neutral"}
            trendValue={`${Math.abs(growth)}%`}
          />
          <StatCard
            title="Total Orders"
            value={String(data?.overview.totalOrders ?? 0)}
            sub={`${data?.overview.thisMonthOrders ?? 0} this month`}
            icon={FileTextIcon}
            iconBg="bg-blue-500/10"
            iconColor="text-blue-600"
          />
          <StatCard
            title="Pending Review"
            value={String(data?.statusBreakdown.find((s) => s.status === "PENDING")?.count ?? 0)}
            sub="awaiting action"
            icon={ClockIcon}
            iconBg="bg-amber-500/10"
            iconColor="text-amber-600"
            trend={
              (data?.statusBreakdown.find((s) => s.status === "PENDING")?.count ?? 0) > 0
                ? "down" : "neutral"
            }
          />
          <StatCard
            title="Low Stock Products"
            value={String(data?.stockHealth.lowStockCount ?? 0)}
            sub={`${data?.stockHealth.outOfStockCount ?? 0} out of stock`}
            icon={AlertTriangleIcon}
            iconBg="bg-red-500/10"
            iconColor="text-red-500"
            trend={(data?.stockHealth.lowStockCount ?? 0) > 0 ? "down" : "neutral"}
          />
        </div>
      )}

      {/* ── Revenue Trend + Donut ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Trend */}
        <Card className="lg:col-span-2 p-5 border-border space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Revenue Trend</p>
              <p className="text-xs text-muted-foreground mt-0.5">Last 7 days · hover bars for details</p>
            </div>
            <span className="font-mono text-sm font-bold text-foreground">
              {formatInrFull(data?.overview.totalRevenuePaisa ?? 0)}
            </span>
          </div>
          {loading ? (
            <div className="flex items-end gap-1.5 h-16">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="flex-1 rounded" style={{ height: `${30 + Math.random() * 50}%` }} />
              ))}
            </div>
          ) : (
            <RevenueTrend data={data?.revenueTrend ?? []} />
          )}
        </Card>

        {/* Order Status Donut */}
        <Card className="p-5 border-border space-y-4">
          <div>
            <p className="text-sm font-semibold text-foreground">Order Status</p>
            <p className="text-xs text-muted-foreground mt-0.5">All-time breakdown</p>
          </div>
          {loading ? (
            <div className="flex items-center gap-6">
              <Skeleton className="h-20 w-20 rounded-full shrink-0" />
              <div className="space-y-2 flex-1">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-3 w-full rounded" />)}
              </div>
            </div>
          ) : (
            <StatusDonut data={data?.statusBreakdown ?? []} />
          )}
        </Card>
      </div>

      {/* ── Bottom row: Top Products + Top Sellers + Stock Alert ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top Products */}
        <Card className="p-5 border-border space-y-4">
          <div className="flex items-center gap-2">
            <PackageIcon className="size-4 text-muted-foreground" />
            <p className="text-sm font-semibold text-foreground">Top Products</p>
            <span className="text-xs text-muted-foreground ml-auto">by revenue</span>
          </div>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="size-6 rounded-md shrink-0" />
                  <Skeleton className="h-3 flex-1 rounded" />
                  <Skeleton className="h-3 w-16 rounded" />
                </div>
              ))}
            </div>
          ) : data?.topProducts.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">No orders yet</p>
          ) : (
            <div className="space-y-2.5">
              {data?.topProducts.map((p, i) => (
                <div key={p.productId} className="flex items-center gap-3 group">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted text-[10px] font-bold text-muted-foreground">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{p.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {smartFormatQty(p.totalBaseQty, p.dimension as any)} ordered
                    </p>
                  </div>
                  <span className="text-xs font-bold font-mono text-foreground shrink-0">
                    {formatInr(p.revenueInPaisa)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Top Sellers */}
        <Card className="p-5 border-border space-y-4">
          <div className="flex items-center gap-2">
            <UsersIcon className="size-4 text-muted-foreground" />
            <p className="text-sm font-semibold text-foreground">Top Sellers</p>
            <span className="text-xs text-muted-foreground ml-auto">by spend</span>
          </div>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="size-7 rounded-full shrink-0" />
                  <Skeleton className="h-3 flex-1 rounded" />
                  <Skeleton className="h-3 w-14 rounded" />
                </div>
              ))}
            </div>
          ) : data?.topSellers.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">No sellers yet</p>
          ) : (
            <div className="space-y-2.5">
              {data?.topSellers.map((s, i) => {
                const initials = s.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
                return (
                  <div key={s.userId} className="flex items-center gap-3">
                    <div
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white text-[10px] font-bold"
                      style={{ background: "linear-gradient(135deg, var(--primary), oklch(0.55 0.22 280))" }}
                    >
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{s.name}</p>
                      <p className="text-[10px] text-muted-foreground">{s.orderCount} order{s.orderCount !== 1 ? "s" : ""}</p>
                    </div>
                    <span className="text-xs font-bold font-mono text-foreground shrink-0">
                      {formatInr(s.totalSpentPaisa)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Low Stock Alert */}
        <Card className="p-5 border-border space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangleIcon className="size-4 text-amber-500" />
            <p className="text-sm font-semibold text-foreground">Low Stock</p>
            <Badge variant="outline" className="ml-auto text-[10px] bg-amber-500/10 text-amber-700 border-amber-500/20">
              {data?.stockHealth.lowStockCount ?? "—"} items
            </Badge>
          </div>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <Skeleton className="h-3 w-3/4 rounded" />
                  <Skeleton className="h-1.5 w-full rounded-full" />
                </div>
              ))}
            </div>
          ) : (data?.stockHealth.lowStockProducts.length ?? 0) === 0 ? (
            <div className="flex flex-col items-center py-4 gap-2">
              <CheckCircleIcon className="size-8 text-emerald-500" />
              <p className="text-xs text-muted-foreground">All stock levels healthy</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data?.stockHealth.lowStockProducts.map((p) => {
                const pct = p.reorderThreshold > 0
                  ? Math.min((p.stockQuantity / p.reorderThreshold) * 100, 100)
                  : 0;
                return (
                  <div key={p.id} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-foreground truncate flex-1 mr-2">{p.name}</p>
                      <span className="text-[10px] font-mono text-red-500 shrink-0">
                        {smartFormatQty(p.stockQuantity, p.dimension as any)}
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          background: pct < 25 ? "#ef4444" : pct < 60 ? "#f59e0b" : "#10b981",
                        }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground/60">
                      Reorder at: {smartFormatQty(p.reorderThreshold, p.dimension as any)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
          <Button asChild variant="outline" size="sm" className="w-full rounded-xl text-xs gap-1.5">
            <Link href="/admin/products">
              <BoxIcon className="size-3" /> Manage Inventory
            </Link>
          </Button>
        </Card>
      </div>

      {/* ── Pending Quotations Queue ── */}
      {(loading || (data?.pendingQuotations?.length ?? 0) > 0) && (
        <Card className="border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/20">
            <div className="flex items-center gap-2">
              <ClockIcon className="size-4 text-amber-500" />
              <p className="text-sm font-semibold text-foreground">Pending Quotations</p>
              <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-700 border-amber-500/20">
                Needs Action
              </Badge>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs gap-1 rounded-xl">
              <Link href="/admin/quotations?status=PENDING">
                View All <ArrowRightIcon className="size-3" />
              </Link>
            </Button>
          </div>

          <div className="divide-y divide-border">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-4">
                    <Skeleton className="h-4 w-20 rounded" />
                    <Skeleton className="h-3 flex-1 rounded" />
                    <Skeleton className="h-3 w-24 rounded" />
                    <Skeleton className="h-7 w-20 rounded-lg" />
                  </div>
                ))
              : data?.pendingQuotations.map((q) => (
                  <div key={q.id} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-foreground">#{q.reference}</span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">{q.sellerName}</span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(q.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                        {q.previewItems.map((i) => i.productName).join(", ")}
                        {q.itemCount > 3 && ` +${q.itemCount - 3} more`}
                      </p>
                    </div>
                    <span className="font-mono text-sm font-bold text-foreground shrink-0">
                      {formatInrFull(q.totalAmount)}
                    </span>
                    <Button asChild size="sm" className="rounded-xl gap-1.5 shrink-0 text-xs"
                      style={{ background: "linear-gradient(135deg, var(--primary), oklch(0.55 0.22 280))" }}>
                      <Link href="/admin/quotations">
                        <CheckIcon className="size-3" /> Review
                      </Link>
                    </Button>
                  </div>
                ))}
          </div>
        </Card>
      )}
    </div>
  );
}
