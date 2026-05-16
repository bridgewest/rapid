import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, FlatList, Alert } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { colors } from "../../theme";
import { apiFetch } from "../../api/client";
import type { SendFlowParamList } from "../MainTabNavigator";

type Props = NativeStackScreenProps<SendFlowParamList, "SendRecipient">;

type Recipient = { id: string; name: string; phoneE164: string };

export function SendRecipientScreen({ navigation, route }: Props) {
  const { usdCents } = route.params;
  const [list, setList] = useState<Recipient[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+231");

  useEffect(() => {
    (async () => {
      const res = await apiFetch("/recipients");
      if (res.ok) setList(await res.json());
    })();
  }, []);

  const addRecipient = async () => {
    const res = await apiFetch("/recipients", {
      method: "POST",
      body: JSON.stringify({ name, phoneE164: phone }),
    });
    if (!res.ok) {
      Alert.alert("Error", "Could not save recipient");
      return;
    }
    const r = await res.json();
    setList((x) => [r, ...x]);
    navigation.navigate("SendReview", { usdCents, recipientId: r.id });
  };

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Recipient</Text>
      <FlatList
        data={list}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <Pressable
            style={styles.row}
            onPress={() => navigation.navigate("SendReview", { usdCents, recipientId: item.id })}
          >
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.phone}>{item.phoneE164}</Text>
          </Pressable>
        )}
        ListHeaderComponent={
          <>
            <Text style={styles.h2}>New recipient</Text>
            <Text style={styles.label}>Name</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholderTextColor={colors.textMuted} />
            <Text style={styles.label}>Phone</Text>
            <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholderTextColor={colors.textMuted} />
            <Pressable style={styles.btn} onPress={addRecipient}>
              <Text style={styles.btnText}>Save & continue</Text>
            </Pressable>
            <Text style={[styles.h2, { marginTop: 24 }]}>Saved</Text>
          </>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, padding: 24 },
  title: { fontSize: 24, fontWeight: "700", color: colors.text, marginBottom: 8 },
  h2: { color: colors.textMuted, marginBottom: 12, fontWeight: "600" },
  label: { color: colors.textMuted, marginBottom: 6, fontSize: 13 },
  input: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 14,
    color: colors.text,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  btn: {
    backgroundColor: colors.accent,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 8,
  },
  btnText: { color: colors.onAccent, fontWeight: "700" },
  row: {
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  name: { color: colors.text, fontWeight: "600", fontSize: 16 },
  phone: { color: colors.textMuted, marginTop: 4 },
});
