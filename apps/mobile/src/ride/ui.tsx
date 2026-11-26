import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { colors, radii } from "../theme";

export function Button({
  title,
  onPress,
  variant = "primary",
  loading,
  disabled,
  style,
}: {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger";
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}) {
  const bg = variant === "primary" ? colors.accent : variant === "danger" ? colors.danger : colors.card;
  const fg = variant === "secondary" ? colors.text : colors.onAccent;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        ui.btn,
        { backgroundColor: bg, opacity: disabled ? 0.5 : pressed ? 0.9 : 1 },
        variant === "secondary" && ui.btnSecondary,
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={fg} /> : <Text style={[ui.btnText, { color: fg }]}>{title}</Text>}
    </Pressable>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[ui.card, style]}>{children}</View>;
}

export function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={ui.row}>
      <Text style={ui.rowLabel}>{label}</Text>
      <Text style={[ui.rowValue, strong && { fontWeight: "800", fontSize: 16 }]}>{value}</Text>
    </View>
  );
}

export function ErrorText({ message }: { message: string | null }) {
  if (!message) return null;
  return <Text style={ui.error}>{message}</Text>;
}

export const ui = StyleSheet.create({
  btn: {
    borderRadius: radii.md,
    paddingVertical: 15,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
  },
  btnSecondary: { borderWidth: 1, borderColor: colors.borderStrong },
  btnText: { fontWeight: "700", fontSize: 16 },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
  rowLabel: { color: colors.textMuted, fontSize: 14 },
  rowValue: { color: colors.text, fontSize: 14, fontWeight: "600", flexShrink: 1, textAlign: "right", marginLeft: 12 },
  error: { color: colors.danger, marginVertical: 8, fontSize: 14 },
  h1: { fontSize: 26, fontWeight: "800", color: colors.text, letterSpacing: -0.4 },
  h2: { fontSize: 17, fontWeight: "800", color: colors.text, marginBottom: 10 },
  muted: { color: colors.textMuted, fontSize: 14, lineHeight: 20 },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
});
