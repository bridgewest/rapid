import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { colors } from "../../theme";
import type { SendFlowParamList } from "../MainTabNavigator";

type Props = NativeStackScreenProps<SendFlowParamList, "SendAmount">;

export function SendAmountScreen({ navigation }: Props) {
  const [usd, setUsd] = useState("50");

  const next = () => {
    const n = Math.round(parseFloat(usd || "0") * 100);
    if (n < 100) {
      Alert.alert("Minimum", "Enter at least $1");
      return;
    }
    navigation.navigate("SendRecipient", { usdCents: n });
  };

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Send money</Text>
      <Text style={styles.label}>Amount (USD)</Text>
      <TextInput
        style={styles.input}
        value={usd}
        onChangeText={setUsd}
        keyboardType="decimal-pad"
        placeholderTextColor={colors.textMuted}
      />
      <Pressable style={styles.btn} onPress={next}>
        <Text style={styles.btnText}>Choose recipient</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, padding: 24 },
  title: { fontSize: 24, fontWeight: "700", color: colors.text, marginBottom: 24 },
  label: { color: colors.textMuted, marginBottom: 8 },
  input: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 16,
    fontSize: 22,
    color: colors.text,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  btn: {
    backgroundColor: colors.accent,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  btnText: { color: colors.bg, fontWeight: "700", fontSize: 17 },
});
