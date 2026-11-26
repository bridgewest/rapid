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

// ───────────── Rapid Ride ─────────────

router.get("/drivers", async (req, res, next) => {
  try {
    const { status } = z
      .object({ status: z.enum(["PENDING", "APPROVED", "SUSPENDED", "REJECTED"]).optional() })
      .parse(req.query);
    const drivers = await prisma.driverProfile.findMany({
      where: status ? { status } : undefined,
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      take: 200,
      include: { user: { select: { email: true, phoneE164: true } } },
    });
    return res.json(drivers);
  } catch (e) {
    next(e);
  }
});

router.post("/drivers/:id/decide", async (req, res, next) => {
  try {
    const body = z
      .object({ decision: z.enum(["APPROVED", "REJECTED", "SUSPENDED"]), notes: z.string().max(500).optional() })
      .parse(req.body);
    const driver = await prisma.driverProfile.update({
      where: { id: req.params.id },
      data: {
        status: body.decision,
        reviewerNotes: body.notes,
        ...(body.decision === "APPROVED" ? { approvedAt: new Date() } : { isOnline: false }),
      },
    });
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: `driver.${body.decision.toLowerCase()}`,
        resource: "DriverProfile",
        resourceId: driver.id,
        payload: { notes: body.notes ?? null },
      },
    });
    return res.json(driver);
  } catch (e) {
    next(e);
  }
});

router.get("/rides", async (req, res, next) => {
  try {
    const { status, take } = z
      .object({ status: z.string().optional(), take: z.coerce.number().max(200).default(100) })
      .parse(req.query);
    const rides = await prisma.ride.findMany({
      where: status ? { status: status as never } : undefined,
      orderBy: { requestedAt: "desc" },
      take,
      include: {
        rider: { select: { email: true, phoneE164: true } },
        driver: { select: { fullName: true, plateNumber: true, vehicleClass: true } },
      },
    });
    return res.json(rides.map(({ pickupPin: _p, ...r }) => r));
  } catch (e) {
    next(e);
  }
});

router.get("/rides/summary", async (_req, res, next) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const [driversOnline, driversPending, activeRides, completedToday, grossToday, byStatus] = await Promise.all([
      prisma.driverProfile.count({
        where: { isOnline: true, status: "APPROVED", lastLocationAt: { gte: new Date(Date.now() - 2 * 60_000) } },
      }),
      prisma.driverProfile.count({ where: { status: "PENDING" } }),
      prisma.ride.count({ where: { status: { in: ["REQUESTED", "DRIVER_ASSIGNED", "DRIVER_ARRIVED", "IN_PROGRESS"] } } }),
      prisma.ride.count({ where: { status: "COMPLETED", completedAt: { gte: startOfDay } } }),
      prisma.ride.aggregate({
        _sum: { fareFinalLrd: true },
        where: { status: "COMPLETED", completedAt: { gte: startOfDay } },
      }),
      prisma.ride.groupBy({ by: ["status"], _count: { _all: true } }),
    ]);
    return res.json({
      driversOnline,
      driversPending,
      activeRides,
      completedToday,
      grossFareTodayLrd: grossToday._sum.fareFinalLrd ?? 0,
      byStatus: byStatus.map((b) => ({ status: b.status, count: b._count._all })),
    });
  } catch (e) {
    next(e);
  }
});

export default router;
