// ─── Unit conversion utilities ────────────────────────────────────────────────

export type UnitDimension = "WEIGHT" | "VOLUME" | "COUNT";

export const DIMENSION_UNITS: Record<UnitDimension, string[]> = {
  WEIGHT: ["g", "kg"],
  VOLUME: ["mL", "L"],
  COUNT: ["unit"],
};

export const DIMENSION_BASE: Record<UnitDimension, string> = {
  WEIGHT: "g",
  VOLUME: "mL",
  COUNT: "unit",
};

export const UNIT_LABELS: Record<string, string> = {
  g: "Grams (g)",
  kg: "Kilograms (kg)",
  mL: "Millilitres (mL)",
  L: "Litres (L)",
  unit: "Units",
};

// Conversion factors: how many base units = 1 of this unit?
export const UNIT_TO_BASE: Record<string, number> = {
  g: 1,
  kg: 1000,
  mL: 1,
  L: 1000,
  unit: 1,
};

export type Unit = keyof typeof UNIT_TO_BASE;

/**
 * Convert a quantity in `fromUnit` to base units.
 * Base: g (weight), mL (volume), unit (count)
 */
export function toBaseQty(qty: number | string, fromUnit: string): number {
  const factor = UNIT_TO_BASE[fromUnit] ?? 1;
  return Number(qty) * factor;
}

/**
 * Convert a quantity in base units to `toUnit`.
 */
export function fromBaseQty(baseQty: number, toUnit: string): number {
  const factor = UNIT_TO_BASE[toUnit] ?? 1;
  return baseQty / factor;
}

/**
 * Calculate line total in paisa given quantity + unit + price per base unit.
 */
export function calcLineTotalPaisa(
  qty: number,
  unit: string,
  pricePerBase: number
): number {
  const baseQty = toBaseQty(qty, unit);
  return Math.round(baseQty * pricePerBase);
}

/**
 * Convert paisa (int) to formatted INR string.
 */
export function paisaToInr(paisa: number): string {
  return `₹${(paisa / 100).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Format a decimal (numeric string or number) for display with given decimals.
 * Trims trailing zeros.
 */
export function formatDecimal(value: number | string, decimals = 4): string {
  return Number(value).toFixed(decimals).replace(/\.?0+$/, "");
}

/**
 * Format quantity with unit label, e.g. "500 g" or "2.5 kg"
 */
export function formatQty(baseQty: number, unit: string): string {
  const converted = fromBaseQty(baseQty, unit);
  return `${formatDecimal(converted, 3)} ${unit}`;
}

/**
 * Auto-select the most human-readable unit for a base quantity given its dimension.
 *
 * WEIGHT:  ≥ 1,000 g  → display in kg  (e.g. 2500 g  → "2.5 kg")
 *          < 1,000 g  → display in g    (e.g. 750 g   → "750 g")
 * VOLUME:  ≥ 1,000 mL → display in L   (e.g. 3000 mL → "3 L")
 *          < 1,000 mL → display in mL   (e.g. 500 mL  → "500 mL")
 * COUNT:   always "unit"
 *
 * Returns { value, unit, display } — display = "2.5 kg"
 */
export function smartUnit(
  baseQty: number,
  dimension: UnitDimension
): { value: number; unit: string; display: string } {
  if (dimension === "WEIGHT") {
    if (Math.abs(baseQty) >= 1000) {
      const v = baseQty / 1000;
      return { value: v, unit: "kg", display: `${+v.toFixed(4).replace(/\.?0+$/, "")} kg` };
    }
    return { value: baseQty, unit: "g", display: `${+baseQty.toFixed(4).replace(/\.?0+$/, "")} g` };
  }
  if (dimension === "VOLUME") {
    if (Math.abs(baseQty) >= 1000) {
      const v = baseQty / 1000;
      return { value: v, unit: "L", display: `${+v.toFixed(4).replace(/\.?0+$/, "")} L` };
    }
    return { value: baseQty, unit: "mL", display: `${+baseQty.toFixed(4).replace(/\.?0+$/, "")} mL` };
  }
  // COUNT
  return { value: baseQty, unit: "unit", display: `${+baseQty.toFixed(2).replace(/\.?0+$/, "")} unit` };
}

/**
 * Smart display string for a base quantity + dimension.
 * e.g. smartFormatQty(2500, "WEIGHT") → "2.5 kg"
 */
export function smartFormatQty(baseQty: number, dimension: UnitDimension): string {
  return smartUnit(baseQty, dimension).display;
}

/**
 * Full display: shows human unit + base unit in parentheses for transparency.
 * e.g. formatQtyBoth(2500, "WEIGHT") → "2.5 kg (2,500 g)"
 * e.g. formatQtyBoth(750, "WEIGHT")  → "750 g"  (no duplicate when same unit)
 */
export function formatQtyBoth(baseQty: number, dimension: UnitDimension): string {
  const { display, unit } = smartUnit(baseQty, dimension);
  const baseUnit = DIMENSION_BASE[dimension];
  if (unit === baseUnit) return display; // already in base unit, no duplication
  const baseLabel = baseQty.toLocaleString("en-IN", { maximumFractionDigits: 2 });
  return `${display} (${baseLabel} ${baseUnit})`;
}

/**
 * Format an ordered qty in its order unit, showing base equivalent in parens.
 * e.g. formatOrderQty("2", "kg", "WEIGHT") → "2 kg (2,000 g)"
 */
export function formatOrderQty(
  orderQty: number | string,
  orderUnit: string,
  dimension: UnitDimension
): string {
  const qty = Number(orderQty);
  const baseQty = toBaseQty(qty, orderUnit);
  const baseUnit = DIMENSION_BASE[dimension];
  const displayQty = `${+qty.toFixed(4).replace(/\.?0+$/, "")} ${orderUnit}`;
  if (orderUnit === baseUnit) return displayQty;
  const baseLabel = baseQty.toLocaleString("en-IN", { maximumFractionDigits: 2 });
  return `${displayQty} (${baseLabel} ${baseUnit})`;
}

/**
 * Format price per base unit with the base unit appended.
 * e.g. formatPricePerBase("0.05", "WEIGHT") → "₹0.05/g"
 *      For display purposes, also convert: "₹50/kg" if ≥1000
 */
export function formatPricePerBase(pricePerBase: number | string, dimension: UnitDimension): string {
  const p = Number(pricePerBase);
  const baseUnit = DIMENSION_BASE[dimension];
  return `₹${p.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}/${baseUnit}`;
}