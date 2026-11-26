import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { colors } from "../../theme";
import type { SendFlowParamList } from "../../navigation/MainTabNavigator";

type Props = NativeStackScreenProps<SendFlowParamList, "SendSuccess">;

export function SendSuccessScreen({ navigation, route }: Props) {
  const { publicId } = route.params;
  return (
    <View style={styles.root}>
      <Text style={styles.title}>Transfer initiated</Text>
      <Text style={styles.sub}>Reference: {publicId}</Text>
      <Text style={styles.body}>Status: Initiated → Processing → Delivered (push updates enabled).</Text>
      <Pressable style={styles.btn} onPress={() => navigation.popToTop()}>
        <Text style={styles.btnText}>Done</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, padding: 24, justifyContent: "center" },
  title: { fontSize: 26, fontWeight: "800", color: colors.accent, marginBottom: 12 },
  sub: { color: colors.text, marginBottom: 16 },
  body: { color: colors.textMuted, lineHeight: 22, marginBottom: 32 },
  btn: {
    backgroundColor: colors.card,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnText: { color: colors.text, fontWeight: "700" },
});
