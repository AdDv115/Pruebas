import React from "react";
import { View, StyleSheet } from "react-native";
import Header from "../Componentes/Header";
import Formu_Registro from "../Componentes/Formu_Registro";

export default function Registro({ navigation }: any) {
  return (
    <View style={styles.container}>
      
      <Header title="Crear cuenta" onBack={() => navigation.goBack()} />

      <Formu_Registro
        onLoginPress={() => navigation.navigate("Login")}
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