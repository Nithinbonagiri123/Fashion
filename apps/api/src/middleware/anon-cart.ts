import { createHash, randomBytes } from "node:crypto";
import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from "fastify";
import fp from "fastify-plugin";
import { env } from "../lib/env.js";

const COOKIE_NAME = "df_anon_cart";
const TTL_SECONDS = 60 * 60 * 24 * 30;

declare module "fastify" {
  interface FastifyRequest {
    // Stable HMAC of the raw cookie token — used as Cart.anonymousToken.
    // Plaintext never touches the DB, so a DB dump can't be used to hijack carts.
    anonCartToken?: string;
  }
}

function hashToken(plaintext: string): string {
  return createHash("sha256").update(plaintext).update(env.JWT_SECRET).digest("hex");
}

function issueToken(reply: FastifyReply): string {
  const plaintext = randomBytes(32).toString("base64url");
  reply.setCookie(COOKIE_NAME, plaintext, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: "lax",
    path: "/",
    maxAge: TTL_SECONDS,
    signed: true,
  });
  return hashToken(plaintext);
}

const anonCartPlugin: FastifyPluginAsync = async (app) => {
  app.decorateRequest("anonCartToken", undefined);

  app.addHook("onRequest", async (req: FastifyRequest, reply: FastifyReply) => {
    const raw = req.cookies?.[COOKIE_NAME];
    if (raw) {
      const unsigned = req.unsignCookie(raw);
      if (unsigned.valid && unsigned.value) {
        req.anonCartToken = hashToken(unsigned.value);
        return;
      }
    }
    // Only issue a new token for routes that actually need one — the route
    // can call ensureAnonCart(req, reply) to provision lazily.
    void issueToken;
  });
};

export default fp(anonCartPlugin, { name: "anon-cart" });

export async function ensureAnonCartToken(req: FastifyRequest, reply: FastifyReply): Promise<string> {
  if (req.anonCartToken) return req.anonCartToken;
  const hashed = issueToken(reply);
  req.anonCartToken = hashed;
  return hashed;
}
