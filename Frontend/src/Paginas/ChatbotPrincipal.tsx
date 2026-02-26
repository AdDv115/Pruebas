import React from "react";
import { View, StyleSheet } from "react-native";
import Header from "../Componentes/Header";
import Navbar from "../Componentes/Navbar";
import ChatBotView from "../Componentes/ChatbotView"

export default function ChatbotPrincipal({ navigation }: any) {
  return(
    <View style={styles.container}>
      <Header title="PailApp" />

        <ChatBotView/>
        <Navbar navigation={navigation} />

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EDE4C7",
    marginBottom: 20,
    color:"#000"
  },
});