import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { colors } from "../../theme";
import type { OnboardingStackParamList } from "../../navigation/RootNavigator";

type Props = NativeStackScreenProps<OnboardingStackParamList, "KycIntro">;

export function KycIntroScreen({ navigation }: Props) {
  return (
    <View style={styles.root}>
      <Text style={styles.title}>Verify your identity</Text>
      <Text style={styles.body}>
        KYC collects government ID, a selfie, and proof of address. Integration points: Persona or Jumio
        (backend `/kyc/submit`).
      </Text>
      <Pressable style={styles.btn} onPress={() => navigation.navigate("ProfileSetup")}>
        <Text style={styles.btnText}>Continue</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, padding: 24, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: "700", color: colors.text, marginBottom: 16 },
  body: { color: colors.textMuted, fontSize: 16, lineHeight: 24, marginBottom: 32 },
  btn: {
    backgroundColor: colors.accent,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  btnText: { color: colors.onAccent, fontWeight: "700", fontSize: 17 },
});
