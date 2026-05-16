import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { colors, radii } from "../../theme";
import type { AuthStackParamList } from "../../navigation/RootNavigator";

type Props = NativeStackScreenProps<AuthStackParamList, "Welcome">;

export function WelcomeScreen({ navigation }: Props) {
  return (
    <View style={styles.root}>
      <View style={styles.hero}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>U.S. → Liberia</Text>
        </View>
        <Text style={styles.logo}>DukorPay</Text>
        <Text style={styles.tag}>Remittance, airtime & bills in one super-app.</Text>
      </View>
      <Pressable style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]} onPress={() => navigation.navigate("Register")}>
        <Text style={styles.btnText}>Get started</Text>
      </Pressable>
      <Pressable onPress={() => navigation.navigate("Login")} hitSlop={12}>
        <Text style={styles.link}>Already have an account? Sign in</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, padding: 24, justifyContent: "center" },
  hero: {
    marginBottom: 36,
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    padding: 28,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 28,
    elevation: 6,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: colors.accentMuted,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.pill,
    marginBottom: 16,
  },
  badgeText: { fontSize: 11, fontWeight: "800", color: colors.accentDark, letterSpacing: 0.8 },
  logo: { fontSize: 36, fontWeight: "800", color: colors.text, marginBottom: 10, letterSpacing: -0.5 },
  tag: { fontSize: 16, color: colors.textMuted, lineHeight: 24 },
  btn: {
    backgroundColor: colors.accent,
    paddingVertical: 16,
    borderRadius: radii.md,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 4,
  },
  btnPressed: { opacity: 0.94 },
  btnText: { color: colors.onAccent, fontWeight: "800", fontSize: 17 },
  link: { color: colors.accentDark, textAlign: "center", fontSize: 15, fontWeight: "600" },
});
