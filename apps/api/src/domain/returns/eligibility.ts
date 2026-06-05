import { ReturnItemStatus } from "@prisma/client";
import { prisma } from "../../lib/db.js";
import { Errors } from "../../lib/errors.js";

export const RETURN_WINDOW_DAYS = 30;

export interface EligibilityResult {
  orderItemId: string;
  orderId: string;
  userId: string;
  variantId: string;
  unitPriceCents: number;
  lineTotalCents: number;
  quantity: number;
  currency: string;
}

// Authoritative gate for "can this user return this item right now?".
// Always called inside a transaction before transitioning state.
export async function assertEligibleForReturn(args: {
  orderItemId: string;
  userId: string;
  now?: Date;
}): Promise<EligibilityResult> {
  const now = args.now ?? new Date();

  const item = await prisma.orderItem.findUnique({
    where: { id: args.orderItemId },
    include: {
      order: { select: { id: true, userId: true, currency: true, status: true } },
    },
  });

  if (!item) throw Errors.notFound("Order item not found");
  if (item.order.userId !== args.userId) throw Errors.forbidden("Not your order");

  if (item.returnStatus !== ReturnItemStatus.NOT_RETURNED) {
    throw Errors.returnIneligible(`Item already in return state ${item.returnStatus}`);
  }

  if (item.order.status !== "DELIVERED" && item.order.status !== "FULFILLED") {
    throw Errors.returnIneligible("Order has not been delivered");
  }

  if (!item.deliveredAt) {
    throw Errors.returnIneligible("Delivery date missing — cannot evaluate return window");
  }

  const cutoff = new Date(item.deliveredAt.getTime() + RETURN_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  if (now > cutoff) {
    throw Errors.returnIneligible(`Return window expired (${RETURN_WINDOW_DAYS} days from delivery)`);
  }

  return {
    orderItemId: item.id,
    orderId: item.order.id,
    userId: item.order.userId,
    variantId: item.variantId,
    unitPriceCents: item.unitPriceCents,
    lineTotalCents: item.lineTotalCents,
    quantity: item.quantity,
    currency: item.order.currency,
  };
}
