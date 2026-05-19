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

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
