import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, Pressable } from "react-native";
import { colors } from "../../theme";
import { apiFetch } from "../../api/client";

type Tx = {
  publicId: string;
  kind: string;
  status: string;
  sendAmountUsdCents: number;
  createdAt: string;
};

export function HistoryScreen() {
  const [kind, setKind] = useState<string | null>(null);
  const [items, setItems] = useState<Tx[]>([]);

  const load = async (k: string | null) => {
    const q = k ? `?kind=${k}` : "";
    const res = await apiFetch(`/transactions${q}`);
    if (res.ok) setItems(await res.json());
  };

  useEffect(() => {
    void load(kind);
  }, [kind]);

  return (
    <View style={styles.root}>
      <Text style={styles.title}>History</Text>
      <View style={styles.filters}>
        {["ALL", "REMITTANCE", "AIRTIME"].map((k) => (
          <Pressable key={k} onPress={() => setKind(k === "ALL" ? null : k)} style={styles.chip}>
            <Text style={{ color: colors.text }}>{k}</Text>
          </Pressable>
        ))}
      </View>
      <FlatList
        data={items}
        keyExtractor={(i) => i.publicId}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.k}>{item.kind}</Text>
            <Text style={styles.s}>{item.status}</Text>
            <Text style={styles.a}>${(item.sendAmountUsdCents / 100).toFixed(2)}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, padding: 16 },
  title: { fontSize: 22, fontWeight: "700", color: colors.text, marginBottom: 12 },
  filters: { flexDirection: "row", gap: 8, marginBottom: 12, flexWrap: "wrap" },
  chip: {
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    padding: 14,
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  k: { color: colors.accent, fontWeight: "600" },
  s: { color: colors.textMuted },
  a: { color: colors.text, marginTop: 4, fontSize: 16 },
});
