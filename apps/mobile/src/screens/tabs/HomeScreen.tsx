import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { colors } from "../../theme";

export function HomeScreen() {
  return (
    <ScrollView style={styles.root} contentContainerStyle={{ padding: 24 }}>
      <Text style={styles.title}>DukorPay</Text>
      <View style={styles.ticker}>
        <Text style={styles.tickerLabel}>USD → LRD</Text>
        <Text style={styles.tickerValue}>Live rate from API · 1 USD ≈ 192 LRD (demo)</Text>
      </View>
      <Text style={styles.section}>Quick send</Text>
      <Text style={styles.muted}>Shortcuts to recent recipients — wire after history fetch.</Text>
      <Text style={[styles.section, { marginTop: 24 }]}>Referrals</Text>
      <Text style={styles.refer}>Invite a friend, get $5 when they send.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  title: { fontSize: 28, fontWeight: "800", color: colors.text, marginBottom: 20 },
  ticker: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
  },
  tickerLabel: { color: colors.accent, fontWeight: "700", marginBottom: 6 },
  tickerValue: { color: colors.textMuted },
  section: { color: colors.text, fontSize: 18, fontWeight: "700", marginBottom: 8 },
  muted: { color: colors.textMuted, lineHeight: 22 },
  refer: { color: colors.warn, fontWeight: "600" },
});
