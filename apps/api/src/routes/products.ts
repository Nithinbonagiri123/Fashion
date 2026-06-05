import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/db.js";
import { Errors } from "../lib/errors.js";

const listQuery = z.object({
  category: z.enum(["women", "men", "accessories", "bridal"]).optional(),
  limit: z.coerce.number().int().positive().max(100).default(60),
});

export const productRoutes: FastifyPluginAsync = async (app) => {
  app.get("/api/products", async (req) => {
    const q = listQuery.parse(req.query);
    const products = await prisma.product.findMany({
      where: {
        isPublished: true,
        ...(q.category ? { category: q.category } : {}),
      },
      take: q.limit,
      orderBy: { createdAt: "desc" },
      include: {
        variants: {
          where: { isActive: true },
          orderBy: { size: "asc" },
        },
      },
    });
    return { products: products.map(serialize) };
  });

  app.get("/api/products/:slug", async (req) => {
    const params = z.object({ slug: z.string().min(1) }).parse(req.params);
    const product = await prisma.product.findUnique({
      where: { slug: params.slug },
      include: {
        variants: {
          where: { isActive: true },
          orderBy: { size: "asc" },
        },
      },
    });
    if (!product || !product.isPublished) throw Errors.notFound("Product not found");
    return serialize(product);
  });
};

type ProductWithVariants = Awaited<ReturnType<typeof prisma.product.findUnique<{
  include: { variants: true };
}>>>;

function serialize(p: NonNullable<ProductWithVariants>) {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    brand: p.brand,
    category: p.category,
    basePriceCents: p.basePriceCents,
    currency: p.currency,
    imageUrls: p.imageUrls,
    variants: p.variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      size: v.size,
      color: v.color,
      priceCents: v.priceCentsOverride ?? p.basePriceCents,
      inStock: v.warehouseStock - v.reservedStock > 0,
    })),
  };
}
