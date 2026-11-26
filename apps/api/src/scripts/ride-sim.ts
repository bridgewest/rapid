/**
 * Rapid Ride simulator — LOCAL DEV ONLY.
 * Keeps the seeded demo drivers online and walks requested rides through the
 * full lifecycle so you can test the rider app without a second phone.
 *
 *   npm run ride:sim -w apps/api
 */
import "dotenv/config";
import { prisma } from "../lib/prisma.js";
import { nearbyDrivers } from "../services/rides.js";

if (process.env.NODE_ENV === "production") {
  console.error("ride-sim refuses to run in production");
  process.exit(1);
}

const TICK_MS = 3000;
const ACCEPT_AFTER_MS = 6000;
const STEP = 0.25; // fraction of remaining distance moved per tick

const isDemo = { user: { email: { endsWith: "@rapid.local" } } } as const;

function moveToward(lat: number, lng: number, tLat: number, tLng: number) {
  return { lat: lat + (tLat - lat) * STEP, lng: lng + (tLng - lng) * STEP };
}
function close(lat: number, lng: number, tLat: number, tLng: number) {
  return Math.abs(lat - tLat) < 0.0008 && Math.abs(lng - tLng) < 0.0008;
}
async function event(rideId: string, status: Parameters<typeof prisma.rideEvent.create>[0]["data"]["status"], lat?: number | null, lng?: number | null) {
  await prisma.rideEvent.create({ data: { rideId, status, lat, lng, note: "simulated" } });
}

async function tick() {
  // 1. Keep idle demo drivers online, with a little GPS jitter.
  const drivers = await prisma.driverProfile.findMany({ where: { ...isDemo, status: "APPROVED" } });
  for (const d of drivers) {
    const jitter = () => (Math.random() - 0.5) * 0.0006;
    await prisma.driverProfile.update({
      where: { id: d.id },
      data: {
        isOnline: true,
        lastLocationAt: new Date(),
        ...(d.lat != null && d.lng != null ? { lat: d.lat + jitter(), lng: d.lng + jitter() } : {}),
      },
    });
  }

  // 2. Accept waiting requests with the nearest free demo driver.
  const waiting = await prisma.ride.findMany({
    where: { status: "REQUESTED", requestedAt: { lte: new Date(Date.now() - ACCEPT_AFTER_MS) } },
  });
  for (const r of waiting) {
    const candidates = await nearbyDrivers(r.pickupLat, r.pickupLng, r.vehicleClass, 25);
    for (const c of candidates) {
      const demo = drivers.find((d) => d.id === c.id);
      if (!demo) continue;
      const busy = await prisma.ride.count({
        where: { driverId: c.id, status: { in: ["DRIVER_ASSIGNED", "DRIVER_ARRIVED", "IN_PROGRESS"] } },
      });
      if (busy) continue;
      const ok = await prisma.ride.updateMany({
        where: { id: r.id, status: "REQUESTED" },
        data: { status: "DRIVER_ASSIGNED", driverId: c.id, acceptedAt: new Date() },
      });
      if (ok.count) {
        await event(r.id, "DRIVER_ASSIGNED", c.lat, c.lng);
        console.log(`✓ ${demo.fullName} accepted ${r.pickupLabel} → ${r.dropoffLabel}`);
      }
      break;
    }
  }

  // 3. Drive assigned demo trips forward.
  const active = await prisma.ride.findMany({
    where: { status: { in: ["DRIVER_ASSIGNED", "DRIVER_ARRIVED", "IN_PROGRESS"] }, driver: isDemo },
    include: { driver: true },
  });
  for (const r of active) {
    const d = r.driver!;
    if (d.lat == null || d.lng == null) continue;
    if (r.status === "DRIVER_ASSIGNED") {
      const p = moveToward(d.lat, d.lng, r.pickupLat, r.pickupLng);
      await prisma.driverProfile.update({ where: { id: d.id }, data: { ...p, lastLocationAt: new Date() } });
      if (close(p.lat, p.lng, r.pickupLat, r.pickupLng)) {
        await prisma.ride.update({ where: { id: r.id }, data: { status: "DRIVER_ARRIVED", arrivedAt: new Date() } });
        await event(r.id, "DRIVER_ARRIVED", p.lat, p.lng);
        console.log(`• ${d.fullName} arrived at ${r.pickupLabel} (PIN ${r.pickupPin})`);
      }
    } else if (r.status === "DRIVER_ARRIVED" && r.arrivedAt && Date.now() - r.arrivedAt.getTime() > 8000) {
      await prisma.ride.update({ where: { id: r.id }, data: { status: "IN_PROGRESS", startedAt: new Date() } });
      await event(r.id, "IN_PROGRESS", d.lat, d.lng);
      console.log(`▶ trip started`);
    } else if (r.status === "IN_PROGRESS") {
      const p = moveToward(d.lat, d.lng, r.dropoffLat, r.dropoffLng);
      await prisma.driverProfile.update({ where: { id: d.id }, data: { ...p, lastLocationAt: new Date() } });
      if (close(p.lat, p.lng, r.dropoffLat, r.dropoffLng)) {
        await prisma.ride.update({
          where: { id: r.id },
          data: { status: "COMPLETED", completedAt: new Date(), fareFinalLrd: r.fareEstimateLrd },
        });
        await prisma.driverProfile.update({ where: { id: d.id }, data: { tripsCount: { increment: 1 } } });
        await event(r.id, "COMPLETED", p.lat, p.lng);
        console.log(`■ completed — LRD ${r.fareEstimateLrd}`);
      }
    }
  }
}

console.log("Rapid Ride simulator running (Ctrl+C to stop)…");
for (;;) {
  try {
    await tick();
  } catch (e) {
    console.error(e);
  }
  await new Promise((r) => setTimeout(r, TICK_MS));
}
