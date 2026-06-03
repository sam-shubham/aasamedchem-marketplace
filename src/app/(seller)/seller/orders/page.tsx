"use client";
import { useEffect, useState } from "react";
import { ShoppingCartIcon, CheckIcon, ClockIcon, XIcon, FileTextIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
 Table,
 TableBody,
 TableCell,
 TableHead,
 TableHeader,
 TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
 PENDING: { label: "Pending", className: "bg-amber-500/10 text-amber-700 border-amber-500/20" },
 APPROVED: { label: "Approved", className: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" },
 REJECTED: { label: "Rejected", className: "bg-destructive/10 text-destructive border-destructive/20" },
 FULFILLED: { label: "Fulfilled", className: "bg-blue-500/10 text-blue-700 border-blue-500/20" },
};

function formatInr(paisa: number): string {
 return `₹${(paisa / 100).toLocaleString("en-IN", {
 minimumFractionDigits: 2,
 maximumFractionDigits: 2,
 })}`;
}

function StatusIcon({ status }: { status: string }) {
 switch (status) {
 case "FULFILLED": return <CheckIcon className="size-3" />;
 case "REJECTED": return <XIcon className="size-3" />;
 case "PENDING": return <ClockIcon className="size-3" />;
 default: return null;
 }
}

type QuotationItem = {
 id: string;
 product: { name: string };
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

function OrderRowSkeleton() {
 return (
 <TableRow>
 <TableCell><Skeleton className="h-4 w-20 rounded" /></TableCell>
 <TableCell><Skeleton className="h-4 w-24 rounded" /></TableCell>
 <TableCell><Skeleton className="h-4 w-16 rounded-full" /></TableCell>
 <TableCell><Skeleton className="h-4 w-20 rounded" /></TableCell>
 </TableRow>
 );
}

export default function SellerOrdersPage() {
 const [orders, setOrders] = useState<Quotation[]>([]);
 const [loading, setLoading] = useState(true);
 const [expanded, setExpanded] = useState<string | null>(null);

 useEffect(() => { load(); }, []);

 async function load() {
 setLoading(true);
 const res = await fetch("/api/quotations");
 const data = await res.json();
 setOrders(data);
 setLoading(false);
 }

 function toggleExpand(id: string) {
 setExpanded((prev) => (prev === id ? null : id));
 }

 return (
 <div className="p-6 space-y-6">
 {/* Header */}
 <div>
 <h1 className="text-2xl font-bold tracking-tight text-foreground">My Orders</h1>
 <p className="text-sm text-muted-foreground mt-0.5">
 Track the status of your quotations and orders
 </p>
 </div>

 {/* Table */}
 {loading ? (
 <Card className="border-border overflow-hidden">
 <Table>
 <TableHeader>
 <TableRow className="hover:bg-transparent border-b">
 <TableHead className="w-28">Order #</TableHead>
 <TableHead>Date</TableHead>
 <TableHead>Status</TableHead>
 <TableHead className="text-right">Total</TableHead>
 <TableHead className="w-20" />
 </TableRow>
 </TableHeader>
 <TableBody>
 {Array.from({ length: 5 }).map((_, i) => <OrderRowSkeleton key={i} />)}
 </TableBody>
 </Table>
 </Card>
 ) : orders.length === 0 ? (
 <Card className="border-border flex flex-col items-center justify-center py-16 gap-4">
 <div className="flex size-14 items-center justify-center rounded-full bg-muted">
 <ShoppingCartIcon className="size-6 text-muted-foreground" />
 </div>
 <div className="text-center">
 <p className="text-sm font-medium text-foreground">No orders yet</p>
 <p className="text-xs text-muted-foreground mt-0.5">
 You haven't submitted any quotations or orders
 </p>
 </div>
 </Card>
 ) : (
 <Card className="border-border overflow-hidden">
 <Table>
 <TableHeader>
 <TableRow className="hover:bg-transparent border-b">
 <TableHead className="w-28">Order #</TableHead>
 <TableHead>Date</TableHead>
 <TableHead>Status</TableHead>
 <TableHead className="text-right">Total</TableHead>
 <TableHead className="w-20" />
 </TableRow>
 </TableHeader>
 <TableBody>
 {orders.map((order) => {
 const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING;
 const ref = order.reference?.slice(0, 8).toUpperCase() ?? order.id.slice(0, 8).toUpperCase();
 const isExpanded = expanded === order.id;

 return (
 <>
 <TableRow
 key={order.id}
 className={`cursor-pointer border-b last:border-0 hover:bg-muted/30 transition-colors ${isExpanded ? "bg-muted/30" : ""}`}
 onClick={() => toggleExpand(order.id)}
 >
 <TableCell className="font-mono text-xs font-semibold text-foreground">#{ref}</TableCell>
 <TableCell className="text-sm text-muted-foreground">
 {new Date(order.createdAt).toLocaleDateString("en-IN", {
 day: "numeric",
 month: "short",
 year: "numeric",
 })}
 </TableCell>
 <TableCell>
 <Badge variant="outline" className={cfg.className}>
 <StatusIcon status={order.status} />
 {cfg.label}
 </Badge>
 </TableCell>
 <TableCell className="text-right font-semibold text-foreground">
 {formatInr(order.totalAmount)}
 </TableCell>
 <TableCell>
 <div className="flex items-center justify-end gap-2">
 <span className={`text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`}>
 <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="size-4">
 <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
 </svg>
 </span>
 </div>
 </TableCell>
 </TableRow>

 {/* Expanded Detail */}
 {isExpanded && (
 <TableRow className="hover:bg-transparent">
 <TableCell colSpan={5} className="p-0">
 <div className="bg-muted/20 border-t">
 {/* Items */}
 <div className="overflow-x-auto px-5 py-3">
 <table className="w-full text-sm">
 <thead>
 <tr className="text-xs text-muted-foreground">
 <th className="text-left font-medium pb-2">Product</th>
 <th className="text-left font-medium pb-2">Unit</th>
 <th className="text-right font-medium pb-2">Qty</th>
 <th className="text-right font-medium pb-2">Rate</th>
 <th className="text-right font-medium pb-2">Line Total</th>
 </tr>
 </thead>
 <tbody className="divide-y">
 {order.items?.map((item) => (
 <tr key={item.id} className="py-2">
 <td className="py-2 font-medium text-foreground">{item.product?.name ?? "—"}</td>
 <td className="py-2 text-muted-foreground">{item.orderUnit}</td>
 <td className="py-2 text-right font-mono text-sm">{parseFloat(item.orderQty).toFixed(4)}</td>
 <td className="py-2 text-right font-mono text-sm">₹{parseFloat(item.pricePerBase).toFixed(4)}</td>
 <td className="py-2 text-right font-semibold text-foreground">{formatInr(item.lineTotal)}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>

 {order.notes && (
 <div className="px-5 pb-3 text-xs text-muted-foreground italic">
 <span className="font-medium not-italic text-foreground">Note:</span> {order.notes}
 </div>
 )}

 {/* Totals bar */}
 <div className="flex items-center gap-5 px-5 py-3 border-t bg-muted/40 text-xs">
 <span className="text-muted-foreground">Subtotal: <b className="text-foreground">{formatInr(order.subtotal)}</b></span>
 <span className="text-muted-foreground">Tax (18% GST): <b className="text-foreground">{formatInr(order.taxAmount)}</b></span>
 <span className="text-muted-foreground">Total: <b className="text-foreground font-semibold text-base">{formatInr(order.totalAmount)}</b></span>
 </div>
 </div>
 </TableCell>
 </TableRow>
 )}
 </>
 );
 })}
 </TableBody>
 </Table>
 </Card>
 )}
 </div>
 );
}