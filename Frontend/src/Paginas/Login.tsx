import React from "react";
import { View, StyleSheet } from "react-native";
import Header from "../Componentes/Header";
import Formu_Inicio from "../Componentes/Formu_Inicio";

export default function Login({ navigation }: any) {
  return (
    <View style={styles.container}>
      
      <Header title="Iniciar sesión" onBack={() => navigation.goBack()}/>

      <Formu_Inicio
        onRegisterPress={() => navigation.navigate("Registro")}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EDE4C7",
  },
});