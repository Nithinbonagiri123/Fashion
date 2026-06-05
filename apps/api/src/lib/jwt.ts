import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { jwtVerify, SignJWT } from "jose";
import { env } from "./env.js";

const secret = new TextEncoder().encode(env.JWT_SECRET);
const ISSUER = "demand-fashion";
const AUDIENCE = "demand-fashion-web";

export interface AccessTokenClaims {
  sub: string;
  isGuest: boolean;
}

export async function signAccessToken(claims: AccessTokenClaims): Promise<string> {
  return new SignJWT({ isGuest: claims.isGuest })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(claims.sub)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${env.JWT_ACCESS_TTL_SECONDS}s`)
    .sign(secret);
}

export async function verifyAccessToken(token: string): Promise<AccessTokenClaims> {
  const { payload } = await jwtVerify(token, secret, {
    issuer: ISSUER,
    audience: AUDIENCE,
    algorithms: ["HS256"],
  });
  if (!payload.sub) throw new Error("Missing sub");
  return { sub: payload.sub, isGuest: Boolean(payload.isGuest) };
}

// --- Opaque refresh tokens ---------------------------------------------------
// Refresh tokens are opaque, high-entropy strings. We store SHA-256(token) only.
// The plaintext lives only in the user's httpOnly cookie.

export function generateRefreshToken(): { plaintext: string; hash: string } {
  const plaintext = randomBytes(48).toString("base64url");
  const hash = createHash("sha256").update(plaintext).digest("hex");
  return { plaintext, hash };
}

export function hashRefreshToken(plaintext: string): string {
  return createHash("sha256").update(plaintext).digest("hex");
}

// --- Guest tracking tokens ---------------------------------------------------
// HMAC with a server-side pepper so a DB leak alone does not let an attacker
// forge tokens. Comparison is timing-safe.

export function generateGuestToken(): { plaintext: string; hash: string } {
  const plaintext = randomBytes(32).toString("base64url");
  const hash = hashGuestToken(plaintext);
  return { plaintext, hash };
}

export function hashGuestToken(plaintext: string): string {
  return createHmac("sha256", env.GUEST_TOKEN_PEPPER).update(plaintext).digest("hex");
}

export function constantTimeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}
