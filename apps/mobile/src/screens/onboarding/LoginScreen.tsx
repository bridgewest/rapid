import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { colors } from "../../theme";
import type { AuthStackParamList } from "../../navigation/RootNavigator";
import { useAuth } from "../../context/AuthContext";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    setBusy(true);
    try {
      await signIn(email, password);
    } catch {
      Alert.alert("Error", "Invalid email or password");
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Sign in</Text>
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor={colors.textMuted}
      />
      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor={colors.textMuted}
      />
      <Pressable style={[styles.btn, busy && styles.btnDisabled]} onPress={onSubmit} disabled={busy}>
        <Text style={styles.btnText}>Sign in</Text>
      </Pressable>
      <Pressable onPress={() => navigation.navigate("Register")} style={{ marginTop: 20 }}>
        <Text style={styles.link}>New user? Create account</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, padding: 24, paddingTop: 60 },
  title: { fontSize: 26, fontWeight: "700", color: colors.text, marginBottom: 24 },
  label: { color: colors.textMuted, marginBottom: 6, fontSize: 13 },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 14,
    color: colors.text,
    marginBottom: 16,
    fontSize: 16,
  },
  btn: {
    backgroundColor: colors.accent,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: colors.bg, fontWeight: "700", fontSize: 17 },
  link: { color: colors.accent, textAlign: "center" },
});
