import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: "validation", details: err.flatten() });
  }
  const message = err instanceof Error ? err.message : "Internal error";
  const status =
    typeof (err as { status?: number })?.status === "number" ? (err as { status: number }).status : 500;
  console.error(err);
  return res.status(status).json({ error: message });
}
