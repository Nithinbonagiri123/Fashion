import { env } from "../../lib/env.js";

// Flat-rate pricing. The defining property of "flat-rate" here is that
// shipping is a single per-order amount and tax is a single bps multiplier
// applied to the subtotal — no per-zone, per-product, or per-jurisdiction
// math. All values come from env so ops can tweak without a redeploy.

export interface PricingLine {
  variantId: string;
  unitPriceCents: number;
  quantity: number;
}

export interface PricingBreakdown {
  subtotalCents: number;
  shippingCents: number;
  taxCents: number;
  discountCents: number;
  totalCents: number;
  currency: string;
}

export interface PricingInput {
  lines: PricingLine[];
  walletRedemptionCents?: number;
  currency: string;
}

export function priceCheckout(input: PricingInput): PricingBreakdown {
  const subtotal = input.lines.reduce(
    (acc, l) => acc + l.unitPriceCents * l.quantity,
    0,
  );

  // Apply wallet redemption against subtotal only — tax is still computed on
  // the pre-redemption amount because store credit is a payment instrument,
  // not a discount. (Tax-on-store-credit rules vary by jurisdiction; we side
  // with the most conservative reading for v1.)
  const discount = clamp(input.walletRedemptionCents ?? 0, 0, subtotal);

  const tax = Math.round((subtotal * env.FLAT_TAX_BPS) / 10_000);
  const shipping = subtotal > 0 ? env.FLAT_SHIPPING_CENTS : 0;
  const total = subtotal + tax + shipping - discount;

  return {
    subtotalCents: subtotal,
    shippingCents: shipping,
    taxCents: tax,
    discountCents: discount,
    totalCents: total,
    currency: input.currency,
  };
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}
