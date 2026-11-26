import "dotenv/config";
import { prisma } from "../src/lib/prisma.js";
import bcrypt from "bcryptjs";
import { getSupabaseAdmin, isSupabaseAuthConfigured } from "../src/lib/supabase.js";

async function main() {
  const count = await prisma.exchangeRate.count({ where: { base: "USD", quote: "LRD" } });
  if (count === 0) {
    await prisma.exchangeRate.create({
      data: {
        base: "USD",
        quote: "LRD",
        rate: 192.25,
        source: "seed",
        isManualOverride: false,
      },
    });
  }

  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@rapid.local";
  const exists = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!exists) {
    const hash = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD ?? "admin-admin-admin", 12);
    await prisma.user.create({
      data: {
        email: adminEmail,
        phoneE164: "+10000000000",
        passwordHash: hash,
        tier: "KYC_VERIFIED",
        kycStatus: "APPROVED",
        referrerCode: "ADMIN01",
        profile: { create: { displayName: "Admin" } },
        wallet: { create: {} },
        adminProfile: { create: { role: "admin" } },
      },
    });
    console.log("Seeded admin:", adminEmail);
  }

  if (isSupabaseAuthConfigured()) {
    const admin = getSupabaseAdmin();
    const pwd = process.env.SEED_ADMIN_PASSWORD ?? "admin-admin-admin";
    if (admin) {
      const row = await prisma.user.findUnique({ where: { email: adminEmail } });
      if (row && !row.supabaseUserId) {
        const { data: created, error: createErr } = await admin.auth.admin.createUser({
          email: adminEmail,
          password: pwd,
          email_confirm: true,
        });
        let supabaseId = created.user?.id;
        if (createErr && !supabaseId) {
          const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
          supabaseId = list?.users?.find((u) => u.email === adminEmail)?.id;
        }
        if (supabaseId) {
          await prisma.user.update({
            where: { email: adminEmail },
            data: { supabaseUserId: supabaseId },
          });
          console.log("Linked seed admin to Supabase Auth:", adminEmail);
        } else if (createErr) {
          console.warn("Supabase Auth link skipped:", createErr.message);
        }
      }
    }
  }
}

/** Demo drivers spread across Greater Monrovia — local dev only. */
const DEMO_DRIVERS = [
  { name: "Joseph Kollie", cls: "TAXI", make: "Toyota", model: "Corolla", color: "Yellow", plate: "TX-1042", lat: 6.3106, lng: -10.8047 },
  { name: "Musu Kamara", cls: "COMFORT", make: "Toyota", model: "RAV4", color: "Silver", plate: "PP-2210", lat: 6.2907, lng: -10.7605 },
  { name: "Emmanuel Doe", cls: "KEKE", make: "Bajaj", model: "RE", color: "Yellow", plate: "KK-0381", lat: 6.3004, lng: -10.7969 },
  { name: "Fatu Sirleaf", cls: "TAXI", make: "Nissan", model: "Sunny", color: "Yellow", plate: "TX-5531", lat: 6.2774, lng: -10.7346 },
  { name: "Samuel Weah", cls: "KEKE", make: "TVS", model: "King", color: "Yellow", plate: "KK-0917", lat: 6.3302, lng: -10.7781 },
] as const;

async function seedDemoDrivers() {
  if (process.env.NODE_ENV === "production") return;
  const hash = await bcrypt.hash("driver-demo-123", 10);
  for (const [i, d] of DEMO_DRIVERS.entries()) {
    const email = `driver${i + 1}@rapid.local`;
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        phoneE164: `+23177000${String(i + 1).padStart(4, "0")}`,
        passwordHash: hash,
        profile: { create: { displayName: d.name, country: "LR", city: "Monrovia" } },
        wallet: { create: {} },
      },
    });
    await prisma.driverProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        status: "APPROVED",
        approvedAt: new Date(),
        fullName: d.name,
        licenseNumber: `LR-DL-${1000 + i}`,
        vehicleClass: d.cls,
        vehicleMake: d.make,
        vehicleModel: d.model,
        vehicleColor: d.color,
        plateNumber: d.plate,
        lat: d.lat,
        lng: d.lng,
        ratingAvg: 4.7 + (i % 3) / 10,
        ratingCount: 20 + i * 7,
        tripsCount: 40 + i * 13,
      },
    });
  }
  console.log(`Seeded ${DEMO_DRIVERS.length} demo drivers (driverN@rapid.local / driver-demo-123)`);
}

main()
  .then(seedDemoDrivers)
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
