// Shared synthesis helpers for turning the legacy in-memory garment catalog
// into seeded products + variants. The same shape is exposed to the API so
// the frontend can rely on a single price/slug definition.

export interface GarmentSeed {
  id: string;
  name: string;
  description: string;
  fabric_info: string;
  image_filename: string;
  like_count: number;
  category: "women" | "men" | "accessories" | "bridal";
  subcategory: string;
  on_sale?: boolean;
}

export function toSlug(g: { id: string; name: string }): string {
  const base = g.name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
  return `${base}-${g.id}`;
}

// Subcategory price bands (USD, cents). Range gives a deterministic spread
// based on id so the same garment always gets the same price across reseeds.
const PRICE_BANDS: Record<string, [number, number]> = {
  Sarees: [8900, 18900],
  Lehengas: [29900, 89900],
  "Bridal Sarees": [49900, 99900],
  "Bridal Lehengas": [79900, 189900],
  "Bridal Jewelry": [29900, 79900],
  Kurtas: [5900, 12900],
  Suits: [9900, 22900],
  Gowns: [19900, 39900],
  Sherwanis: [24900, 44900],
  Jackets: [12900, 18900],
  Dupattas: [3900, 7900],
  Shawls: [9900, 17900],
  Jewelry: [7900, 49900],
  Bags: [4900, 12900],
};

export function basePriceCents(g: GarmentSeed): number {
  const band = PRICE_BANDS[g.subcategory] ?? [9900, 19900];
  const [lo, hi] = band;
  // Deterministic numeric hash of id → spreads prices within the band.
  const n = Number.parseInt(g.id.slice(1), 10);
  const t = ((n * 9301 + 49297) % 233280) / 233280;
  const cents = Math.round(lo + t * (hi - lo));
  // Snap to $X.99 endings for retail polish.
  return Math.round(cents / 100) * 100 - 1;
}

export function effectivePriceCents(g: GarmentSeed): number {
  const base = basePriceCents(g);
  return g.on_sale ? Math.round(base * 0.75) - 1 : base;
}

const SIZE_SETS = {
  womenApparel: ["XS", "S", "M", "L", "XL"],
  menApparel: ["S", "M", "L", "XL", "XXL"],
  oneSize: ["ONE_SIZE"],
};

const ACCESSORY_SUBCATS = new Set(["Dupattas", "Shawls", "Jewelry", "Bridal Jewelry", "Bags"]);

export function sizesFor(g: GarmentSeed): string[] {
  if (ACCESSORY_SUBCATS.has(g.subcategory)) return SIZE_SETS.oneSize;
  if (g.category === "men") return SIZE_SETS.menApparel;
  return SIZE_SETS.womenApparel;
}

// One canonical color per garment. We try to extract from the name (after an
// em-dash or " — "), otherwise fall back to a category-appropriate default.
export function colorFor(g: GarmentSeed): string {
  const m = g.name.match(/—\s*(.+?)\s*$/);
  if (m && m[1]) return m[1].trim();
  return "Natural";
}

export function skuFor(g: GarmentSeed, size: string): string {
  return `VV-${g.id.toUpperCase()}-${size.replace(/_/g, "")}`;
}

// Image URLs: the frontend already serves these from a local map, but for the
// API response we synthesize a stable public path so other clients can render.
export function imageUrlFor(g: GarmentSeed): string {
  return `/garments/${g.image_filename}`;
}
