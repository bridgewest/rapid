import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { colors, radii } from "../../theme";
import type { RideFlowParamList } from "../../navigation/RideNavigator";
import {
  CLASS_INFO,
  PAYMENT_LABEL,
  lrd,
  rideApi,
  type FareOption,
  type PaymentMethod,
  type RiderRide,
  type VehicleClass,
} from "../../ride/types";
import { Button, Card, ErrorText, ui } from "../../ride/ui";

type Props = NativeStackScreenProps<RideFlowParamList, "RideOptions">;
type Estimate = { distanceKm: number; durationMin: number; options: FareOption[] };

export function RideOptionsScreen({ navigation, route }: Props) {
  const { pickup, dropoff } = route.params;
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [selected, setSelected] = useState<VehicleClass>("TAXI");
  const [payment, setPayment] = useState<PaymentMethod>("CASH");
  const [forSomeone, setForSomeone] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    rideApi<Estimate>("/rides/estimate", { body: { pickup, dropoff } })
      .then((e) => {
        setEstimate(e);
        const firstAvailable = e.options.find((o) => o.driversNearby > 0);
        if (firstAvailable) setSelected(firstAvailable.vehicleClass);
      })
      .catch((e: Error) => setError(e.message));
  }, [pickup, dropoff]);

  const option = estimate?.options.find((o) => o.vehicleClass === selected);

  const book = async () => {
    setBooking(true);
    setError(null);
    try {
      const ride = await rideApi<RiderRide>("/rides", {
        body: {
          pickup,
          dropoff,
          vehicleClass: selected,
          paymentMethod: payment,
          ...(forSomeone && guestName ? { bookedForName: guestName, bookedForPhone: guestPhone || undefined } : {}),
        },
      });
      navigation.reset({ index: 1, routes: [{ name: "RideHome" }, { name: "RideTracking", params: { rideId: ride.id } }] });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBooking(false);
    }
  };

  if (!estimate)
    return (
      <View style={[styles.root, { justifyContent: "center", alignItems: "center" }]}>
        {error ? <ErrorText message={error} /> : <ActivityIndicator color={colors.accent} size="large" />}
      </View>
    );

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 24 }}>
        <Card style={{ marginBottom: 16 }}>
          <Text style={styles.route} numberOfLines={1}>🟢 {pickup.label}</Text>
          <Text style={styles.route} numberOfLines={1}>🔴 {dropoff.label}</Text>
          <Text style={[ui.muted, { marginTop: 6 }]}>
            ~{estimate.distanceKm} km · ~{estimate.durationMin} min
          </Text>
        </Card>

        {estimate.options.map((o) => {
          const active = o.vehicleClass === selected;
          return (
            <Pressable
              key={o.vehicleClass}
              onPress={() => setSelected(o.vehicleClass)}
              style={[styles.option, active && styles.optionActive]}
            >
              <Text style={styles.emoji}>{CLASS_INFO[o.vehicleClass].emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.optTitle}>
                  {o.label} <Text style={styles.optSeats}>· {o.seats} seats</Text>
                </Text>
                <Text style={styles.optSub}>{CLASS_INFO[o.vehicleClass].blurb}</Text>
                <Text style={[styles.optSub, { color: o.driversNearby ? colors.success : colors.warn }]}>
                  {o.driversNearby
                    ? `${o.driversNearby} nearby · pickup in ~${o.pickupEtaMin} min`
                    : "No drivers nearby right now"}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.price}>{lrd(o.fareLrd)}</Text>
                <Text style={styles.usd}>≈ ${(o.fareUsdCents / 100).toFixed(2)}</Text>
                {o.surgeMultiplier > 1 && <Text style={styles.surge}>Busy ×{o.surgeMultiplier}</Text>}
              </View>
            </Pressable>
          );
        })}

        <Text style={[ui.h2, { marginTop: 14 }]}>Payment</Text>
        <View style={styles.chips}>
          {(Object.keys(PAYMENT_LABEL) as PaymentMethod[]).map((m) => (
            <Pressable key={m} onPress={() => setPayment(m)} style={[styles.chip, payment === m && styles.chipActive]}>
              <Text style={[styles.chipText, payment === m && { color: colors.onAccent }]}>{PAYMENT_LABEL[m]}</Text>
            </Pressable>
          ))}
        </View>
        {payment !== "CASH" && (
          <Text style={[ui.muted, { marginTop: 6 }]}>
            {payment === "MOBILE_MONEY"
              ? "You'll pay the driver by Orange Money or MTN MoMo at drop-off."
              : "Lizor wallet payments are coming soon — the driver will collect cash for now."}
          </Text>
        )}

        <View style={styles.toggleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.optTitle}>Booking for someone else?</Text>
            <Text style={styles.optSub}>Family member, guest — the driver will call them.</Text>
          </View>
          <Switch value={forSomeone} onValueChange={setForSomeone} />
        </View>
        {forSomeone && (
          <View style={{ gap: 8 }}>
            <TextInput style={ui.input} placeholder="Their name" placeholderTextColor={colors.textMuted} value={guestName} onChangeText={setGuestName} />
            <TextInput
              style={ui.input}
              placeholder="Their phone (+231…)"
              placeholderTextColor={colors.textMuted}
              keyboardType="phone-pad"
              value={guestPhone}
              onChangeText={setGuestPhone}
            />
          </View>
        )}
        <ErrorText message={error} />
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={option ? `Request ${option.label} · ${lrd(option.fareLrd)}` : "Request"}
          onPress={book}
          loading={booking}
          disabled={!option || (forSomeone && !guestName)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  route: { fontSize: 15, color: colors.text, fontWeight: "600", paddingVertical: 2 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: radii.lg,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.card,
    marginBottom: 10,
  },
  optionActive: { borderColor: colors.accent, backgroundColor: colors.accentMuted },
  emoji: { fontSize: 32 },
  optTitle: { fontSize: 16, fontWeight: "800", color: colors.text },
  optSeats: { fontSize: 13, fontWeight: "500", color: colors.textMuted },
  optSub: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  price: { fontSize: 17, fontWeight: "800", color: colors.text },
  usd: { fontSize: 12, color: colors.textMuted },
  surge: { fontSize: 11, color: colors.warn, fontWeight: "700", marginTop: 2 },
  chips: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.card,
  },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { fontWeight: "700", color: colors.text },
  toggleRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 20, marginBottom: 10 },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.bgElevated },
});
