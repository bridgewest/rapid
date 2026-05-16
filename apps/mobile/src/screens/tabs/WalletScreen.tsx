import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../theme";
import { apiFetch } from "../../api/client";

export function WalletScreen() {
  const [bal, setBal] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const res = await apiFetch("/wallet");
      if (res.ok) {
        const w = await res.json();
        setBal(w.availableUsdCents);
      }
    })();
  }, []);

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Wallet</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Available (ledger summary)</Text>
        <Text style={styles.amt}>
          {bal == null ? "—" : `$${(bal / 100).toFixed(2)}`}
        </Text>
        <Text style={styles.note}>
          Production: Stripe Treasury / Column Bank financial account balance.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, padding: 24 },
  title: { fontSize: 24, fontWeight: "700", color: colors.text, marginBottom: 20 },
  card: {
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: { color: colors.textMuted, marginBottom: 8 },
  amt: { color: colors.accent, fontSize: 36, fontWeight: "800" },
  note: { color: colors.textMuted, marginTop: 16, lineHeight: 20 },
});
