import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { colors } from "../../theme";
import type { SendFlowParamList } from "../../navigation/MainTabNavigator";

type Props = NativeStackScreenProps<SendFlowParamList, "SendHub">;

export function SendHubScreen({ navigation }: Props) {
  return (
    <View style={styles.root}>
      <Text style={styles.title}>Send</Text>
      <Pressable style={styles.card} onPress={() => navigation.navigate("SendAmount")}>
        <Text style={styles.cardTitle}>Send money</Text>
        <Text style={styles.cardSub}>USD → LRD · 1.5% fee · live rate</Text>
      </Pressable>
      <Pressable style={styles.card} onPress={() => navigation.navigate("AirtimePhone")}>
        <Text style={styles.cardTitle}>Send airtime</Text>
        <Text style={styles.cardSub}>Orange / MTN Liberia · Reloadly</Text>
      </Pressable>
      <Text style={styles.phase}>Phase 3: Bill pay uses same flow with Reloadly Bill Pay API.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, padding: 24 },
  title: { fontSize: 28, fontWeight: "800", color: colors.text, marginBottom: 24 },
  card: {
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: { color: colors.text, fontSize: 18, fontWeight: "700", marginBottom: 6 },
  cardSub: { color: colors.textMuted, fontSize: 14 },
  phase: { color: colors.textMuted, marginTop: 24, fontSize: 13 },
});
