import { createHash } from "node:crypto";
import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import { redis, RedisKeys } from "../lib/redis.js";
import { Errors } from "../lib/errors.js";

const TTL_SECONDS = 60 * 60 * 24;
const IN_FLIGHT_TTL_SECONDS = 60;
const HEADER = "idempotency-key";

interface StoredResponse {
  status: "in_flight" | "complete";
  bodyHash?: string;
  statusCode?: number;
  contentType?: string;
  body?: string;
}

declare module "fastify" {
  interface FastifyRequest {
    idempotencyKey?: string;
    // Hash of the request body. We refuse if the same key is reused with a
    // different body — that almost always indicates a client bug and would
    // otherwise silently mask the second request.
    idempotencyBodyHash?: string;
  }
}

function hashBody(req: FastifyRequest): string {
  const payload = req.body == null ? "" : JSON.stringify(req.body);
  return createHash("sha256").update(payload).digest("hex");
}

async function getStored(key: string): Promise<StoredResponse | null> {
  const raw = await redis.get(RedisKeys.idempotency(key));
  if (!raw) return null;
  return JSON.parse(raw) as StoredResponse;
}

async function setStored(key: string, value: StoredResponse, ttl: number): Promise<void> {
  await redis.set(RedisKeys.idempotency(key), JSON.stringify(value), "EX", ttl);
}

async function claimInFlight(key: string, bodyHash: string): Promise<boolean> {
  // SET ... NX — atomic claim. Returns null if already set.
  const placeholder: StoredResponse = { status: "in_flight", bodyHash };
  const result = await redis.set(
    RedisKeys.idempotency(key),
    JSON.stringify(placeholder),
    "EX",
    IN_FLIGHT_TTL_SECONDS,
    "NX",
  );
  return result === "OK";
}

// Routes that require idempotency mark themselves with `config: { idempotent: true }`
// when registered. The hook below only activates on those routes.
declare module "fastify" {
  interface FastifyContextConfig {
    idempotent?: boolean;
  }
}

const idempotencyPlugin: FastifyPluginAsync = async (app) => {
  app.addHook("preHandler", async (req: FastifyRequest, reply: FastifyReply) => {
    if (!req.routeOptions.config?.idempotent) return;

    const key = req.headers[HEADER];
    if (typeof key !== "string" || key.length < 16 || key.length > 200) {
      throw Errors.validation("Missing or invalid Idempotency-Key header");
    }
    req.idempotencyKey = key;
    req.idempotencyBodyHash = hashBody(req);

    const existing = await getStored(key);
    if (existing == null) {
      const claimed = await claimInFlight(key, req.idempotencyBodyHash);
      if (!claimed) {
        // Lost the race; re-read and fall through.
        const after = await getStored(key);
        if (after?.status === "in_flight") throw Errors.idempotencyInFlight();
        if (after?.status === "complete") return replayCached(reply, after, req.idempotencyBodyHash);
      }
      return;
    }

    if (existing.status === "in_flight") throw Errors.idempotencyInFlight();
    return replayCached(reply, existing, req.idempotencyBodyHash);
  });

  app.addHook("onSend", async (req, reply, payload) => {
    if (!req.routeOptions.config?.idempotent) return payload;
    if (!req.idempotencyKey || !req.idempotencyBodyHash) return payload;

    // Only cache deterministic responses: 2xx and 4xx (client errors won't
    // change on retry). 5xx and 408/429 are released so the client can retry.
    const sc = reply.statusCode;
    const cacheable = (sc >= 200 && sc < 300) || (sc >= 400 && sc < 500 && sc !== 408 && sc !== 429);
    if (!cacheable) {
      await redis.del(RedisKeys.idempotency(req.idempotencyKey));
      return payload;
    }

    const body = typeof payload === "string" ? payload : Buffer.isBuffer(payload) ? payload.toString("utf8") : "";
    await setStored(
      req.idempotencyKey,
      {
        status: "complete",
        bodyHash: req.idempotencyBodyHash,
        statusCode: sc,
        contentType: reply.getHeader("content-type")?.toString() ?? "application/json",
        body,
      },
      TTL_SECONDS,
    );
    return payload;
  });
};

function replayCached(reply: FastifyReply, stored: StoredResponse, currentBodyHash: string): void {
  if (stored.bodyHash && stored.bodyHash !== currentBodyHash) {
    throw Errors.conflict("Idempotency-Key was reused with a different request body");
  }
  reply
    .header("Idempotent-Replay", "true")
    .header("content-type", stored.contentType ?? "application/json")
    .status(stored.statusCode ?? 200)
    .send(stored.body ?? "");
}

export default fp(idempotencyPlugin, { name: "idempotency" });
