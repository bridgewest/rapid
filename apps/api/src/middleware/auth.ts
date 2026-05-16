import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

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

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const h = req.headers.authorization;
  const token = h?.startsWith("Bearer ") ? h.slice(7) : undefined;
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const payload = jwt.verify(token, SECRET) as { sub: string; email: string };
    req.user = { id: payload.sub, email: payload.email };
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
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
