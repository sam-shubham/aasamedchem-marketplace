"use client";

import { useEffect, useState } from "react";
import {
  UsersIcon,
  PlusIcon,
  Trash2Icon,
  SearchIcon,
  IndianRupeeIcon,
  ShoppingCartIcon,
  CalendarIcon,
  MailIcon,
  LockIcon,
  UserCheckIcon,
  XIcon,
  AlertTriangleIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

// ── Types ──────────────────────────────────────────────────────────────────────
type Seller = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  orderCount: number;
  totalSpentPaisa: number;
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

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0]!.charAt(0) + parts[parts.length - 1]!.charAt(0)).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

// ── Skeleton Loader for Table ──────────────────────────────────────────────────
function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-border/40">
          <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/4 rounded" />
            <Skeleton className="h-3 w-1/3 rounded" />
          </div>
          <Skeleton className="h-4 w-20 rounded" />
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

// ── Main Page Component ────────────────────────────────────────────────────────
export default function AdminSellersPage() {
  const [sellers, setSellers] = useState<Seller[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Dialog & Alert states
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [sellerToDelete, setSellerToDelete] = useState<Seller | null>(null);

  // Form states
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Fetch Sellers list
  const fetchSellers = async () => {
    try {
      const response = await fetch("/api/admin/sellers");
      if (!response.ok) throw new Error("Failed to load sellers");
      const data = await response.json();
      setSellers(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load sellers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  // Form submit: Create Seller
  const handleCreateSeller = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    const { name, email, password } = formData;

    if (!name.trim() || !email.trim() || !password) {
      setFormError("All fields are required");
      setIsSubmitting(false);
      return;
    }

    if (password.length < 6) {
      setFormError("Password must be at least 6 characters long");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/sellers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create seller account");
      }

      toast.success(`Seller "${data.name}" created successfully!`);
      setCreateOpen(false);
      setFormData({ name: "", email: "", password: "" });
      fetchSellers();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Alert submit: Delete Seller
  const handleDeleteSeller = async () => {
    if (!sellerToDelete) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/admin/sellers/${sellerToDelete.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete seller");
      }

      toast.success(`Seller "${sellerToDelete.name}" deleted successfully.`);
      setDeleteOpen(false);
      setSellerToDelete(null);
      fetchSellers();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete seller.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter local listings
  const filteredSellers = (sellers || []).filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Aggregates
  const totalSellers = sellers ? sellers.length : 0;
  const totalOrders = sellers ? sellers.reduce((sum, s) => sum + s.orderCount, 0) : 0;
  const totalSalesPaisa = sellers ? sellers.reduce((sum, s) => sum + s.totalSpentPaisa, 0) : 0;

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
              style={{ background: "linear-gradient(135deg, var(--primary), oklch(0.55 0.22 280))" }}
            >
              <UsersIcon className="size-4 text-white" strokeWidth={1.5} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Sellers</h1>
          </div>
          <p className="text-sm text-muted-foreground pl-[2.625rem]">
            Manage seller accounts and monitor their transaction history
          </p>
        </div>

        <Button
          onClick={() => {
            setFormError("");
            setFormData({ name: "", email: "", password: "" });
            setCreateOpen(true);
          }}
          className="rounded-xl gap-1.5 shrink-0 self-start sm:self-center font-semibold"
          style={{ background: "linear-gradient(135deg, var(--primary), oklch(0.55 0.22 280))" }}
        >
          <PlusIcon className="size-4" /> Add Seller
        </Button>
      </div>

      {/* ── Stats Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 border-border hover:shadow-md transition-all duration-200 flex items-center justify-between group">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Sellers</p>
            <p className="text-3xl font-bold text-foreground font-mono">
              {loading ? <Skeleton className="h-8 w-16 mt-1" /> : totalSellers}
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
            <UsersIcon className="size-5 text-blue-600 dark:text-blue-400" />
          </div>
        </Card>

        <Card className="p-5 border-border hover:shadow-md transition-all duration-200 flex items-center justify-between group">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Orders Placed</p>
            <p className="text-3xl font-bold text-foreground font-mono">
              {loading ? <Skeleton className="h-8 w-16 mt-1" /> : totalOrders}
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
            <ShoppingCartIcon className="size-5 text-amber-600 dark:text-amber-400" />
          </div>
        </Card>

        <Card className="p-5 border-border hover:shadow-md transition-all duration-200 flex items-center justify-between group">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Sales</p>
            <p className="text-3xl font-bold text-foreground font-mono">
              {loading ? <Skeleton className="h-8 w-24 mt-1" /> : formatInr(totalSalesPaisa)}
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
            <IndianRupeeIcon className="size-5 text-emerald-600 dark:text-emerald-400" />
          </div>
        </Card>
      </div>

      {/* ── Table & Search Controls ── */}
      <Card className="border-border overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-border bg-muted/10 flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search sellers by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 h-9 rounded-xl border-border bg-background text-sm focus-visible:ring-1 focus-visible:ring-primary w-full"
            />
          </div>
        </div>

        {/* Listings Container */}
        {loading ? (
          <div className="p-4">
            <TableSkeleton />
          </div>
        ) : filteredSellers.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
            <UsersIcon className="size-8 text-muted-foreground/60" strokeWidth={1.5} />
            <p className="text-sm font-semibold">No sellers found</p>
            <p className="text-xs text-muted-foreground/80">
              {searchQuery ? "Try refining your search query." : "Click Add Seller to get started."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent border-b border-border">
                  <TableHead className="w-[300px]">Seller Info</TableHead>
                  <TableHead>Joined Date</TableHead>
                  <TableHead className="text-center">Orders Placed</TableHead>
                  <TableHead className="text-right">Total Spent</TableHead>
                  <TableHead className="text-center w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSellers.map((seller) => {
                  const initials = getInitials(seller.name);
                  // Dynamic colors for avatar background
                  const hash = seller.name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
                  const colors = [
                    "linear-gradient(135deg, oklch(0.60 0.19 215), oklch(0.48 0.18 200))",
                    "linear-gradient(135deg, oklch(0.65 0.16 140), oklch(0.55 0.15 120))",
                    "linear-gradient(135deg, oklch(0.58 0.20 330), oklch(0.48 0.18 310))",
                    "linear-gradient(135deg, oklch(0.62 0.18 40), oklch(0.52 0.16 20))",
                  ];
                  const avatarBg = colors[hash % colors.length];

                  return (
                    <TableRow key={seller.id} className="hover:bg-muted/10 group/row border-b border-border/50">
                      {/* Name & Avatar */}
                      <TableCell className="font-medium py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white text-xs font-bold shadow-sm"
                            style={{ background: avatarBg }}
                          >
                            {initials}
                          </div>
                          <div className="grid leading-tight min-w-0">
                            <span className="truncate text-sm font-semibold text-foreground">
                              {seller.name}
                            </span>
                            <span className="truncate text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <MailIcon className="size-3 shrink-0" />
                              {seller.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Created date */}
                      <TableCell className="text-muted-foreground text-sm font-medium">
                        <span className="flex items-center gap-1.5">
                          <CalendarIcon className="size-3.5 shrink-0" />
                          {new Date(seller.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </TableCell>

                      {/* Orders Count */}
                      <TableCell className="text-center font-semibold text-sm">
                        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-lg bg-muted text-muted-foreground text-xs font-mono">
                          {seller.orderCount}
                        </span>
                      </TableCell>

                      {/* Total Spent */}
                      <TableCell className="text-right font-mono font-bold text-foreground text-sm">
                        {formatInrFull(seller.totalSpentPaisa)}
                      </TableCell>

                      {/* Action buttons */}
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSellerToDelete(seller);
                            setDeleteOpen(true);
                          }}
                          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          title="Delete Seller"
                        >
                          <Trash2Icon className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* ── Create Seller Dialog ── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl border border-border shadow-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
              <UserCheckIcon className="size-5 text-primary" /> Create New Seller Account
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateSeller} className="space-y-4 py-2">
            {formError && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertTriangleIcon className="size-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Full Name</label>
              <div className="relative">
                <Input
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="rounded-xl border-border bg-background focus-visible:ring-1 focus-visible:ring-primary text-sm pl-3 h-10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Email Address</label>
              <div className="relative">
                <Input
                  type="email"
                  required
                  placeholder="e.g. rahul@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="rounded-xl border-border bg-background focus-visible:ring-1 focus-visible:ring-primary text-sm pl-3 h-10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Password</label>
              <div className="relative">
                <Input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="rounded-xl border-border bg-background focus-visible:ring-1 focus-visible:ring-primary text-sm pl-3 h-10"
                />
              </div>
            </div>

            <DialogFooter className="pt-2 gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
                className="rounded-xl font-medium"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl font-semibold gap-1.5"
                style={{ background: "linear-gradient(135deg, var(--primary), oklch(0.55 0.22 280))" }}
              >
                {isSubmitting ? <Spinner className="size-4" /> : <UserCheckIcon className="size-4" />}
                Create Seller
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delete Seller Alert Dialog ── */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="rounded-2xl border border-border shadow-xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive font-bold">
              <AlertTriangleIcon className="size-5 shrink-0" /> Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2 pt-2">
              <p>
                You are about to delete the seller account for{" "}
                <strong className="text-foreground">{sellerToDelete?.name}</strong> (
                {sellerToDelete?.email}).
              </p>
              <div className="p-3 bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl text-xs space-y-1 border border-red-500/25">
                <p className="font-bold flex items-center gap-1">
                  <AlertTriangleIcon className="size-3.5 shrink-0" /> CRITICAL WARNING:
                </p>
                <p>
                  Deleting this user will permanently erase all associated orders/quotations (
                  <strong>{sellerToDelete?.orderCount}</strong> placed) and transaction histories from the
                  system.
                </p>
                <p className="font-semibold">This action cannot be undone.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2 sm:gap-0">
            <AlertDialogCancel asChild>
              <Button variant="outline" className="rounded-xl" disabled={isSubmitting}>
                Cancel
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  handleDeleteSeller();
                }}
                disabled={isSubmitting}
                variant="destructive"
                className="rounded-xl gap-1.5 font-semibold"
              >
                {isSubmitting ? <Spinner className="size-4" /> : <Trash2Icon className="size-4" />}
                Confirm Delete
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
