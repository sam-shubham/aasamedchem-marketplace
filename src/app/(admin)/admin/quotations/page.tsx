"use client";
import { useEffect, useState } from "react";
import { CheckIcon, XIcon, FileTextIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { formatOrderQty, smartFormatQty, type UnitDimension } from "@/lib/units";

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: string }> = {
 PENDING: { label: "Pending", className: "bg-amber-500/10 text-amber-700 border-amber-500/20", icon: "clock" },
 APPROVED: { label: "Approved", className: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20", icon: "check" },
 REJECTED: { label: "Rejected", className: "bg-destructive/10 text-destructive border-destructive/20", icon: "x" },
 FULFILLED: { label: "Fulfilled", className: "bg-blue-500/10 text-blue-700 border-blue-500/20", icon: "check" },
};

function formatInr(paisa: number): string {
 return `₹${(paisa / 100).toLocaleString("en-IN", {
 minimumFractionDigits: 2,
 maximumFractionDigits: 2,
 })}`;
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
 requestedBy?: { name: string; email: string };
 totalAmount: number;
 subtotal: number;
 taxAmount: number;
 createdAt: string;
 notes?: string;
 items: QuotationItem[];
};

function StatusIcon({ status }: { status: string }) {
 switch (status) {
 case "APPROVED":
 case "FULFILLED": return <CheckIcon className="size-3" />;
 case "REJECTED": return <XIcon className="size-3" />;
 default: return null;
 }
}

function QuotationCardSkeleton() {
 return (
 <Card className="border-border overflow-hidden">
 <div className="flex items-center justify-between px-5 py-4 border-b bg-muted/50">
 <div className="space-y-1.5"><Skeleton className="h-4 w-24 rounded" /><Skeleton className="h-3 w-40 rounded" /></div>
 <div className="text-right space-y-1"><Skeleton className="h-6 w-20 rounded-full" /><Skeleton className="h-4 w-16 rounded" /></div>
 </div>
 <div className="overflow-x-auto p-4">
 <div className="space-y-3">
 {Array.from({ length: 3 }).map((_, i) => (
 <div key={i} className="flex gap-4"><Skeleton className="h-4 flex-1 rounded" /><Skeleton className="h-4 w-16 rounded" /><Skeleton className="h-4 w-20 rounded" /></div>
 ))}
 </div>
 </div>
 <div className="px-5 py-3 border-t bg-muted/30 flex gap-4"><Skeleton className="h-5 w-20 rounded" /><Skeleton className="h-5 w-20 rounded" /><Skeleton className="h-5 w-20 rounded" /></div>
 </Card>
 );
}

function QuotationCard({ quotation, onStatusChange }: { quotation: Quotation; onStatusChange: (id: string, status: string) => void }) {
 const cfg = STATUS_CONFIG[quotation.status] ?? STATUS_CONFIG.PENDING;
 const ref = quotation.reference?.slice(0, 8).toUpperCase() ?? quotation.id.slice(0, 8).toUpperCase();

 return (
 <Card className="border-border overflow-hidden">
 {/* Card Header */}
 <div className="flex items-center justify-between px-5 py-4 border-b bg-muted/30">
 <div>
 <p className="font-semibold text-sm text-foreground">#{ref}</p>
 <p className="text-xs text-muted-foreground mt-0.5">
 {quotation.requestedBy?.name ?? "Unknown"}
 {quotation.requestedBy?.email ? ` · ${quotation.requestedBy.email}` : ""}
 </p>
 </div>
 <div className="text-right">
 <Badge variant="outline" className={cfg.className}>
 <StatusIcon status={quotation.status} />
 {cfg.label}
 </Badge>
 <p className="text-base font-bold mt-1 text-foreground">{formatInr(quotation.totalAmount)}</p>
 <p className="text-xs text-muted-foreground mt-0.5">
 {new Date(quotation.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
 </p>
 </div>
 </div>

 {/* Items Table */}
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead className="border-b bg-muted/20">
 <tr>
 <th className="text-left px-4 py-2 text-xs text-muted-foreground font-medium">Product</th>
 <th className="text-left px-4 py-2 text-xs text-muted-foreground font-medium">Qty Ordered</th>
 <th className="text-right px-4 py-2 text-xs text-muted-foreground font-medium">Base Qty</th>
 <th className="text-right px-4 py-2 text-xs text-muted-foreground font-medium">Rate</th>
 <th className="text-right px-4 py-2 text-xs text-muted-foreground font-medium">Line Total</th>
 </tr>
 </thead>
 <tbody className="divide-y">
 {quotation.items?.map((item) => {
 const dim = (item.product as any)?.dimension as UnitDimension ?? "COUNT";
 const orderedDisplay = formatOrderQty(item.orderQty, item.orderUnit, dim);
 const baseDisplay = smartFormatQty(parseFloat(item.baseQty), dim);
 return (
 <tr key={item.id} className="hover:bg-muted/20 transition-colors">
 <td className="px-4 py-2.5 font-medium text-foreground">{item.product?.name ?? "—"}</td>
 <td className="px-4 py-2.5">
 <span className="inline-flex items-center bg-primary/8 border border-primary/15 text-primary rounded-md px-2 py-0.5 text-xs font-semibold font-mono">
 {orderedDisplay}
 </span>
 </td>
 <td className="px-4 py-2.5 text-right font-mono text-xs text-muted-foreground">{baseDisplay}</td>
 <td className="px-4 py-2.5 text-right font-mono text-sm">₹{parseFloat(item.pricePerBase).toFixed(4)}</td>
 <td className="px-4 py-2.5 text-right font-semibold text-foreground">{formatInr(item.lineTotal)}</td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>

 {/* Notes */}
 {quotation.notes && (
 <div className="px-5 py-2.5 text-sm text-muted-foreground italic border-t bg-muted/10">
 <span className="font-medium not-italic text-foreground">Note:</span> {quotation.notes}
 </div>
 )}

 {/* Action Bar */}
 <div className="flex items-center gap-3 px-5 py-3 border-t bg-muted/20">
 {quotation.status === "PENDING" && (
 <div className="flex gap-2">
 <Button
 size="sm"
 variant="default"
 className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
 onClick={() => onStatusChange(quotation.id, "APPROVED")}
 >
 <CheckIcon className="size-3.5" />
 Approve
 </Button>
 <Button
 size="sm"
 variant="outline"
 className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
 onClick={() => onStatusChange(quotation.id, "REJECTED")}
 >
 <XIcon className="size-3.5" />
 Reject
 </Button>
 </div>
 )}
 {quotation.status === "APPROVED" && (
 <Button
 size="sm"
 variant="default"
 className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
 onClick={() => onStatusChange(quotation.id, "FULFILLED")}
 >
 <CheckIcon className="size-3.5" />
 Mark Fulfilled
 </Button>
 )}
 <div className="ml-auto flex gap-4 text-xs">
 <span className="text-muted-foreground">Subtotal: <b className="text-foreground">{formatInr(quotation.subtotal)}</b></span>
 <span className="text-muted-foreground">Tax (18% GST): <b className="text-foreground">{formatInr(quotation.taxAmount)}</b></span>
 <span className="text-muted-foreground">Total: <b className="text-foreground font-semibold">{formatInr(quotation.totalAmount)}</b></span>
 </div>
 </div>
 </Card>
 );
}

export default function AdminQuotationsPage() {
 const [quotations, setQuotations] = useState<Quotation[]>([]);
 const [loading, setLoading] = useState(true);
 const [filter, setFilter] = useState("ALL");
 const [updating, setUpdating] = useState<string | null>(null);

 useEffect(() => { load(); }, [filter]);

 async function load() {
 setLoading(true);
 const url = filter && filter !== "ALL" ? `/api/quotations?status=${filter}` : "/api/quotations";
 const res = await fetch(url);
 const data = await res.json();
 setQuotations(data);
 setLoading(false);
 }

 async function onStatusChange(id: string, status: string) {
 if (updating) return;
 setUpdating(id);
 try {
 const res = await fetch(`/api/quotations/${id}`, {
 method: "PATCH",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ status }),
 });
 if (!res.ok) throw new Error("Update failed");
 const labels: Record<string, string> = { APPROVED: "approved", REJECTED: "rejected", FULFILLED: "fulfilled" };
 toast.success(`Quotation ${labels[status] ?? "updated"}`);
 load();
 } catch {
 toast.error("Failed to update quotation status");
 } finally {
 setUpdating(null);
 }
 }

 return (
 <div className="p-6 space-y-6">
 {/* Header */}
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-2xl font-bold tracking-tight text-foreground">Quotations & Orders</h1>
 <p className="text-sm text-muted-foreground mt-0.5">
 Review, approve, and manage incoming quotations
 </p>
 </div>
 <Select value={filter} onValueChange={setFilter}>
 <SelectTrigger className="h-9 rounded-xl text-sm">
 <SelectValue placeholder="All statuses" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="ALL">All statuses</SelectItem>
 <SelectItem value="PENDING">Pending</SelectItem>
 <SelectItem value="APPROVED">Approved</SelectItem>
 <SelectItem value="REJECTED">Rejected</SelectItem>
 <SelectItem value="FULFILLED">Fulfilled</SelectItem>
 </SelectContent>
 </Select>
 </div>

 {/* Content */}
 {loading ? (
 <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <QuotationCardSkeleton key={i} />)}</div>
 ) : quotations.length === 0 ? (
 <Card className="border-border flex flex-col items-center justify-center py-16 gap-4">
 <div className="flex size-14 items-center justify-center rounded-full bg-muted">
 <FileTextIcon className="size-6 text-muted-foreground" />
 </div>
 <div className="text-center">
 <p className="text-sm font-medium text-foreground">No quotations found</p>
 <p className="text-xs text-muted-foreground mt-0.5">
 {filter && filter !== "ALL" ? `No ${STATUS_CONFIG[filter]?.label.toLowerCase() ?? filter} quotations` : "No quotations submitted yet"}
 </p>
 </div>
 {filter && filter !== "ALL" && (
 <Button variant="outline" size="sm" onClick={() => setFilter("ALL")} className="rounded-xl gap-1.5">
 Clear filter
 </Button>
 )}
 </Card>
 ) : (
 <div className="space-y-4">
 {quotations.map((q) => (
 <QuotationCard
 key={q.id}
 quotation={q}
 onStatusChange={onStatusChange}
 />
 ))}
 </div>
 )}
 </div>
 );
}