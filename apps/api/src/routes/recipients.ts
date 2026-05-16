import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const list = await prisma.recipient.findMany({
      where: { ownerId: req.user!.id },
      orderBy: { updatedAt: "desc" },
    });
    return res.json(list);
  } catch (e) {
    next(e);
  }
});

const createSchema = z.object({
  name: z.string().min(1),
  phoneE164: z.string().min(10),
  nickname: z.string().optional(),
  carrierHint: z.enum(["MTN", "ORANGE", "AUTO"]).optional(),
});

router.post("/", async (req, res, next) => {
  try {
    const body = createSchema.parse(req.body);
    const hint = body.carrierHint === "AUTO" ? null : body.carrierHint;
    const recipient = await prisma.recipient.create({
      data: {
        ownerId: req.user!.id,
        name: body.name,
        phoneE164: body.phoneE164,
        nickname: body.nickname,
        carrierHint: hint,
      },
    });
    return res.status(201).json(recipient);
  } catch (e) {
    next(e);
  }
});

router.get("/lookup", async (req, res, next) => {
  try {
    const q = z.object({ phoneE164: z.string() }).parse(req.query);
    const recipient = await prisma.recipient.findFirst({
      where: { ownerId: req.user!.id, phoneE164: q.phoneE164 },
    });
    return res.json({ recipient, carrierGuess: guessCarrier(q.phoneE164) });
  } catch (e) {
    next(e);
  }
});

/** Minimal Liberia carrier heuristic */
export function guessCarrier(phoneE164: string): string {
  const d = phoneE164.replace(/\D/g, "");
  if (d.includes("880") || d.endsWith("25")) return "ORANGE";
  if (d.includes("770") || d.includes("881")) return "MTN";
  return "UNKNOWN";
}

export default router;
