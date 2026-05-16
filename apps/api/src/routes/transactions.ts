import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js";
import { TransactionKind } from "@prisma/client";
import { createRemittanceTx, createAirtimeTx, createComboTx } from "../services/transactions.service.js";

const router = Router();
router.use(requireAuth);

function clientMeta(req: import("express").Request) {
  return {
    ip: req.ip,
    deviceFingerprint: req.get("x-device-fingerprint") ?? undefined,
    idempotencyKey: req.get("idempotency-key") ?? undefined,
  };
}

router.get("/", async (req, res, next) => {
  try {
    const parsed = z
      .enum(["REMITTANCE", "AIRTIME", "BILL_PAY", "COMBO", "ALL"])
      .optional()
      .parse(req.query.kind);
    const kind = parsed ?? "ALL";
    const where =
      kind === "ALL"
        ? { userId: req.user!.id }
        : { userId: req.user!.id, kind: kind as TransactionKind };
    const rows = await prisma.transaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { recipient: true, events: { orderBy: { createdAt: "asc" } } },
    });
    return res.json(rows);
  } catch (e) {
    next(e);
  }
});

router.get("/:publicId", async (req, res, next) => {
  try {
    const tx = await prisma.transaction.findFirst({
      where: { publicId: req.params.publicId, userId: req.user!.id },
      include: { recipient: true, events: { orderBy: { createdAt: "asc" } } },
    });
    if (!tx) return res.status(404).json({ error: "Not found" });
    return res.json(tx);
  } catch (e) {
    next(e);
  }
});

router.post("/remittance", async (req, res, next) => {
  try {
    const body = z
      .object({
        sendAmountUsdCents: z.number().int().positive(),
        recipientId: z.string(),
      })
      .parse(req.body);
    const tx = await createRemittanceTx(req.user!.id, body, clientMeta(req));
    return res.status(201).json(tx);
  } catch (e) {
    next(e);
  }
});

router.post("/airtime", async (req, res, next) => {
  try {
    const body = z
      .object({
        recipientPhoneE164: z.string().min(10),
        wholesaleUsdCents: z.number().int().positive(),
        marginPercent: z.number().min(18).max(25),
        carrier: z.string(),
      })
      .parse(req.body);
    const tx = await createAirtimeTx(req.user!.id, body, clientMeta(req));
    return res.status(201).json(tx);
  } catch (e) {
    next(e);
  }
});

router.post("/combo", async (req, res, next) => {
  try {
    const body = z
      .object({
        remittanceUsdCents: z.number().int().positive(),
        airtimeWholesaleUsdCents: z.number().int().positive(),
        airtimeMarginPercent: z.number().min(18).max(25),
        recipientId: z.string(),
        recipientPhoneForAirtime: z.string(),
        carrier: z.string(),
      })
      .parse(req.body);
    const result = await createComboTx(req.user!.id, body, clientMeta(req));
    return res.status(201).json(result);
  } catch (e) {
    next(e);
  }
});

/** Receipt payload for mobile PDF / email */
router.get("/:publicId/receipt", async (req, res, next) => {
  try {
    const tx = await prisma.transaction.findFirst({
      where: { publicId: req.params.publicId, userId: req.user!.id },
      include: { recipient: true, user: { include: { profile: true } } },
    });
    if (!tx) return res.status(404).json({ error: "Not found" });
    return res.json({
      receiptId: tx.publicId,
      issuedAt: tx.createdAt,
      sender: tx.user.profile,
      transaction: tx,
    });
  } catch (e) {
    next(e);
  }
});

export default router;
