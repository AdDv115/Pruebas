import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";

interface Props {
  label: string;
  secureTextEntry?: boolean;
}

export default function Input({ label, secureTextEntry }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        secureTextEntry={secureTextEntry}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 15,
    color:"#000"
  },

  label: {
    fontSize: 18,
    marginBottom: 20,
    fontWeight: "500",
    alignSelf: "center",
    color:"#000"
  },

  input: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    fontSize: 16,
    color:"#000"
  },
});
