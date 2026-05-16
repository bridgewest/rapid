import { prisma } from "../lib/prisma.js";
import { cacheGet, cacheSet } from "../lib/redis.js";
import { Decimal } from "@prisma/client/runtime/library";

const CACHE_KEY = "fx:USD:LRD";
const CACHE_TTL = 300;

/** Fallback when no API key — replace with OpenExchangeRates / Wise */
const FALLBACK_USD_LRD = 190.5;

export async function getUsdToLrdRate(): Promise<{ rate: Decimal; source: string }> {
  const cached = await cacheGet(CACHE_KEY);
  if (cached) {
    return { rate: new Decimal(cached), source: "cache" };
  }

  const latest = await prisma.exchangeRate.findFirst({
    where: { base: "USD", quote: "LRD" },
    orderBy: { createdAt: "desc" },
  });

  if (latest) {
    await cacheSet(CACHE_KEY, latest.rate.toString(), CACHE_TTL);
    return { rate: latest.rate, source: latest.source };
  }

  const rate = new Decimal(FALLBACK_USD_LRD.toString());
  await prisma.exchangeRate.create({
    data: {
      base: "USD",
      quote: "LRD",
      rate,
      source: "seed_fallback",
    },
  });
  await cacheSet(CACHE_KEY, rate.toString(), CACHE_TTL);
  return { rate, source: "seed_fallback" };
}

export function lrdFromUsd(usdCents: number, rate: Decimal): number {
  const usd = new Decimal(usdCents).div(100);
  return Math.round(usd.mul(rate).toNumber());
}
