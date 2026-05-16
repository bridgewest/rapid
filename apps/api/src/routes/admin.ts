import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { Decimal } from "@prisma/client/runtime/library";

const router = Router();
router.use(requireAuth);
router.use(requireAdmin("any"));

router.get("/transactions", async (req, res, next) => {
  try {
    const { status, take } = z
      .object({
        status: z.string().optional(),
        take: z.coerce.number().max(200).default(50),
      })
      .parse(req.query);
    const list = await prisma.transaction.findMany({
      where: status ? { status: status as never } : undefined,
      orderBy: { createdAt: "desc" },
      take,
      include: { user: { select: { email: true, phoneE164: true } } },
    });
    return res.json(list);
  } catch (e) {
    next(e);
  }
});

router.get("/kyc-queue", async (_req, res, next) => {
  try {
    const queue = await prisma.kycSubmission.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
      include: { user: { select: { id: true, email: true, phoneE164: true } } },
    });
    return res.json(queue);
  } catch (e) {
    next(e);
  }
});

router.post("/kyc/:id/decide", async (req, res, next) => {
  try {
    const body = z
      .object({
        decision: z.enum(["APPROVED", "REJECTED", "NEEDS_REVIEW"]),
        notes: z.string().optional(),
      })
      .parse(req.body);
    const sub = await prisma.kycSubmission.update({
      where: { id: req.params.id },
      data: {
        status: body.decision,
        reviewerNotes: body.notes,
        decidedAt: new Date(),
      },
    });
    await prisma.user.update({
      where: { id: sub.userId },
      data: {
        kycStatus: body.decision,
        ...(body.decision === "APPROVED"
          ? { tier: "KYC_VERIFIED" }
          : body.decision === "REJECTED"
            ? { tier: "UNVERIFIED" }
            : {}),
      },
    });
    return res.json(sub);
  } catch (e) {
    next(e);
  }
});

router.post("/fx", async (req, res, next) => {
  try {
    const body = z
      .object({
        usdToLrd: z.string().or(z.number()),
        source: z.string().default("manual_override"),
      })
      .parse(req.body);
    const rate = new Decimal(typeof body.usdToLrd === "number" ? body.usdToLrd : body.usdToLrd);
    const row = await prisma.exchangeRate.create({
      data: {
        base: "USD",
        quote: "LRD",
        rate,
        source: body.source,
        isManualOverride: true,
      },
    });
    return res.status(201).json(row);
  } catch (e) {
    next(e);
  }
});

router.get("/analytics/summary", async (_req, res, next) => {
  try {
    const [volume, fees] = await prisma.$transaction([
      prisma.transaction.aggregate({
        _sum: { sendAmountUsdCents: true },
        where: { status: { in: ["DELIVERED", "PROCESSING", "INITIATED"] } },
      }),
      prisma.transaction.aggregate({
        _sum: { feeTotalUsdCents: true },
      }),
    ]);
    const byKind = await prisma.transaction.groupBy({
      by: ["kind"],
      _sum: { sendAmountUsdCents: true, feeTotalUsdCents: true },
    });
    return res.json({
      volumeSendUsdCents: volume._sum.sendAmountUsdCents ?? 0,
      feesCollectedUsdCents: fees._sum.feeTotalUsdCents ?? 0,
      byKind,
    });
  } catch (e) {
    next(e);
  }
});

router.get("/aml", async (_req, res, next) => {
  try {
    const flags = await prisma.amlFlag.findMany({
      where: { resolved: false },
      orderBy: { createdAt: "desc" },
    });
    return res.json(flags);
  } catch (e) {
    next(e);
  }
});

export default router;
