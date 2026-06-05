import { type Garment } from "./garmentData";

// Mirror of apps/api/src/lib/product-helpers.ts — kept in sync so the
// frontend can build product URLs from local garment data without round-
// tripping to the API just to discover the slug.

export function toSlug(g: { id: string; name: string }): string {
  const base = g.name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
  return `${base}-${g.id}`;
}

// Pull the legacy g0X id back out of a slug so we can index into imageMap.
export function legacyIdFromSlug(slug: string): string | null {
  const m = slug.match(/-(g\d+)$/);
  return m && m[1] ? m[1] : null;
}

export function productHref(g: { id: string; name: string }): string {
  return `/products/${toSlug(g)}`;
}

export function formatPrice(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

// Display-only helper used by GarmentCard. Mirrors the seed's price formula
// so cards can show a price without a network roundtrip. The authoritative
// price still lives on the variant returned by the API.
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

export function previewPriceCents(g: Garment): { base: number; sale: number | null } {
  const band = PRICE_BANDS[g.subcategory] ?? [9900, 19900];
  const [lo, hi] = band;
  const n = Number.parseInt(g.id.slice(1), 10);
  const t = ((n * 9301 + 49297) % 233280) / 233280;
  const cents = Math.round(lo + t * (hi - lo));
  const base = Math.round(cents / 100) * 100 - 1;
  const sale = g.on_sale ? Math.round(base * 0.75) - 1 : null;
  return { base, sale };
}
