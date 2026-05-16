import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { colors, radii } from "../../theme";

const QUICK_ACTIONS = [
  { title: "Send money", subtitle: "USD → LRD · 1.5% fee" },
  { title: "Airtime", subtitle: "Orange · MTN Liberia" },
  { title: "Referrals", subtitle: "Invite · earn $5" },
] as const;

export function HomeScreen() {
  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.kicker}>Home</Text>
      <Text style={styles.title}>DukorPay</Text>
      <Text style={styles.subtitle}>U.S. → Liberia · remittance, airtime & bills</Text>

      <View style={styles.rateCard}>
        <View style={styles.rateBadge}>
          <Text style={styles.rateBadgeText}>Live corridor</Text>
        </View>
        <Text style={styles.rateLabel}>USD → LRD</Text>
        <Text style={styles.rateValue}>1 USD ≈ 192 LRD</Text>
        <Text style={styles.rateHint}>Demo rate — connect quotes API for live FX.</Text>
      </View>

      <Text style={styles.section}>Quick actions</Text>
      <View style={styles.quickRow}>
        {QUICK_ACTIONS.map((q) => (
          <Pressable
            key={q.title}
            style={({ pressed }) => [styles.quickChip, pressed && styles.quickChipPressed]}
            accessibilityRole="button"
          >
            <Text style={styles.quickTitle}>{q.title}</Text>
            <Text style={styles.quickSub}>{q.subtitle}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.section}>Referrals</Text>
      <View style={styles.referCard}>
        <Text style={styles.referTitle}>Invite a friend, get $5</Text>
        <Text style={styles.referBody}>When they complete their first qualifying send, you both earn rewards.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 24, paddingBottom: 40 },
  kicker: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: colors.accent,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  title: { fontSize: 32, fontWeight: "800", color: colors.text, letterSpacing: -0.5, marginBottom: 6 },
  subtitle: { fontSize: 15, color: colors.textMuted, lineHeight: 22, marginBottom: 24 },
  rateCard: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: 20,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 4,
  },
  rateBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.accentMuted,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.sm,
    marginBottom: 12,
  },
  rateBadgeText: { fontSize: 11, fontWeight: "800", color: colors.accentDark, letterSpacing: 0.6 },
  rateLabel: { color: colors.accent, fontWeight: "700", marginBottom: 4, fontSize: 13 },
  rateValue: { color: colors.text, fontSize: 22, fontWeight: "800", letterSpacing: -0.3 },
  rateHint: { color: colors.textMuted, marginTop: 8, fontSize: 13, lineHeight: 18 },
  section: { color: colors.text, fontSize: 17, fontWeight: "800", marginBottom: 12, letterSpacing: -0.2 },
  quickRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 28 },
  quickChip: {
    flexGrow: 1,
    flexBasis: "30%",
    minWidth: 100,
    backgroundColor: colors.card,
    borderRadius: radii.md,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickChipPressed: { opacity: 0.92, transform: [{ scale: 0.98 }] },
  quickTitle: { color: colors.text, fontWeight: "700", fontSize: 14, marginBottom: 4 },
  quickSub: { color: colors.textMuted, fontSize: 12, lineHeight: 16 },
  referCard: {
    backgroundColor: colors.accentMuted,
    borderRadius: radii.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(11, 143, 217, 0.2)",
  },
  referTitle: { color: colors.accentDark, fontWeight: "800", fontSize: 16, marginBottom: 6 },
  referBody: { color: colors.textSecondary, fontSize: 14, lineHeight: 20 },
});
