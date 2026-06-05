import { randomBytes } from "node:crypto";

// Mocked carrier label generator. Real integrations (Shippo, EasyPost, USPS)
// would replace this with an API call; the call site contract — Promise<ReturnShippingLabel>
// — stays the same.

export interface ReturnShippingLabel {
  carrier: "USPS" | "UPS" | "FEDEX";
  service: string;
  trackingNumber: string;
  labelUrl: string;
  labelFormat: "PDF" | "ZPL";
  createdAt: string;
  expiresAt: string;
  fromAddress: AddressSnapshot;
  toAddress: AddressSnapshot;
}

export interface AddressSnapshot {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  region: string;
  postalCode: string;
  countryCode: string;
}

const WAREHOUSE: AddressSnapshot = {
  fullName: "Demand Fashion Returns",
  line1: "1 Logistics Way",
  city: "Newark",
  region: "NJ",
  postalCode: "07102",
  countryCode: "US",
};

export async function generateReturnLabel(args: {
  fromAddress: AddressSnapshot;
  returnId: string;
}): Promise<ReturnShippingLabel> {
  const now = new Date();
  const expires = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30);
  const trackingNumber = "9400" + randomBytes(8).toString("hex").toUpperCase();

  return {
    carrier: "USPS",
    service: "Ground Advantage Return",
    trackingNumber,
    labelUrl: `https://labels.example.com/${args.returnId}.pdf`,
    labelFormat: "PDF",
    createdAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    fromAddress: args.fromAddress,
    toAddress: WAREHOUSE,
  };
}
