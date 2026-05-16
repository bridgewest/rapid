import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { apiFetch } from "../../api/client";
import { colors } from "../../theme";
import type { SendFlowParamList } from "../MainTabNavigator";

type Props = NativeStackScreenProps<SendFlowParamList, "AirtimePhone">;

export function AirtimePhoneScreen({ navigation }: Props) {
  const [phone, setPhone] = useState("+231");
  const [carrier, setCarrier] = useState("AUTO");

  const lookup = async () => {
    const res = await apiFetch(`/recipients/lookup?phoneE164=${encodeURIComponent(phone)}`);
    const data = res.ok ? await res.json() : { carrierGuess: "UNKNOWN" };
    const c = data.carrierGuess === "UNKNOWN" ? carrier : data.carrierGuess;
    navigation.navigate("AirtimeAmount", { phoneE164: phone, carrier: c });
  };

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Send airtime</Text>
      <Text style={styles.label}>Liberia number</Text>
      <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholderTextColor={colors.textMuted} />
      <Text style={styles.label}>Carrier (if unknown)</Text>
      <TextInput style={styles.input} value={carrier} onChangeText={setCarrier} placeholderTextColor={colors.textMuted} />
      <Pressable style={styles.btn} onPress={lookup}>
        <Text style={styles.btnText}>Continue</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, padding: 24 },
  title: { fontSize: 24, fontWeight: "700", color: colors.text, marginBottom: 20 },
  label: { color: colors.textMuted, marginBottom: 6 },
  input: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 14,
    color: colors.text,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  btn: {
    backgroundColor: colors.accent,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  btnText: { color: colors.bg, fontWeight: "700", fontSize: 17 },
});
