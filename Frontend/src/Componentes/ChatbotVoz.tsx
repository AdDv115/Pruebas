import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";

export default function ChatVoz({ navigation }: any) {
  return (
    <View style={styles.container}>

      <View style={styles.statusBar}>
        <Text style={{ color: "#fff" }}>Escuchando...</Text>
      </View>

      {/* Contenido */}
      <View style={styles.content}>
        <Image
          source={require("../Img/robotito2.png")}
          style={styles.robot}
          resizeMode="contain"
        />

        <TouchableOpacity>
        <Image
          source={require("../Img/icono-micro.png")}
          style={{ width: 80, height: 80 }}
        />
        </TouchableOpacity>

        <TouchableOpacity>
            <Image
          source={require("../Img/icono-teclado.png")}
          style={{ width: 80, height: 80, margin: 30 }}
        />
            </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EDE4C7",
  },

  header: {
    backgroundColor: "#FFD600",
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  logo: {
    fontSize: 22,
    fontWeight: "bold",
  },

  statusBar: {
    backgroundColor: "#000",
    height: 25,
    justifyContent: "center",
    alignItems: "center",
  },

  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  robot: {
    width: 260,
    height: 260,
    marginBottom: 40,
  },

  micButton: {
    marginBottom: 20,
  },

  mic: {
    fontSize: 60,
  },

  keyboard: {
    fontSize: 20,
  },
});