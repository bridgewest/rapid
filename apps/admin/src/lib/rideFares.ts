/** Mirrors apps/api/src/services/rides.ts — illustrative website estimates only. */
export const RIDE_CLASSES = [
  {
    id: "KEKE",
    label: "Keke",
    icon: "🛺",
    seats: 3,
    bestFor: "Quick, cheap hops around town",
    base: 100,
    perKm: 40,
    perMin: 5,
    min: 150,
  },
  {
    id: "TAXI",
    label: "Taxi",
    icon: "🚕",
    seats: 4,
    bestFor: "Private yellow taxi — no sharing, no stops",
    base: 200,
    perKm: 70,
    perMin: 8,
    min: 300,
  },
  {
    id: "COMFORT",
    label: "Comfort",
    icon: "🚙",
    seats: 4,
    bestFor: "Newer car or SUV with A/C — airport & business",
    base: 400,
    perKm: 120,
    perMin: 12,
    min: 600,
  },
] as const;

export type RideClassId = (typeof RIDE_CLASSES)[number]["id"];

export const RIDE_PLACES = [
  { label: "Broad Street", area: "Central Monrovia", lat: 6.3156, lng: -10.8074 },
  { label: "Waterside Market", area: "Central Monrovia", lat: 6.3178, lng: -10.8043 },
  { label: "Mamba Point", area: "Central Monrovia", lat: 6.317, lng: -10.815 },
  { label: "Capitol Hill", area: "Central Monrovia", lat: 6.3046, lng: -10.7935 },
  { label: "JFK Medical Center", area: "Sinkor", lat: 6.2953, lng: -10.7799 },
  { label: "Tubman Boulevard, Sinkor", area: "Sinkor", lat: 6.293, lng: -10.777 },
  { label: "Spriggs Payne Airport", area: "Sinkor", lat: 6.289, lng: -10.7587 },
  { label: "Congo Town", area: "Congo Town", lat: 6.278, lng: -10.75 },
  { label: "Red Light Market", area: "Paynesville", lat: 6.2955, lng: -10.715 },
  { label: "ELWA Junction", area: "Paynesville", lat: 6.2416, lng: -10.7047 },
  { label: "Gardnersville", area: "Gardnersville", lat: 6.32, lng: -10.753 },
  { label: "Freeport of Monrovia", area: "Bushrod Island", lat: 6.346, lng: -10.79 },
  { label: "Duala Market", area: "Bushrod Island", lat: 6.348, lng: -10.777 },
  { label: "Roberts Intl Airport (RIA)", area: "Harbel", lat: 6.2338, lng: -10.3623 },
];

export const PLATFORM_TAKE = 0.15;

export function estimateRide(fromIdx: number, toIdx: number) {
  const a = RIDE_PLACES[fromIdx];
  const b = RIDE_PLACES[toIdx];
  const toRad = (d: number) => (d * Math.PI) / 180;
  const h =
    Math.sin(toRad(b.lat - a.lat) / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(toRad(b.lng - a.lng) / 2) ** 2;
  const km = Math.max(0.3, 2 * 6371 * Math.asin(Math.sqrt(h)) * 1.35);
  const min = Math.max(3, Math.round((Math.min(km, 10) / 18 + Math.max(0, km - 10) / 45) * 60));
  return {
    km: Math.round(km * 10) / 10,
    min,
    fares: RIDE_CLASSES.map((c) => ({
      ...c,
      fare: Math.ceil(Math.max(c.min, c.base + c.perKm * km + c.perMin * min) / 25) * 25,
    })),
  };
}

export const formatLrdWhole = (n: number) => `L$ ${Math.round(n).toLocaleString("en-US")}`;
