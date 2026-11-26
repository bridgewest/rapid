import React, { useCallback, useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as Location from "expo-location";
import { colors, radii } from "../../theme";
import type { RideFlowParamList } from "../../navigation/RideNavigator";
import { nearestPlace, searchPlaces, type Place } from "../../ride/places";
import { lrd, rideApi, type Point, type RiderRide } from "../../ride/types";
import { Button, ui } from "../../ride/ui";

type Props = NativeStackScreenProps<RideFlowParamList, "RideHome">;
type Field = "pickup" | "dropoff";

export function RideHomeScreen({ navigation }: Props) {
  const [pickup, setPickup] = useState<Point | null>(null);
  const [dropoff, setDropoff] = useState<Point | null>(null);
  const [editing, setEditing] = useState<Field>("dropoff");
  const [query, setQuery] = useState("");
  const [locating, setLocating] = useState(false);
  const [recent, setRecent] = useState<RiderRide[]>([]);

  // Resume an in-flight ride (e.g. app was closed mid-trip).
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      rideApi<RiderRide | null>("/rides/active")
        .then((r) => {
          if (alive && r) navigation.navigate("RideTracking", { rideId: r.id });
        })
        .catch(() => {});
      rideApi<RiderRide[]>("/rides/history")
        .then((h) => alive && setRecent(h.filter((r) => r.status === "COMPLETED").slice(0, 3)))
        .catch(() => {});
      return () => {
        alive = false;
      };
    }, [navigation]),
  );

  const locateMe = useCallback(async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const near = nearestPlace(pos.coords.latitude, pos.coords.longitude);
      setPickup({ lat: pos.coords.latitude, lng: pos.coords.longitude, label: `Current location (near ${near.label})` });
    } catch {
      // Location unavailable — user picks a landmark instead.
    } finally {
      setLocating(false);
    }
  }, []);

  useEffect(() => {
    void locateMe();
  }, [locateMe]);

  const choose = (p: Place) => {
    const point = { lat: p.lat, lng: p.lng, label: p.label };
    if (editing === "pickup") {
      setPickup(point);
      setEditing("dropoff");
    } else {
      setDropoff(point);
      if (!pickup) setEditing("pickup");
    }
    setQuery("");
  };

  const ready = pickup && dropoff && pickup.label !== dropoff.label;

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={ui.h1}>Where to?</Text>
        <Text style={ui.muted}>Keke, taxi or comfort car — anywhere in Greater Monrovia.</Text>
      </View>

      <View style={styles.fields}>
        <FieldButton
          dot={colors.success}
          label="Pickup"
          value={pickup?.label ?? (locating ? "Finding you…" : "Choose pickup")}
          active={editing === "pickup"}
          onPress={() => setEditing("pickup")}
        />
        <View style={styles.divider} />
        <FieldButton
          dot={colors.danger}
          label="Destination"
          value={dropoff?.label ?? "Choose destination"}
          active={editing === "dropoff"}
          onPress={() => setEditing("dropoff")}
        />
      </View>

      <TextInput
        style={[ui.input, { marginHorizontal: 20, marginBottom: 8 }]}
        placeholder={editing === "pickup" ? "Search pickup landmark" : "Search destination (e.g. ELWA, Red Light)"}
        placeholderTextColor={colors.textMuted}
        value={query}
        onChangeText={setQuery}
        autoCorrect={false}
      />

      <FlatList
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 16 }}
        data={searchPlaces(query)}
        keyExtractor={(p) => p.label}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          editing === "pickup" ? (
            <Pressable style={styles.place} onPress={locateMe}>
              <Text style={styles.placeLabel}>📍 Use my current location</Text>
            </Pressable>
          ) : recent.length > 0 && !query ? (
            <View style={{ marginBottom: 6 }}>
              <Text style={styles.sectionLabel}>Recent</Text>
              {recent.map((r) => (
                <Pressable
                  key={r.id}
                  style={styles.place}
                  onPress={() => setDropoff({ lat: r.dropoffLat, lng: r.dropoffLng, label: r.dropoffLabel })}
                >
                  <Text style={styles.placeLabel}>↺ {r.dropoffLabel}</Text>
                  <Text style={styles.placeArea}>Last fare {lrd(r.fareFinalLrd ?? r.fareEstimateLrd)}</Text>
                </Pressable>
              ))}
              <Text style={[styles.sectionLabel, { marginTop: 10 }]}>Popular places</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable style={({ pressed }) => [styles.place, pressed && { opacity: 0.7 }]} onPress={() => choose(item)}>
            <Text style={styles.placeLabel}>{item.label}</Text>
            <Text style={styles.placeArea}>{item.area}</Text>
          </Pressable>
        )}
      />

      <View style={styles.footer}>
        <Button
          title="See prices"
          disabled={!ready}
          onPress={() => ready && navigation.navigate("RideOptions", { pickup: pickup!, dropoff: dropoff! })}
        />
        <Pressable onPress={() => navigation.navigate("DriverHub")} style={{ paddingTop: 14, alignItems: "center" }}>
          <Text style={{ color: colors.accent, fontWeight: "700" }}>Have a car or keke? Drive with Rapid →</Text>
        </Pressable>
      </View>
    </View>
  );
}

function FieldButton(props: { dot: string; label: string; value: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={props.onPress} style={[styles.field, props.active && styles.fieldActive]}>
      <View style={[styles.dot, { backgroundColor: props.dot }]} />
      <View style={{ flex: 1 }}>
        <Text style={styles.fieldLabel}>{props.label}</Text>
        <Text style={styles.fieldValue} numberOfLines={1}>
          {props.value}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14, gap: 4 },
  fields: {
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  field: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 12, gap: 12 },
  fieldActive: { backgroundColor: colors.accentMuted },
  divider: { height: 1, backgroundColor: colors.border, marginLeft: 36 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  fieldLabel: { fontSize: 12, color: colors.textMuted, fontWeight: "600" },
  fieldValue: { fontSize: 16, color: colors.text, fontWeight: "600" },
  sectionLabel: { fontSize: 12, fontWeight: "800", color: colors.textMuted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 },
  place: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  placeLabel: { fontSize: 15, color: colors.text, fontWeight: "600" },
  placeArea: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  footer: { padding: 20, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.bgElevated },
});
