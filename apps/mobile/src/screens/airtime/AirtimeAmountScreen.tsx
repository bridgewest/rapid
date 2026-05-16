import React, { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, FlatList } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { apiFetch } from "../../api/client";
import { colors } from "../../theme";
import type { SendFlowParamList } from "../MainTabNavigator";

type Props = NativeStackScreenProps<SendFlowParamList, "AirtimeAmount">;

type Preset = { label: string; wholesaleUsdCents: number; totalUsdCents: number };

export function AirtimeAmountScreen({ navigation, route }: Props) {
  const { phoneE164, carrier } = route.params;
  const [margin] = useState(20);
  const [presets, setPresets] = useState<Preset[]>([]);

  useEffect(() => {
    (async () => {
      const res = await apiFetch(`/quotes/airtime?marginPercent=${margin}`);
      if (res.ok) {
        const q = await res.json();
        setPresets(q.presets);
      }
    })();
  }, [margin]);

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Top-up amount</Text>
      <Text style={styles.sub}>
        To {phoneE164} · {carrier} · margin {margin}% + $0.75
      </Text>
      <FlatList
        data={presets}
        keyExtractor={(p) => p.label}
        renderItem={({ item }) => (
          <Pressable
            style={styles.row}
            onPress={() =>
              navigation.navigate("AirtimeReview", {
                phoneE164,
                carrier,
                wholesaleCents: item.wholesaleUsdCents,
                margin,
              })
            }
          >
            <Text style={styles.rowTitle}>{item.label} face value</Text>
            <Text style={styles.rowSub}>You pay ${(item.totalUsdCents / 100).toFixed(2)}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, padding: 24 },
  title: { fontSize: 22, fontWeight: "700", color: colors.text, marginBottom: 6 },
  sub: { color: colors.textMuted, marginBottom: 20 },
  row: {
    backgroundColor: colors.card,
    padding: 18,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowTitle: { color: colors.text, fontWeight: "600", fontSize: 16 },
  rowSub: { color: colors.accent, marginTop: 6 },
});
