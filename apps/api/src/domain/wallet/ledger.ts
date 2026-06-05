import type { Prisma } from "@prisma/client";
import { WalletEntryReason, WalletEntryType } from "@prisma/client";
import { prisma } from "../../lib/db.js";
import { Errors } from "../../lib/errors.js";

// Wallet invariants (enforced by this module — do NOT mutate UserWallet or
// WalletTransaction from anywhere else):
//   1. Every mutation runs inside a Prisma transaction.
//   2. The wallet row is locked with SELECT ... FOR UPDATE before any read of
//      balanceCents, so concurrent credit/debit pairs cannot interleave.
//   3. Every entry carries a unique `ledgerKey`. Re-applying the same logical
//      operation (e.g. "return:<returnId>:credit") is a no-op that returns the
//      pre-existing entry.
//   4. Debits that would drive balance < 0 are rejected.
//   5. balanceAfterCents is a snapshot — sum(credits) - sum(debits) must equal
//      the latest balanceAfterCents at all times. Used by reconciliation jobs.

export interface ApplyEntryInput {
  userId: string;
  type: WalletEntryType;
  reason: WalletEntryReason;
  amountCents: number;
  ledgerKey: string;
  orderId?: string;
}

export interface ApplyEntryResult {
  walletTransactionId: string;
  balanceAfterCents: number;
  alreadyApplied: boolean;
}

export async function applyEntry(input: ApplyEntryInput): Promise<ApplyEntryResult> {
  if (!Number.isInteger(input.amountCents) || input.amountCents <= 0) {
    throw Errors.validation("amountCents must be a positive integer");
  }

  return prisma.$transaction(async (tx) => {
    // Idempotency: if an entry with this ledgerKey already exists, no-op.
    const existing = await tx.walletTransaction.findUnique({
      where: { ledgerKey: input.ledgerKey },
      select: { id: true, balanceAfterCents: true },
    });
    if (existing) {
      return {
        walletTransactionId: existing.id,
        balanceAfterCents: existing.balanceAfterCents,
        alreadyApplied: true,
      };
    }

    const wallet = await lockWallet(tx, input.userId);

    const delta = input.type === WalletEntryType.CREDIT ? input.amountCents : -input.amountCents;
    const next = wallet.balanceCents + delta;
    if (next < 0) throw Errors.insufficientWalletBalance();

    const entry = await tx.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: input.type,
        reason: input.reason,
        amountCents: input.amountCents,
        balanceAfterCents: next,
        currency: wallet.currency,
        ledgerKey: input.ledgerKey,
        ...(input.orderId ? { orderId: input.orderId } : {}),
      },
      select: { id: true, balanceAfterCents: true },
    });

    await tx.userWallet.update({
      where: { id: wallet.id },
      data: { balanceCents: next },
    });

    return {
      walletTransactionId: entry.id,
      balanceAfterCents: entry.balanceAfterCents,
      alreadyApplied: false,
    };
  }, { isolationLevel: "Serializable" });
}

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

async function lockWallet(tx: Prisma.TransactionClient, userId: string) {
  // Prisma has no first-class SELECT ... FOR UPDATE; use raw SQL inside the tx
  // to acquire the row lock, then fetch via the typed client for ergonomics.
  // Both run on the same connection because we're inside $transaction.
  const locked = await tx.$queryRaw<Array<{ id: string }>>`
    SELECT id FROM "UserWallet" WHERE "userId" = ${userId}::uuid FOR UPDATE
  `;
  if (locked.length === 0) {
    // Auto-provision on first use. The INSERT races safely because of the
    // unique constraint on userId — losers fall through to the SELECT.
    await tx.$executeRaw`
      INSERT INTO "UserWallet" ("id", "userId", "balanceCents", "currency", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), ${userId}::uuid, 0, 'USD', NOW(), NOW())
      ON CONFLICT ("userId") DO NOTHING
    `;
    await tx.$queryRaw`SELECT id FROM "UserWallet" WHERE "userId" = ${userId}::uuid FOR UPDATE`;
  }
  const wallet = await tx.userWallet.findUniqueOrThrow({
    where: { userId },
    select: { id: true, balanceCents: true, currency: true },
  });
  return wallet;
}

// ---------------------------------------------------------------------------
// Reconciliation helper — call from a nightly job.
// ---------------------------------------------------------------------------

export async function reconcileWallet(userId: string): Promise<{ ok: boolean; expected: number; actual: number }> {
  const wallet = await prisma.userWallet.findUniqueOrThrow({ where: { userId } });
  const sum = await prisma.walletTransaction.aggregate({
    where: { walletId: wallet.id },
    _sum: { amountCents: true },
    _count: true,
  });
  const credits = await prisma.walletTransaction.aggregate({
    where: { walletId: wallet.id, type: WalletEntryType.CREDIT },
    _sum: { amountCents: true },
  });
  const debits = await prisma.walletTransaction.aggregate({
    where: { walletId: wallet.id, type: WalletEntryType.DEBIT },
    _sum: { amountCents: true },
  });
  const expected = (credits._sum.amountCents ?? 0) - (debits._sum.amountCents ?? 0);
  void sum;
  return { ok: expected === wallet.balanceCents, expected, actual: wallet.balanceCents };
}
