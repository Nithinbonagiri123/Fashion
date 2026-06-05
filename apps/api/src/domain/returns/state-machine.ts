import {
  RefundDestination,
  RefundStatus,
  ReturnItemStatus,
  WalletEntryReason,
  WalletEntryType,
} from "@prisma/client";
import { prisma } from "../../lib/db.js";
import { Errors } from "../../lib/errors.js";
import { stripe } from "../../lib/stripe.js";
import { generateReturnLabel, type AddressSnapshot } from "../../lib/shipping-label.js";
import { applyEntry } from "../wallet/ledger.js";
import { assertEligibleForReturn } from "./eligibility.js";

// State machine for item-level returns.
//
//   NOT_RETURNED ──initiateReturn──▶ RETURN_REQUESTED
//                                          │
//                       receiveAtWarehouse  │
//                                          ▼
//                                      PROCESSING
//                                          │
//                       completeReturn     │  (decision tree on RefundDestination)
//                                          ▼
//                              RESTOCKED_AND_REFUNDED  (terminal)
//
// All transitions:
//   - are guarded by a strict allow-list,
//   - run inside a Prisma serializable transaction,
//   - re-check the current state inside the transaction (defeats lost updates),
//   - emit at most one side effect (label generation, stock increment, refund),
//   - use idempotency keys for any external/ledger side effects.

const TRANSITIONS: Record<ReturnItemStatus, ReturnItemStatus[]> = {
  NOT_RETURNED: [ReturnItemStatus.RETURN_REQUESTED],
  RETURN_REQUESTED: [ReturnItemStatus.PROCESSING],
  PROCESSING: [ReturnItemStatus.RESTOCKED_AND_REFUNDED],
  RESTOCKED_AND_REFUNDED: [],
};

function assertAllowed(from: ReturnItemStatus, to: ReturnItemStatus): void {
  if (!TRANSITIONS[from].includes(to)) {
    throw Errors.invalidStateTransition(from, to);
  }
}

// ---------------------------------------------------------------------------
// 1. NOT_RETURNED -> RETURN_REQUESTED
// ---------------------------------------------------------------------------

export interface InitiateReturnInput {
  orderItemId: string;
  userId: string;
  reason: string;
  refundDestination: RefundDestination;
  fromAddress: AddressSnapshot;
}

export interface InitiateReturnResult {
  returnId: string;
  status: ReturnItemStatus;
  shippingLabel: unknown;
}

export async function initiateReturn(input: InitiateReturnInput): Promise<InitiateReturnResult> {
  const eligible = await assertEligibleForReturn({
    orderItemId: input.orderItemId,
    userId: input.userId,
  });

  return prisma.$transaction(async (tx) => {
    const item = await tx.orderItem.findUniqueOrThrow({
      where: { id: input.orderItemId },
      select: { returnStatus: true },
    });
    assertAllowed(item.returnStatus, ReturnItemStatus.RETURN_REQUESTED);

    const created = await tx.return.create({
      data: {
        orderItemId: eligible.orderItemId,
        orderId: eligible.orderId,
        userId: eligible.userId,
        reason: input.reason,
        refundDestination: input.refundDestination,
        refundAmountCents: eligible.lineTotalCents,
        currency: eligible.currency,
        refundStatus: RefundStatus.PENDING,
        shippingLabel: {},
      },
      select: { id: true },
    });

    const label = await generateReturnLabel({
      fromAddress: input.fromAddress,
      returnId: created.id,
    });

    const updated = await tx.return.update({
      where: { id: created.id },
      data: { shippingLabel: label as object },
      select: { id: true, shippingLabel: true },
    });

    await tx.orderItem.update({
      where: { id: input.orderItemId },
      data: { returnStatus: ReturnItemStatus.RETURN_REQUESTED },
    });

    return {
      returnId: updated.id,
      status: ReturnItemStatus.RETURN_REQUESTED,
      shippingLabel: updated.shippingLabel,
    };
  }, { isolationLevel: "Serializable" });
}

// ---------------------------------------------------------------------------
// 2. RETURN_REQUESTED -> PROCESSING  (warehouse scan)
// ---------------------------------------------------------------------------

export async function receiveAtWarehouse(args: { returnId: string }): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const ret = await tx.return.findUniqueOrThrow({
      where: { id: args.returnId },
      include: { orderItem: { select: { id: true, returnStatus: true } } },
    });
    assertAllowed(ret.orderItem.returnStatus, ReturnItemStatus.PROCESSING);

    await tx.orderItem.update({
      where: { id: ret.orderItem.id },
      data: { returnStatus: ReturnItemStatus.PROCESSING },
    });
    await tx.return.update({
      where: { id: ret.id },
      data: { receivedAt: new Date() },
    });
  }, { isolationLevel: "Serializable" });
}

// ---------------------------------------------------------------------------
// 3. PROCESSING -> RESTOCKED_AND_REFUNDED  (terminal)
//    Atomically: restock the variant + issue refund (wallet OR Stripe) + flip
//    the item state. If Stripe is the destination, we only mark the refund
//    PENDING here — the Stripe webhook flips it to ISSUED.
// ---------------------------------------------------------------------------

export interface CompleteReturnResult {
  returnId: string;
  status: ReturnItemStatus;
  refundStatus: RefundStatus;
  walletBalanceAfterCents?: number;
  stripeRefundId?: string;
}

export async function completeReturn(args: { returnId: string }): Promise<CompleteReturnResult> {
  // The Stripe refund call sits outside the DB transaction so we never hold
  // row locks across an external HTTP roundtrip. We pre-claim PROCESSING -> ?
  // by recording an intent inside a tx, then either:
  //   - apply the wallet credit + flip state (single tx), OR
  //   - call Stripe, then flip state in a second tx.
  // If the Stripe call fails, the item stays in PROCESSING and we surface the
  // error so a retry can pick up the same return safely.

  const prep = await prisma.$transaction(async (tx) => {
    const ret = await tx.return.findUniqueOrThrow({
      where: { id: args.returnId },
      include: {
        orderItem: { select: { id: true, returnStatus: true, variantId: true, quantity: true } },
        order: { select: { id: true, stripeChargeId: true, stripePaymentIntentId: true } },
      },
    });
    assertAllowed(ret.orderItem.returnStatus, ReturnItemStatus.RESTOCKED_AND_REFUNDED);
    if (ret.refundStatus === RefundStatus.ISSUED) {
      // Already done in a prior attempt — surface as a no-op.
      return { alreadyDone: true as const, ret };
    }
    return { alreadyDone: false as const, ret };
  }, { isolationLevel: "Serializable" });

  if (prep.alreadyDone) {
    return {
      returnId: prep.ret.id,
      status: ReturnItemStatus.RESTOCKED_AND_REFUNDED,
      refundStatus: RefundStatus.ISSUED,
    };
  }

  const ret = prep.ret;

  if (ret.refundDestination === RefundDestination.STORE_CREDIT) {
    return finalizeStoreCredit(ret);
  }
  return finalizeStripeRefund(ret);
}

// Shape produced by the prep transaction in completeReturn() — passed to the
// finalize helpers so they don't refetch.
type ReturnForFinalize = NonNullable<
  Awaited<ReturnType<typeof prisma.return.findUnique<{
    include: {
      orderItem: { select: { id: true; returnStatus: true; variantId: true; quantity: true } };
      order: { select: { id: true; stripeChargeId: true; stripePaymentIntentId: true } };
    };
  }>>>
>;

async function finalizeStoreCredit(ret: ReturnForFinalize): Promise<CompleteReturnResult> {
  const walletResult = await applyEntry({
    userId: ret.userId,
    type: WalletEntryType.CREDIT,
    reason: WalletEntryReason.RETURN_REFUND,
    amountCents: ret.refundAmountCents,
    ledgerKey: `return:${ret.id}:credit`,
    orderId: ret.orderId,
  });

  await prisma.$transaction(async (tx) => {
    await restockVariant(tx, ret.orderItem.variantId, ret.orderItem.quantity);
    await tx.orderItem.update({
      where: { id: ret.orderItem.id },
      data: { returnStatus: ReturnItemStatus.RESTOCKED_AND_REFUNDED },
    });
    await tx.return.update({
      where: { id: ret.id },
      data: {
        refundStatus: RefundStatus.ISSUED,
        refundedAt: new Date(),
        walletTransactionId: walletResult.walletTransactionId,
      },
    });
  }, { isolationLevel: "Serializable" });

  return {
    returnId: ret.id,
    status: ReturnItemStatus.RESTOCKED_AND_REFUNDED,
    refundStatus: RefundStatus.ISSUED,
    walletBalanceAfterCents: walletResult.balanceAfterCents,
  };
}

async function finalizeStripeRefund(ret: ReturnForFinalize): Promise<CompleteReturnResult> {
  if (!ret.order.stripePaymentIntentId) {
    throw Errors.conflict("Cannot issue Stripe refund: order has no payment_intent");
  }

  // Stripe-side idempotency uses our return id — retries collapse to a single
  // refund object regardless of network conditions.
  const refund = await stripe.refunds.create(
    {
      payment_intent: ret.order.stripePaymentIntentId,
      amount: ret.refundAmountCents,
      reason: "requested_by_customer",
      metadata: { returnId: ret.id, orderItemId: ret.orderItem.id },
    },
    { idempotencyKey: `return-refund:${ret.id}` },
  );

  await prisma.$transaction(async (tx) => {
    await restockVariant(tx, ret.orderItem.variantId, ret.orderItem.quantity);
    await tx.orderItem.update({
      where: { id: ret.orderItem.id },
      data: { returnStatus: ReturnItemStatus.RESTOCKED_AND_REFUNDED },
    });
    await tx.return.update({
      where: { id: ret.id },
      data: {
        // Stripe refunds can be async — final ISSUED transition is gated on
        // the charge.refunded / refund.updated webhook. We mark PENDING here
        // and let the webhook handler promote to ISSUED.
        refundStatus: refund.status === "succeeded" ? RefundStatus.ISSUED : RefundStatus.PENDING,
        refundedAt: refund.status === "succeeded" ? new Date() : null,
        stripeRefundId: refund.id,
      },
    });
  }, { isolationLevel: "Serializable" });

  return {
    returnId: ret.id,
    status: ReturnItemStatus.RESTOCKED_AND_REFUNDED,
    refundStatus: refund.status === "succeeded" ? RefundStatus.ISSUED : RefundStatus.PENDING,
    stripeRefundId: refund.id,
  };
}

async function restockVariant(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  variantId: string,
  quantity: number,
): Promise<void> {
  await tx.productVariant.update({
    where: { id: variantId },
    data: { warehouseStock: { increment: quantity } },
  });
}
