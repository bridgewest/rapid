import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { colors } from "../../theme";
import type { OnboardingStackParamList } from "../../navigation/RootNavigator";
import { apiFetch } from "../../api/client";
import { useAuth } from "../../context/AuthContext";

type Props = NativeStackScreenProps<OnboardingStackParamList, "ProfileSetup">;

export function ProfileSetupScreen(_props: Props) {
  const { markOnboardingFinished } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const save = async () => {
    await apiFetch("/users/me/profile", {
      method: "PATCH",
      body: JSON.stringify({ firstName, lastName }),
    });
    await markOnboardingFinished();
  };

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Your profile</Text>
      <Text style={styles.label}>First name</Text>
      <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} placeholderTextColor={colors.textMuted} />
      <Text style={styles.label}>Last name</Text>
      <TextInput style={styles.input} value={lastName} onChangeText={setLastName} placeholderTextColor={colors.textMuted} />
      <Pressable style={styles.btn} onPress={() => void save()}>
        <Text style={styles.btnText}>Save & enter app</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, padding: 24, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: "700", color: colors.text, marginBottom: 24 },
  label: { color: colors.textMuted, marginBottom: 6 },
  input: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 14,
    color: colors.text,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  btn: {
    backgroundColor: colors.accent,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
  },
  btnText: { color: colors.onAccent, fontWeight: "700", fontSize: 17 },
});
