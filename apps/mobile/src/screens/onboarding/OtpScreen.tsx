import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { colors } from "../../theme";
import type { OnboardingStackParamList } from "../../navigation/RootNavigator";
import { apiFetch } from "../../api/client";
import { useAuth } from "../../context/AuthContext";

type Props = NativeStackScreenProps<OnboardingStackParamList, "Otp">;

export function OtpScreen({ navigation, route }: Props) {
  const { user } = useAuth();
  const phoneE164 = route.params?.phoneE164 ?? user?.phoneE164 ?? "";
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const verify = async () => {
    setBusy(true);
    try {
      const res = await apiFetch("/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ phoneE164, code }),
      });
      if (!res.ok) throw new Error();
      navigation.navigate("KycIntro");
    } catch {
      Alert.alert("OTP", "Invalid code. Dev: use 123456");
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Verify phone</Text>
      <Text style={styles.sub}>Enter the code sent to {phoneE164}</Text>
      <Text style={styles.hint}>Dev bypass: 123456</Text>
      <TextInput
        style={styles.input}
        value={code}
        onChangeText={setCode}
        keyboardType="number-pad"
        maxLength={6}
        placeholder="000000"
        placeholderTextColor={colors.textMuted}
      />
      <Pressable style={styles.btn} onPress={verify} disabled={busy}>
        <Text style={styles.btnText}>Verify</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, padding: 24, paddingTop: 60 },
  title: { fontSize: 26, fontWeight: "700", color: colors.text, marginBottom: 8 },
  sub: { color: colors.textMuted, marginBottom: 8 },
  hint: { color: colors.warn, marginBottom: 20, fontSize: 12 },
  input: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 14,
    color: colors.text,
    fontSize: 24,
    letterSpacing: 8,
    marginBottom: 20,
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
