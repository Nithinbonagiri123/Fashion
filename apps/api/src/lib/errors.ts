// Domain errors. Thrown from services, mapped to HTTP responses by the
// Fastify error handler in server.ts. Never expose `cause` to clients.

export type ErrorCode =
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "VALIDATION"
  | "IDEMPOTENCY_IN_FLIGHT"
  | "INSUFFICIENT_STOCK"
  | "INSUFFICIENT_WALLET_BALANCE"
  | "RETURN_INELIGIBLE"
  | "INVALID_STATE_TRANSITION"
  | "WEBHOOK_SIGNATURE_INVALID"
  | "INTERNAL";

export class AppError extends Error {
  override readonly name = "AppError";
  readonly statusCode: number;
  readonly code: ErrorCode;
  readonly publicDetail: Record<string, unknown> | undefined;

  constructor(args: {
    code: ErrorCode;
    statusCode: number;
    message: string;
    publicDetail?: Record<string, unknown>;
    cause?: unknown;
  }) {
    super(args.message, { cause: args.cause });
    this.code = args.code;
    this.statusCode = args.statusCode;
    this.publicDetail = args.publicDetail;
  }
}

export const Errors = {
  unauthenticated: (msg = "Not authenticated") =>
    new AppError({ code: "UNAUTHENTICATED", statusCode: 401, message: msg }),
  forbidden: (msg = "Forbidden") =>
    new AppError({ code: "FORBIDDEN", statusCode: 403, message: msg }),
  notFound: (msg = "Not found") =>
    new AppError({ code: "NOT_FOUND", statusCode: 404, message: msg }),
  conflict: (msg: string) => new AppError({ code: "CONFLICT", statusCode: 409, message: msg }),
  validation: (msg: string, publicDetail?: Record<string, unknown>) =>
    new AppError({ code: "VALIDATION", statusCode: 422, message: msg, ...(publicDetail ? { publicDetail } : {}) }),
  idempotencyInFlight: () =>
    new AppError({
      code: "IDEMPOTENCY_IN_FLIGHT",
      statusCode: 409,
      message: "A request with this Idempotency-Key is still being processed",
    }),
  insufficientStock: (variantId: string) =>
    new AppError({
      code: "INSUFFICIENT_STOCK",
      statusCode: 409,
      message: "Insufficient stock",
      publicDetail: { variantId },
    }),
  insufficientWalletBalance: () =>
    new AppError({
      code: "INSUFFICIENT_WALLET_BALANCE",
      statusCode: 409,
      message: "Insufficient wallet balance",
    }),
  returnIneligible: (reason: string) =>
    new AppError({
      code: "RETURN_INELIGIBLE",
      statusCode: 422,
      message: reason,
    }),
  invalidStateTransition: (from: string, to: string) =>
    new AppError({
      code: "INVALID_STATE_TRANSITION",
      statusCode: 409,
      message: `Invalid transition: ${from} -> ${to}`,
      publicDetail: { from, to },
    }),
  webhookSignatureInvalid: () =>
    new AppError({
      code: "WEBHOOK_SIGNATURE_INVALID",
      statusCode: 400,
      message: "Webhook signature verification failed",
    }),
};
