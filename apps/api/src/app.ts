import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import { errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import kycRoutes from "./routes/kyc.js";
import recipientRoutes from "./routes/recipients.js";
import quoteRoutes from "./routes/quotes.js";
import transactionRoutes from "./routes/transactions.js";
import walletRoutes from "./routes/wallet.js";
import deviceRoutes from "./routes/devices.js";
import adminRoutes from "./routes/admin.js";

export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN?.split(",") ?? "*",
      exposedHeaders: ["idempotency-key"],
    }),
  );
  app.use(express.json({ limit: "2mb" }));
  app.use(
    rateLimit({
      windowMs: 60_000,
      max: 120,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  app.get("/health", (_req, res) => res.json({ ok: true, service: "dukorpay-api" }));

  app.use("/auth", authRoutes);
  app.use("/users", userRoutes);
  app.use("/kyc", kycRoutes);
  app.use("/recipients", recipientRoutes);
  app.use("/quotes", quoteRoutes);
  app.use("/transactions", transactionRoutes);
  app.use("/wallet", walletRoutes);
  app.use("/devices", deviceRoutes);
  app.use("/admin", adminRoutes);

  app.use(errorHandler);
  return app;
}
