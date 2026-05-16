import { Decimal } from "@prisma/client/runtime/library";

/** Remittance fee: 1.5% */
export function remittanceFeeUsdCents(sendUsdCents: number): number {
  return Math.round(sendUsdCents * 0.015);
}

/** Airtime: flat $0.75 + margin applied to retail (caller sets retail amount) */
export const AIRTIME_FLAT_FEE_CENTS = 75;

/** Apply margin percent to wholesale estimate (Reloadly cost hidden); user sees retail */
export function airtimeRetailUsdCents(wholesaleUsdCents: number, marginPercent: number): number {
  return Math.ceil(wholesaleUsdCents * (1 + marginPercent / 100));
}

export function toDecimal(n: number): Decimal {
  return new Decimal(n.toString());
}
