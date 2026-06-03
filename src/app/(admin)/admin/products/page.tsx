"use client";
import { useEffect, useState } from "react";
import { PackageIcon, PlusIcon, PencilIcon, Trash2Icon } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

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
  { label: string; className: string; baseUnit: string }
> = {
  WEIGHT: {
    label: "Weight",
    className: "bg-blue-500/10 text-blue-700 border-blue-500/20",
    baseUnit: "g",
  },
  VOLUME: {
    label: "Volume",
    className: "bg-purple-500/10 text-purple-700 border-purple-500/20",
    baseUnit: "mL",
  },
  COUNT: {
    label: "Count",
    className: "bg-green-500/10 text-green-700 border-green-500/20",
    baseUnit: "unit",
  },
};

function formatInr(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return `₹${num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
}

function formatStock(
  value: string | number,
  threshold?: string | null,
): { text: string; className: string } {
  const num = typeof value === "string" ? parseFloat(value) : value;
  const isLow = threshold != null && num <= parseFloat(threshold);
  return {
    text: num.toFixed(4),
    className: isLow
      ? "text-destructive font-semibold"
      : "text-muted-foreground",
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

  useEffect(() => {
    loadProducts();
  }, []);

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
    if (res.ok) {
      toast.success("Product deleted");
      loadProducts();
    } else {
      toast.error("Failed to delete product");
    }
  }

  function openCreate() {
    setEditing({
      id: "",
      name: "",
      description: "",
      category: "",
      sku: "",
      dimension: "WEIGHT",
      pricePerBaseUnit: "",
      stockQuantity: "",
      reorderThreshold: "",
      units: DEFAULT_UNITS.WEIGHT,
    });
    setShowModal(true);
  }

  function openEdit(p: Product) {
    setEditing({
      ...p,
      units: p.units?.length
        ? p.units
        : (DEFAULT_UNITS[p.dimension] ?? DEFAULT_UNITS.WEIGHT),
    });
    setShowModal(true);
  }

  async function handleSave(form: Product) {
    setSaving(true);
    const payload = {
      ...form,
      pricePerBaseUnit: form.pricePerBaseUnit.toString(),
      stockQuantity: form.stockQuantity.toString(),
      reorderThreshold: form.reorderThreshold
        ? form.reorderThreshold.toString()
        : null,
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Products
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your chemical inventory and product catalog
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <PlusIcon className="size-4" />
          Add Product
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <Card className="border-border">
          <Table>
            <TableHeader>
              <TableRow>
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
                    <TableCell key={j}>
                      <Skeleton className="h-5 w-full rounded" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : products.length === 0 ? (
        <Card className="border-border flex flex-col items-center justify-center py-16 gap-4">
          <div className="flex size-14 items-center justify-center rounded-full bg-muted">
            <PackageIcon className="size-6 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              No products yet
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Add your first product to start managing inventory
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={openCreate}
            className="gap-1.5"
          >
            <PlusIcon className="size-3.5" />
            Add Product
          </Button>
        </Card>
      ) : (
        <Card className="border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b">
                <TableHead className="w-[280px]">Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Dimension</TableHead>
                <TableHead className="text-right">Price / Base Unit</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => {
                const dim = DIM_CONFIG[p.dimension] ?? DIM_CONFIG.COUNT;
                const stock = formatStock(p.stockQuantity, p.reorderThreshold);
                return (
                  <TableRow key={p.id} className="border-b last:border-0">
                    <TableCell>
                      <div className="font-medium text-foreground">
                        {p.name}
                      </div>
                      {p.sku && (
                        <div className="text-xs text-muted-foreground font-mono mt-0.5">
                          {p.sku}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {p.category || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={dim.className}>
                        {dim.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {formatInr(p.pricePerBaseUnit)}
                      <span className="text-muted-foreground text-xs">
                        /{dim.baseUnit}
                      </span>
                    </TableCell>
                    <TableCell
                      className={`text-right font-mono text-sm ${stock.className}`}
                    >
                      {stock.text}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1.5"
                          onClick={() => openEdit(p)}
                        >
                          <PencilIcon className="size-3.5" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
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

  function updateField(k: keyof Product, v: any) {
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

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product.id ? "Edit Product" : "New Product"}
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleSubmit(e);
          }}
          className="space-y-5"
        >
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Name <span className="text-destructive">*</span>
            </label>
            <Input
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="e.g. Paracetamol"
              aria-invalid={!!errors.name}
              className="rounded-xl"
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Category
              </label>
              <Input
                value={form.category ?? ""}
                onChange={(e) => updateField("category", e.target.value)}
                placeholder="e.g. Bulk Chemical"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                SKU
              </label>
              <Input
                value={form.sku ?? ""}
                onChange={(e) => updateField("sku", e.target.value)}
                placeholder="SKU-001"
                className="rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Dimension
            </label>
            <select
              value={form.dimension}
              onChange={(e) => updateField("dimension", e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="WEIGHT">Weight (g / kg)</option>
              <option value="VOLUME">Volume (mL / L)</option>
              <option value="COUNT">Count (unit)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Price per base unit (₹){" "}
                <span className="text-destructive">*</span>
              </label>
              <Input
                type="number"
                step="0.0001"
                min="0"
                value={form.pricePerBaseUnit}
                onChange={(e) =>
                  updateField("pricePerBaseUnit", e.target.value)
                }
                placeholder="0.0000"
                aria-invalid={!!errors.pricePerBaseUnit}
                className="rounded-xl font-mono"
              />
              {errors.pricePerBaseUnit && (
                <p className="text-xs text-destructive">
                  {errors.pricePerBaseUnit}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Current stock
              </label>
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

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Reorder threshold
            </label>
            <Input
              type="number"
              step="0.0001"
              min="0"
              value={form.reorderThreshold ?? ""}
              onChange={(e) => updateField("reorderThreshold", e.target.value)}
              placeholder="Optional"
              className="rounded-xl font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Description
            </label>
            <textarea
              value={form.description ?? ""}
              onChange={(e) => updateField("description", e.target.value)}
              rows={2}
              placeholder="Optional description"
              className="w-full px-3 py-2 rounded-xl border border-input bg-background text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring resize-none"
            />
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Units
            </p>
            <div className="space-y-2 rounded-xl border border-border p-3">
              {(form.units || []).map((u: ProductUnit, i: number) => (
                <div key={i} className="flex gap-2 items-center text-sm">
                  <span className="w-16 font-mono bg-muted text-center text-xs py-1.5 rounded-lg border border-border">
                    {u.unit}
                  </span>
                  <input
                    value={u.label}
                    onChange={(e) => {
                      const u2 = [...form.units];
                      u2[i] = { ...u2[i], label: e.target.value };
                      setForm({ ...form, units: u2 } as Product);
                    }}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-input bg-background text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder="Label"
                  />
                  <input
                    value={u.amountInBase}
                    onChange={(e) => {
                      const u2 = [...form.units];
                      u2[i] = { ...u2[i], amountInBase: e.target.value };
                      setForm({ ...form, units: u2 } as Product);
                    }}
                    className="w-24 px-3 py-1.5 rounded-lg border border-input bg-background text-sm font-mono focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder="Base equiv."
                  />
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="rounded-xl gap-2"
            >
              {saving ? (
                <>
                  <Spinner size="sm" /> Saving...
                </>
              ) : product.id ? (
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
