import { Router, type Request } from "express";
import { z } from "zod";
import type { Prisma, RideStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import {
  DISPATCH_RADIUS_KM,
  estimateTrip,
  etaMinutes,
  expireStaleRequests,
  fareLrd,
  haversineKm,
  httpError,
} from "../services/rides.js";

const router = Router();
router.use(requireAuth);

const driverRideInclude = {
  rider: { select: { phoneE164: true, profile: { select: { firstName: true, displayName: true } } } },
} satisfies Prisma.RideInclude;

type DriverRide = Prisma.RideGetPayload<{ include: typeof driverRideInclude }>;

/** Drivers never see the pickup PIN — the rider tells them in person. */
function presentForDriver(ride: DriverRide) {
  const { pickupPin: _pin, declinedByDriverIds: _d, rider, ...rest } = ride;
  const net = Math.round(((ride.fareFinalLrd ?? ride.fareEstimateLrd) * (100 - Number(ride.platformFeePercent))) / 100);
  return {
    ...rest,
    driverEarningsLrd: net,
    rider: {
      name: ride.bookedForName ?? rider.profile?.displayName ?? rider.profile?.firstName ?? "Rider",
      phoneE164: ride.bookedForPhone ?? rider.phoneE164,
    },
  };
}

async function myDriver(req: Request, opts: { approved?: boolean } = {}) {
  const d = await prisma.driverProfile.findUnique({ where: { userId: req.user!.id } });
  if (!d) throw httpError(404, "Not registered as a driver");
  if (opts.approved && d.status !== "APPROVED") throw httpError(403, `Driver account is ${d.status.toLowerCase()}`);
  return d;
}

const applySchema = z.object({
  fullName: z.string().min(2).max(100),
  licenseNumber: z.string().min(3).max(40),
  nationalId: z.string().max(40).optional(),
  city: z.string().max(60).default("Monrovia"),
  vehicleClass: z.enum(["KEKE", "TAXI", "COMFORT"]),
  vehicleMake: z.string().min(1).max(40),
  vehicleModel: z.string().min(1).max(40),
  vehicleColor: z.string().min(1).max(30),
  plateNumber: z.string().min(2).max(20).transform((s) => s.toUpperCase().replace(/\s+/g, "")),
  vehicleYear: z.number().int().min(1980).max(2100).optional(),
});

/** Apply (or update a pending/rejected application). */
router.post("/apply", async (req, res, next) => {
  try {
    const data = applySchema.parse(req.body);
    const existing = await prisma.driverProfile.findUnique({ where: { userId: req.user!.id } });
    if (existing && (existing.status === "APPROVED" || existing.status === "SUSPENDED")) {
      throw httpError(409, "Driver profile already reviewed — contact support to change vehicle details");
    }
    const plateTaken = await prisma.driverProfile.findFirst({
      where: { plateNumber: data.plateNumber, NOT: { userId: req.user!.id } },
    });
    if (plateTaken) throw httpError(409, "That plate number is already registered");

    const profile = await prisma.driverProfile.upsert({
      where: { userId: req.user!.id },
      create: { userId: req.user!.id, ...data },
      update: { ...data, status: "PENDING", reviewerNotes: null },
    });
    return res.status(201).json(profile);
  } catch (e) {
    next(e);
  }
});

router.get("/me", async (req, res, next) => {
  try {
    const d = await prisma.driverProfile.findUnique({ where: { userId: req.user!.id } });
    if (!d) return res.json(null);
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const today = await prisma.ride.findMany({
      where: { driverId: d.id, status: "COMPLETED", completedAt: { gte: startOfDay } },
      select: { fareFinalLrd: true, fareEstimateLrd: true, platformFeePercent: true },
    });
    const todayEarningsLrd = today.reduce(
      (sum, r) => sum + Math.round(((r.fareFinalLrd ?? r.fareEstimateLrd) * (100 - Number(r.platformFeePercent))) / 100),
      0,
    );
    return res.json({ ...d, todayTrips: today.length, todayEarningsLrd });
  } catch (e) {
    next(e);
  }
});

router.post("/status", async (req, res, next) => {
  try {
    const body = z
      .object({ online: z.boolean(), lat: z.number().optional(), lng: z.number().optional() })
      .parse(req.body);
    const d = await myDriver(req, { approved: true });
    if (!body.online) {
      const active = await prisma.ride.findFirst({
        where: { driverId: d.id, status: { in: ["DRIVER_ASSIGNED", "DRIVER_ARRIVED", "IN_PROGRESS"] } },
      });
      if (active) throw httpError(409, "Finish your current trip before going offline");
    }
    const updated = await prisma.driverProfile.update({
      where: { id: d.id },
      data: {
        isOnline: body.online,
        ...(body.lat != null && body.lng != null
          ? { lat: body.lat, lng: body.lng, lastLocationAt: new Date() }
          : {}),
      },
    });
    return res.json(updated);
  } catch (e) {
    next(e);
  }
});

/** GPS ping — call every ~10s while online. */
router.post("/location", async (req, res, next) => {
  try {
    const { lat, lng } = z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) }).parse(req.body);
    const d = await myDriver(req, { approved: true });
    await prisma.driverProfile.update({ where: { id: d.id }, data: { lat, lng, lastLocationAt: new Date() } });
    return res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

/** Open requests near the driver, nearest first. */
router.get("/offers", async (req, res, next) => {
  try {
    const d = await myDriver(req, { approved: true });
    if (!d.isOnline || d.lat == null || d.lng == null) return res.json([]);
    await expireStaleRequests();

    const busy = await prisma.ride.findFirst({
      where: { driverId: d.id, status: { in: ["DRIVER_ASSIGNED", "DRIVER_ARRIVED", "IN_PROGRESS"] } },
    });
    if (busy) return res.json([]);

    const dLat = DISPATCH_RADIUS_KM / 111;
    const dLng = DISPATCH_RADIUS_KM / (111 * Math.cos((d.lat * Math.PI) / 180));
    const rides = await prisma.ride.findMany({
      where: {
        status: "REQUESTED",
        vehicleClass: d.vehicleClass,
        riderId: { not: d.userId },
        NOT: { declinedByDriverIds: { has: d.id } },
        pickupLat: { gte: d.lat - dLat, lte: d.lat + dLat },
        pickupLng: { gte: d.lng - dLng, lte: d.lng + dLng },
      },
      include: driverRideInclude,
      take: 20,
    });
    const offers = rides
      .map((r) => {
        const toPickupKm = haversineKm(d.lat!, d.lng!, r.pickupLat, r.pickupLng);
        return { ...presentForDriver(r), toPickupKm: Math.round(toPickupKm * 10) / 10, pickupEtaMin: etaMinutes(toPickupKm) };
      })
      .filter((o) => o.toPickupKm <= DISPATCH_RADIUS_KM)
      .sort((a, b) => a.toPickupKm - b.toPickupKm);
    return res.json(offers);
  } catch (e) {
    next(e);
  }
});

router.post("/rides/:id/accept", async (req, res, next) => {
  try {
    const d = await myDriver(req, { approved: true });
    const busy = await prisma.ride.findFirst({
      where: { driverId: d.id, status: { in: ["DRIVER_ASSIGNED", "DRIVER_ARRIVED", "IN_PROGRESS"] } },
    });
    if (busy) throw httpError(409, "You already have an active trip");

    // Atomic claim — only one driver can win a request.
    const claimed = await prisma.ride.updateMany({
      where: { id: req.params.id, status: "REQUESTED", driverId: null, vehicleClass: d.vehicleClass },
      data: { status: "DRIVER_ASSIGNED", driverId: d.id, acceptedAt: new Date() },
    });
    if (claimed.count === 0) throw httpError(409, "Ride is no longer available");
    await prisma.rideEvent.create({ data: { rideId: req.params.id, status: "DRIVER_ASSIGNED", lat: d.lat, lng: d.lng } });
    const ride = await prisma.ride.findUniqueOrThrow({ where: { id: req.params.id }, include: driverRideInclude });
    return res.json(presentForDriver(ride));
  } catch (e) {
    next(e);
  }
});

router.post("/rides/:id/decline", async (req, res, next) => {
  try {
    const d = await myDriver(req, { approved: true });
    const ride = await prisma.ride.findFirst({ where: { id: req.params.id, status: "REQUESTED" } });
    if (ride && !ride.declinedByDriverIds.includes(d.id)) {
      await prisma.ride.update({ where: { id: ride.id }, data: { declinedByDriverIds: { push: d.id } } });
    }
    return res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

/** Current assigned trip for this driver. */
router.get("/rides/active", async (req, res, next) => {
  try {
    const d = await myDriver(req);
    const ride = await prisma.ride.findFirst({
      where: { driverId: d.id, status: { in: ["DRIVER_ASSIGNED", "DRIVER_ARRIVED", "IN_PROGRESS"] } },
      include: driverRideInclude,
    });
    return res.json(ride ? presentForDriver(ride) : null);
  } catch (e) {
    next(e);
  }
});

router.get("/rides/history", async (req, res, next) => {
  try {
    const d = await myDriver(req);
    const rides = await prisma.ride.findMany({
      where: { driverId: d.id },
      orderBy: { requestedAt: "desc" },
      take: 50,
      include: driverRideInclude,
    });
    return res.json(rides.map(presentForDriver));
  } catch (e) {
    next(e);
  }
});

async function transition(
  req: Request,
  from: RideStatus[],
  to: RideStatus,
  extra: Prisma.RideUpdateManyMutationInput = {},
) {
  const d = await myDriver(req, { approved: true });
  const result = await prisma.ride.updateMany({
    where: { id: req.params.id, driverId: d.id, status: { in: from } },
    data: { status: to, ...extra },
  });
  if (result.count === 0) throw httpError(409, `Ride cannot move to ${to.toLowerCase().replace(/_/g, " ")}`);
  await prisma.rideEvent.create({ data: { rideId: req.params.id, status: to, lat: d.lat, lng: d.lng } });
  return { driver: d, ride: await prisma.ride.findUniqueOrThrow({ where: { id: req.params.id }, include: driverRideInclude }) };
}

router.post("/rides/:id/arrive", async (req, res, next) => {
  try {
    const { ride } = await transition(req, ["DRIVER_ASSIGNED"], "DRIVER_ARRIVED", { arrivedAt: new Date() });
    return res.json(presentForDriver(ride));
  } catch (e) {
    next(e);
  }
});

/** Start trip — driver must enter the 4-digit PIN the rider shows them. */
router.post("/rides/:id/start", async (req, res, next) => {
  try {
    const { pin } = z.object({ pin: z.string().regex(/^\d{4}$/) }).parse(req.body);
    const pending = await prisma.ride.findUnique({ where: { id: req.params.id }, select: { pickupPin: true } });
    if (!pending || pending.pickupPin !== pin) throw httpError(400, "Incorrect PIN — ask the rider to check their app");
    const { ride } = await transition(req, ["DRIVER_ARRIVED"], "IN_PROGRESS", { startedAt: new Date() });
    return res.json(presentForDriver(ride));
  } catch (e) {
    next(e);
  }
});

router.post("/rides/:id/complete", async (req, res, next) => {
  try {
    const current = await prisma.ride.findUnique({ where: { id: req.params.id } });
    if (!current) throw httpError(404, "Ride not found");
    // Re-price on actual time when the trip ran long (traffic), never below the quote.
    const actualMin = current.startedAt ? Math.round((Date.now() - current.startedAt.getTime()) / 60_000) : current.durationMin;
    const trip = estimateTrip(
      { lat: current.pickupLat, lng: current.pickupLng },
      { lat: current.dropoffLat, lng: current.dropoffLng },
    );
    const repriced = fareLrd(current.vehicleClass, trip.distanceKm, Math.max(actualMin, trip.durationMin), Number(current.surgeMultiplier));
    const finalFare = Math.max(current.fareEstimateLrd, Math.min(repriced, Math.round(current.fareEstimateLrd * 1.5)));

    const { driver, ride } = await transition(req, ["IN_PROGRESS"], "COMPLETED", {
      completedAt: new Date(),
      fareFinalLrd: finalFare,
    });
    await prisma.driverProfile.update({ where: { id: driver.id }, data: { tripsCount: { increment: 1 } } });
    return res.json(presentForDriver(ride));
  } catch (e) {
    next(e);
  }
});

router.post("/rides/:id/cancel", async (req, res, next) => {
  try {
    const { reason } = z.object({ reason: z.string().max(200).optional() }).parse(req.body ?? {});
    const { ride } = await transition(req, ["DRIVER_ASSIGNED", "DRIVER_ARRIVED"], "CANCELLED_BY_DRIVER", {
      cancelledAt: new Date(),
      cancelReason: reason,
    });
    return res.json(presentForDriver(ride));
  } catch (e) {
    next(e);
  }
});

router.post("/rides/:id/rate-rider", async (req, res, next) => {
  try {
    const { rating } = z.object({ rating: z.number().int().min(1).max(5) }).parse(req.body);
    const d = await myDriver(req);
    const r = await prisma.ride.updateMany({
      where: { id: req.params.id, driverId: d.id, status: "COMPLETED", driverRating: null },
      data: { driverRating: rating },
    });
    if (r.count === 0) throw httpError(409, "Ride cannot be rated");
    return res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;
