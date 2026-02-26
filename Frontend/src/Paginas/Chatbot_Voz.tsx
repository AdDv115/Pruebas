import React from "react";
import { View, StyleSheet } from "react-native";
import Header from "../Componentes/Header";
import Navbar from "../Componentes/Navbar";
import ChatbotVoz from "../Componentes/ChatbotVoz"

export default function Chatbot_Voz({ navigation }: any) {
  return(
    <View style={styles.container}>

        <ChatbotVoz/>
        <Navbar navigation={navigation} />



    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EDE4C7",
  },
});