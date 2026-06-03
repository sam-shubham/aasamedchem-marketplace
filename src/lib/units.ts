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