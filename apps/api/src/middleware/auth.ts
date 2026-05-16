import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { getSupabaseAdmin, isSupabaseAuthConfigured } from "../lib/supabase.js";

export type AuthUser = { id: string; email: string; adminRole?: string };

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

const SECRET = process.env.JWT_SECRET ?? "dev-secret-change-me";

function bearerToken(req: Request): string | undefined {
  const h = req.headers.authorization;
  return h?.startsWith("Bearer ") ? h.slice(7) : undefined;
}

async function resolveUserFromSupabaseJwt(token: string): Promise<{ id: string; email: string } | null> {
  const admin = getSupabaseAdmin();
  if (!admin) return null;
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user?.id) return null;
  const email = data.user.email;
  if (!email) return null;

  const byLink = await prisma.user.findFirst({
    where: { supabaseUserId: data.user.id },
    select: { id: true, email: true },
  });
  if (byLink) return { id: byLink.id, email: byLink.email };

  const byEmail = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, supabaseUserId: true },
  });
  if (byEmail) {
    if (!byEmail.supabaseUserId) {
      await prisma.user.update({
        where: { id: byEmail.id },
        data: { supabaseUserId: data.user.id },
      });
    }
    return { id: byEmail.id, email: byEmail.email };
  }
  return null;
}

/** Supports Supabase access tokens (when configured) and legacy HS256 JWT. */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  void (async () => {
    try {
      const token = bearerToken(req);
      if (!token) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      if (isSupabaseAuthConfigured()) {
        const fromSb = await resolveUserFromSupabaseJwt(token);
        if (fromSb) {
          req.user = fromSb;
          next();
          return;
        }
      }

      try {
        const payload = jwt.verify(token, SECRET) as { sub: string; email: string };
        req.user = { id: payload.sub, email: payload.email };
        next();
      } catch {
        res.status(401).json({ error: "Invalid token" });
      }
    } catch (e) {
      next(e);
    }
  })();
}

export function requireAdmin(role: "admin" | "compliance" | "support" | "any" = "any") {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const profile = await prisma.adminProfile.findUnique({
      where: { userId: req.user.id },
    });
    if (!profile) return res.status(403).json({ error: "Admin only" });
    if (role !== "any" && profile.role !== role && profile.role !== "admin") {
      return res.status(403).json({ error: "Insufficient role" });
    }
    req.user.adminRole = profile.role;
    next();
  };
}

export function signAccessToken(userId: string, email: string) {
  return jwt.sign({ sub: userId, email }, SECRET, { expiresIn: "15m" });
}
