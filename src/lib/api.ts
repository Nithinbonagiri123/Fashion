// Typed client for the Fastify backend at apps/api.
//
// All cart/auth calls use credentials: "include" so the httpOnly anon-cart
// and session cookies flow with each request. The base URL is configurable
// via NEXT_PUBLIC_API_URL.

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export interface ApiVariant {
  id: string;
  sku: string;
  size: string;
  color: string;
  priceCents: number;
  inStock: boolean;
}

export interface ApiProduct {
  id: string;
  slug: string;
  name: string;
  description: string;
  brand: string;
  category: string;
  basePriceCents: number;
  currency: string;
  imageUrls: string[];
  variants: ApiVariant[];
}

export interface ApiCartItem {
  id: string;
  variantId: string;
  productId: string;
  productSlug: string;
  productName: string;
  imageUrl: string | null;
  size: string;
  color: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
}

export interface ApiCart {
  id: string | null;
  items: ApiCartItem[];
  subtotalCents: number;
  itemCount: number;
  currency: string;
}

export class ApiError extends Error {
  constructor(public readonly status: number, public readonly code: string, message: string) {
    super(message);
  }
}

async function request<T>(
  path: string,
  opts: { method?: string; body?: unknown; cache?: RequestCache } = {},
): Promise<T> {
  const init: RequestInit = {
    method: opts.method ?? "GET",
    credentials: "include",
    headers: { "content-type": "application/json" },
    ...(opts.cache ? { cache: opts.cache } : {}),
  };
  if (opts.body !== undefined) init.body = JSON.stringify(opts.body);
  const res = await fetch(`${API_URL}${path}`, init);
  if (!res.ok) {
    let code = "INTERNAL";
    let message = res.statusText;
    try {
      const j = (await res.json()) as { error?: { code?: string; message?: string } };
      code = j.error?.code ?? code;
      message = j.error?.message ?? message;
    } catch {}
    throw new ApiError(res.status, code, message);
  }
  return res.json() as Promise<T>;
}

export const api = {
  getProduct: (slug: string) =>
    request<ApiProduct>(`/api/products/${encodeURIComponent(slug)}`, { cache: "no-store" }),

  getCart: () => request<ApiCart>("/api/cart"),

  addToCart: (variantId: string, quantity: number) =>
    request<ApiCart>("/api/cart/items", {
      method: "POST",
      body: { variantId, quantity },
    }),

  updateCartItem: (itemId: string, quantity: number) =>
    request<ApiCart>(`/api/cart/items/${itemId}`, {
      method: "PATCH",
      body: { quantity },
    }),

  removeCartItem: (itemId: string) =>
    request<ApiCart>(`/api/cart/items/${itemId}`, { method: "DELETE" }),
};
