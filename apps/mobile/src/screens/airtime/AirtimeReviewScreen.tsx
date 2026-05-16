import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { apiFetch } from "../../api/client";
import { colors } from "../../theme";
import type { SendFlowParamList } from "../MainTabNavigator";

type Props = NativeStackScreenProps<SendFlowParamList, "AirtimeReview">;

export function AirtimeReviewScreen({ navigation, route }: Props) {
  const { phoneE164, carrier, wholesaleCents, margin } = route.params;

  const confirm = async () => {
    const res = await apiFetch("/transactions/airtime", {
      method: "POST",
      body: JSON.stringify({
        recipientPhoneE164: phoneE164,
        wholesaleUsdCents: wholesaleCents,
        marginPercent: margin,
        carrier,
      }),
    });
    if (!res.ok) return;
    const tx = await res.json();
    navigation.navigate("AirtimeSuccess", { publicId: tx.publicId });
  };

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Confirm airtime</Text>
      <Text style={styles.line}>Number: {phoneE164}</Text>
      <Text style={styles.line}>Carrier: {carrier}</Text>
      <Text style={styles.line}>Wholesale value: ${(wholesaleCents / 100).toFixed(2)}</Text>
      <Text style={styles.note}>Reloadly API executes delivery; confirmation SMS to recipient.</Text>
      <Pressable style={styles.btn} onPress={confirm}>
        <Text style={styles.btnText}>Pay & send</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, padding: 24 },
  title: { fontSize: 22, fontWeight: "700", color: colors.text, marginBottom: 16 },
  line: { color: colors.text, marginBottom: 8, fontSize: 16 },
  note: { color: colors.textMuted, marginVertical: 24, lineHeight: 22 },
  btn: {
    backgroundColor: colors.accent,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  btnText: { color: colors.bg, fontWeight: "700", fontSize: 17 },
});
