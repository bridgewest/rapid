import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { colors } from "../../theme";
import type { AuthStackParamList } from "../../navigation/RootNavigator";

type Props = NativeStackScreenProps<AuthStackParamList, "Welcome">;

export function WelcomeScreen({ navigation }: Props) {
  return (
    <View style={styles.root}>
      <Text style={styles.logo}>DukorPay</Text>
      <Text style={styles.tag}>U.S. → Liberia remittance, airtime & bills</Text>
      <Pressable style={styles.btn} onPress={() => navigation.navigate("Register")}>
        <Text style={styles.btnText}>Get started</Text>
      </Pressable>
      <Pressable onPress={() => navigation.navigate("Login")}>
        <Text style={styles.link}>Already have an account? Sign in</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, padding: 24, justifyContent: "center" },
  logo: { fontSize: 36, fontWeight: "800", color: colors.text, marginBottom: 8 },
  tag: { fontSize: 16, color: colors.textMuted, marginBottom: 40 },
  btn: {
    backgroundColor: colors.accent,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  btnText: { color: colors.bg, fontWeight: "700", fontSize: 17 },
  link: { color: colors.accent, textAlign: "center", fontSize: 15 },
});
