import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.post("/submit", async (req, res, next) => {
  try {
    const schema = z.object({
      idDocumentUrl: z.string().url(),
      selfieUrl: z.string().url(),
      proofOfAddressUrl: z.string().url(),
      providerInquiryId: z.string().optional(),
    });
    const body = schema.parse(req.body);
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { kycStatus: "PENDING" },
    });
    const kyc = await prisma.kycSubmission.create({
      data: {
        userId: req.user!.id,
        ...body,
      },
    });
    return res.status(201).json(kyc);
  } catch (e) {
    next(e);
  }
});

router.get("/status", async (req, res, next) => {
  try {
    const latest = await prisma.kycSubmission.findFirst({
      where: { userId: req.user!.id },
      orderBy: { createdAt: "desc" },
    });
    const user = await prisma.user.findUniqueOrThrow({ where: { id: req.user!.id } });
    return res.json({ kycStatus: user.kycStatus, latestSubmission: latest });
  } catch (e) {
    next(e);
  }
});

export default router;
