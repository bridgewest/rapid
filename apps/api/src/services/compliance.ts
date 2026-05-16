import type { SanctionsResult } from "@prisma/client";

const THRESHOLD_USD_CENTS = 300_000; // $3,000

/** Stub — wire Persona/OFAC vendor in production */
export async function screenTransaction(opts: {
  amountUsdCents: number;
  recipientPhone: string;
}): Promise<{ result: SanctionsResult; payload: Record<string, unknown> }> {
  const overThreshold = opts.amountUsdCents >= THRESHOLD_USD_CENTS;
  if (overThreshold) {
    return {
      result: "PENDING_REVIEW",
      payload: { reason: "amount_threshold", thresholdCents: THRESHOLD_USD_CENTS },
    };
  }
  // toy "screening"
  if (opts.recipientPhone.includes("0000000")) {
    return { result: "MATCH", payload: { list: "SANCTIONS_STUB" } };
  }
  return { result: "CLEAR", payload: { screenedAt: new Date().toISOString() } };
}
