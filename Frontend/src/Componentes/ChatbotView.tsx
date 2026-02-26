import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { API_BASE_URL } from "../config/api";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export default function ChatPrincipal({ navigation }: any) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hola, soy tu asistente de cocina. ¿Qué quieres cocinar hoy?",
    },
  ]);

  const sendMessage = async () => {
    const mensaje = input.trim();
    if (!mensaje || loading) return;

    const userMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      content: mensaje,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mensaje,
          tipoUsuario: "free",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Error al conectar con el agente");
      }

      const assistantMessage: ChatMessage = {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        content: data?.respuesta || "No hubo respuesta del agente.",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-error`,
          role: "assistant",
          content:
            error?.message ||
            "No se pudo conectar con el servidor. Verifica que la API esté en http://localhost:4000",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>

      {/* Contenido */}
      <View style={styles.content}>
        <Image
          source={require("../Img/robotito1.png")}
          style={styles.robot}
          resizeMode="contain"
        />

        <ScrollView
          style={styles.chatBox}
          contentContainerStyle={styles.chatContent}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.bubble,
                message.role === "user" ? styles.userBubble : styles.botBubble,
              ]}
            >
              <Text style={styles.bubbleText}>{message.content}</Text>
            </View>
          ))}
          {loading && (
            <View style={[styles.bubble, styles.botBubble, styles.loadingBubble]}>
              <ActivityIndicator size="small" color="#000" />
              <Text style={styles.loadingText}>Pensando...</Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Barra de input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Escribe tu mensaje..."
          placeholderTextColor="#666"
          onSubmitEditing={sendMessage}
          editable={!loading}
        />
        <TouchableOpacity>
          <Image
          source={require("../Img/icono-micro.png")}
          style={{ width: 36, height: 36, marginLeft: 5, marginRight: 5 }}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={sendMessage} disabled={loading}>
          <Image
          source={require("../Img/icono-enviado.png")}
          style={{ width: 36, height: 36, opacity: loading ? 0.5 : 1 }}
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

  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 10,
  },

  question: {
    fontSize: 26,
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 30,
  },

  robot: {
    width: 180,
    height: 140,
    marginBottom: 8,
  },

  chatBox: {
    width: "88%",
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.55)",
    borderRadius: 16,
    paddingHorizontal: 8,
  },

  chatContent: {
    paddingVertical: 10,
    gap: 8,
  },

  bubble: {
    maxWidth: "88%",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },

  botBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
  },

  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#FFD600",
  },

  bubbleText: {
    color: "#000",
    fontSize: 15,
  },

  loadingBubble: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  loadingText: {
    color: "#000",
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
  },

  input: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 15,
    height: 45,
    color: "#000",
  },

});
