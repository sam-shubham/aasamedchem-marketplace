"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShoppingCartIcon,
  ClockIcon,
  CheckCircleIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  IndianRupeeIcon,
  PackageIcon,
  ArrowRightIcon,
  CheckIcon,
  XCircleIcon,
  SparklesIcon,
  LayoutDashboardIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { smartFormatQty, formatOrderQty } from "@/lib/units";

// ── Types ──────────────────────────────────────────────────────────────────────
type SellerAnalytics = {
  overview: {
    totalSpentPaisa: number;
    totalOrders: number;
    thisMonthSpentPaisa: number;
    thisMonthOrders: number;
    spendGrowthPct: number;
    pendingCount: number;
    approvedCount: number;
  };
  statusBreakdown: { status: string; count: number; totalPaisa: number }[];
  recentOrders: {
    id: string;
    reference: string;
    status: string;
    totalAmount: number;
    subtotal: number;
    taxAmount: number;
    createdAt: string;
    notes: string | null;
    items: {
      id: string;
      productName: string;
      dimension: string;
      category: string | null;
      orderUnit: string;
      orderQty: number;
      baseQty: number;
      pricePerBase: number;
      lineTotal: number;
    }[];
  }[];
  topProducts: {
    productId: string;
    name: string;
    dimension: string;
    category: string | null;
    totalBaseQty: number;
    totalSpentPaisa: number;
    orderCount: number;
  }[];
};

// ── Helpers ────────────────────────────────────────────────────────────────────
function formatInr(paisa: number) {
  return `₹${(paisa / 100).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function formatInrShort(paisa: number) {
  const amount = paisa / 100;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount.toFixed(0)}`;
}

const STATUS_CONFIG: Record<string, {
  label: string; badgeClass: string; iconColor: string; bgColor: string; icon: React.ElementType;
}> = {
  PENDING:   { label: "Pending",   badgeClass: "bg-amber-500/10 text-amber-700 border-amber-500/20",     iconColor: "text-amber-500",   bgColor: "bg-amber-500/10",   icon: ClockIcon },
  APPROVED:  { label: "Approved",  badgeClass: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20", iconColor: "text-emerald-500", bgColor: "bg-emerald-500/10", icon: CheckCircleIcon },
  REJECTED:  { label: "Rejected",  badgeClass: "bg-red-500/10 text-red-600 border-red-500/20",            iconColor: "text-red-500",     bgColor: "bg-red-500/10",     icon: XCircleIcon },
  FULFILLED: { label: "Fulfilled", badgeClass: "bg-blue-500/10 text-blue-700 border-blue-500/20",         iconColor: "text-blue-500",    bgColor: "bg-blue-500/10",    icon: CheckIcon },
};

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

function StatCard({
  title, value, sub, icon: Icon, iconBg, iconColor, trend, trendValue,
}: {
  title: string; value: string; sub?: string;
  icon: React.ElementType; iconBg: string; iconColor: string;
  trend?: "up" | "down" | "neutral"; trendValue?: string;
}) {
  return (
    <Card className="p-5 border-border hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
          <Icon className={`size-[18px] ${iconColor}`} strokeWidth={1.75} />
        </div>
      </div>
      <p className="text-2xl font-bold text-foreground mt-2 font-mono tracking-tight">{value}</p>
      {(sub || trendValue) && (
        <div className="flex items-center gap-1.5 mt-1">
          {trend && trendValue && (
            <span className={`flex items-center gap-0.5 text-xs font-semibold ${
              trend === "up" ? "text-emerald-600" : trend === "down" ? "text-red-500" : "text-muted-foreground"
            }`}>
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

// ── Order Row ──────────────────────────────────────────────────────────────────
function OrderRow({ order }: { order: SellerAnalytics["recentOrders"][0] }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING;
  const StatusIcon = cfg.icon;

  return (
    <div className="border-b border-border last:border-0">
      {/* Row */}
      <button
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors text-left"
      >
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${cfg.bgColor}`}>
          <StatusIcon className={`size-4 ${cfg.iconColor}`} strokeWidth={1.75} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-foreground">#{order.reference}</span>
            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${cfg.badgeClass}`}>
              {cfg.label}
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            {" · "}
            {order.items.length} item{order.items.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-mono text-sm font-bold text-foreground">{formatInr(order.totalAmount)}</p>
        </div>
        <span className={`text-muted-foreground transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="bg-muted/20 border-t border-border px-5 py-4 space-y-3 animate-slide-up">
          {/* Items with smart unit display */}
          <div className="space-y-2">
            {order.items.map((item) => {
              const qty = formatOrderQty(item.orderQty, item.orderUnit, item.dimension as any);
              return (
                <div key={item.id} className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground">{item.productName}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {/* Smart quantity display */}
                      <span className="inline-flex items-center gap-1 bg-primary/8 border border-primary/15 text-primary rounded-md px-2 py-0.5 text-[10px] font-semibold font-mono">
                        {qty}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        @ ₹{item.pricePerBase.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}/{item.dimension === "WEIGHT" ? "g" : item.dimension === "VOLUME" ? "mL" : "unit"}
                      </span>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-foreground shrink-0">{formatInr(item.lineTotal)}</span>
                </div>
              );
            })}
          </div>

          {order.notes && (
            <p className="text-[11px] text-muted-foreground italic border-l-2 border-border pl-3">
              {order.notes}
            </p>
          )}

          {/* Totals strip */}
          <div className="flex items-center gap-4 pt-2 border-t border-border text-[11px]">
            <span className="text-muted-foreground">Subtotal: <b className="text-foreground">{formatInr(order.subtotal)}</b></span>
            <span className="text-muted-foreground">GST 18%: <b className="text-foreground">{formatInr(order.taxAmount)}</b></span>
            <span className="ml-auto text-muted-foreground">Total: <b className="text-foreground text-sm">{formatInr(order.totalAmount)}</b></span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function SellerDashboardPage() {
  const [data, setData] = useState<SellerAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/seller/analytics")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const growth = data?.overview.spendGrowthPct ?? 0;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
              style={{ background: "linear-gradient(135deg, oklch(0.60 0.19 215), oklch(0.48 0.18 200))" }}>
              <LayoutDashboardIcon className="size-4 text-white" strokeWidth={1.5} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">My Dashboard</h1>
          </div>
          <p className="text-sm text-muted-foreground pl-[2.625rem]">
            Your orders, spending &amp; activity at a glance
          </p>
        </div>
        <Button asChild className="rounded-xl gap-1.5 shrink-0 text-sm h-9"
          style={{ background: "linear-gradient(135deg, var(--primary), oklch(0.55 0.22 280))" }}>
          <Link href="/seller/products">
            <ShoppingCartIcon className="size-4" /> Browse &amp; Order
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
            title="Spent This Month"
            value={formatInrShort(data?.overview.thisMonthSpentPaisa ?? 0)}
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
            icon={ShoppingCartIcon}
            iconBg="bg-blue-500/10"
            iconColor="text-blue-600"
          />
          <StatCard
            title="Awaiting Approval"
            value={String(data?.overview.pendingCount ?? 0)}
            sub="pending review"
            icon={ClockIcon}
            iconBg="bg-amber-500/10"
            iconColor="text-amber-500"
          />
          <StatCard
            title="Ready to Fulfill"
            value={String(data?.overview.approvedCount ?? 0)}
            sub="approved orders"
            icon={CheckCircleIcon}
            iconBg="bg-emerald-500/10"
            iconColor="text-emerald-500"
          />
        </div>
      )}

      {/* ── Status Strip ── */}
      {!loading && (data?.statusBreakdown.length ?? 0) > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {["PENDING", "APPROVED", "FULFILLED", "REJECTED"].map((status) => {
            const entry = data?.statusBreakdown.find((s) => s.status === status);
            const cfg = STATUS_CONFIG[status];
            const Icon = cfg.icon;
            return (
              <Card key={status} className={`border-border p-4 flex items-center gap-3`}>
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${cfg.bgColor}`}>
                  <Icon className={`size-4 ${cfg.iconColor}`} strokeWidth={1.75} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{cfg.label}</p>
                  <p className="text-lg font-bold text-foreground font-mono">{entry?.count ?? 0}</p>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ── Bottom row: Recent Orders + Top Products ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Orders */}
        <Card className="lg:col-span-2 border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/20">
            <div className="flex items-center gap-2">
              <ShoppingCartIcon className="size-4 text-muted-foreground" />
              <p className="text-sm font-semibold text-foreground">Recent Orders</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs gap-1 rounded-xl">
              <Link href="/seller/orders">
                All Orders <ArrowRightIcon className="size-3" />
              </Link>
            </Button>
          </div>

          {loading ? (
            <div className="divide-y divide-border">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4">
                  <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-32 rounded" />
                    <Skeleton className="h-3 w-48 rounded" />
                  </div>
                  <Skeleton className="h-4 w-20 rounded shrink-0" />
                </div>
              ))}
            </div>
          ) : (data?.recentOrders.length ?? 0) === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                <ShoppingCartIcon className="size-6 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground">No orders yet</p>
                <p className="text-xs text-muted-foreground mt-1">Place your first quotation to get started</p>
              </div>
              <Button asChild className="rounded-xl gap-2"
                style={{ background: "linear-gradient(135deg, var(--primary), oklch(0.55 0.22 280))" }}>
                <Link href="/seller/products">
                  <SparklesIcon className="size-4" /> Browse Products
                </Link>
              </Button>
            </div>
          ) : (
            <div>
              {data?.recentOrders.map((order) => (
                <OrderRow key={order.id} order={order} />
              ))}
            </div>
          )}
        </Card>

        {/* Top Products ordered */}
        <Card className="p-5 border-border space-y-4">
          <div className="flex items-center gap-2">
            <PackageIcon className="size-4 text-muted-foreground" />
            <p className="text-sm font-semibold text-foreground">My Top Products</p>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="h-6 w-6 rounded-md shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-3 w-3/4 rounded" />
                    <Skeleton className="h-2.5 w-1/2 rounded" />
                  </div>
                  <Skeleton className="h-3 w-14 rounded shrink-0" />
                </div>
              ))}
            </div>
          ) : (data?.topProducts.length ?? 0) === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {data?.topProducts.map((p, i) => (
                <div key={p.productId} className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 mt-0.5 items-center justify-center rounded-md bg-muted text-[10px] font-bold text-muted-foreground">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{p.name}</p>
                    {/* Smart unit display */}
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <span className="inline-flex items-center bg-muted/60 border border-border rounded px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                        {smartFormatQty(p.totalBaseQty, p.dimension as any)}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{p.orderCount}×</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold font-mono text-foreground shrink-0">
                    {formatInrShort(p.totalSpentPaisa)}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2 border-t border-border">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Total Spent</span>
              <span className="font-bold font-mono text-foreground">
                {loading ? "—" : formatInr(data?.overview.totalSpentPaisa ?? 0)}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
