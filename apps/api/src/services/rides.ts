import type { VehicleClass } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

/**
 * Rapid Ride pricing — quoted in LRD.
 * Starting points only: tune with real Monrovia market data before launch.
 */
export const FARE_TABLE: Record<
  VehicleClass,
  { label: string; seats: number; baseLrd: number; perKmLrd: number; perMinLrd: number; minimumLrd: number }
> = {
  KEKE: { label: "Keke", seats: 3, baseLrd: 100, perKmLrd: 40, perMinLrd: 5, minimumLrd: 150 },
  TAXI: { label: "Taxi", seats: 4, baseLrd: 200, perKmLrd: 70, perMinLrd: 8, minimumLrd: 300 },
  COMFORT: { label: "Comfort", seats: 4, baseLrd: 400, perKmLrd: 120, perMinLrd: 12, minimumLrd: 600 },
};

export const PLATFORM_FEE_PERCENT = 15;
/** Drivers within this radius are offered a request. */
export const DISPATCH_RADIUS_KM = 6;
/** A request with no taker after this long becomes NO_DRIVERS. */
export const REQUEST_TIMEOUT_MS = 5 * 60_000;
/** A driver whose last GPS ping is older than this is treated as offline. */
export const DRIVER_STALE_MS = 2 * 60_000;

/** Road distance is longer than straight-line; Monrovia's grid + bridges ≈ 1.35×. */
const ROAD_FACTOR = 1.35;
/** Average urban speed incl. traffic (km/h); distance beyond URBAN_KM runs at highway speed. */
const AVG_SPEED_KMH = 18;
const URBAN_KM = 10;
const HIGHWAY_SPEED_KMH = 45;

export function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function estimateTrip(pickup: { lat: number; lng: number }, dropoff: { lat: number; lng: number }) {
  const distanceKm = Math.max(0.3, haversineKm(pickup.lat, pickup.lng, dropoff.lat, dropoff.lng) * ROAD_FACTOR);
  const urban = Math.min(distanceKm, URBAN_KM);
  const highway = Math.max(0, distanceKm - URBAN_KM);
  const durationMin = Math.max(3, Math.round((urban / AVG_SPEED_KMH + highway / HIGHWAY_SPEED_KMH) * 60));
  return { distanceKm: Math.round(distanceKm * 10) / 10, durationMin };
}

export function fareLrd(vehicleClass: VehicleClass, distanceKm: number, durationMin: number, surge = 1): number {
  const t = FARE_TABLE[vehicleClass];
  const raw = t.baseLrd + t.perKmLrd * distanceKm + t.perMinLrd * durationMin;
  // Round up to nearest 25 LRD — easier for cash change.
  return Math.ceil((Math.max(t.minimumLrd, raw) * surge) / 25) * 25;
}

function onlineDriverWhere(vehicleClass?: VehicleClass) {
  return {
    status: "APPROVED" as const,
    isOnline: true,
    lastLocationAt: { gte: new Date(Date.now() - DRIVER_STALE_MS) },
    ...(vehicleClass ? { vehicleClass } : {}),
  };
}

/** Simple supply/demand surge: open requests vs. online drivers per class, capped at 1.5×. */
export async function surgeFor(vehicleClass: VehicleClass): Promise<number> {
  const [open, drivers] = await Promise.all([
    prisma.ride.count({
      where: {
        vehicleClass,
        status: "REQUESTED",
        requestedAt: { gte: new Date(Date.now() - REQUEST_TIMEOUT_MS) },
      },
    }),
    prisma.driverProfile.count({ where: onlineDriverWhere(vehicleClass) }),
  ]);
  if (drivers === 0 || open <= drivers) return 1;
  return Math.min(1.5, Math.round((1 + (open - drivers) / drivers / 4) * 100) / 100);
}

/** Nearby online drivers (approximate bounding box, then exact distance). */
export async function nearbyDrivers(lat: number, lng: number, vehicleClass?: VehicleClass, radiusKm = DISPATCH_RADIUS_KM) {
  const dLat = radiusKm / 111;
  const dLng = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));
  const drivers = await prisma.driverProfile.findMany({
    where: {
      ...onlineDriverWhere(vehicleClass),
      lat: { gte: lat - dLat, lte: lat + dLat },
      lng: { gte: lng - dLng, lte: lng + dLng },
    },
    select: { id: true, lat: true, lng: true, vehicleClass: true },
  });
  return drivers
    .map((d) => ({ ...d, distanceKm: haversineKm(lat, lng, d.lat!, d.lng!) }))
    .filter((d) => d.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

export function etaMinutes(distanceKm: number): number {
  return Math.max(2, Math.round(((distanceKm * ROAD_FACTOR) / AVG_SPEED_KMH) * 60));
}

export function makePickupPin(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

/** Lazily expire stale requests so riders aren't left waiting forever. */
export async function expireStaleRequests() {
  const cutoff = new Date(Date.now() - REQUEST_TIMEOUT_MS);
  const stale = await prisma.ride.findMany({
    where: { status: "REQUESTED", requestedAt: { lt: cutoff } },
    select: { id: true },
  });
  if (stale.length === 0) return;
  await prisma.$transaction([
    prisma.ride.updateMany({
      where: { id: { in: stale.map((s) => s.id) }, status: "REQUESTED" },
      data: { status: "NO_DRIVERS", cancelledAt: new Date() },
    }),
    prisma.rideEvent.createMany({
      data: stale.map((s) => ({ rideId: s.id, status: "NO_DRIVERS" as const, note: "No driver accepted in time" })),
    }),
  ]);
}

export const ACTIVE_RIDE_STATUSES = ["REQUESTED", "DRIVER_ASSIGNED", "DRIVER_ARRIVED", "IN_PROGRESS"] as const;

export function httpError(status: number, message: string) {
  return Object.assign(new Error(message), { status });
}
