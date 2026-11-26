import { Router } from "express";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { getUsdToLrdRate } from "../services/fx.js";
import {
  ACTIVE_RIDE_STATUSES,
  FARE_TABLE,
  PLATFORM_FEE_PERCENT,
  estimateTrip,
  etaMinutes,
  expireStaleRequests,
  fareLrd,
  haversineKm,
  httpError,
  makePickupPin,
  nearbyDrivers,
  surgeFor,
} from "../services/rides.js";

const router = Router();
router.use(requireAuth);

const point = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  label: z.string().min(1).max(200),
});
const vehicleClass = z.enum(["KEKE", "TAXI", "COMFORT"]);

const riderRideInclude = {
  driver: {
    select: {
      id: true,
      fullName: true,
      vehicleClass: true,
      vehicleMake: true,
      vehicleModel: true,
      vehicleColor: true,
      plateNumber: true,
      ratingAvg: true,
      tripsCount: true,
      lat: true,
      lng: true,
      lastLocationAt: true,
      user: { select: { phoneE164: true } },
    },
  },
} satisfies Prisma.RideInclude;

type RiderRide = Prisma.RideGetPayload<{ include: typeof riderRideInclude }>;

function presentForRider(ride: RiderRide) {
  const { declinedByDriverIds: _d, driver, ...rest } = ride;
  let driverEtaMin: number | null = null;
  if (driver?.lat != null && driver.lng != null && ride.status === "DRIVER_ASSIGNED") {
    driverEtaMin = etaMinutes(haversineKm(driver.lat, driver.lng, ride.pickupLat, ride.pickupLng));
  }
  return {
    ...rest,
    driverEtaMin,
    driver: driver
      ? {
          ...driver,
          phoneE164: driver.user.phoneE164,
          user: undefined,
        }
      : null,
  };
}

/** Fare + ETA for each vehicle class between two points. */
router.post("/estimate", async (req, res, next) => {
  try {
    const { pickup, dropoff } = z.object({ pickup: point, dropoff: point }).parse(req.body);
    const trip = estimateTrip(pickup, dropoff);
    const { rate } = await getUsdToLrdRate();
    const usdPerLrd = 1 / rate.toNumber();

    const options = await Promise.all(
      (Object.keys(FARE_TABLE) as (keyof typeof FARE_TABLE)[]).map(async (cls) => {
        const [surge, drivers] = await Promise.all([surgeFor(cls), nearbyDrivers(pickup.lat, pickup.lng, cls)]);
        const fare = fareLrd(cls, trip.distanceKm, trip.durationMin, surge);
        return {
          vehicleClass: cls,
          label: FARE_TABLE[cls].label,
          seats: FARE_TABLE[cls].seats,
          fareLrd: fare,
          fareUsdCents: Math.round(fare * usdPerLrd * 100),
          surgeMultiplier: surge,
          driversNearby: drivers.length,
          pickupEtaMin: drivers[0] ? etaMinutes(drivers[0].distanceKm) : null,
        };
      }),
    );

    return res.json({ ...trip, fxRate: rate.toString(), options });
  } catch (e) {
    next(e);
  }
});

const requestSchema = z.object({
  pickup: point,
  dropoff: point,
  vehicleClass,
  paymentMethod: z.enum(["CASH", "MOBILE_MONEY", "WALLET"]).default("CASH"),
  bookedForName: z.string().max(100).optional(),
  bookedForPhone: z.string().max(20).optional(),
});

router.post("/", async (req, res, next) => {
  try {
    const body = requestSchema.parse(req.body);
    await expireStaleRequests();

    const existing = await prisma.ride.findFirst({
      where: { riderId: req.user!.id, status: { in: [...ACTIVE_RIDE_STATUSES] } },
    });
    if (existing) throw httpError(409, "You already have an active ride");

    const trip = estimateTrip(body.pickup, body.dropoff);
    const surge = await surgeFor(body.vehicleClass);
    const ride = await prisma.ride.create({
      data: {
        riderId: req.user!.id,
        vehicleClass: body.vehicleClass,
        paymentMethod: body.paymentMethod,
        pickupLat: body.pickup.lat,
        pickupLng: body.pickup.lng,
        pickupLabel: body.pickup.label,
        dropoffLat: body.dropoff.lat,
        dropoffLng: body.dropoff.lng,
        dropoffLabel: body.dropoff.label,
        distanceKm: trip.distanceKm,
        durationMin: trip.durationMin,
        fareEstimateLrd: fareLrd(body.vehicleClass, trip.distanceKm, trip.durationMin, surge),
        surgeMultiplier: surge,
        platformFeePercent: PLATFORM_FEE_PERCENT,
        pickupPin: makePickupPin(),
        bookedForName: body.bookedForName,
        bookedForPhone: body.bookedForPhone,
        events: { create: { status: "REQUESTED", lat: body.pickup.lat, lng: body.pickup.lng } },
      },
      include: riderRideInclude,
    });
    return res.status(201).json(presentForRider(ride));
  } catch (e) {
    next(e);
  }
});

/** The rider's current active ride, if any (polled by the app). */
router.get("/active", async (req, res, next) => {
  try {
    await expireStaleRequests();
    const ride = await prisma.ride.findFirst({
      where: { riderId: req.user!.id, status: { in: [...ACTIVE_RIDE_STATUSES] } },
      orderBy: { requestedAt: "desc" },
      include: riderRideInclude,
    });
    return res.json(ride ? presentForRider(ride) : null);
  } catch (e) {
    next(e);
  }
});

router.get("/history", async (req, res, next) => {
  try {
    const rides = await prisma.ride.findMany({
      where: { riderId: req.user!.id },
      orderBy: { requestedAt: "desc" },
      take: 50,
      include: riderRideInclude,
    });
    return res.json(rides.map(presentForRider));
  } catch (e) {
    next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    await expireStaleRequests();
    const ride = await prisma.ride.findFirst({
      where: { id: req.params.id, riderId: req.user!.id },
      include: riderRideInclude,
    });
    if (!ride) throw httpError(404, "Ride not found");
    return res.json(presentForRider(ride));
  } catch (e) {
    next(e);
  }
});

router.post("/:id/cancel", async (req, res, next) => {
  try {
    const { reason } = z.object({ reason: z.string().max(200).optional() }).parse(req.body ?? {});
    const result = await prisma.ride.updateMany({
      where: {
        id: req.params.id,
        riderId: req.user!.id,
        status: { in: ["REQUESTED", "DRIVER_ASSIGNED", "DRIVER_ARRIVED"] },
      },
      data: { status: "CANCELLED_BY_RIDER", cancelledAt: new Date(), cancelReason: reason },
    });
    if (result.count === 0) throw httpError(409, "Ride can no longer be cancelled");
    await prisma.rideEvent.create({ data: { rideId: req.params.id, status: "CANCELLED_BY_RIDER", note: reason } });
    const ride = await prisma.ride.findUniqueOrThrow({ where: { id: req.params.id }, include: riderRideInclude });
    return res.json(presentForRider(ride));
  } catch (e) {
    next(e);
  }
});

router.post("/:id/rate", async (req, res, next) => {
  try {
    const { rating, comment } = z
      .object({ rating: z.number().int().min(1).max(5), comment: z.string().max(500).optional() })
      .parse(req.body);
    const ride = await prisma.ride.findFirst({
      where: { id: req.params.id, riderId: req.user!.id, status: "COMPLETED", riderRating: null },
    });
    if (!ride || !ride.driverId) throw httpError(409, "Ride cannot be rated");

    await prisma.$transaction(async (tx) => {
      await tx.ride.update({ where: { id: ride.id }, data: { riderRating: rating, riderComment: comment } });
      const d = await tx.driverProfile.findUniqueOrThrow({ where: { id: ride.driverId! } });
      const count = d.ratingCount + 1;
      await tx.driverProfile.update({
        where: { id: d.id },
        data: { ratingCount: count, ratingAvg: (d.ratingAvg * d.ratingCount + rating) / count },
      });
    });
    return res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;
