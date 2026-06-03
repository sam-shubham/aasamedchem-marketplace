"use client";
import { useEffect, useState } from "react";
import {
  PackageIcon,
  PlusIcon,
  PencilIcon,
  Trash2Icon,
  AlertTriangleIcon,
  FlaskConicalIcon,
  WeightIcon,
  BeakerIcon,
  HashIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { smartFormatQty, formatQtyBoth, type UnitDimension } from "@/lib/units";

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
  { label: string; icon: React.ElementType; badgeClass: string; iconClass: string; baseUnit: string }
> = {
  WEIGHT: {
    label: "Weight",
    icon: WeightIcon,
    badgeClass: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",
    iconClass: "text-blue-500",
    baseUnit: "g",
  },
  VOLUME: {
    label: "Volume",
    icon: BeakerIcon,
    badgeClass: "bg-violet-500/10 text-violet-600 border-violet-500/20 dark:text-violet-400",
    iconClass: "text-violet-500",
    baseUnit: "mL",
  },
  COUNT: {
    label: "Count",
    icon: HashIcon,
    badgeClass: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
    iconClass: "text-emerald-500",
    baseUnit: "unit",
  },
};

function formatInr(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return `₹${num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
}

function formatStock(
  value: string | number,
  dimension: string,
  threshold?: string | null,
): { display: string; both: string; isLow: boolean } {
  const num = typeof value === "string" ? parseFloat(value) : value;
  const isLow = threshold != null && num <= parseFloat(threshold);
  const dim = (dimension as UnitDimension) ?? "COUNT";
  return {
    display: smartFormatQty(num, dim),
    both: formatQtyBoth(num, dim),
    isLow,
  };
}

type ProductUnit = { unit: string; label: string; amountInBase: string };
type Product = {
  id: string;
  name: string;
  description?: string;
  category?: string;
  sku?: string;
  dimension: string;
  pricePerBaseUnit: string;
  stockQuantity: string;
  reorderThreshold?: string;
  units: ProductUnit[];
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadProducts(); }, []);

  async function loadProducts() {
    setLoading(true);
    const res = await fetch("/api/products");
    const data = await res.json();
    setProducts(data);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Product deleted"); loadProducts(); }
    else toast.error("Failed to delete product");
  }

  function openCreate() {
    setEditing({
      id: "", name: "", description: "", category: "", sku: "",
      dimension: "WEIGHT", pricePerBaseUnit: "", stockQuantity: "",
      reorderThreshold: "", units: DEFAULT_UNITS.WEIGHT,
    });
    setShowModal(true);
  }

  function openEdit(p: Product) {
    setEditing({
      ...p,
      units: p.units?.length ? p.units : (DEFAULT_UNITS[p.dimension] ?? DEFAULT_UNITS.WEIGHT),
    });
    setShowModal(true);
  }

  async function handleSave(form: Product) {
    setSaving(true);
    const payload = {
      ...form,
      pricePerBaseUnit: form.pricePerBaseUnit.toString(),
      stockQuantity: form.stockQuantity.toString(),
      reorderThreshold: form.reorderThreshold ? form.reorderThreshold.toString() : null,
    };
    try {
      const url = form.id ? `/api/products/${form.id}` : "/api/products";
      const method = form.id ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Save failed");
      toast.success(form.id ? "Product updated" : "Product created");
      setShowModal(false);
      loadProducts();
    } catch {
      toast.error("Failed to save product");
    } finally {
      setSaving(false);
    }
  }

  const lowStockCount = products.filter(
    (p) => p.reorderThreshold && parseFloat(p.stockQuantity) <= parseFloat(p.reorderThreshold),
  ).length;

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
              style={{ background: "linear-gradient(135deg, var(--primary), oklch(0.55 0.22 280))" }}>
              <FlaskConicalIcon className="size-4 text-white" strokeWidth={1.5} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Products</h1>
          </div>
          <p className="text-sm text-muted-foreground pl-[2.625rem]">
            Manage your chemical inventory and product catalog
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="gap-2 shrink-0 rounded-xl h-10"
          style={{ background: "linear-gradient(135deg, var(--primary), oklch(0.55 0.22 280))", boxShadow: "0 2px 12px var(--primary-glow)" }}
        >
          <PlusIcon className="size-4" />
          Add Product
        </Button>
      </div>

      {/* ── Stats strip ── */}
      {!loading && products.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Products", value: products.length, sub: "in catalog", color: "var(--primary)" },
            { label: "Low Stock", value: lowStockCount, sub: "need reorder", color: lowStockCount > 0 ? "var(--destructive)" : "var(--success)" },
            { label: "Weight Items", value: products.filter(p => p.dimension === "WEIGHT").length, sub: "by weight", color: "oklch(0.52 0.17 250)" },
            { label: "Volume Items", value: products.filter(p => p.dimension === "VOLUME").length, sub: "by volume", color: "oklch(0.55 0.18 285)" },
          ].map((stat) => (
            <Card key={stat.label} className="border-border p-4 bg-card">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-foreground leading-none mb-0.5"
                style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.sub}</p>
            </Card>
          ))}
        </div>
      )}

      {/* ── Low stock alert ── */}
      {!loading && lowStockCount > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-amber-500/20 bg-amber-500/8 animate-scale-in">
          <AlertTriangleIcon className="size-4 text-amber-500 shrink-0" />
          <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">
            {lowStockCount} product{lowStockCount > 1 ? "s are" : " is"} below reorder threshold — review stock levels
          </p>
        </div>
      )}

      {/* ── Table ── */}
      {loading ? (
        <Card className="border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Dimension</TableHead>
                <TableHead className="text-right">Price / Base</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((__, j) => (
                    <TableCell key={j}><Skeleton className="h-5 w-full rounded" /></TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : products.length === 0 ? (
        <Card className="border-border flex flex-col items-center justify-center py-20 gap-5">
          <div className="flex size-16 items-center justify-center rounded-2xl"
            style={{ background: "linear-gradient(135deg, var(--primary) / 0.1, oklch(0.60 0.19 215) / 0.1)" }}>
            <PackageIcon className="size-7 text-primary" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-base font-semibold text-foreground">No products yet</p>
            <p className="text-sm text-muted-foreground">Add your first product to start managing inventory</p>
          </div>
          <Button onClick={openCreate} className="gap-2 rounded-xl">
            <PlusIcon className="size-4" />Add Product
          </Button>
        </Card>
      ) : (
        <Card className="border-border overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40 border-b-2 border-border">
                <TableHead className="w-[260px] font-semibold text-foreground/70 text-xs uppercase tracking-wider">Product</TableHead>
                <TableHead className="font-semibold text-foreground/70 text-xs uppercase tracking-wider">Category</TableHead>
                <TableHead className="font-semibold text-foreground/70 text-xs uppercase tracking-wider">Dimension</TableHead>
                <TableHead className="text-right font-semibold text-foreground/70 text-xs uppercase tracking-wider">Price / Base</TableHead>
                <TableHead className="text-right font-semibold text-foreground/70 text-xs uppercase tracking-wider">Stock</TableHead>
                <TableHead className="text-right font-semibold text-foreground/70 text-xs uppercase tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p, idx) => {
                const dim = DIM_CONFIG[p.dimension] ?? DIM_CONFIG.COUNT;
                const DimIcon = dim.icon;
                return (
                  <TableRow
                    key={p.id}
                    className="group border-b last:border-0 hover:bg-muted/30 transition-colors duration-100"
                    style={{ animationDelay: `${idx * 30}ms` }}
                  >
                    {/* Product name + SKU */}
                    <TableCell className="py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                          <DimIcon className={`size-3.5 ${dim.iconClass}`} />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground text-sm leading-tight">{p.name}</div>
                          {p.sku && (
                            <div className="text-[11px] text-muted-foreground font-mono mt-0.5 bg-muted/60 inline-block px-1.5 py-0.5 rounded">
                              {p.sku}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Category */}
                    <TableCell className="py-3.5">
                      {p.category ? (
                        <span className="text-sm text-foreground/80 bg-muted/50 px-2.5 py-1 rounded-lg">
                          {p.category}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/50 text-sm">—</span>
                      )}
                    </TableCell>

                    {/* Dimension badge */}
                    <TableCell className="py-3.5">
                      <Badge variant="outline" className={`gap-1.5 text-xs font-medium py-1 ${dim.badgeClass}`}>
                        <DimIcon className="size-3" />
                        {dim.label}
                      </Badge>
                    </TableCell>

                    {/* Price */}
                    <TableCell className="text-right py-3.5">
                      <span className="font-mono text-sm font-semibold text-foreground">
                        {formatInr(p.pricePerBaseUnit)}
                      </span>
                      <span className="text-muted-foreground text-xs ml-0.5">/{dim.baseUnit}</span>
                    </TableCell>

                    {/* Stock */}
                    <TableCell className="text-right py-3.5">
                      {(() => {
                        const stock = formatStock(p.stockQuantity, p.dimension, p.reorderThreshold);
                        return (
                          <div className="flex flex-col items-end gap-0.5">
                            <span className={`font-mono text-sm font-semibold ${stock.isLow ? "text-destructive" : "text-foreground"}`}>
                              {stock.display}
                            </span>
                            {stock.both !== stock.display && (
                              <span className="text-[10px] text-muted-foreground/60 font-mono">{stock.both.split("(")[1]?.replace(")", "") ?? ""}</span>
                            )}
                            {stock.isLow && (
                              <span className="flex items-center gap-1 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                                <AlertTriangleIcon className="size-2.5" /> low stock
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right py-3.5">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1.5 rounded-lg text-xs hover:bg-primary/10 hover:text-primary"
                          onClick={() => openEdit(p)}
                        >
                          <PencilIcon className="size-3.5" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1.5 rounded-lg text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(p.id)}
                        >
                          <Trash2Icon className="size-3.5" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* ── Modal ── */}
      {showModal && editing && (
        <ProductModal
          product={editing}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
          saving={saving}
        />
      )}
    </div>
  );
}

function ProductModal({
  product,
  onSave,
  onClose,
  saving,
}: {
  product: Product;
  onSave: (p: Product) => void;
  onClose: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState(product);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function updateField(k: keyof Product, v: unknown) {
    const next = { ...form, [k]: v };
    if (k === "dimension") {
      next.units = DEFAULT_UNITS[v as string] ?? DEFAULT_UNITS.COUNT;
    }
    setForm(next as Product);
  }

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.pricePerBaseUnit || parseFloat(form.pricePerBaseUnit) <= 0)
      errs.pricePerBaseUnit = "Price must be greater than 0";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSave(form);
  }

  const isEdit = !!product.id;

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[92vh] overflow-y-auto p-0">
        {/* Modal header with gradient */}
        <div className="px-6 pt-6 pb-5 border-b border-border"
          style={{ background: "linear-gradient(to bottom, var(--muted)/40, transparent)" }}>
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                style={{ background: "linear-gradient(135deg, var(--primary), oklch(0.55 0.22 280))" }}>
                {isEdit ? <PencilIcon className="size-4 text-white" /> : <PlusIcon className="size-4 text-white" />}
              </div>
              <DialogTitle className="text-lg font-bold">
                {isEdit ? "Edit Product" : "New Product"}
              </DialogTitle>
            </div>
          </DialogHeader>
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); void handleSubmit(e); }}
          className="px-6 py-5 space-y-5"
        >
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Product Name <span className="text-destructive">*</span>
            </label>
            <Input
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="e.g. Paracetamol"
              aria-invalid={!!errors.name}
              className={`rounded-xl ${errors.name ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
            />
            {errors.name && <p className="text-xs text-destructive font-medium">{errors.name}</p>}
          </div>

          {/* Category + SKU */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</label>
              <Input
                value={form.category ?? ""}
                onChange={(e) => updateField("category", e.target.value)}
                placeholder="e.g. Bulk Chemical"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">SKU</label>
              <Input
                value={form.sku ?? ""}
                onChange={(e) => updateField("sku", e.target.value)}
                placeholder="SKU-001"
                className="rounded-xl font-mono"
              />
            </div>
          </div>

          {/* Dimension */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dimension</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(DIM_CONFIG).map(([key, cfg]) => {
                const Icon = cfg.icon;
                const active = form.dimension === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => updateField("dimension", key)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-xs font-semibold transition-all duration-150 ${active
                      ? "border-primary bg-primary/8 text-primary"
                      : "border-border bg-muted/30 text-muted-foreground hover:border-primary/40 hover:bg-muted/50"}`}
                  >
                    <Icon className="size-4" />
                    {cfg.label}
                    <span className="text-[10px] opacity-70 font-mono">{cfg.baseUnit}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price + Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Price / base unit (₹) <span className="text-destructive">*</span>
              </label>
              <Input
                type="number"
                step="0.0001"
                min="0"
                value={form.pricePerBaseUnit}
                onChange={(e) => updateField("pricePerBaseUnit", e.target.value)}
                placeholder="0.0000"
                aria-invalid={!!errors.pricePerBaseUnit}
                className={`rounded-xl font-mono ${errors.pricePerBaseUnit ? "border-destructive" : ""}`}
              />
              {errors.pricePerBaseUnit && <p className="text-xs text-destructive font-medium">{errors.pricePerBaseUnit}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Current Stock</label>
              <Input
                type="number"
                step="0.0001"
                min="0"
                value={form.stockQuantity}
                onChange={(e) => updateField("stockQuantity", e.target.value)}
                placeholder="0"
                className="rounded-xl font-mono"
              />
            </div>
          </div>

          {/* Reorder threshold */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Reorder Threshold
              <span className="ml-1.5 text-[10px] font-normal text-muted-foreground/60 normal-case tracking-normal">(optional)</span>
            </label>
            <Input
              type="number"
              step="0.0001"
              min="0"
              value={form.reorderThreshold ?? ""}
              onChange={(e) => updateField("reorderThreshold", e.target.value)}
              placeholder="Alert when stock falls below this"
              className="rounded-xl font-mono"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Description
              <span className="ml-1.5 text-[10px] font-normal text-muted-foreground/60 normal-case tracking-normal">(optional)</span>
            </label>
            <textarea
              value={form.description ?? ""}
              onChange={(e) => updateField("description", e.target.value)}
              rows={2}
              placeholder="Optional description"
              className="w-full px-3 py-2.5 rounded-xl border border-input bg-muted/30 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-ring/30 resize-none transition-all"
            />
          </div>

          {/* Units section */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Units</p>
            <div className="space-y-2 rounded-xl border border-border bg-muted/20 p-3">
              {(form.units || []).map((u: ProductUnit, i: number) => (
                <div key={i} className="flex gap-2 items-center">
                  <span className="w-14 text-center font-mono text-xs py-2 rounded-lg border border-border bg-background text-foreground font-semibold shrink-0">
                    {u.unit}
                  </span>
                  <input
                    value={u.label}
                    onChange={(e) => {
                      const u2 = [...form.units];
                      u2[i] = { ...u2[i]!, label: e.target.value };
                      setForm({ ...form, units: u2 } as Product);
                    }}
                    className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
                    placeholder="Label"
                  />
                  <input
                    value={u.amountInBase}
                    onChange={(e) => {
                      const u2 = [...form.units];
                      u2[i] = { ...u2[i]!, amountInBase: e.target.value };
                      setForm({ ...form, units: u2 } as Product);
                    }}
                    className="w-24 px-3 py-2 rounded-lg border border-input bg-background text-sm font-mono focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
                    placeholder="Base equiv."
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="rounded-xl gap-2 min-w-28"
              style={{ background: "linear-gradient(135deg, var(--primary), oklch(0.55 0.22 280))", boxShadow: "0 2px 12px var(--primary-glow)" }}
            >
              {saving ? (
                <><Spinner size="sm" /> Saving...</>
              ) : isEdit ? (
                "Save Changes"
              ) : (
                "Add Product"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
