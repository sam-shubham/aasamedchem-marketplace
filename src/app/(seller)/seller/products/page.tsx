"use client";
import { useEffect, useState } from "react";
import {
  PackageIcon,
  SearchIcon,
  ShoppingCartIcon,
  Trash2Icon,
  CheckIcon,
  FlaskConicalIcon,
  WeightIcon,
  BeakerIcon,
  HashIcon,
  SlidersHorizontalIcon,
  SparklesIcon,
} from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useAuthStore } from "@/lib/auth-store";
import { toast } from "sonner";

function getCartStorageKey(userId: string): string {
  return `sellerCart:${userId}`;
}

const DEFAULT_UNITS: Record<
  string,
  { unit: string; label: string; amountInBase: string }[]
> = {
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

const DIM_CONFIG: Record<
  string,
  {
    label: string;
    icon: React.ElementType;
    badgeClass: string;
    bgClass: string;
    iconClass: string;
    baseUnit: string;
  }
> = {
  WEIGHT: {
    label: "Weight",
    icon: WeightIcon,
    badgeClass:
      "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",
    bgClass: "bg-blue-500/8",
    iconClass: "text-blue-500",
    baseUnit: "g",
  },
  VOLUME: {
    label: "Volume",
    icon: BeakerIcon,
    badgeClass:
      "bg-violet-500/10 text-violet-600 border-violet-500/20 dark:text-violet-400",
    bgClass: "bg-violet-500/8",
    iconClass: "text-violet-500",
    baseUnit: "mL",
  },
  COUNT: {
    label: "Count",
    icon: HashIcon,
    badgeClass:
      "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
    bgClass: "bg-emerald-500/8",
    iconClass: "text-emerald-500",
    baseUnit: "unit",
  },
};

function formatInr(paisa: number): string {
  return `₹${(paisa / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}

type CartItem = {
  product: Product;
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
      <div className="p-5 space-y-4">
        <div className="flex items-start gap-3">
          <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-4 w-3/4 rounded" />
            <Skeleton className="h-3 w-1/3 rounded" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full shrink-0" />
        </div>
        <Skeleton className="h-5 w-1/2 rounded" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28 rounded-xl" />
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
      DEFAULT_UNITS[product.dimension]?.[0]?.unit ??
      "g",
  );
  const pricePerBase = parseFloat(product.pricePerBaseUnit);
  const availableUnits =
    product.units?.length > 0
      ? product.units
      : (DEFAULT_UNITS[product.dimension] ?? DEFAULT_UNITS.COUNT);

  const multiplier =
    availableUnits.find((u) => u.unit === unit)?.amountInBase ?? "1";
  const previewBase = (parseFloat(qty) || 0) * parseFloat(multiplier);
  const previewPaisa = Math.round(previewBase * pricePerBase * 100);
  const dim = DIM_CONFIG[product.dimension] ?? DIM_CONFIG.COUNT;
  const DimIcon = dim.icon;
  const hasQty = !!qty && parseFloat(qty) > 0;

  function handleAdd() {
    if (!hasQty) return;
    onAdd(product, unit, parseFloat(qty));
    setQty("");
  }

  return (
    <Card
      className={`border-border overflow-hidden flex flex-col transition-all duration-200 hover:shadow-md hover:border-primary/20 group ${cart ? "ring-1 ring-emerald-500/30 border-emerald-500/20" : ""}`}
    >
      {/* In-cart indicator strip */}
      {cart && (
        <div
          className="h-1 w-full"
          style={{
            background:
              "linear-gradient(90deg, var(--primary), oklch(0.60 0.19 215))",
          }}
        />
      )}

      <div className="p-5 flex flex-col gap-4 flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${dim.bgClass}`}
            >
              <DimIcon className={`size-5 ${dim.iconClass}`} />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground text-sm leading-tight truncate">
                {product.name}
              </h3>
              {product.category && (
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {product.category}
                </p>
              )}
              {product.sku && (
                <p className="text-[10px] font-mono text-muted-foreground/60 mt-0.5">
                  {product.sku}
                </p>
              )}
            </div>
          </div>
          <Badge
            variant="outline"
            className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 ${dim.badgeClass}`}
          >
            {dim.label}
          </Badge>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1">
          <span className="font-mono text-lg font-bold text-foreground leading-none">
            ₹{pricePerBase.toFixed(2)}
          </span>
          <span className="text-xs text-muted-foreground">/{dim.baseUnit}</span>
        </div>

        {/* Cart badge */}
        {cart && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 rounded-lg px-2.5 py-1.5">
            <CheckIcon className="size-3.5 shrink-0" />
            <span>
              {cart.qty} {cart.unit} added to cart
            </span>
          </div>
        )}

        {/* Quantity selector */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Select value={unit} onValueChange={setUnit}>
              <SelectTrigger className="h-9 w-[120px] shrink-0 rounded-xl text-xs px-2.5 bg-muted/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableUnits.map((u) => (
                  <SelectItem key={u.unit} value={u.unit}>
                    {u.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input
              type="number"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              placeholder="Quantity"
              min="0"
              step="0.001"
              className="flex-1 h-9 rounded-xl border border-input bg-muted/40 px-3 text-sm placeholder:text-muted-foreground/50 focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono transition-all"
            />
          </div>

          {/* Live preview */}
          {hasQty && (
            <div className="flex items-center justify-between rounded-lg bg-muted/50 border border-border/60 px-3 py-2 animate-scale-in">
              <span className="text-xs text-muted-foreground">
                {parseFloat(qty)} {unit} → {previewBase.toFixed(2)}{" "}
                {dim.baseUnit}
              </span>
              <span className="text-xs font-bold font-mono text-foreground">
                {formatInr(previewPaisa)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="px-5 pb-5">
        <Button
          onClick={handleAdd}
          className="w-full rounded-xl gap-2 h-9 text-sm font-semibold transition-all"
          disabled={!hasQty}
          style={
            hasQty
              ? {
                  background:
                    "linear-gradient(135deg, var(--primary), oklch(0.55 0.22 280))",
                  boxShadow: "0 2px 12px var(--primary-glow)",
                }
              : {}
          }
        >
          <ShoppingCartIcon className="size-4" />
          {cart ? "Update Cart" : "Add to Cart"}
        </Button>
      </div>
    </Card>
  );
}

function CartFooter({
  cartItems,
  notes,
  onNotesChange,
  onPlace,
  ordering,
  subtotal,
  taxAmount,
  totalAmount,
}: {
  cartItems: CartItem[];
  notes: string;
  onNotesChange: (n: string) => void;
  onPlace: () => void;
  ordering: boolean;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
}) {
  return (
    <div className="border-t border-border bg-card">
      <div className="px-6 py-5 space-y-4">
        {/* Notes */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Notes{" "}
            <span className="normal-case font-normal text-muted-foreground/60">
              (optional)
            </span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            rows={2}
            placeholder="Special requirements, delivery instructions..."
            className="w-full px-3 py-2.5 rounded-xl border border-input bg-muted/30 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-all"
          />
        </div>

        {/* Totals */}
        <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Subtotal</span>
            <span className="font-mono font-medium text-foreground">
              {formatInr(subtotal)}
            </span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>GST (18%)</span>
            <span className="font-mono font-medium text-foreground">
              {formatInr(taxAmount)}
            </span>
          </div>
          <div className="flex justify-between text-sm font-bold text-foreground pt-2 border-t border-border">
            <span>Total</span>
            <span className="font-mono">{formatInr(totalAmount)}</span>
          </div>
        </div>

        <Button
          onClick={onPlace}
          disabled={ordering}
          className="w-full rounded-xl gap-2 h-11 font-semibold"
          style={{
            background:
              "linear-gradient(135deg, var(--primary), oklch(0.55 0.22 280))",
            boxShadow: "0 2px 16px var(--primary-glow)",
          }}
        >
          {ordering ? (
            <>
              <Spinner size="sm" /> Placing Quotation...
            </>
          ) : (
            <>
              <ShoppingCartIcon className="size-4" /> Place Quotation
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export default function SellerProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [cartHydrated, setCartHydrated] = useState(false);
  const [search, setSearch] = useState("");
  const [dimension, setDimension] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [ordering, setOrdering] = useState(false);
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState<{
    reference?: string;
    totalAmount: number;
  } | null>(null);
  const userId = useAuthStore((state) => state.user?.id);

  useEffect(() => {
    if (!userId) {
      setCartHydrated(true);
      return;
    }

    try {
      const stored = window.localStorage.getItem(getCartStorageKey(userId));
      if (stored) {
        setCart(JSON.parse(stored) as Record<string, CartItem>);
      } else {
        setCart({});
      }
    } catch {
      setCart({});
    } finally {
      setCartHydrated(true);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId || !cartHydrated) return;
    window.localStorage.setItem(
      getCartStorageKey(userId),
      JSON.stringify(cart),
    );
  }, [cart, cartHydrated, userId]);

  useEffect(() => {
    const timer = setTimeout(() => loadProducts(), 300);
    return () => clearTimeout(timer);
  }, [search, dimension]);

  async function loadProducts() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (dimension && dimension !== "ALL") params.set("dimension", dimension);
    const res = await fetch(`/api/products?${params}`);
    setProducts(await res.json());
    setLoading(false);
  }

  function addToCart(product: Product, unit: string, qty: number) {
    const availableUnits =
      product.units?.length > 0
        ? product.units
        : (DEFAULT_UNITS[product.dimension] ?? DEFAULT_UNITS.COUNT);
    const multiplier =
      availableUnits.find((u) => u.unit === unit)?.amountInBase ?? "1";
    const baseQty = qty * parseFloat(multiplier);
    const pricePerBase = parseFloat(product.pricePerBaseUnit);
    const lineTotal = Math.round(baseQty * pricePerBase * 100);
    setCart((prev) => ({
      ...prev,
      [product.id]: { product, unit, qty, baseQty, lineTotal, pricePerBase },
    }));
    toast.success(`${product.name} added to cart`);
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
      toast.success("Quotation placed successfully!");
      setSubmitted(quotation);
      setCart({});
      setShowCart(false);
      setNotes("");
      if (userId) {
        window.localStorage.removeItem(getCartStorageKey(userId));
      }
    } catch {
      toast.error("Failed to place quotation");
    } finally {
      setOrdering(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
              style={{
                background:
                  "linear-gradient(135deg, var(--primary), oklch(0.55 0.22 280))",
              }}
            >
              <FlaskConicalIcon
                className="size-4 text-white"
                strokeWidth={1.5}
              />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Browse Products
            </h1>
          </div>
          <p className="text-sm text-muted-foreground pl-[2.625rem]">
            Browse catalog and create quotation requests
          </p>
        </div>

        {/* Cart button */}
        <Button
          onClick={() => setShowCart(true)}
          className="gap-2 relative shrink-0 rounded-xl h-10"
          style={
            cartCount > 0
              ? {
                  background:
                    "linear-gradient(135deg, var(--primary), oklch(0.55 0.22 280))",
                  boxShadow: "0 2px 12px var(--primary-glow)",
                }
              : {}
          }
          variant={cartCount > 0 ? "default" : "outline"}
        >
          <ShoppingCartIcon className="size-4" />
          Cart
          {cartCount > 0 && (
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-primary text-[10px] font-bold leading-none">
              {cartCount}
            </span>
          )}
        </Button>
      </div>

      {/* ── Filters bar ── */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="ps-9 h-10 rounded-xl bg-muted/40 border-border/70"
          />
        </div>
        <Select value={dimension} onValueChange={setDimension}>
          <SelectTrigger className="h-10 rounded-xl w-44 bg-muted/40 border-border/70 text-sm">
            <SlidersHorizontalIcon className="size-3.5 mr-1.5 text-muted-foreground shrink-0" />
            <SelectValue placeholder="All dimensions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All dimensions</SelectItem>
            <SelectItem value="WEIGHT">Weight</SelectItem>
            <SelectItem value="VOLUME">Volume</SelectItem>
            <SelectItem value="COUNT">Count</SelectItem>
          </SelectContent>
        </Select>
        {!loading && products.length > 0 && (
          <div className="flex items-center ml-auto">
            <span className="text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-xl border border-border/50">
              {products.length} product{products.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      {/* ── Product grid ── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <Card className="border-border flex flex-col items-center justify-center py-20 gap-5">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-muted">
            <PackageIcon className="size-7 text-muted-foreground" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-base font-semibold text-foreground">
              No products found
            </p>
            <p className="text-sm text-muted-foreground">
              {search || dimension !== "ALL"
                ? "Try adjusting your search or filters"
                : "No products available yet"}
            </p>
          </div>
          {(search || dimension !== "ALL") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch("");
                setDimension("ALL");
              }}
              className="rounded-xl gap-1.5"
            >
              Clear filters
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p, i) => (
            <div
              key={p.id}
              className="animate-slide-up"
              style={{ animationDelay: `${i * 40}ms`, opacity: 0 }}
            >
              <ProductCard product={p} onAdd={addToCart} cart={cart[p.id]} />
            </div>
          ))}
        </div>
      )}

      {/* ── Cart Sheet ── */}
      <Sheet open={showCart} onOpenChange={(v) => !v && setShowCart(false)}>
        <SheetContent className="w-full sm:max-w-md p-0 flex flex-col border-border">
          {/* Cart header */}
          <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                style={{
                  background:
                    "linear-gradient(135deg, var(--primary), oklch(0.55 0.22 280))",
                }}
              >
                <ShoppingCartIcon className="size-4 text-white" />
              </div>
              <div>
                <SheetTitle className="text-base font-bold text-foreground">
                  Your Cart
                </SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground">
                  {cartCount > 0
                    ? `${cartCount} item${cartCount > 1 ? "s" : ""} · ${formatInr(subtotal)} subtotal`
                    : "No items yet"}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto">
            {cartCount === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-6">
                <div className="flex size-16 items-center justify-center rounded-2xl bg-muted">
                  <ShoppingCartIcon className="size-7 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Your cart is empty
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add products from the catalog
                  </p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {cartItems.map((c) => {
                  const dim =
                    DIM_CONFIG[c.product.dimension] ?? DIM_CONFIG.COUNT;
                  const DimIcon = dim.icon;
                  return (
                    <div
                      key={c.product.id}
                      className="px-6 py-4 hover:bg-muted/30 transition-colors group"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${dim.bgClass}`}
                        >
                          <DimIcon className={`size-4 ${dim.iconClass}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground leading-tight truncate">
                            {c.product.name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {c.qty} {c.unit} · {c.baseQty.toFixed(2)}{" "}
                            {dim.baseUnit}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          <p className="font-mono font-bold text-sm text-foreground">
                            {formatInr(c.lineTotal)}
                          </p>
                          <button
                            onClick={() => removeFromCart(c.product.id)}
                            className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2Icon className="size-3" />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {cartCount > 0 && (
            <CartFooter
              cartItems={cartItems}
              notes={notes}
              onNotesChange={setNotes}
              onPlace={placeOrder}
              ordering={ordering}
              subtotal={subtotal}
              taxAmount={taxAmount}
              totalAmount={totalAmount}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* ── Success overlay ── */}
      {submitted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <Card className="border-border w-full max-w-sm mx-4 p-8 text-center shadow-2xl animate-scale-in">
            <div
              className="flex size-16 items-center justify-center rounded-2xl mx-auto mb-5"
              style={{
                background:
                  "linear-gradient(135deg, var(--success), oklch(0.55 0.20 160))",
              }}
            >
              <SparklesIcon className="size-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-1">
              Quotation Placed!
            </h2>
            <p className="text-sm text-muted-foreground mb-1">
              Reference:{" "}
              <span className="font-mono font-bold text-foreground tracking-wider">
                {submitted.reference?.slice(0, 8).toUpperCase()}
              </span>
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Total:{" "}
              <span className="font-bold text-foreground">
                {formatInr(submitted.totalAmount)}
              </span>
            </p>
            <Button
              onClick={() => setSubmitted(null)}
              className="rounded-xl w-full"
              style={{
                background:
                  "linear-gradient(135deg, var(--primary), oklch(0.55 0.22 280))",
              }}
            >
              Continue Browsing
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
