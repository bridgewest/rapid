import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { getUsdToLrdRate, lrdFromUsd } from "../services/fx.js";
import { remittanceFeeUsdCents, AIRTIME_FLAT_FEE_CENTS, airtimeRetailUsdCents } from "../services/fees.js";

const router = Router();
router.use(requireAuth);

router.get("/remittance", async (req, res, next) => {
  try {
    const { sendAmountUsdCents } = z
      .object({ sendAmountUsdCents: z.coerce.number().int().positive() })
      .parse(req.query);
    const { rate, source } = await getUsdToLrdRate();
    const fee = remittanceFeeUsdCents(sendAmountUsdCents);
    const receiveLrd = lrdFromUsd(sendAmountUsdCents, rate);
    return res.json({
      sendAmountUsdCents,
      estimatedReceiveLrd: receiveLrd,
      feeUsdCents: fee,
      feePercent: 1.5,
      fxRate: rate.toString(),
      fxSource: source,
      totalChargeUsdCents: sendAmountUsdCents + fee,
    });
  } catch (e) {
    next(e);
  }
});

const presets = [500, 1000, 2000, 5000];

router.get("/airtime", async (req, res, next) => {
  try {
    const { wholesaleUsdCents, marginPercent } = z
      .object({
        wholesaleUsdCents: z.coerce.number().int().default(500),
        marginPercent: z.coerce.number().min(18).max(25).default(20),
      })
      .parse(req.query);
    const retail = airtimeRetailUsdCents(wholesaleUsdCents, marginPercent);
    const total = retail + AIRTIME_FLAT_FEE_CENTS;
    return res.json({
      presets: presets.map((c) => ({
        label: `$${(c / 100).toFixed(0)}`,
        wholesaleUsdCents: c,
        retailUsdCents: airtimeRetailUsdCents(c, marginPercent),
        totalUsdCents: airtimeRetailUsdCents(c, marginPercent) + AIRTIME_FLAT_FEE_CENTS,
      })),
      wholesaleUsdCents,
      marginPercent,
      retailUsdCents: retail,
      flatFeeUsdCents: AIRTIME_FLAT_FEE_CENTS,
      totalUsdCents: total,
    });
  } catch (e) {
    next(e);
  }
});

export default router;
