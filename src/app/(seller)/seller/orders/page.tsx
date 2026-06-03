"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  CheckIcon,
  ChevronDownIcon,
  ClockIcon,
  FileTextIcon,
  IndianRupeeIcon,
  PackageIcon,
  ShoppingCartIcon,
  SparklesIcon,
  XCircleIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatOrderQty,
  smartFormatQty,
  type UnitDimension,
} from "@/lib/units";
import { toast } from "sonner";

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    badgeClass: string;
    iconColor: string;
    bgColor: string;
    icon: React.ElementType;
  }
> = {
  PENDING: {
    label: "Pending",
    badgeClass: "bg-amber-500/10 text-amber-700 border-amber-500/20",
    iconColor: "text-amber-500",
    bgColor: "bg-amber-500/10",
    icon: ClockIcon,
  },
  APPROVED: {
    label: "Approved",
    badgeClass: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
    iconColor: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    icon: CheckCircleIcon,
  },
  REJECTED: {
    label: "Rejected",
    badgeClass: "bg-red-500/10 text-red-600 border-red-500/20",
    iconColor: "text-red-500",
    bgColor: "bg-red-500/10",
    icon: XCircleIcon,
  },
  FULFILLED: {
    label: "Fulfilled",
    badgeClass: "bg-blue-500/10 text-blue-700 border-blue-500/20",
    iconColor: "text-blue-500",
    bgColor: "bg-blue-500/10",
    icon: CheckIcon,
  },
};

function formatInr(paisa: number): string {
  return `₹${(paisa / 100).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatInrShort(paisa: number): string {
  const amount = paisa / 100;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount.toFixed(0)}`;
}

type QuotationItem = {
  id: string;
  product: { name: string; dimension?: string };
  orderUnit: string;
  orderQty: string;
  baseQty: string;
  pricePerBase: string;
  lineTotal: number;
};

type Quotation = {
  id: string;
  reference?: string;
  status: string;
  totalAmount: number;
  subtotal: number;
  taxAmount: number;
  createdAt: string;
  notes?: string;
  items: QuotationItem[];
};

function StatCardSkeleton() {
  return (
    <Card className="p-5 border-border space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24 rounded" />
        <Skeleton className="h-9 w-9 rounded-xl" />
      </div>
      <Skeleton className="h-8 w-20 rounded" />
      <Skeleton className="h-3 w-28 rounded" />
    </Card>
  );
}

function StatCard({
  title,
  value,
  sub,
  icon: Icon,
  iconBg,
  iconColor,
}: {
  title: string;
  value: string;
  sub: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <Card className="p-5 border-border hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconBg}`}
        >
          <Icon className={`size-[18px] ${iconColor}`} strokeWidth={1.75} />
        </div>
      </div>
      <p className="text-2xl font-bold text-foreground mt-2 font-mono tracking-tight">
        {value}
      </p>
      <p className="text-xs text-muted-foreground mt-1">{sub}</p>
    </Card>
  );
}

function OrderRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-5 py-4 border-b border-border last:border-0">
      <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-40 rounded" />
        <Skeleton className="h-3 w-56 rounded" />
      </div>
      <Skeleton className="h-5 w-24 rounded shrink-0" />
    </div>
  );
}

function EmptyOrders() {
  return (
    <Card className="border-border flex flex-col items-center justify-center py-20 gap-5">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
        <ShoppingCartIcon className="size-7 text-muted-foreground" />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-foreground">No orders yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          Place your first quotation to start tracking order status here
        </p>
      </div>
      <Button
        asChild
        className="rounded-xl gap-2"
        style={{
          background:
            "linear-gradient(135deg, var(--primary), oklch(0.55 0.22 280))",
        }}
      >
        <Link href="/seller/products">
          <SparklesIcon className="size-4" />
          Browse Products
        </Link>
      </Button>
    </Card>
  );
}

function OrderRow({
  order,
  expanded,
  onToggle,
}: {
  order: Quotation;
  expanded: boolean;
  onToggle: () => void;
}) {
  const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING;
  const StatusIcon = cfg.icon;
  const ref =
    order.reference?.slice(0, 8).toUpperCase() ??
    order.id.slice(0, 8).toUpperCase();

  return (
    <div className="border-b border-border last:border-0">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors text-left"
      >
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${cfg.bgColor}`}
        >
          <StatusIcon className={`size-4 ${cfg.iconColor}`} strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-bold text-foreground">
              #{ref}
            </span>
            <Badge
              variant="outline"
              className={`text-[10px] px-1.5 py-0 ${cfg.badgeClass}`}
            >
              {cfg.label}
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
            {" · "}
            {order.items?.length ?? 0} item{order.items?.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-mono text-sm font-bold text-foreground">
            {formatInr(order.totalAmount)}
          </p>
          <p className="hidden sm:block text-[10px] text-muted-foreground">
            GST incl.
          </p>
        </div>
        <ChevronDownIcon
          className={`size-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {expanded && (
        <div className="bg-muted/20 border-t border-border px-5 py-4 space-y-4 animate-slide-up">
          <div className="space-y-3">
            {order.items?.map((item) => {
              const dim =
                ((item.product as any)?.dimension as UnitDimension) ?? "COUNT";
              const qty = formatOrderQty(item.orderQty, item.orderUnit, dim);
              const rateUnit =
                dim === "WEIGHT" ? "g" : dim === "VOLUME" ? "mL" : "unit";

              return (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background border border-border">
                      <PackageIcon className="size-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {item.product?.name ?? "Untitled product"}
                      </p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="inline-flex items-center bg-primary/8 border border-primary/15 text-primary rounded-md px-2 py-0.5 text-[10px] font-semibold font-mono">
                          {qty}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {smartFormatQty(parseFloat(item.baseQty), dim)} base
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          @ ₹
                          {parseFloat(item.pricePerBase).toLocaleString(
                            "en-IN",
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 4,
                            },
                          )}
                          /{rateUnit}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-foreground shrink-0">
                    {formatInr(item.lineTotal)}
                  </span>
                </div>
              );
            })}
          </div>

          {order.notes && (
            <p className="text-[11px] text-muted-foreground italic border-l-2 border-border pl-3">
              {order.notes}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-3 border-t border-border text-[11px]">
            <span className="text-muted-foreground">
              Subtotal: <b className="text-foreground">{formatInr(order.subtotal)}</b>
            </span>
            <span className="text-muted-foreground">
              GST 18%: <b className="text-foreground">{formatInr(order.taxAmount)}</b>
            </span>
            <span className="sm:ml-auto text-muted-foreground">
              Total:{" "}
              <b className="text-foreground text-sm">
                {formatInr(order.totalAmount)}
              </b>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/quotations");
      if (!res.ok) throw new Error("Unable to load orders");
      const data = await res.json();
      setOrders(data);
    } catch {
      toast.error("Could not load orders");
    } finally {
      setLoading(false);
    }
  }

  const summary = useMemo(() => {
    return orders.reduce(
      (acc, order) => {
        acc.totalAmount += order.totalAmount;
        acc.pending += order.status === "PENDING" ? 1 : 0;
        acc.approved += order.status === "APPROVED" ? 1 : 0;
        acc.fulfilled += order.status === "FULFILLED" ? 1 : 0;
        return acc;
      },
      { totalAmount: 0, pending: 0, approved: 0, fulfilled: 0 },
    );
  }, [orders]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.60 0.19 215), oklch(0.48 0.18 200))",
              }}
            >
              <FileTextIcon className="size-4 text-white" strokeWidth={1.5} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              My Orders
            </h1>
          </div>
          <p className="text-sm text-muted-foreground pl-[2.625rem]">
            Track quotation status, totals, and item-level order details
          </p>
        </div>
        <Button
          asChild
          className="rounded-xl gap-1.5 shrink-0 text-sm h-9"
          style={{
            background:
              "linear-gradient(135deg, var(--primary), oklch(0.55 0.22 280))",
          }}
        >
          <Link href="/seller/products">
            Browse &amp; Order
            <ArrowRightIcon className="size-4" />
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Orders"
            value={String(orders.length)}
            sub={`${summary.fulfilled} fulfilled`}
            icon={ShoppingCartIcon}
            iconBg="bg-blue-500/10"
            iconColor="text-blue-600"
          />
          <StatCard
            title="Total Spend"
            value={formatInrShort(summary.totalAmount)}
            sub={formatInr(summary.totalAmount)}
            icon={IndianRupeeIcon}
            iconBg="bg-primary/10"
            iconColor="text-primary"
          />
          <StatCard
            title="Pending"
            value={String(summary.pending)}
            sub="awaiting approval"
            icon={ClockIcon}
            iconBg="bg-amber-500/10"
            iconColor="text-amber-500"
          />
          <StatCard
            title="Approved"
            value={String(summary.approved)}
            sub="ready to fulfill"
            icon={CheckCircleIcon}
            iconBg="bg-emerald-500/10"
            iconColor="text-emerald-500"
          />
        </div>
      )}

      {loading ? (
        <Card className="border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/20">
            <div className="flex items-center gap-2">
              <ShoppingCartIcon className="size-4 text-muted-foreground" />
              <p className="text-sm font-semibold text-foreground">Orders</p>
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <div>
            {Array.from({ length: 5 }).map((_, i) => (
              <OrderRowSkeleton key={i} />
            ))}
          </div>
        </Card>
      ) : orders.length === 0 ? (
        <EmptyOrders />
      ) : (
        <Card className="border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/20">
            <div className="flex items-center gap-2">
              <ShoppingCartIcon className="size-4 text-muted-foreground" />
              <p className="text-sm font-semibold text-foreground">Orders</p>
            </div>
            <Badge
              variant="outline"
              className="text-[10px] bg-muted/50 text-muted-foreground border-border"
            >
              {orders.length} total
            </Badge>
          </div>
          <div>
            {orders.map((order) => (
              <OrderRow
                key={order.id}
                order={order}
                expanded={expanded === order.id}
                onToggle={() =>
                  setExpanded((prev) => (prev === order.id ? null : order.id))
                }
              />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
