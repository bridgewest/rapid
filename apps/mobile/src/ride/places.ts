/**
 * Greater Monrovia landmarks. Liberians navigate by landmark ("by ELWA
 * junction", "behind Red Light"), not street address — so pickup/dropoff is
 * landmark-first. Coordinates are APPROXIMATE: verify on the ground and move
 * to a server-managed table (or Google Places) before launch.
 */
export type Place = { label: string; area: string; lat: number; lng: number };

export const MONROVIA_PLACES: Place[] = [
  { label: "Broad Street", area: "Central Monrovia", lat: 6.3156, lng: -10.8074 },
  { label: "Waterside Market", area: "Central Monrovia", lat: 6.3178, lng: -10.8043 },
  { label: "Mamba Point", area: "Central Monrovia", lat: 6.317, lng: -10.815 },
  { label: "Capitol Hill", area: "Central Monrovia", lat: 6.3046, lng: -10.7935 },
  { label: "University of Liberia (Capitol Hill)", area: "Central Monrovia", lat: 6.307, lng: -10.792 },
  { label: "JFK Medical Center", area: "Sinkor", lat: 6.2953, lng: -10.7799 },
  { label: "Tubman Boulevard (Sinkor)", area: "Sinkor", lat: 6.293, lng: -10.777 },
  { label: "Spriggs Payne Airport", area: "Sinkor", lat: 6.289, lng: -10.7587 },
  { label: "Fish Market", area: "Sinkor", lat: 6.283, lng: -10.76 },
  { label: "Congo Town", area: "Congo Town", lat: 6.278, lng: -10.75 },
  { label: "Red Light Market", area: "Paynesville", lat: 6.2955, lng: -10.715 },
  { label: "Paynesville City Hall", area: "Paynesville", lat: 6.293, lng: -10.713 },
  { label: "ELWA Junction", area: "Paynesville", lat: 6.2416, lng: -10.7047 },
  { label: "Gardnersville", area: "Gardnersville", lat: 6.32, lng: -10.753 },
  { label: "Freeport of Monrovia", area: "Bushrod Island", lat: 6.346, lng: -10.79 },
  { label: "Duala Market", area: "Bushrod Island", lat: 6.348, lng: -10.777 },
  { label: "Roberts International Airport (RIA)", area: "Harbel", lat: 6.2338, lng: -10.3623 },
];

export function searchPlaces(q: string): Place[] {
  const s = q.trim().toLowerCase();
  if (!s) return MONROVIA_PLACES;
  return MONROVIA_PLACES.filter((p) => p.label.toLowerCase().includes(s) || p.area.toLowerCase().includes(s));
}

/** Nearest landmark to a GPS point — used to label "Current location". */
export function nearestPlace(lat: number, lng: number): Place {
  let best = MONROVIA_PLACES[0];
  let bestD = Infinity;
  for (const p of MONROVIA_PLACES) {
    const d = (p.lat - lat) ** 2 + (p.lng - lng) ** 2;
    if (d < bestD) {
      bestD = d;
      best = p;
    }
  }
  return best;
}
