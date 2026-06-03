"use client";
import { useEffect, useState } from "react";
import { PackageIcon, SearchIcon, ShoppingCartIcon, Trash2Icon, CheckIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
 Sheet,
 SheetContent,
 SheetHeader,
 SheetTitle,
 SheetDescription,
 SheetFooter,
} from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

const DEFAULT_UNITS: Record<string, { unit: string; label: string; amountInBase: string }[]> = {
 WEIGHT: [
 { unit: "g", label: "Grams (g)", amountInBase: "1" },
 { unit: "kg", label: "Kilograms (kg)", amountInBase: "1000" },
 ],
 VOLUME: [
 { unit: "mL", label: "Millilitres (mL)", amountInBase: "1" },
 { unit: "L", label: "Litres (L)", amountInBase: "1000" },
 ],
 COUNT: [{ unit: "unit", label: "Unit / Item", amountInBase: "1" }],
};

const DIM_CONFIG: Record<string, { label: string; className: string; baseUnit: string }> = {
 WEIGHT: { label: "Weight", className: "bg-blue-500/10 text-blue-700 border-blue-500/20", baseUnit: "g" },
 VOLUME: { label: "Volume", className: "bg-purple-500/10 text-purple-700 border-purple-500/20", baseUnit: "mL" },
 COUNT: { label: "Count", className: "bg-green-500/10 text-green-700 border-green-500/20", baseUnit: "unit" },
};

function formatInr(paisa: number): string {
 return `₹${(paisa / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}

type CartItem = {
 product: any;
 unit: string;
 qty: number;
 baseQty: number;
 lineTotal: number;
 pricePerBase: number;
};

type Product = {
 id: string;
 name: string;
 description?: string;
 category?: string;
 sku?: string;
 dimension: string;
 pricePerBaseUnit: string;
 stockQuantity?: string;
 units: { unit: string; label: string; amountInBase: string }[];
};

function ProductCardSkeleton() {
 return (
 <Card className="border-border overflow-hidden">
 <div className="p-5 flex flex-col gap-4">
 <div className="space-y-1.5">
 <Skeleton className="h-5 w-3/4 rounded" />
 <Skeleton className="h-3 w-1/3 rounded" />
 </div>
 <Skeleton className="h-4 w-1/2 rounded" />
 <div className="flex gap-2">
 <Skeleton className="h-9 w-20 rounded-xl" />
 <Skeleton className="h-9 flex-1 rounded-xl" />
 </div>
 <Skeleton className="h-9 w-full rounded-xl" />
 </div>
 </Card>
 );
}

function ProductCard({
 product,
 onAdd,
 cart,
}: {
 product: Product;
 onAdd: (p: Product, u: string, q: number) => void;
 cart?: CartItem;
}) {
 const [qty, setQty] = useState("");
 const [unit, setUnit] = useState(
 product.units?.[0]?.unit ??
 (DEFAULT_UNITS[product.dimension]?.[0]?.unit ?? "g"),
 );
 const pricePerBase = parseFloat(product.pricePerBaseUnit);
 const availableUnits =
 product.units?.length > 0
 ? product.units
 : DEFAULT_UNITS[product.dimension] ?? DEFAULT_UNITS.COUNT;

 const multiplier = availableUnits.find((u) => u.unit === unit)?.amountInBase ?? "1";
 const previewBase = (parseFloat(qty) || 0) * parseFloat(multiplier);
 const previewPaisa = Math.round(previewBase * pricePerBase * 100);

 function handleAdd() {
 if (!qty || parseFloat(qty) <= 0) return;
 onAdd(product, unit, parseFloat(qty));
 setQty("");
 }

 return (
 <Card className="border-border overflow-hidden flex flex-col">
 <div className="p-5 flex flex-col gap-3 flex-1">
 {/* Header */}
 <div className="flex items-start justify-between gap-2">
 <div className="min-w-0">
 <h3 className="font-semibold text-foreground truncate">{product.name}</h3>
 {product.category && (
 <p className="text-xs text-muted-foreground mt-0.5">{product.category}</p>
 )}
 </div>
 <Badge variant="outline" className={DIM_CONFIG[product.dimension]?.className ?? ""}>
 {DIM_CONFIG[product.dimension]?.label ?? product.dimension}
 </Badge>
 </div>

 {/* Price */}
 <p className="text-sm text-muted-foreground">
 <span className="font-mono text-foreground font-semibold">
 ₹{pricePerBase.toFixed(4)}
 </span>
 {" "}/ {DIM_CONFIG[product.dimension]?.baseUnit ?? "unit"}
 </p>

 {/* Qty inputs */}
 <div className="space-y-2">
 <div className="flex gap-2">
 <select
 value={unit}
 onChange={(e) => setUnit(e.target.value)}
 className="h-9 w-24 shrink-0 rounded-xl border border-input bg-background px-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
 >
 {availableUnits.map((u) => (
 <option key={u.unit} value={u.unit}>{u.label}</option>
 ))}
 </select>
 <input
 type="number"
 value={qty}
 onChange={(e) => setQty(e.target.value)}
 placeholder="Qty"
 min="0"
 step="0.001"
 className="flex-1 h-9 rounded-xl border border-input bg-muted/40 px-3 text-sm placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:outline-none focus:ring-1 focus:ring-ring"
 />
 </div>

 {/* Live price preview */}
 {qty && parseFloat(qty) > 0 && (
 <p className="text-xs text-muted-foreground">
 {parseFloat(qty)} {unit} = {previewBase.toFixed(4)} base units →{" "}
 <span className="font-semibold text-foreground">{formatInr(previewPaisa)}</span>
 </p>
 )}

 {cart && (
 <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
 <CheckIcon className="size-3" />
 {cart.qty} {cart.unit} in cart
 </p>
 )}
 </div>
 </div>

 {/* Footer */}
 <div className="px-5 pb-5">
 <Button
 onClick={handleAdd}
 variant="default"
 className="w-full rounded-xl gap-2"
 disabled={!qty || parseFloat(qty) <= 0}
 >
 <ShoppingCartIcon className="size-4" />
 Add to Cart
 </Button>
 </div>
 </Card>
 );
}

export default function SellerProductsPage() {
 const [products, setProducts] = useState<Product[]>([]);
 const [cart, setCart] = useState<Record<string, CartItem>>({});
 const [search, setSearch] = useState("");
 const [dimension, setDimension] = useState("");
 const [loading, setLoading] = useState(true);
 const [showCart, setShowCart] = useState(false);
 const [ordering, setOrdering] = useState(false);
 const [notes, setNotes] = useState("");
 const [submitted, setSubmitted] = useState<{ reference?: string; totalAmount: number } | null>(null);

 useEffect(() => {
 const timer = setTimeout(() => loadProducts(), 300);
 return () => clearTimeout(timer);
 }, [search, dimension]);

 async function loadProducts() {
 setLoading(true);
 const params = new URLSearchParams();
 if (search) params.set("q", search);
 if (dimension) params.set("dimension", dimension);
 const res = await fetch(`/api/products?${params}`);
 setProducts(await res.json());
 setLoading(false);
 }

 function addToCart(product: Product, unit: string, qty: number) {
 const availableUnits =
 product.units?.length > 0
 ? product.units
 : DEFAULT_UNITS[product.dimension] ?? DEFAULT_UNITS.COUNT;
 const multiplier = availableUnits.find((u) => u.unit === unit)?.amountInBase ?? "1";
 const baseQty = qty * parseFloat(multiplier);
 const pricePerBase = parseFloat(product.pricePerBaseUnit);
 const lineTotal = Math.round(baseQty * pricePerBase * 100);
 setCart((prev) => ({
 ...prev,
 [product.id]: { product, unit, qty, baseQty, lineTotal, pricePerBase },
 }));
 }

 function removeFromCart(id: string) {
 setCart((prev) => {
 const next = { ...prev };
 delete next[id];
 return next;
 });
 }

 const cartItems = Object.values(cart);
 const subtotal = cartItems.reduce((s, c) => s + c.lineTotal, 0);
 const taxAmount = Math.round(subtotal * 0.18);
 const totalAmount = subtotal + taxAmount;
 const cartCount = cartItems.length;

 async function placeOrder() {
 setOrdering(true);
 const items = cartItems.map((c) => ({
 productId: c.product.id,
 unit: c.unit,
 quantity: c.qty,
 }));
 try {
 const res = await fetch("/api/quotations", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ items, notes }),
 });
 if (!res.ok) throw new Error("Failed");
 const quotation = await res.json();
 toast.success("Quotation placed successfully");
 setSubmitted(quotation);
 setCart({});
 setShowCart(false);
 setNotes("");
 } catch {
 toast.error("Failed to place quotation");
 } finally {
 setOrdering(false);
 }
 }

 return (
 <div className="p-6 space-y-6">
 {/* Header */}
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-2xl font-bold tracking-tight text-foreground">Browse Products</h1>
 <p className="text-sm text-muted-foreground mt-0.5">
 Browse inventory and create quotation requests
 </p>
 </div>
 <Button onClick={() => setShowCart(true)} className="gap-2 relative">
 <ShoppingCartIcon className="size-4" />
 Cart
 {cartCount > 0 && (
 <span className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-primary-foreground text-primary text-xs font-bold flex items-center justify-center">
 {cartCount}
 </span>
 )}
 </Button>
 </div>

 {/* Filters */}
 <div className="flex gap-3">
 <div className="relative flex-1 max-w-sm">
 <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
 <Input
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 placeholder="Search by name, SKU, category..."
 className="ps-9 h-10 rounded-xl"
 />
 </div>
 <select
 value={dimension}
 onChange={(e) => setDimension(e.target.value)}
 className="h-10 px-3 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
 >
 <option value="">All dimensions</option>
 <option value="WEIGHT">Weight</option>
 <option value="VOLUME">Volume</option>
 <option value="COUNT">Count</option>
 </select>
 </div>

 {/* Product grid */}
 {loading ? (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}
 </div>
 ) : products.length === 0 ? (
 <Card className="border-border flex flex-col items-center justify-center py-16 gap-4">
 <div className="flex size-14 items-center justify-center rounded-full bg-muted">
 <PackageIcon className="size-6 text-muted-foreground" />
 </div>
 <div className="text-center">
 <p className="text-sm font-medium text-foreground">No products found</p>
 <p className="text-xs text-muted-foreground mt-0.5">
 {search || dimension ? "Try adjusting your search or filters" : "No products available yet"}
 </p>
 </div>
 {(search || dimension) && (
 <Button variant="outline" size="sm" onClick={() => { setSearch(""); setDimension(""); }} className="rounded-xl gap-1.5">
 Clear filters
 </Button>
 )}
 </Card>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {products.map((p) => (
 <ProductCard
 key={p.id}
 product={p}
 onAdd={addToCart}
 cart={cart[p.id]}
 />
 ))}
 </div>
 )}

 {/* Cart Sheet */}
 <Sheet open={showCart} onOpenChange={(v) => !v && setShowCart(false)}>
 <SheetContent className="w-full sm:max-w-md p-0 flex flex-col border-border">
 <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
 <SheetTitle className="text-lg font-semibold text-foreground">Your Cart</SheetTitle>
 <SheetDescription className="text-xs text-muted-foreground">
 {cartCount > 0 ? `${cartCount} item${cartCount > 1 ? "s" : ""} selected` : "No items yet"}
 </SheetDescription>
 </SheetHeader>

 <div className="flex-1 overflow-y-auto">
 {cartCount === 0 ? (
 <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
 <div className="flex size-12 items-center justify-center rounded-full bg-muted">
 <ShoppingCartIcon className="size-5 text-muted-foreground" />
 </div>
 <p className="text-sm text-muted-foreground">Your cart is empty</p>
 <p className="text-xs text-muted-foreground">Add products from the catalog above</p>
 </div>
 ) : (
 <div className="divide-y divide-border">
 {cartItems.map((c) => (
 <div key={c.product.id} className="px-6 py-4">
 <div className="flex items-start justify-between gap-3">
 <div className="min-w-0 flex-1">
 <p className="text-sm font-medium text-foreground truncate">{c.product.name}</p>
 <p className="text-xs text-muted-foreground mt-0.5">
 {c.qty} {c.unit} × ₹{c.pricePerBase.toFixed(4)}/base
 </p>
 <p className="text-xs text-muted-foreground">
 {c.baseQty.toFixed(4)} base units
 </p>
 </div>
 <Button
 variant="ghost"
 size="sm"
 className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
 onClick={() => removeFromCart(c.product.id)}
 >
 <Trash2Icon className="size-3.5" />
 Remove
 </Button>
 </div>
 <p className="text-right font-semibold text-foreground mt-2 font-mono text-sm">
 {formatInr(c.lineTotal)}
 </p>
 </div>
 ))}
 </div>
 )}
 </div>

 {cartCount > 0 && (
 <div className="border-t border-border">
 <div className="px-6 py-4 space-y-3">
 <div className="space-y-1.5">
 <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Notes (optional)</label>
 <textarea
 value={notes}
 onChange={(e) => setNotes(e.target.value)}
 rows={2}
 placeholder="Any special requirements, delivery instructions..."
 className="w-full px-3 py-2 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring resize-none"
 />
 </div>

 <div className="space-y-1.5 text-sm">
 <div className="flex justify-between text-muted-foreground">
 <span>Subtotal</span>
 <span className="font-mono text-foreground">{formatInr(subtotal)}</span>
 </div>
 <div className="flex justify-between text-muted-foreground">
 <span>GST (18%)</span>
 <span className="font-mono text-foreground">{formatInr(taxAmount)}</span>
 </div>
 <div className="flex justify-between font-semibold text-foreground border-t border-border pt-1.5">
 <span>Total</span>
 <span className="font-mono">{formatInr(totalAmount)}</span>
 </div>
 </div>

 <Button onClick={placeOrder} disabled={ordering} className="w-full rounded-xl gap-2">
 {ordering ? <><Spinner size="sm" /> Placing...</> : <><ShoppingCartIcon className="size-4" /> Place Quotation</>}
 </Button>
 </div>
 )}
 </SheetContent>
 </Sheet>

 {/* Success Dialog */}
 {submitted && (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
 <Card className="border-border w-full max-w-sm mx-4 p-8 text-center">
 <div className="flex size-12 items-center justify-center rounded-full bg-emerald-500/10 mx-auto mb-4">
 <CheckIcon className="size-6 text-emerald-600" />
 </div>
 <h2 className="text-xl font-bold text-foreground mb-1">Quotation Placed!</h2>
 <p className="text-sm text-muted-foreground">
 Reference: <span className="font-mono font-semibold text-foreground">{submitted.reference?.slice(0, 8).toUpperCase()}</span>
 </p>
 <p className="text-sm text-muted-foreground mt-1">
 Total: <span className="font-semibold text-foreground">{formatInr(submitted.totalAmount)}</span>
 </p>
 <div className="mt-6">
 <Button onClick={() => setSubmitted(null)} className="rounded-xl">
 Done
 </Button>
 </div>
 </Card>
 </div>
 )}
 </div>
 );
}