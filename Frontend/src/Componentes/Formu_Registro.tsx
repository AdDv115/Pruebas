import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Input from "./Input";
import Boton from "./Boton";

interface Props {
  onLoginPress: () => void;
}

export default function Formu_Registro({ onLoginPress }: Props) {
  return (
    <View style={styles.content}>
      
      <View style={styles.card}>
        <Input label="Nombre de usuario" />
        <Input label="Correo electrónico" />
        <Input label="Contraseña" secureTextEntry />

        <Boton title="Registrarse" />
      </View>

      <TouchableOpacity style={styles.googleBtn}>
        <Text style={styles.googleText}>
          Continuar con Google
        </Text>
      </TouchableOpacity>

      <Text style={styles.loginText}>
        ¿Ya tienes cuenta?{" "}
        <Text 
          style={{ fontWeight: "bold" }} 
          onPress={onLoginPress}
        >
          Inicia sesión
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
    padding: 20,
    borderRadius: 12,
  },
  googleBtn: {
    width: "80%",
    borderWidth: 1,
    borderColor: "#000",
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 25,
  },
  googleText: {
    fontSize: 15,
  },
  loginText: {
    marginTop: 20,
    textAlign: "center",
  },
});