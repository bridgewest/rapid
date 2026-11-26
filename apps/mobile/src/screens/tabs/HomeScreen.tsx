import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Image } from "react-native";

const lizorMark = require("../../../assets/lizor-mark.png");
import { useNavigation } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { blues, colors, radii } from "../../theme";
import type { MainTabParamList } from "../../navigation/MainTabNavigator";

const PROMISES = [
  { tag: "Upfront fares", quote: "Know the price before you go. No haggling at the roadside, no surprises at drop-off." },
  { tag: "Pickup PIN", quote: "Your trip only starts when you give the driver your PIN. Plate or PIN doesn't match? Don't get in." },
  { tag: "Trip sharing", quote: "Send your driver, car and plate to family with one tap." },
  { tag: "Book for family", quote: "Abroad? Book a ride for your family in Monrovia and follow it from your phone." },
];

export function HomeScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const [promise, setPromise] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setPromise((p) => (p + 1) % PROMISES.length), 6000);
    return () => clearInterval(t);
  }, [promise]);

  const ride = () => navigation.navigate("RideFlow");

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Announcement strip */}
      <View style={styles.announce}>
        <Text style={styles.announceText}>Be one of the first in Monrovia.</Text>
        <Pressable style={styles.pill} onPress={ride} accessibilityRole="button">
          <Text style={styles.pillText}>Take a ride</Text>
        </Pressable>
      </View>

      {/* Hero */}
      <Pressable style={styles.hero} onPress={ride} accessibilityRole="button" accessibilityLabel="Book a ride">
        <View style={styles.heroGlow} />
        <Image source={lizorMark} style={styles.heroMark} accessibilityIgnoresInvertColors />
        <View style={styles.heroRoad}>
          {[0, 1, 2, 3, 4].map((i) => (
            <View key={i} style={styles.heroDash} />
          ))}
        </View>
        <Text style={styles.heroWord}>Hail.</Text>
        <Text style={[styles.heroWord, { color: blues.pale, alignSelf: "flex-end" }]}>Ride.</Text>
        <View style={styles.whereTo}>
          <View style={styles.whereDot} />
          <Text style={styles.whereText}>Where to?</Text>
          <Text style={styles.whereArrow}>→</Text>
        </View>
      </Pressable>

      {/* Meet */}
      <View style={styles.section}>
        <Text style={styles.meet}>
          Meet <Text style={{ color: blues.sky }}>Lizor</Text>
        </Text>
        <Text style={styles.meetSub}>Rides around Monrovia and money to Liberia — in one app.</Text>
        <View style={styles.features}>
          <Feature icon="🚕" title={"3 ride\ntypes"} />
          <Feature icon="🔒" title={"PIN on\nevery pickup"} />
          <Feature icon="L$" title={"Fares from\nL$ 150"} />
        </View>
      </View>

      {/* Big stat */}
      <View style={styles.dark}>
        <Text style={styles.bigKeep}>drivers keep</Text>
        <Text style={styles.bigNum}>85%</Text>
        <Text style={styles.bigText}>of every fare*</Text>
        <Text style={styles.bigFoot}>*Lizor keeps a 15% platform fee.</Text>
        <Pressable style={styles.circleLink} onPress={ride}>
          <View style={styles.circle}>
            <Text style={{ color: "#fff", fontSize: 16 }}>→</Text>
          </View>
          <Text style={styles.circleLinkText}>Drive with Lizor</Text>
        </Pressable>
      </View>

      {/* Promise */}
      <View style={styles.promise}>
        <Text style={styles.promiseTitle}>Why ride with Lizor</Text>
        <View style={styles.promiseRule} />
        <Text style={styles.quoteMark}>“</Text>
        <Text style={styles.promiseQuote}>{PROMISES[promise].quote}</Text>
        <Text style={styles.promiseTag}>{PROMISES[promise].tag}</Text>
        <View style={styles.dots}>
          {PROMISES.map((p, i) => (
            <Pressable
              key={p.tag}
              onPress={() => setPromise(i)}
              accessibilityRole="button"
              accessibilityLabel={p.tag}
              style={[styles.dot, i === promise && styles.dotActive]}
            />
          ))}
        </View>
      </View>

      {/* Send money */}
      <View style={styles.sendCard}>
        <View style={styles.sendIcon}>
          <Text style={{ fontSize: 20 }}>✉️</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.sendTitle}>Send money to Liberia</Text>
          <Text style={styles.sendSub}>USD → LRD · 1.5% fee · mobile money, bank or cash pickup</Text>
        </View>
        <Pressable style={styles.sendBtn} onPress={() => navigation.navigate("SendFlow")} accessibilityRole="button">
          <Text style={styles.sendBtnText}>Send</Text>
        </Pressable>
      </View>

      {/* Safety */}
      <View style={styles.safety}>
        <Text style={styles.safetyTitle}>Our commitment{"\n"}to safety</Text>
        {[
          "Drivers verified in person",
          "4-digit PIN on every pickup",
          "One-tap trip sharing",
          "Two-way ratings",
        ].map((s) => (
          <View key={s} style={styles.safetyRow}>
            <View style={styles.safetyDot} />
            <Text style={styles.safetyText}>{s}</Text>
          </View>
        ))}
        <View style={styles.stripe} />
      </View>
    </ScrollView>
  );
}

function Feature({ icon, title }: { icon: string; title: string }) {
  return (
    <View style={styles.feature}>
      <View style={styles.featureIcon}>
        <Text style={{ fontSize: 18, fontWeight: "800", color: blues.royal }}>{icon}</Text>
      </View>
      <Text style={styles.featureTitle}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  announce: {
    backgroundColor: "#000",
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  announceText: { color: "#fff", fontSize: 14, flex: 1 },
  pill: { backgroundColor: blues.bright, borderRadius: radii.pill, paddingHorizontal: 14, paddingVertical: 8 },
  pillText: { color: "#fff", fontWeight: "600" },

  hero: {
    margin: 16,
    borderRadius: radii.xl,
    backgroundColor: blues.navy,
    padding: 22,
    paddingBottom: 18,
    minHeight: 280,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  heroGlow: {
    position: "absolute",
    left: -60,
    right: -60,
    bottom: -120,
    height: 240,
    borderRadius: 200,
    backgroundColor: blues.deep,
    opacity: 0.6,
  },
  heroMark: { position: "absolute", right: 14, top: 14, width: 92, height: 92, opacity: 0.95 },
  heroRoad: { position: "absolute", left: 0, right: 0, top: 120, flexDirection: "row", justifyContent: "space-around" },
  heroDash: { width: 36, height: 4, borderRadius: 2, backgroundColor: blues.primary, opacity: 0.7 },
  heroWord: { color: "#fff", fontSize: 64, fontWeight: "500", letterSpacing: -2, lineHeight: 66 },
  whereTo: {
    marginTop: 18,
    backgroundColor: "#fff",
    borderRadius: radii.pill,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 14,
    gap: 12,
  },
  whereDot: { width: 10, height: 10, backgroundColor: blues.primary, borderRadius: 5 },
  whereText: { flex: 1, fontSize: 18, fontWeight: "600", color: colors.text },
  whereArrow: { fontSize: 20, color: blues.primary, fontWeight: "700" },

  section: { paddingHorizontal: 20, paddingTop: 18 },
  meet: { fontSize: 42, fontWeight: "500", letterSpacing: -1.2, color: blues.primary },
  meetSub: { fontSize: 18, lineHeight: 25, color: colors.textSecondary, marginTop: 8 },
  features: {
    flexDirection: "row",
    gap: 10,
    marginTop: 22,
    paddingTop: 22,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  feature: { flex: 1, gap: 10 },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: blues.ice,
    backgroundColor: blues.mist,
    alignItems: "center",
    justifyContent: "center",
  },
  featureTitle: { fontSize: 16, fontWeight: "500", color: blues.navy2, lineHeight: 20 },

  dark: { backgroundColor: "#000", marginTop: 28, padding: 24, paddingVertical: 32 },
  bigKeep: { color: blues.bright, fontSize: 22, fontWeight: "500" },
  bigNum: { color: blues.bright, fontSize: 110, fontWeight: "500", letterSpacing: -5, lineHeight: 112 },
  bigText: { color: "#fff", fontSize: 28, fontWeight: "500" },
  bigFoot: { color: "#a1a1aa", fontSize: 13, marginTop: 10 },
  circleLink: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 20 },
  circle: { width: 34, height: 34, borderRadius: 17, borderWidth: 2, borderColor: "#fff", alignItems: "center", justifyContent: "center" },
  circleLinkText: { color: "#fff", fontSize: 18, fontWeight: "500" },

  promise: { backgroundColor: blues.bright, padding: 24, paddingVertical: 32 },
  promiseTitle: { color: "#fff", fontSize: 20 },
  promiseRule: { height: 1, backgroundColor: "rgba(255,255,255,0.7)", marginVertical: 18 },
  quoteMark: { color: "#fff", fontSize: 64, fontWeight: "900", lineHeight: 64, marginBottom: -14 },
  promiseQuote: { color: "#fff", fontSize: 26, lineHeight: 32, letterSpacing: -0.5, minHeight: 130 },
  promiseTag: { color: "#fff", fontFamily: "monospace", marginTop: 12, fontSize: 14 },
  dots: { flexDirection: "row", gap: 12, marginTop: 22 },
  dot: { width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(255,255,255,0.2)" },
  dotActive: { backgroundColor: blues.navy, borderWidth: 3, borderColor: "#fff" },

  sendCard: {
    marginHorizontal: 16,
    marginTop: -14,
    backgroundColor: "#23243b",
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sendIcon: { width: 46, height: 46, borderRadius: 23, backgroundColor: blues.ink, alignItems: "center", justifyContent: "center" },
  sendTitle: { color: "#fff", fontSize: 16, fontWeight: "700" },
  sendSub: { color: "#cbd5e1", fontSize: 12, marginTop: 3, lineHeight: 16 },
  sendBtn: { backgroundColor: blues.bright, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 6 },
  sendBtnText: { color: "#fff", fontWeight: "600" },

  safety: {
    margin: 16,
    marginTop: 24,
    backgroundColor: blues.navy,
    borderRadius: radii.xl,
    padding: 24,
    overflow: "hidden",
    gap: 10,
  },
  safetyTitle: { color: "#fff", fontSize: 34, fontWeight: "500", letterSpacing: -1, lineHeight: 38, marginBottom: 8 },
  safetyRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  safetyDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: blues.sky },
  safetyText: { color: "#e2e8f0", fontSize: 15 },
  stripe: {
    position: "absolute",
    right: -40,
    bottom: 30,
    width: 200,
    height: 22,
    backgroundColor: blues.bright,
    transform: [{ rotate: "-45deg" }],
  },
});
