import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Input from "./Input";
import Boton from "./Boton";

interface Props {
  onRegisterPress: () => void;
}

export default function Formu_Inicio({ onRegisterPress }: Props) {
  return (
    <View style={styles.content}>

      <View style={styles.card}>
        <Input label="Correo electrónico" />
        <Input label="Contraseña" secureTextEntry />
        <Boton title="Entrar" />
      </View>

      <TouchableOpacity style={styles.googleBtn}>
        <Text>Continuar con Google</Text>
      </TouchableOpacity>

      <Text style={styles.register}>
        ¿No tienes cuenta?{" "}
        <Text style={{ fontWeight: "bold" }} onPress={onRegisterPress}>
          Crear cuenta
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: "center",
    paddingTop: 40,
  },
  card: {
    backgroundColor: "#FFD600",
    width: "80%",
    padding: 15,
    borderRadius: 12,
  },
  googleBtn: {
    width: "60%",
    borderWidth: 1,
    borderColor: "#000",
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 25,
  },
  register: {
    marginTop: 20,
    textAlign: "center",
  },
});