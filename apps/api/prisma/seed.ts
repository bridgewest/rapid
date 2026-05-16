import "dotenv/config";
import { prisma } from "../src/lib/prisma.js";
import bcrypt from "bcryptjs";

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

  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@dukorpay.local";
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
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
