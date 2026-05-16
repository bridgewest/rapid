import React, { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { colors } from "../../theme";
import { apiFetch } from "../../api/client";
import type { SendFlowParamList } from "../MainTabNavigator";

type Props = NativeStackScreenProps<SendFlowParamList, "SendReview">;

export function SendReviewScreen({ navigation, route }: Props) {
  const { usdCents, recipientId } = route.params;
  const [quote, setQuote] = useState<{
    feeUsdCents: number;
    estimatedReceiveLrd: number;
    fxRate: string;
  } | null>(null);

  useEffect(() => {
    (async () => {
      const res = await apiFetch(`/quotes/remittance?sendAmountUsdCents=${usdCents}`);
      if (res.ok) setQuote(await res.json());
    })();
  }, [usdCents]);

  const confirm = async () => {
    const res = await apiFetch("/transactions/remittance", {
      method: "POST",
      body: JSON.stringify({ sendAmountUsdCents: usdCents, recipientId }),
    });
    if (!res.ok) return;
    const tx = await res.json();
    navigation.navigate("SendSuccess", { publicId: tx.publicId });
  };

  if (!quote)
    return (
      <View style={[styles.root, styles.center]}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Review</Text>
      <View style={styles.card}>
        <Row label="You send" value={`$${(usdCents / 100).toFixed(2)} USD`} />
        <Row label="Fee (1.5%)" value={`$${(quote.feeUsdCents / 100).toFixed(2)}`} />
        <Row label="They receive ~" value={`LRD ${quote.estimatedReceiveLrd.toLocaleString()}`} />
        <Row label="Rate" value={quote.fxRate} last />
      </View>
      <Pressable style={styles.btn} onPress={confirm}>
        <Text style={styles.btnText}>Confirm</Text>
      </Pressable>
    </View>
  );
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.row, last && { borderBottomWidth: 0 }]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, padding: 24 },
  center: { justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "700", color: colors.text, marginBottom: 20 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLabel: { color: colors.textMuted },
  rowValue: { color: colors.text, fontWeight: "600" },
  btn: {
    backgroundColor: colors.accent,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  btnText: { color: colors.bg, fontWeight: "700", fontSize: 17 },
});
