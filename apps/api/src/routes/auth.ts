import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { signAccessToken } from "../middleware/auth.js";
import { customAlphabet } from "nanoid";
import { getSupabaseAdmin, getSupabaseAnon, isSupabaseAuthConfigured } from "../lib/supabase.js";

const router = Router();
const nanoidCode = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 8);

const registerSchema = z.object({
  phoneE164: z.string().min(10),
  email: z.string().email(),
  password: z.string().min(8),
  referralCode: z.string().optional(),
});

async function issueSupabaseSession(email: string, password: string) {
  const anon = getSupabaseAnon();
  if (!anon) return null;
  const { data, error } = await anon.auth.signInWithPassword({ email, password });
  if (error || !data.session?.access_token) return null;
  return data.session.access_token;
}

router.post("/register", async (req, res, next) => {
  try {
    const body = registerSchema.parse(req.body);
    const exists = await prisma.user.findFirst({
      where: { OR: [{ phoneE164: body.phoneE164 }, { email: body.email }] },
    });
    if (exists) return res.status(409).json({ error: "Phone or email already registered" });

    let referredByUserId: string | undefined;
    if (body.referralCode) {
      const ref = await prisma.user.findUnique({ where: { referrerCode: body.referralCode } });
      if (ref) referredByUserId = ref.id;
    }

    const passwordHash = await bcrypt.hash(body.password, 12);
    const user = await prisma.user.create({
      data: {
        phoneE164: body.phoneE164,
        email: body.email,
        passwordHash,
        referrerCode: nanoidCode(),
        referredByUserId,
        profile: { create: {} },
        wallet: { create: {} },
        mfaFactors: {
          create: [{ channel: "SMS", verified: false }],
        },
      },
    });

    if (isSupabaseAuthConfigured()) {
      const admin = getSupabaseAdmin();
      if (!admin) {
        await prisma.user.delete({ where: { id: user.id } });
        return res.status(500).json({ error: "Supabase is not configured correctly" });
      }
      const { data: sbData, error: sbErr } = await admin.auth.admin.createUser({
        email: body.email,
        password: body.password,
        email_confirm: true,
      });
      if (sbErr || !sbData.user?.id) {
        await prisma.user.delete({ where: { id: user.id } });
        const msg = sbErr?.message ?? "Could not create auth user";
        return res.status(400).json({ error: msg });
      }
      await prisma.user.update({
        where: { id: user.id },
        data: { supabaseUserId: sbData.user.id },
      });

      const accessToken = await issueSupabaseSession(body.email, body.password);
      if (!accessToken) {
        await admin.auth.admin.deleteUser(sbData.user.id);
        await prisma.user.delete({ where: { id: user.id } });
        return res.status(500).json({ error: "Could not establish Supabase session" });
      }

      return res.status(201).json({
        accessToken,
        user: {
          id: user.id,
          phoneE164: user.phoneE164,
          email: user.email,
          kycStatus: user.kycStatus,
        },
      });
    }

    const token = signAccessToken(user.id, user.email);
    return res.status(201).json({
      accessToken: token,
      user: { id: user.id, phoneE164: user.phoneE164, email: user.email, kycStatus: user.kycStatus },
    });
  } catch (e) {
    next(e);
  }
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

router.post("/login", async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body);

    if (isSupabaseAuthConfigured()) {
      const accessToken = await issueSupabaseSession(body.email, body.password);
      if (!accessToken) return res.status(401).json({ error: "Invalid credentials" });
      const admin = getSupabaseAdmin()!;
      const { data: sbUser } = await admin.auth.getUser(accessToken);
      if (!sbUser.user?.id) return res.status(401).json({ error: "Invalid credentials" });

      let user = await prisma.user.findFirst({
        where: { supabaseUserId: sbUser.user.id },
      });
      if (!user) {
        user = await prisma.user.findUnique({ where: { email: body.email } });
        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: { supabaseUserId: sbUser.user.id },
          });
        }
      }
      if (!user) return res.status(401).json({ error: "Invalid credentials" });

      return res.json({
        accessToken,
        user: {
          id: user.id,
          phoneE164: user.phoneE164,
          email: user.email,
          kycStatus: user.kycStatus,
        },
      });
    }

    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    const ok = await bcrypt.compare(body.password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });
    const token = signAccessToken(user.id, user.email);
    return res.json({
      accessToken: token,
      user: { id: user.id, phoneE164: user.phoneE164, email: user.email, kycStatus: user.kycStatus },
    });
  } catch (e) {
    next(e);
  }
});

/** Stub: in production integrate Twilio / Firebase phone OTP */
router.post("/verify-otp", async (req, res, next) => {
  try {
    const schema = z.object({ phoneE164: z.string(), code: z.string().length(6) });
    const { phoneE164, code } = schema.parse(req.body);
    if (code !== "000000" && code !== "123456") {
      return res.status(400).json({ error: "Invalid code (dev: use 123456)" });
    }
    const user = await prisma.user.findUnique({ where: { phoneE164 } });
    if (!user) return res.status(404).json({ error: "User not found" });
    await prisma.mfaFactor.updateMany({
      where: { userId: user.id, channel: "SMS" },
      data: { verified: true, lastUsedAt: new Date() },
    });
    return res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;
