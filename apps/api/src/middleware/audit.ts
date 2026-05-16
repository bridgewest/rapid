import type { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.js";

export function withAudit(action: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);
    res.json = (body: unknown) => {
      void prisma.auditLog
        .create({
          data: {
            userId: req.user?.id,
            action,
            resource: req.path,
            ip: req.ip,
            deviceFp: req.get("x-device-fingerprint") ?? undefined,
            payload: {
              method: req.method,
              statusCode: res.statusCode,
            },
          },
        })
        .catch(() => {});
      return originalJson(body);
    };
    next();
  };
}
