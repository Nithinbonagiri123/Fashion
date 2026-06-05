import type Stripe from "stripe";
import { OrderStatus, RefundStatus } from "@prisma/client";
import { prisma } from "../../lib/db.js";
import { Errors } from "../../lib/errors.js";

const PROVIDER = "stripe";

// Single entry point for verified Stripe events. Caller (HTTP handler) is
// responsible for signature verification — by the time we reach handleStripeEvent
// the event is trusted.
//
// Guarantees:
//   - Each event is processed at most once (WebhookEvent.providerEventId unique).
//   - Order state transitions are gated on the current state inside a tx — we
//     never blindly write PAID from a duplicate event.
//   - Stock is decremented exactly once per order on first successful payment.

export async function handleStripeEvent(event: Stripe.Event): Promise<{ alreadyProcessed: boolean }> {
  const claim = await claimEvent(event);
  if (claim.alreadyProcessed) return { alreadyProcessed: true };

  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        await onPaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      case "payment_intent.payment_failed":
        await onPaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      case "charge.refunded":
      case "refund.updated":
        await onRefundUpdated(event.data.object as Stripe.Charge | Stripe.Refund);
        break;
      default:
        // We accept-and-ignore unknown event types so Stripe doesn't retry,
        // but we still record them in WebhookEvent for forensic value.
        break;
    }
    await prisma.webhookEvent.update({
      where: { id: claim.id },
      data: { processedAt: new Date() },
    });
  } catch (err) {
    await prisma.webhookEvent.update({
      where: { id: claim.id },
      data: { processingError: err instanceof Error ? err.message : String(err) },
    });
    throw err;
  }
  return { alreadyProcessed: false };
}

async function claimEvent(event: Stripe.Event): Promise<{ id: string; alreadyProcessed: boolean }> {
  try {
    const created = await prisma.webhookEvent.create({
      data: {
        provider: PROVIDER,
        providerEventId: event.id,
        type: event.type,
        payload: event as unknown as object,
      },
      select: { id: true, processedAt: true },
    });
    return { id: created.id, alreadyProcessed: false };
  } catch (err) {
    const existing = await prisma.webhookEvent.findUnique({
      where: { provider_providerEventId: { provider: PROVIDER, providerEventId: event.id } },
      select: { id: true, processedAt: true },
    });
    if (!existing) throw err;
    return { id: existing.id, alreadyProcessed: existing.processedAt != null };
  }
}

// ---------------------------------------------------------------------------
// payment_intent.succeeded -> Order.PENDING -> Order.PAID + stock decrement
// ---------------------------------------------------------------------------

async function onPaymentIntentSucceeded(pi: Stripe.PaymentIntent): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { stripePaymentIntentId: pi.id },
      include: { items: { select: { id: true, variantId: true, quantity: true } } },
    });
    if (!order) {
      // Unknown PI — could be a test event or another integration sharing
      // the same Stripe account. Log via the WebhookEvent.processingError
      // path by throwing.
      throw Errors.notFound(`No order for payment_intent ${pi.id}`);
    }

    if (order.status !== OrderStatus.PENDING) return;

    // Atomic stock decrement: the WHERE clause refuses to touch a row that
    // would go negative. We count affected rows per line item and abort the
    // whole tx if any line failed.
    for (const item of order.items) {
      const affected = await tx.$executeRaw`
        UPDATE "ProductVariant"
        SET "warehouseStock" = "warehouseStock" - ${item.quantity},
            "updatedAt" = NOW()
        WHERE "id" = ${item.variantId}::uuid
          AND "warehouseStock" >= ${item.quantity}
      `;
      if (affected !== 1) throw Errors.insufficientStock(item.variantId);
    }

    const charge =
      typeof pi.latest_charge === "string"
        ? pi.latest_charge
        : pi.latest_charge?.id ?? null;

    await tx.order.update({
      where: { id: order.id },
      data: {
        status: OrderStatus.PAID,
        paidAt: new Date(),
        ...(charge ? { stripeChargeId: charge } : {}),
      },
    });
  }, { isolationLevel: "Serializable" });
}

async function onPaymentIntentFailed(pi: Stripe.PaymentIntent): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { stripePaymentIntentId: pi.id },
    });
    if (!order) return;
    if (order.status !== OrderStatus.PENDING) return;
    await tx.order.update({
      where: { id: order.id },
      data: { status: OrderStatus.CANCELLED, cancelledAt: new Date() },
    });
  });
}

// ---------------------------------------------------------------------------
// charge.refunded / refund.updated -> promote Return.refundStatus -> ISSUED
// ---------------------------------------------------------------------------

async function onRefundUpdated(obj: Stripe.Charge | Stripe.Refund): Promise<void> {
  const refundIds = collectRefundIds(obj);
  if (refundIds.length === 0) return;

  for (const rid of refundIds) {
    await prisma.$transaction(async (tx) => {
      const ret = await tx.return.findUnique({ where: { stripeRefundId: rid } });
      if (!ret || ret.refundStatus === RefundStatus.ISSUED) return;
      await tx.return.update({
        where: { id: ret.id },
        data: { refundStatus: RefundStatus.ISSUED, refundedAt: new Date() },
      });
    });
  }
}

function collectRefundIds(obj: Stripe.Charge | Stripe.Refund): string[] {
  if (obj.object === "refund") return [obj.id];
  if (obj.object === "charge") {
    const refunds = obj.refunds?.data ?? [];
    return refunds.map((r) => r.id);
  }
  return [];
}
