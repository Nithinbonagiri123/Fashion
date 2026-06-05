import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { api, ApiError, type ApiProduct } from "@/lib/api";
import { legacyIdFromSlug } from "@/lib/product-helpers";
import { getGarmentImageLarge } from "@/lib/imageMap";
import ProductDetailClient from "./ProductDetailClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function loadProduct(slug: string): Promise<ApiProduct | null> {
  try {
    return await api.getProduct(slug);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await loadProduct(slug);
  if (!product) return { title: "Not found" };
  return {
    title: `${product.name} — Vastra Virasat`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await loadProduct(slug);
  if (!product) notFound();

  const legacyId = legacyIdFromSlug(slug);
  const heroImage = legacyId ? getGarmentImageLarge(legacyId) : product.imageUrls[0] ?? "";

  return <ProductDetailClient product={product} heroImage={heroImage} />;
}
