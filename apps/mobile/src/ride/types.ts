import { apiFetch } from "../api/client";

export type VehicleClass = "KEKE" | "TAXI" | "COMFORT";
export type PaymentMethod = "CASH" | "MOBILE_MONEY" | "WALLET";
export type RideStatus =
  | "REQUESTED"
  | "DRIVER_ASSIGNED"
  | "DRIVER_ARRIVED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED_BY_RIDER"
  | "CANCELLED_BY_DRIVER"
  | "NO_DRIVERS";

export type Point = { lat: number; lng: number; label: string };

export type FareOption = {
  vehicleClass: VehicleClass;
  label: string;
  seats: number;
  fareLrd: number;
  fareUsdCents: number;
  surgeMultiplier: number;
  driversNearby: number;
  pickupEtaMin: number | null;
};

type RideBase = {
  id: string;
  publicId: string;
  status: RideStatus;
  vehicleClass: VehicleClass;
  paymentMethod: PaymentMethod;
  pickupLat: number;
  pickupLng: number;
  pickupLabel: string;
  dropoffLat: number;
  dropoffLng: number;
  dropoffLabel: string;
  distanceKm: number;
  durationMin: number;
  fareEstimateLrd: number;
  fareFinalLrd: number | null;
  requestedAt: string;
  completedAt: string | null;
};

export type RiderRide = RideBase & {
  pickupPin: string;
  riderRating: number | null;
  driverEtaMin: number | null;
  driver: null | {
    fullName: string;
    vehicleClass: VehicleClass;
    vehicleMake: string;
    vehicleModel: string;
    vehicleColor: string;
    plateNumber: string;
    ratingAvg: number;
    tripsCount: number;
    phoneE164: string;
    lat: number | null;
    lng: number | null;
  };
};

export type DriverRide = RideBase & {
  driverEarningsLrd: number;
  driverRating: number | null;
  toPickupKm?: number;
  pickupEtaMin?: number;
  rider: { name: string; phoneE164: string };
};

export type DriverProfile = {
  id: string;
  status: "PENDING" | "APPROVED" | "SUSPENDED" | "REJECTED";
  fullName: string;
  vehicleClass: VehicleClass;
  vehicleMake: string;
  vehicleModel: string;
  vehicleColor: string;
  plateNumber: string;
  isOnline: boolean;
  ratingAvg: number;
  ratingCount: number;
  tripsCount: number;
  reviewerNotes: string | null;
  todayTrips: number;
  todayEarningsLrd: number;
};

export const CLASS_INFO: Record<VehicleClass, { emoji: string; blurb: string }> = {
  KEKE: { emoji: "🛺", blurb: "Tricycle · cheapest for short trips" },
  TAXI: { emoji: "🚕", blurb: "Private yellow taxi, just for you" },
  COMFORT: { emoji: "🚙", blurb: "Newer car or SUV, A/C" },
};

export const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  CASH: "Cash",
  MOBILE_MONEY: "Mobile money",
  WALLET: "Rapid wallet",
};

export function lrd(n: number): string {
  return `L$${Math.round(n).toLocaleString("en-US")}`;
}

/** apiFetch that throws the server's error message on non-2xx. */
export async function rideApi<T>(path: string, init?: { method?: string; body?: unknown }): Promise<T> {
  const res = await apiFetch(path, {
    method: init?.method ?? (init?.body ? "POST" : "GET"),
    body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error((data && (data.error as string)) || `Request failed (${res.status})`);
  return data as T;
}
