import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js";

const router = Router();
router.use(requireAuth);

router.post("/register", async (req, res, next) => {
  try {
    const body = z
      .object({
        fcmToken: z.string(),
        platform: z.enum(["ios", "android", "web"]),
        deviceFingerprint: z.string().optional(),
      })
      .parse(req.body);

    const existing = await prisma.userDevice.findFirst({
      where: { userId: req.user!.id, fcmToken: body.fcmToken },
    });
    const device = existing
      ? await prisma.userDevice.update({
          where: { id: existing.id },
          data: {
            lastIp: req.ip,
            userAgent: req.get("user-agent") ?? undefined,
            deviceFingerprint: body.deviceFingerprint ?? existing.deviceFingerprint,
          },
        })
      : await prisma.userDevice.create({
          data: {
            userId: req.user!.id,
            fcmToken: body.fcmToken,
            platform: body.platform,
            deviceFingerprint: body.deviceFingerprint,
            lastIp: req.ip,
            userAgent: req.get("user-agent") ?? undefined,
          },
        });

    return res.status(existing ? 200 : 201).json(device);
  } catch (e) {
    next(e);
  }
});

export default router;
