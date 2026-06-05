import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/db.js";
import { Errors } from "../lib/errors.js";
import { ensureAnonCartToken } from "../middleware/anon-cart.js";

// Cart resolution: prefer authenticated user's cart, else fall back to the
// anonymous cookie-based cart. We auto-provision both — the first POST to
// /api/cart/items will create the cart if it doesn't exist yet.

async function resolveCart(req: FastifyRequest, reply: FastifyReply, opts: { create: boolean }) {
  if (req.auth?.userId) {
    const existing = await prisma.cart.findUnique({
      where: { userId: req.auth.userId },
      include: cartInclude,
    });
    if (existing) return existing;
    if (!opts.create) return null;
    return prisma.cart.create({
      data: { userId: req.auth.userId },
      include: cartInclude,
    });
  }

  const token = await ensureAnonCartToken(req, reply);
  const existing = await prisma.cart.findUnique({
    where: { anonymousToken: token },
    include: cartInclude,
  });
  if (existing) return existing;
  if (!opts.create) return null;
  return prisma.cart.create({
    data: { anonymousToken: token },
    include: cartInclude,
  });
}

const cartInclude = {
  items: {
    include: {
      variant: {
        include: {
          product: {
            select: {
              id: true,
              slug: true,
              name: true,
              imageUrls: true,
              currency: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  },
} as const;

type CartWithItems = NonNullable<Awaited<ReturnType<typeof resolveCart>>>;

function serializeCart(cart: CartWithItems) {
  const items = cart.items.map((it) => {
    const unit = it.unitPriceCents;
    return {
      id: it.id,
      variantId: it.variantId,
      productId: it.variant.product.id,
      productSlug: it.variant.product.slug,
      productName: it.variant.product.name,
      imageUrl: it.variant.product.imageUrls[0] ?? null,
      size: it.variant.size,
      color: it.variant.color,
      quantity: it.quantity,
      unitPriceCents: unit,
      lineTotalCents: unit * it.quantity,
    };
  });
  const subtotalCents = items.reduce((acc, i) => acc + i.lineTotalCents, 0);
  return {
    id: cart.id,
    items,
    subtotalCents,
    itemCount: items.reduce((acc, i) => acc + i.quantity, 0),
    currency: cart.items[0]?.variant.product.currency ?? "USD",
  };
}

const addBody = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().int().positive().max(99),
});
const updateBody = z.object({ quantity: z.number().int().min(0).max(99) });

export const cartRoutes: FastifyPluginAsync = async (app) => {
  app.get("/api/cart", async (req, reply) => {
    const cart = await resolveCart(req, reply, { create: false });
    if (!cart) return { id: null, items: [], subtotalCents: 0, itemCount: 0, currency: "USD" };
    return serializeCart(cart);
  });

  app.post("/api/cart/items", async (req, reply) => {
    const body = addBody.parse(req.body);
    const variant = await prisma.productVariant.findUnique({
      where: { id: body.variantId },
      include: { product: { select: { basePriceCents: true } } },
    });
    if (!variant || !variant.isActive) throw Errors.notFound("Variant not available");
    if (variant.warehouseStock - variant.reservedStock < body.quantity) {
      throw Errors.insufficientStock(variant.id);
    }
    const unit = variant.priceCentsOverride ?? variant.product.basePriceCents;

    const cart = await resolveCart(req, reply, { create: true });
    if (!cart) throw Errors.notFound("Could not resolve cart");

    await prisma.cartItem.upsert({
      where: { cartId_variantId: { cartId: cart.id, variantId: variant.id } },
      create: {
        cartId: cart.id,
        variantId: variant.id,
        quantity: body.quantity,
        unitPriceCents: unit,
      },
      update: {
        quantity: { increment: body.quantity },
      },
    });

    const refreshed = await prisma.cart.findUniqueOrThrow({
      where: { id: cart.id },
      include: cartInclude,
    });
    return reply.status(200).send(serializeCart(refreshed));
  });

  app.patch("/api/cart/items/:itemId", async (req, reply) => {
    const params = z.object({ itemId: z.string().uuid() }).parse(req.params);
    const body = updateBody.parse(req.body);

    const cart = await resolveCart(req, reply, { create: false });
    if (!cart) throw Errors.notFound("Cart not found");
    const owned = cart.items.find((i) => i.id === params.itemId);
    if (!owned) throw Errors.notFound("Item not in cart");

    if (body.quantity === 0) {
      await prisma.cartItem.delete({ where: { id: params.itemId } });
    } else {
      await prisma.cartItem.update({
        where: { id: params.itemId },
        data: { quantity: body.quantity },
      });
    }

    const refreshed = await prisma.cart.findUniqueOrThrow({
      where: { id: cart.id },
      include: cartInclude,
    });
    return serializeCart(refreshed);
  });

  app.delete("/api/cart/items/:itemId", async (req, reply) => {
    const params = z.object({ itemId: z.string().uuid() }).parse(req.params);
    const cart = await resolveCart(req, reply, { create: false });
    if (!cart) throw Errors.notFound("Cart not found");
    const owned = cart.items.find((i) => i.id === params.itemId);
    if (!owned) throw Errors.notFound("Item not in cart");
    await prisma.cartItem.delete({ where: { id: params.itemId } });
    const refreshed = await prisma.cart.findUniqueOrThrow({
      where: { id: cart.id },
      include: cartInclude,
    });
    return serializeCart(refreshed);
  });
};
