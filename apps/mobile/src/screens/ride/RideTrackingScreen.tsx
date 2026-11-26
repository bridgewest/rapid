import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Linking, Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { blues, colors, radii } from "../../theme";
import type { RideFlowParamList } from "../../navigation/RideNavigator";
import { CLASS_INFO, PAYMENT_LABEL, lrd, rideApi, type RiderRide } from "../../ride/types";
import { Button, Card, ErrorText, Row, ui } from "../../ride/ui";

type Props = NativeStackScreenProps<RideFlowParamList, "RideTracking">;

const POLL_MS = 4000;
const ACTIVE = ["REQUESTED", "DRIVER_ASSIGNED", "DRIVER_ARRIVED", "IN_PROGRESS"];

const HEADLINE: Record<RiderRide["status"], string> = {
  REQUESTED: "Finding your driver…",
  DRIVER_ASSIGNED: "Driver is on the way",
  DRIVER_ARRIVED: "Your driver has arrived",
  IN_PROGRESS: "On your way",
  COMPLETED: "You've arrived",
  CANCELLED_BY_RIDER: "Ride cancelled",
  CANCELLED_BY_DRIVER: "Driver cancelled",
  NO_DRIVERS: "No drivers available",
};

export function RideTrackingScreen({ navigation, route }: Props) {
  const { rideId } = route.params;
  const [ride, setRide] = useState<RiderRide | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [rating, setRating] = useState(0);
  const [rated, setRated] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await rideApi<RiderRide>(`/rides/${rideId}`);
      setRide(r);
      setError(null);
      if (!ACTIVE.includes(r.status) && timer.current) {
        clearInterval(timer.current);
        timer.current = null;
      }
    } catch (e) {
      setError((e as Error).message);
    }
  }, [rideId]);

  useEffect(() => {
    void load();
    timer.current = setInterval(load, POLL_MS);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [load]);

  const done = () => navigation.reset({ index: 0, routes: [{ name: "RideHome" }] });

  const cancel = async () => {
    setBusy(true);
    try {
      setRide(await rideApi<RiderRide>(`/rides/${rideId}/cancel`, { body: {} }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const submitRating = async () => {
    setBusy(true);
    try {
      await rideApi(`/rides/${rideId}/rate`, { body: { rating } });
      setRated(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const shareTrip = () => {
    if (!ride) return;
    const d = ride.driver;
    void Share.share({
      message:
        `I'm on a Rapid ride: ${ride.pickupLabel} → ${ride.dropoffLabel}.` +
        (d ? ` Driver ${d.fullName}, ${d.vehicleColor} ${d.vehicleMake} ${d.vehicleModel}, plate ${d.plateNumber}.` : ""),
    });
  };

  if (!ride)
    return (
      <View style={[styles.root, styles.center]}>
        {error ? <ErrorText message={error} /> : <ActivityIndicator color={colors.accent} size="large" />}
      </View>
    );

  const d = ride.driver;
  const isActive = ACTIVE.includes(ride.status);
  const canCancel = ["REQUESTED", "DRIVER_ASSIGNED", "DRIVER_ARRIVED"].includes(ride.status);

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 14 }}>
      <View style={styles.hero}>
        {ride.status === "REQUESTED" && <ActivityIndicator color={colors.onAccent} style={{ marginBottom: 10 }} />}
        <Text style={styles.heroTitle}>{HEADLINE[ride.status]}</Text>
        {ride.status === "DRIVER_ASSIGNED" && ride.driverEtaMin != null && (
          <Text style={styles.heroSub}>Arriving in ~{ride.driverEtaMin} min</Text>
        )}
        {ride.status === "REQUESTED" && <Text style={styles.heroSub}>Asking nearby {CLASS_INFO[ride.vehicleClass].emoji} drivers</Text>}
        {ride.status === "NO_DRIVERS" && <Text style={styles.heroSub}>Try again in a few minutes, or pick another vehicle type.</Text>}
      </View>

      {(ride.status === "DRIVER_ASSIGNED" || ride.status === "DRIVER_ARRIVED") && (
        <View style={styles.pinBox}>
          <Text style={styles.pinLabel}>Tell your driver this PIN to start the trip</Text>
          <Text style={styles.pin}>{ride.pickupPin.split("").join(" ")}</Text>
          <Text style={ui.muted}>Only get in if the plate matches: {d?.plateNumber}</Text>
        </View>
      )}

      {d && (
        <Card>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View style={styles.avatar}>
              <Text style={{ fontSize: 26 }}>{CLASS_INFO[d.vehicleClass].emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.driverName}>{d.fullName}</Text>
              <Text style={ui.muted}>
                ★ {d.ratingAvg.toFixed(1)} · {d.tripsCount} trips
              </Text>
              <Text style={ui.muted}>
                {d.vehicleColor} {d.vehicleMake} {d.vehicleModel}
              </Text>
            </View>
            <View style={styles.plate}>
              <Text style={styles.plateText}>{d.plateNumber}</Text>
            </View>
          </View>
          {isActive && (
            <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
              <Button title="Call" variant="secondary" style={{ flex: 1 }} onPress={() => Linking.openURL(`tel:${d.phoneE164}`)} />
              <Button title="Share trip" variant="secondary" style={{ flex: 1 }} onPress={shareTrip} />
            </View>
          )}
        </Card>
      )}

      <Card>
        <Row label="Pickup" value={ride.pickupLabel} />
        <Row label="Destination" value={ride.dropoffLabel} />
        <Row label="Payment" value={PAYMENT_LABEL[ride.paymentMethod]} />
        <Row
          label={ride.fareFinalLrd != null ? "Fare" : "Estimated fare"}
          value={lrd(ride.fareFinalLrd ?? ride.fareEstimateLrd)}
          strong
        />
      </Card>

      {ride.status === "COMPLETED" && (
        <Card>
          {ride.riderRating != null || rated ? (
            <Text style={[styles.driverName, { textAlign: "center" }]}>Thanks for rating! 🙏</Text>
          ) : (
            <>
              <Text style={[ui.h2, { textAlign: "center" }]}>How was your trip?</Text>
              <View style={styles.stars}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <Pressable key={n} onPress={() => setRating(n)} hitSlop={6}>
                    <Text style={[styles.star, n <= rating && { color: "#3574f6" }]}>★</Text>
                  </Pressable>
                ))}
              </View>
              <Button title="Submit rating" onPress={submitRating} disabled={!rating} loading={busy} />
            </>
          )}
          <Text style={[ui.muted, { textAlign: "center", marginTop: 10 }]}>
            Please pay {lrd(ride.fareFinalLrd ?? ride.fareEstimateLrd)} by {PAYMENT_LABEL[ride.paymentMethod].toLowerCase()}.
          </Text>
        </Card>
      )}

      <ErrorText message={error} />
      {canCancel && <Button title="Cancel ride" variant="danger" onPress={cancel} loading={busy} />}
      {!isActive && <Button title={ride.status === "COMPLETED" ? "Done" : "Back"} variant="secondary" onPress={done} />}
      {ride.status === "IN_PROGRESS" && (
        <Text style={[ui.muted, { textAlign: "center" }]}>Feel unsafe? Share your trip with family, or contact the Liberia National Police.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: { justifyContent: "center", alignItems: "center" },
  hero: { backgroundColor: blues.navy, borderRadius: radii.xl, padding: 22, alignItems: "center" },
  heroTitle: { color: colors.onAccent, fontSize: 22, fontWeight: "800", textAlign: "center" },
  heroSub: { color: blues.pale, fontSize: 15, marginTop: 6, textAlign: "center" },
  pinBox: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: 2,
    borderColor: colors.accent,
    padding: 16,
    alignItems: "center",
    gap: 6,
  },
  pinLabel: { color: colors.textSecondary, fontWeight: "600" },
  pin: { fontSize: 40, fontWeight: "900", color: colors.accentDark, letterSpacing: 4 },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.accentMuted, alignItems: "center", justifyContent: "center" },
  driverName: { fontSize: 17, fontWeight: "800", color: colors.text },
  plate: { backgroundColor: blues.ice, borderRadius: radii.sm, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: "#111" },
  plateText: { fontWeight: "900", color: "#111", letterSpacing: 1 },
  stars: { flexDirection: "row", justifyContent: "center", gap: 10, marginVertical: 12 },
  star: { fontSize: 38, color: colors.borderStrong },
});
