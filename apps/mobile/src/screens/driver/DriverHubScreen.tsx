import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import * as Location from "expo-location";
import { colors, radii } from "../../theme";
import { MONROVIA_PLACES } from "../../ride/places";
import { CLASS_INFO, PAYMENT_LABEL, lrd, rideApi, type DriverProfile, type DriverRide, type VehicleClass } from "../../ride/types";
import { Button, Card, ErrorText, Row, ui } from "../../ride/ui";

const POLL_MS = 4000;
const LOCATION_PUSH_MS = 10_000;

export function DriverHubScreen() {
  const [profile, setProfile] = useState<DriverProfile | null | undefined>(undefined);
  const [editing, setEditing] = useState(false);

  const load = useCallback(async () => {
    try {
      setProfile(await rideApi<DriverProfile | null>("/driver/me"));
    } catch {
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (profile === undefined)
    return (
      <View style={[styles.root, styles.center]}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );

  if (!profile || editing) return <ApplyForm existing={profile} onDone={() => { setEditing(false); void load(); }} />;

  if (profile.status === "PENDING" || profile.status === "REJECTED" || profile.status === "SUSPENDED") {
    const copy = {
      PENDING: {
        title: "Application under review",
        body: "Our team will verify your licence and vehicle, usually within 2 business days. Bring your original documents to the Rapid office for inspection.",
      },
      REJECTED: { title: "Application not approved", body: profile.reviewerNotes ?? "Please update your details and re-apply." },
      SUSPENDED: { title: "Account suspended", body: profile.reviewerNotes ?? "Contact Rapid driver support." },
    }[profile.status];
    return (
      <ScrollView style={styles.root} contentContainerStyle={{ padding: 20, gap: 14 }}>
        <Text style={ui.h1}>{copy.title}</Text>
        <Text style={ui.muted}>{copy.body}</Text>
        <Card>
          <Row label="Vehicle" value={`${CLASS_INFO[profile.vehicleClass].emoji} ${profile.vehicleMake} ${profile.vehicleModel}`} />
          <Row label="Plate" value={profile.plateNumber} />
        </Card>
        {profile.status !== "SUSPENDED" && <Button title="Edit application" variant="secondary" onPress={() => setEditing(true)} />}
        <Button title="Refresh status" variant="secondary" onPress={load} />
      </ScrollView>
    );
  }

  return <DriverDashboard profile={profile} reload={load} />;
}

// ───────────────────────── Application form ─────────────────────────

function ApplyForm({ existing, onDone }: { existing: DriverProfile | null; onDone: () => void }) {
  const [form, setForm] = useState({
    fullName: existing?.fullName ?? "",
    licenseNumber: "",
    nationalId: "",
    vehicleClass: (existing?.vehicleClass ?? "TAXI") as VehicleClass,
    vehicleMake: existing?.vehicleMake ?? "",
    vehicleModel: existing?.vehicleModel ?? "",
    vehicleColor: existing?.vehicleColor ?? "",
    plateNumber: existing?.plateNumber ?? "",
    vehicleYear: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    setSaving(true);
    setError(null);
    try {
      await rideApi("/driver/apply", {
        body: {
          ...form,
          nationalId: form.nationalId || undefined,
          vehicleYear: form.vehicleYear ? Number(form.vehicleYear) : undefined,
        },
      });
      onDone();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const valid = form.fullName && form.licenseNumber && form.vehicleMake && form.vehicleModel && form.vehicleColor && form.plateNumber;

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ padding: 20, gap: 10, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
      <Text style={ui.h1}>Drive with Rapid</Text>
      <Text style={[ui.muted, { marginBottom: 8 }]}>
        Earn on your own schedule. Keep 85% of every fare. You'll need a valid Liberian driver's licence and a roadworthy vehicle.
      </Text>

      <Text style={styles.label}>What do you drive?</Text>
      <View style={{ flexDirection: "row", gap: 8 }}>
        {(["KEKE", "TAXI", "COMFORT"] as VehicleClass[]).map((c) => (
          <Pressable
            key={c}
            onPress={() => set("vehicleClass")(c)}
            style={[styles.classChip, form.vehicleClass === c && styles.classChipActive]}
          >
            <Text style={{ fontSize: 26 }}>{CLASS_INFO[c].emoji}</Text>
            <Text style={styles.classChipText}>{c === "COMFORT" ? "Car" : c[0] + c.slice(1).toLowerCase()}</Text>
          </Pressable>
        ))}
      </View>

      <Field label="Full name (as on licence)" value={form.fullName} onChangeText={set("fullName")} />
      <Field label="Driver's licence number" value={form.licenseNumber} onChangeText={set("licenseNumber")} autoCapitalize="characters" />
      <Field label="National ID (optional)" value={form.nationalId} onChangeText={set("nationalId")} />
      <View style={{ flexDirection: "row", gap: 8 }}>
        <View style={{ flex: 1 }}>
          <Field label="Make" placeholder="Toyota" value={form.vehicleMake} onChangeText={set("vehicleMake")} />
        </View>
        <View style={{ flex: 1 }}>
          <Field label="Model" placeholder="Corolla" value={form.vehicleModel} onChangeText={set("vehicleModel")} />
        </View>
      </View>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <View style={{ flex: 1 }}>
          <Field label="Colour" placeholder="Yellow" value={form.vehicleColor} onChangeText={set("vehicleColor")} />
        </View>
        <View style={{ flex: 1 }}>
          <Field label="Year" placeholder="2012" value={form.vehicleYear} onChangeText={set("vehicleYear")} keyboardType="number-pad" />
        </View>
      </View>
      <Field label="Plate number" placeholder="A-12345" value={form.plateNumber} onChangeText={set("plateNumber")} autoCapitalize="characters" />

      <ErrorText message={error} />
      <Button title="Submit application" onPress={submit} loading={saving} disabled={!valid} style={{ marginTop: 6 }} />
    </ScrollView>
  );
}

function Field(props: React.ComponentProps<typeof TextInput> & { label: string }) {
  const { label, ...rest } = props;
  return (
    <View style={{ gap: 4 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={ui.input} placeholderTextColor={colors.textMuted} {...rest} />
    </View>
  );
}

// ───────────────────────── Dashboard ─────────────────────────

type Coords = { lat: number; lng: number };

function DriverDashboard({ profile, reload }: { profile: DriverProfile; reload: () => Promise<void> }) {
  const [online, setOnline] = useState(profile.isOnline);
  const [coords, setCoords] = useState<Coords | null>(null);
  const [gpsDenied, setGpsDenied] = useState(false);
  const [offers, setOffers] = useState<DriverRide[]>([]);
  const [active, setActive] = useState<DriverRide | null>(null);
  const [lastCompleted, setLastCompleted] = useState<DriverRide | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const coordsRef = useRef<Coords | null>(null);
  coordsRef.current = coords;

  // GPS: watch while online; push to server every 10s.
  useEffect(() => {
    if (!online) return;
    let sub: Location.LocationSubscription | null = null;
    let cancelled = false;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setGpsDenied(true);
        return;
      }
      setGpsDenied(false);
      sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 20 },
        (pos) => !cancelled && setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      );
    })().catch(() => setGpsDenied(true));
    const push = setInterval(() => {
      const c = coordsRef.current;
      if (c) void rideApi("/driver/location", { body: c }).catch(() => {});
    }, LOCATION_PUSH_MS);
    return () => {
      cancelled = true;
      sub?.remove();
      clearInterval(push);
    };
  }, [online]);

  // Push immediately when the first fix arrives.
  const hadFix = useRef(false);
  useEffect(() => {
    if (coords && online && !hadFix.current) {
      hadFix.current = true;
      void rideApi("/driver/location", { body: coords }).catch(() => {});
    }
    if (!online) hadFix.current = false;
  }, [coords, online]);

  // Poll for active trip + offers.
  const poll = useCallback(async () => {
    try {
      const a = await rideApi<DriverRide | null>("/driver/rides/active");
      setActive(a);
      if (!a && online) setOffers(await rideApi<DriverRide[]>("/driver/offers"));
      else setOffers([]);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [online]);

  useEffect(() => {
    void poll();
    const t = setInterval(poll, POLL_MS);
    return () => clearInterval(t);
  }, [poll]);

  const toggleOnline = async (next: boolean) => {
    setError(null);
    try {
      await rideApi("/driver/status", { body: { online: next, ...(coords ?? {}) } });
      setOnline(next);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const act = async (path: string, body: unknown = {}) => {
    setBusy(true);
    setError(null);
    try {
      const r = await rideApi<DriverRide>(path, { body });
      if (r.status === "COMPLETED") {
        setLastCompleted(r);
        setActive(null);
        void reload();
      } else if (r.status.startsWith("CANCELLED")) {
        setActive(null);
      } else {
        setActive(r);
      }
      setPin("");
      void poll();
    } catch (e) {
      setError((e as Error).message);
      void poll();
    } finally {
      setBusy(false);
    }
  };

  const setManualArea = async (lat: number, lng: number) => {
    setCoords({ lat, lng });
    await rideApi("/driver/location", { body: { lat, lng } }).catch(() => {});
  };

  const navigateTo = (lat: number, lng: number) => {
    const url =
      Platform.OS === "ios"
        ? `http://maps.apple.com/?daddr=${lat},${lng}`
        : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    void Linking.openURL(url);
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{ padding: 20, gap: 14, paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={false} onRefresh={poll} />}
    >
      <View style={[styles.statusBar, online ? styles.statusOnline : styles.statusOffline]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.statusTitle}>{online ? "You're online" : "You're offline"}</Text>
          <Text style={styles.statusSub}>
            {online ? (coords ? "Looking for trips near you" : "Getting your location…") : "Go online to start receiving trips"}
          </Text>
        </View>
        <Switch value={online} onValueChange={toggleOnline} disabled={!!active} />
      </View>

      <View style={{ flexDirection: "row", gap: 10 }}>
        <Stat label="Today" value={lrd(profile.todayEarningsLrd)} />
        <Stat label="Trips today" value={String(profile.todayTrips)} />
        <Stat label="Rating" value={`★ ${profile.ratingAvg.toFixed(1)}`} />
      </View>

      <ErrorText message={error} />

      {online && gpsDenied && (
        <Card>
          <Text style={ui.h2}>Location is off</Text>
          <Text style={[ui.muted, { marginBottom: 10 }]}>Turn on location for Rapid, or pick the area you're waiting in:</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
            {MONROVIA_PLACES.slice(0, 12).map((p) => (
              <Pressable key={p.label} style={styles.areaChip} onPress={() => setManualArea(p.lat, p.lng)}>
                <Text style={{ fontSize: 13, fontWeight: "600", color: colors.text }}>{p.label}</Text>
              </Pressable>
            ))}
          </View>
        </Card>
      )}

      {active && (
        <Card style={{ borderColor: colors.accent, borderWidth: 2 }}>
          <Text style={styles.tripTag}>
            {active.status === "DRIVER_ASSIGNED" ? "HEAD TO PICKUP" : active.status === "DRIVER_ARRIVED" ? "WAITING FOR RIDER" : "TRIP IN PROGRESS"}
          </Text>
          <Text style={styles.riderName}>{active.rider.name}</Text>
          <Row label="Pickup" value={active.pickupLabel} />
          <Row label="Drop-off" value={active.dropoffLabel} />
          <Row label="Payment" value={PAYMENT_LABEL[active.paymentMethod]} />
          <Row label="Fare" value={lrd(active.fareEstimateLrd)} strong />
          <Row label="You earn" value={lrd(active.driverEarningsLrd)} />

          <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
            <Button title="Call rider" variant="secondary" style={{ flex: 1 }} onPress={() => Linking.openURL(`tel:${active.rider.phoneE164}`)} />
            <Button
              title="Navigate"
              variant="secondary"
              style={{ flex: 1 }}
              onPress={() =>
                active.status === "IN_PROGRESS"
                  ? navigateTo(active.dropoffLat, active.dropoffLng)
                  : navigateTo(active.pickupLat, active.pickupLng)
              }
            />
          </View>

          <View style={{ marginTop: 12, gap: 8 }}>
            {active.status === "DRIVER_ASSIGNED" && (
              <Button title="I've arrived" onPress={() => act(`/driver/rides/${active.id}/arrive`)} loading={busy} />
            )}
            {active.status === "DRIVER_ARRIVED" && (
              <>
                <Text style={styles.label}>Ask the rider for their 4-digit PIN</Text>
                <TextInput
                  style={[ui.input, { fontSize: 24, letterSpacing: 8, textAlign: "center" }]}
                  keyboardType="number-pad"
                  maxLength={4}
                  value={pin}
                  onChangeText={setPin}
                  placeholder="••••"
                  placeholderTextColor={colors.textMuted}
                />
                <Button title="Start trip" onPress={() => act(`/driver/rides/${active.id}/start`, { pin })} loading={busy} disabled={pin.length !== 4} />
              </>
            )}
            {active.status === "IN_PROGRESS" && (
              <Button title="Complete trip" onPress={() => act(`/driver/rides/${active.id}/complete`)} loading={busy} />
            )}
            {active.status !== "IN_PROGRESS" && (
              <Button title="Cancel trip" variant="danger" onPress={() => act(`/driver/rides/${active.id}/cancel`, { reason: "driver_cancelled" })} disabled={busy} />
            )}
          </View>
        </Card>
      )}

      {!active && lastCompleted && (
        <Card>
          <Text style={ui.h2}>Trip complete ✅</Text>
          <Text style={[ui.muted, { marginBottom: 6 }]}>
            Collect {lrd(lastCompleted.fareFinalLrd ?? lastCompleted.fareEstimateLrd)} by {PAYMENT_LABEL[lastCompleted.paymentMethod].toLowerCase()}.
          </Text>
          <Row label="You earned" value={lrd(lastCompleted.driverEarningsLrd)} strong />
          <Text style={[styles.label, { marginTop: 10 }]}>Rate this rider</Text>
          <View style={{ flexDirection: "row", gap: 8, marginTop: 4 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Pressable
                key={n}
                hitSlop={6}
                onPress={async () => {
                  await rideApi(`/driver/rides/${lastCompleted.id}/rate-rider`, { body: { rating: n } }).catch(() => {});
                  setLastCompleted(null);
                }}
              >
                <Text style={{ fontSize: 32, color: "#f59e0b" }}>★</Text>
              </Pressable>
            ))}
          </View>
        </Card>
      )}

      {!active && online && (
        <>
          <Text style={ui.h2}>Trip requests</Text>
          {offers.length === 0 && (
            <Card>
              <Text style={ui.muted}>No requests nearby yet. Stay online — new trips appear automatically.</Text>
            </Card>
          )}
          {offers.map((o) => (
            <Card key={o.id}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
                <Text style={styles.offerFare}>{lrd(o.fareEstimateLrd)}</Text>
                <Text style={ui.muted}>
                  {o.toPickupKm} km away · ~{o.pickupEtaMin} min
                </Text>
              </View>
              <Row label="Pickup" value={o.pickupLabel} />
              <Row label="Drop-off" value={o.dropoffLabel} />
              <Row label="Trip" value={`${o.distanceKm} km · ~${o.durationMin} min`} />
              <Row label="Payment" value={PAYMENT_LABEL[o.paymentMethod]} />
              <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
                <Button title="Pass" variant="secondary" style={{ flex: 1 }} onPress={() => {
                    setOffers((list) => list.filter((x) => x.id !== o.id));
                    void rideApi(`/driver/rides/${o.id}/decline`, { body: {} }).catch(() => {});
                  }}
                  disabled={busy}
                />
                <Button title="Accept" style={{ flex: 2 }} onPress={() => act(`/driver/rides/${o.id}/accept`)} loading={busy} />
              </View>
            </Card>
          ))}
        </>
      )}

      <Card>
        <Row label="Vehicle" value={`${CLASS_INFO[profile.vehicleClass].emoji} ${profile.vehicleColor} ${profile.vehicleMake} ${profile.vehicleModel}`} />
        <Row label="Plate" value={profile.plateNumber} />
        <Row label="Lifetime trips" value={String(profile.tripsCount)} />
      </Card>
    </ScrollView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: { justifyContent: "center", alignItems: "center" },
  label: { fontSize: 13, fontWeight: "700", color: colors.textSecondary },
  classChip: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: radii.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  classChipActive: { borderColor: colors.accent, backgroundColor: colors.accentMuted },
  classChipText: { fontWeight: "700", color: colors.text, marginTop: 2 },
  statusBar: { flexDirection: "row", alignItems: "center", borderRadius: radii.lg, padding: 16 },
  statusOnline: { backgroundColor: colors.success },
  statusOffline: { backgroundColor: colors.textSecondary },
  statusTitle: { color: "#fff", fontSize: 18, fontWeight: "800" },
  statusSub: { color: "rgba(255,255,255,0.85)", fontSize: 13, marginTop: 2 },
  stat: { flex: 1, backgroundColor: colors.card, borderRadius: radii.md, padding: 12, borderWidth: 1, borderColor: colors.border },
  statValue: { fontSize: 16, fontWeight: "800", color: colors.text },
  statLabel: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  areaChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: radii.pill, borderWidth: 1, borderColor: colors.borderStrong },
  tripTag: { fontSize: 12, fontWeight: "900", color: colors.accent, letterSpacing: 1 },
  riderName: { fontSize: 20, fontWeight: "800", color: colors.text, marginVertical: 6 },
  offerFare: { fontSize: 22, fontWeight: "900", color: colors.text },
});
