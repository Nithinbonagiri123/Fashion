import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),

  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),

  JWT_SECRET: z.string().min(32),
  JWT_ACCESS_TTL_SECONDS: z.coerce.number().int().positive().default(900),
  JWT_REFRESH_TTL_SECONDS: z.coerce.number().int().positive().default(60 * 60 * 24 * 30),

  GUEST_TOKEN_PEPPER: z.string().min(32),

  STRIPE_SECRET_KEY: z.string().startsWith("sk_"),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_"),
  STRIPE_API_VERSION: z.string().default("2025-09-30.clover"),

  FLAT_SHIPPING_CENTS: z.coerce.number().int().nonnegative().default(799),
  FLAT_TAX_BPS: z.coerce.number().int().nonnegative().max(10_000).default(875),

  COOKIE_DOMAIN: z.string().default("localhost"),
  COOKIE_SECURE: z.coerce.boolean().default(false),

  WEB_ORIGIN: z.string().url(),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  // Fail fast and loudly. Missing/invalid env is the single most common cause
  // of silent prod misbehavior — better to crash on boot than to ship with
  // e.g. a development webhook secret.
  console.error("Invalid environment:", z.treeifyError(parsed.error));
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
