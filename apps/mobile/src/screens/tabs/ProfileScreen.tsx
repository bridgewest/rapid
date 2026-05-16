import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { colors } from "../../theme";
import { useAuth } from "../../context/AuthContext";

export function ProfileScreen() {
  const { user, signOut } = useAuth();
  return (
    <View style={styles.root}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.line}>{user?.email}</Text>
      <Text style={styles.line}>{user?.phoneE164}</Text>
      <Text style={styles.kyc}>KYC: {user?.kycStatus}</Text>
      <Text style={styles.section}>Biometric MFA</Text>
      <Text style={styles.muted}>Enable Face ID / fingerprint in device settings (client integration).</Text>
      <Pressable style={styles.btn} onPress={() => void signOut()}>
        <Text style={styles.btnText}>Sign out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, padding: 24 },
  title: { fontSize: 26, fontWeight: "700", color: colors.text, marginBottom: 16 },
  line: { color: colors.text, fontSize: 16, marginBottom: 8 },
  kyc: { color: colors.warn, marginVertical: 16 },
  section: { color: colors.text, fontWeight: "600", marginTop: 24 },
  muted: { color: colors.textMuted, marginTop: 8, lineHeight: 20 },
  btn: {
    marginTop: 40,
    backgroundColor: colors.danger,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  btnText: { color: colors.onDanger, fontWeight: "700" },
});
