import React from "react";
import { View, TouchableOpacity, Image, StyleSheet } from "react-native";

export default function Navbar({ navigation }: any) {
  return (
    <View style={styles.container}>

      <TouchableOpacity onPress={() => navigation.navigate("ChatbotPrincipal")}>
        <Image
          source={require("../Img/icono-robot.png")}
          style={styles.icon}
        />
      </TouchableOpacity>

      <TouchableOpacity>
        <Image
          source={require("../Img/icono-chat.png")}
          style={styles.icon}
        />
      </TouchableOpacity>

      <TouchableOpacity>
        <Image
          source={require("../Img/icono-comida.png")}
          style={styles.icon}
        />
      </TouchableOpacity>

      <TouchableOpacity>
        <Image
          source={require("../Img/icono-usuario.png")}
          style={styles.icon}
        />
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFD600",
    height: 80,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },

  icon: {
    width: 50,
    height: 50,
  },
});