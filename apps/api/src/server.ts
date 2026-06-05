import Fastify from "fastify";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import sensible from "@fastify/sensible";
import rawBody from "fastify-raw-body";

import { env } from "./lib/env.js";
import { AppError } from "./lib/errors.js";
import { verifyStripeSignature } from "./lib/stripe.js";
import { handleStripeEvent } from "./domain/webhooks/stripe-handler.js";
import idempotencyPlugin from "./middleware/idempotency.js";
import authPlugin from "./middleware/auth.js";
import anonCartPlugin from "./middleware/anon-cart.js";
import { productRoutes } from "./routes/products.js";
import { cartRoutes } from "./routes/cart.js";

export async function buildServer() {
  const app = Fastify({
    logger: {
      level: env.LOG_LEVEL,
      transport:
        env.NODE_ENV === "development"
          ? { target: "pino-pretty", options: { translateTime: "SYS:HH:MM:ss.l", ignore: "pid,hostname" } }
          : undefined,
    },
    trustProxy: true,
    disableRequestLogging: false,
    bodyLimit: 256 * 1024,
  });

  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(cors, {
    origin: [env.WEB_ORIGIN],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["content-type", "authorization", "idempotency-key", "x-guest-tracking-token"],
  });
  await app.register(sensible);
  await app.register(cookie, { secret: env.JWT_SECRET });
  await app.register(rateLimit, { max: 200, timeWindow: "1 minute" });

  // The Stripe webhook handler needs the raw request bytes for signature
  // verification. fastify-raw-body exposes req.rawBody only on routes that
  // opt in via { config: { rawBody: true } }.
  await app.register(rawBody, {
    field: "rawBody",
    global: false,
    encoding: false,
    runFirst: true,
  });

  await app.register(authPlugin);
  await app.register(anonCartPlugin);
  await app.register(idempotencyPlugin);
  await app.register(productRoutes);
  await app.register(cartRoutes);

  app.setErrorHandler((err, req, reply) => {
    if (err instanceof AppError) {
      req.log.warn({ code: err.code, statusCode: err.statusCode }, err.message);
      return reply.status(err.statusCode).send({
        error: { code: err.code, message: err.message, detail: err.publicDetail },
      });
    }
    req.log.error({ err }, "Unhandled error");
    return reply.status(500).send({ error: { code: "INTERNAL", message: "Internal server error" } });
  });

  app.get("/healthz", async () => ({ ok: true }));

  // -------------------------------------------------------------------------
  // Stripe webhook — raw body, signature verified, then dispatched.
  // -------------------------------------------------------------------------
  app.post(
    "/api/webhooks/payment",
    {
      config: { rawBody: true },
      // Stripe payload guarantees its own schema; we don't try to validate it
      // ourselves — instead we trust the verified signature + Stripe's typed SDK.
    },
    async (req, reply) => {
      const sig = req.headers["stripe-signature"];
      const raw = (req as unknown as { rawBody: Buffer }).rawBody;
      const event = verifyStripeSignature(raw, Array.isArray(sig) ? sig[0] : sig);
      const result = await handleStripeEvent(event);
      return reply.status(200).send({ received: true, alreadyProcessed: result.alreadyProcessed });
    },
  );

  // -------------------------------------------------------------------------
  // Sample idempotent endpoint shape. Phase 2 will replace this stub with the
  // real checkout pipeline (validate cart -> create Stripe PaymentIntent ->
  // create Order in PENDING). The `config: { idempotent: true }` flag is what
  // activates the idempotency middleware for the route.
  // -------------------------------------------------------------------------
  app.post(
    "/api/checkout",
    {
      config: { idempotent: true },
    },
    async (_req, reply) => {
      return reply.status(501).send({ error: { code: "NOT_IMPLEMENTED", message: "Phase 2" } });
    },
  );

  return app;
}

async function main() {
  const app = await buildServer();
  try {
    await app.listen({ port: env.PORT, host: "0.0.0.0" });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

const isEntry = import.meta.url === `file://${process.argv[1]}`;
if (isEntry) {
  void main();
}
