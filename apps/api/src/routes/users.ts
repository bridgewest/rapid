import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/me", async (req, res, next) => {
  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: req.user!.id },
      include: { profile: true, wallet: true },
    });
    return res.json({
      id: user.id,
      email: user.email,
      phoneE164: user.phoneE164,
      tier: user.tier,
      kycStatus: user.kycStatus,
      profile: user.profile,
      wallet: user.wallet,
    });
  } catch (e) {
    next(e);
  }
});

const profileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  displayName: z.string().optional(),
  addressLine1: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
});

router.patch("/me/profile", async (req, res, next) => {
  try {
    const data = profileSchema.parse(req.body);
    const profile = await prisma.userProfile.upsert({
      where: { userId: req.user!.id },
      create: { userId: req.user!.id, ...data },
      update: data,
    });
    return res.json(profile);
  } catch (e) {
    next(e);
  }
});

export default router;
