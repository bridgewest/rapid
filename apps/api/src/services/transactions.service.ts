import { nanoid } from "nanoid";
import {
  ProductPhase,
  TransactionKind,
  TransactionStatus,
  type Prisma,
} from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { getUsdToLrdRate, lrdFromUsd } from "./fx.js";
import { AIRTIME_FLAT_FEE_CENTS, airtimeRetailUsdCents, remittanceFeeUsdCents } from "./fees.js";
import { screenTransaction } from "./compliance.js";
import { Decimal } from "@prisma/client/runtime/library";

type ClientMeta = { ip?: string; deviceFingerprint?: string; idempotencyKey?: string };

export async function createRemittanceTx(
  userId: string,
  input: {
    sendAmountUsdCents: number;
    recipientId: string;
  },
  meta: ClientMeta,
) {
  const recipient = await prisma.recipient.findFirst({
    where: { id: input.recipientId, ownerId: userId },
  });
  if (!recipient) throw Object.assign(new Error("Recipient not found"), { status: 404 });

  const { rate } = await getUsdToLrdRate();
  const fee = remittanceFeeUsdCents(input.sendAmountUsdCents);
  const receiveLrd = lrdFromUsd(input.sendAmountUsdCents, rate);
  const screening = await screenTransaction({
    amountUsdCents: input.sendAmountUsdCents,
    recipientPhone: recipient.phoneE164,
  });

  const data: Prisma.TransactionCreateInput = {
    user: { connect: { id: userId } },
    kind: TransactionKind.REMITTANCE,
    phase: ProductPhase.PHASE_1,
    status:
      screening.result === "MATCH"
        ? TransactionStatus.FAILED
        : screening.result === "PENDING_REVIEW"
          ? TransactionStatus.PROCESSING
          : TransactionStatus.INITIATED,
    sendAmountUsdCents: input.sendAmountUsdCents,
    receiveAmountLrdCents: receiveLrd,
    fxRateUsed: rate,
    feePercentApplied: new Decimal("1.5"),
    feeFlatUsdCents: 0,
    feeTotalUsdCents: fee,
    recipient: { connect: { id: recipient.id } },
    provider: process.env.BAAS_PROVIDER ?? "stripe_treasury",
    idempotencyKey: meta.idempotencyKey ?? nanoid(),
    ipAddress: meta.ip,
    deviceFingerprint: meta.deviceFingerprint,
    sanctionsResult: screening.result,
    sanctionsPayload: screening.payload as Prisma.InputJsonValue,
    metadata: { corridor: "US-LR" } as Prisma.InputJsonValue,
    events: {
      create: {
        status:
          screening.result === "MATCH"
            ? TransactionStatus.FAILED
            : TransactionStatus.INITIATED,
        note: "Transfer initiated",
      },
    },
  };

  const tx = await prisma.transaction.create({ data });

  if (input.sendAmountUsdCents >= 300_000) {
    await prisma.amlFlag.create({
      data: {
        userId,
        transactionId: tx.id,
        severity: "MEDIUM",
        reason: "Single transfer >= $3000",
        amountUsdCents: input.sendAmountUsdCents,
      },
    });
  }

  return tx;
}

export async function createAirtimeTx(
  userId: string,
  input: {
    recipientPhoneE164: string;
    wholesaleUsdCents: number;
    marginPercent: number;
    carrier: string;
  },
  meta: ClientMeta,
) {
  const retail = airtimeRetailUsdCents(input.wholesaleUsdCents, input.marginPercent);
  const total = retail + AIRTIME_FLAT_FEE_CENTS;
  const screening = await screenTransaction({
    amountUsdCents: total,
    recipientPhone: input.recipientPhoneE164,
  });

  const tx = await prisma.transaction.create({
    data: {
      user: { connect: { id: userId } },
      kind: TransactionKind.AIRTIME,
      phase: ProductPhase.PHASE_2,
      status:
        screening.result === "MATCH"
          ? TransactionStatus.FAILED
          : TransactionStatus.INITIATED,
      sendAmountUsdCents: total,
      feeFlatUsdCents: AIRTIME_FLAT_FEE_CENTS,
      feeTotalUsdCents: AIRTIME_FLAT_FEE_CENTS,
      marginPercentAirtime: new Decimal(input.marginPercent.toString()),
      provider: "reloadly",
      idempotencyKey: meta.idempotencyKey ?? nanoid(),
      ipAddress: meta.ip,
      deviceFingerprint: meta.deviceFingerprint,
      sanctionsResult: screening.result,
      sanctionsPayload: screening.payload as Prisma.InputJsonValue,
      metadata: {
        carrier: input.carrier,
        retailUsdCents: retail,
        wholesaleUsdCents: input.wholesaleUsdCents,
        deliverySms: true,
      } as Prisma.InputJsonValue,
      events: {
        create: { status: TransactionStatus.INITIATED, note: "Airtime top-up initiated" },
      },
    },
  });

  return tx;
}

export async function createComboTx(
  userId: string,
  input: {
    remittanceUsdCents: number;
    airtimeWholesaleUsdCents: number;
    airtimeMarginPercent: number;
    recipientId: string;
    recipientPhoneForAirtime: string;
    carrier: string;
  },
  meta: ClientMeta,
) {
  const groupId = nanoid();
  const recipient = await prisma.recipient.findFirst({
    where: { id: input.recipientId, ownerId: userId },
  });
  if (!recipient) throw Object.assign(new Error("Recipient not found"), { status: 404 });

  const { rate } = await getUsdToLrdRate();
  const remitFee = remittanceFeeUsdCents(input.remittanceUsdCents);
  const receiveLrd = lrdFromUsd(input.remittanceUsdCents, rate);
  const retailAir = airtimeRetailUsdCents(input.airtimeWholesaleUsdCents, input.airtimeMarginPercent);
  const airTotal = retailAir + AIRTIME_FLAT_FEE_CENTS;

  const screening = await screenTransaction({
    amountUsdCents: input.remittanceUsdCents + airTotal,
    recipientPhone: recipient.phoneE164,
  });

  const parent = await prisma.transaction.create({
    data: {
      user: { connect: { id: userId } },
      kind: TransactionKind.COMBO,
      phase: ProductPhase.PHASE_2,
      status: TransactionStatus.INITIATED,
      sendAmountUsdCents: input.remittanceUsdCents + airTotal,
      feeTotalUsdCents: remitFee + AIRTIME_FLAT_FEE_CENTS,
      transactionGroupId: groupId,
      legIndex: 0,
      comboInitiator: { connect: { id: userId } },
      ipAddress: meta.ip,
      deviceFingerprint: meta.deviceFingerprint,
      sanctionsResult: screening.result,
      sanctionsPayload: screening.payload as Prisma.InputJsonValue,
      metadata: { bundle: "cash_plus_airtime" } as Prisma.InputJsonValue,
      events: {
        create: { status: TransactionStatus.INITIATED, note: "Combo checkout" },
      },
    },
  });

  const legRemit = await prisma.transaction.create({
    data: {
      user: { connect: { id: userId } },
      kind: TransactionKind.REMITTANCE,
      phase: ProductPhase.PHASE_1,
      status: TransactionStatus.INITIATED,
      sendAmountUsdCents: input.remittanceUsdCents,
      receiveAmountLrdCents: receiveLrd,
      fxRateUsed: rate,
      feePercentApplied: new Decimal("1.5"),
      feeTotalUsdCents: remitFee,
      recipient: { connect: { id: recipient.id } },
      transactionGroupId: groupId,
      legIndex: 1,
      parentTransaction: { connect: { id: parent.id } },
      ipAddress: meta.ip,
      deviceFingerprint: meta.deviceFingerprint,
      sanctionsResult: screening.result,
    },
  });

  const legAir = await prisma.transaction.create({
    data: {
      user: { connect: { id: userId } },
      kind: TransactionKind.AIRTIME,
      phase: ProductPhase.PHASE_2,
      status: TransactionStatus.INITIATED,
      sendAmountUsdCents: airTotal,
      feeFlatUsdCents: AIRTIME_FLAT_FEE_CENTS,
      feeTotalUsdCents: AIRTIME_FLAT_FEE_CENTS,
      marginPercentAirtime: new Decimal(input.airtimeMarginPercent.toString()),
      transactionGroupId: groupId,
      legIndex: 2,
      parentTransaction: { connect: { id: parent.id } },
      provider: "reloadly",
      ipAddress: meta.ip,
      deviceFingerprint: meta.deviceFingerprint,
      sanctionsResult: screening.result,
      metadata: {
        carrier: input.carrier,
        recipientPhone: input.recipientPhoneForAirtime,
        retailUsdCents: retailAir,
      } as Prisma.InputJsonValue,
    },
  });

  return { groupId, parent, legs: [legRemit, legAir] };
}
