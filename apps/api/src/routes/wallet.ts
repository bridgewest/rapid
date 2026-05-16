import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const wallet = await prisma.wallet.findUnique({ where: { userId: req.user!.id } });
    return res.json(wallet);
  } catch (e) {
    next(e);
  }
});

export default router;
