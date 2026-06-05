import Stripe from "stripe";
import { Errors } from "./errors.js";
import { env } from "./env.js";

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: env.STRIPE_API_VERSION as Stripe.LatestApiVersion,
  typescript: true,
  // Avoid Stripe's built-in retry — idempotency is handled at our gateway layer.
  maxNetworkRetries: 0,
});

// Verify the webhook signature using the *raw* request body. The Fastify
// route MUST be configured with rawBody: true (see fastify-raw-body plugin in
// server.ts). Passing the parsed JSON body to constructEvent will silently
// fail the signature check.
export function verifyStripeSignature(rawBody: Buffer, signature: string | undefined): Stripe.Event {
  if (!signature) throw Errors.webhookSignatureInvalid();
  try {
    return stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (cause) {
    throw Errors.webhookSignatureInvalid();
  }
}
