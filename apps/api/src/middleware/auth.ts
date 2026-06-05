import type { FastifyPluginAsync, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import { verifyAccessToken, hashGuestToken } from "../lib/jwt.js";
import { prisma } from "../lib/db.js";
import { Errors } from "../lib/errors.js";

declare module "fastify" {
  interface FastifyRequest {
    auth?: {
      userId: string;
      isGuest: boolean;
    };
  }
}

const COOKIE_NAME = "df_access";
const GUEST_TOKEN_HEADER = "x-guest-tracking-token";

const authPlugin: FastifyPluginAsync = async (app) => {
  app.decorateRequest("auth", undefined);

  // Soft-attach: populate req.auth when a valid cookie is present, but never
  // throw here. Routes that *require* auth call requireAuth() / requireUser().
  app.addHook("onRequest", async (req) => {
    const cookie = req.cookies?.[COOKIE_NAME];
    if (!cookie) return;
    try {
      const claims = await verifyAccessToken(cookie);
      req.auth = { userId: claims.sub, isGuest: claims.isGuest };
    } catch {
      // Expired/invalid cookies are silently ignored; the response layer will
      // 401 only when the route actually needs an authenticated user.
    }
  });
};

export default fp(authPlugin, { name: "auth" });

// ---------------------------------------------------------------------------
// Route guards
// ---------------------------------------------------------------------------

export function requireAuth(req: FastifyRequest): { userId: string; isGuest: boolean } {
  if (!req.auth) throw Errors.unauthenticated();
  return req.auth;
}

export function requireFullUser(req: FastifyRequest): { userId: string } {
  const auth = requireAuth(req);
  if (auth.isGuest) throw Errors.forbidden("This action requires a registered account");
  return { userId: auth.userId };
}

// Authorize a guest *or* logged-in user against a specific order via either
// session cookie or the email-delivered tracking token. Used for /orders/track.
export async function resolveOrderViewer(args: {
  req: FastifyRequest;
  orderId: string;
}): Promise<{ userId: string }> {
  const order = await prisma.order.findUnique({
    where: { id: args.orderId },
    select: { userId: true, user: { select: { isGuest: true, guestTrackingTokenHash: true, guestTokenExpiresAt: true } } },
  });
  if (!order) throw Errors.notFound("Order not found");

  if (args.req.auth?.userId === order.userId) return { userId: order.userId };

  const token = args.req.headers[GUEST_TOKEN_HEADER];
  if (typeof token === "string" && order.user.isGuest && order.user.guestTrackingTokenHash) {
    const candidateHash = hashGuestToken(token);
    const matches = candidateHash === order.user.guestTrackingTokenHash;
    const notExpired =
      order.user.guestTokenExpiresAt == null || order.user.guestTokenExpiresAt > new Date();
    if (matches && notExpired) return { userId: order.userId };
  }

  throw Errors.unauthenticated();
}
