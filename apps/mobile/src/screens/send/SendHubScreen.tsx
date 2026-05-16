import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { colors, radii } from "../../theme";
import type { SendFlowParamList } from "../../navigation/MainTabNavigator";

type Props = NativeStackScreenProps<SendFlowParamList, "SendHub">;

export function SendHubScreen({ navigation }: Props) {
  return (
    <View style={styles.root}>
      <Text style={styles.kicker}>Money movement</Text>
      <Text style={styles.title}>Send</Text>
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        onPress={() => navigation.navigate("SendAmount")}
      >
        <View style={styles.cardAccent} />
        <Text style={styles.cardTitle}>Send money</Text>
        <Text style={styles.cardSub}>USD → LRD · 1.5% fee · live rate</Text>
      </Pressable>
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        onPress={() => navigation.navigate("AirtimePhone")}
      >
        <View style={[styles.cardAccent, styles.cardAccentAlt]} />
        <Text style={styles.cardTitle}>Send airtime</Text>
        <Text style={styles.cardSub}>Orange / MTN Liberia · Reloadly</Text>
      </Pressable>
      <Text style={styles.phase}>Phase 3: Bill pay uses the same pattern with Reloadly Bill Pay.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, padding: 24 },
  kicker: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.1,
    color: colors.accent,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  title: { fontSize: 30, fontWeight: "800", color: colors.text, marginBottom: 22, letterSpacing: -0.5 },
  card: {
    backgroundColor: colors.card,
    padding: 20,
    paddingTop: 18,
    borderRadius: radii.lg,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 3,
  },
  cardPressed: { opacity: 0.96, transform: [{ scale: 0.99 }] },
  cardAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: colors.accent,
  },
  cardAccentAlt: { backgroundColor: "#6366f1" },
  cardTitle: { color: colors.text, fontSize: 18, fontWeight: "800", marginBottom: 6 },
  cardSub: { color: colors.textMuted, fontSize: 14, lineHeight: 20 },
  phase: { color: colors.textMuted, marginTop: 20, fontSize: 13, lineHeight: 19 },
});
