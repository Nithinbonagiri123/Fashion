import { prisma } from "../../lib/db.js";

// Smart-merge an anonymous cart into the authenticated user's cart on login.
//
// Strategy:
//   - For every variant present in both carts, set qty = max(authQty, anonQty).
//     We choose max() to be most-customer-friendly: never silently shrink a
//     cart, never silently double it. Equal qty -> no-op.
//   - Variants only in the anon cart are inserted at the anon-snapshot price.
//   - Variants only in the auth cart are left alone.
//   - The anon cart is deleted at the end.
//
// All in a single serializable tx — concurrent merges (e.g. two tabs) collapse
// to a single observed result because we read both carts under the lock.

export interface MergeResult {
  authCartId: string;
  itemsAdded: number;
  itemsUpdated: number;
  anonCartDeleted: boolean;
}

export async function mergeAnonCartIntoUser(args: {
  userId: string;
  anonymousToken: string;
}): Promise<MergeResult> {
  return prisma.$transaction(async (tx) => {
    const anonCart = await tx.cart.findUnique({
      where: { anonymousToken: args.anonymousToken },
      include: { items: true },
    });
    if (!anonCart || anonCart.items.length === 0) {
      if (anonCart) await tx.cart.delete({ where: { id: anonCart.id } });
      const authCart = await getOrCreateUserCart(tx, args.userId);
      return { authCartId: authCart.id, itemsAdded: 0, itemsUpdated: 0, anonCartDeleted: !!anonCart };
    }

    const authCart = await getOrCreateUserCart(tx, args.userId);
    const authItems = await tx.cartItem.findMany({ where: { cartId: authCart.id } });
    const authByVariant = new Map(authItems.map((i) => [i.variantId, i]));

    let added = 0;
    let updated = 0;

    for (const anonItem of anonCart.items) {
      const existing = authByVariant.get(anonItem.variantId);
      if (!existing) {
        await tx.cartItem.create({
          data: {
            cartId: authCart.id,
            variantId: anonItem.variantId,
            quantity: anonItem.quantity,
            unitPriceCents: anonItem.unitPriceCents,
          },
        });
        added++;
        continue;
      }
      const merged = Math.max(existing.quantity, anonItem.quantity);
      if (merged !== existing.quantity) {
        await tx.cartItem.update({
          where: { id: existing.id },
          data: { quantity: merged },
        });
        updated++;
      }
    }

    await tx.cart.delete({ where: { id: anonCart.id } });

    return { authCartId: authCart.id, itemsAdded: added, itemsUpdated: updated, anonCartDeleted: true };
  }, { isolationLevel: "Serializable" });
}

async function getOrCreateUserCart(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  userId: string,
) {
  const existing = await tx.cart.findUnique({ where: { userId } });
  if (existing) return existing;
  return tx.cart.create({ data: { userId } });
}
