import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function Inicio({ navigation }: any) {
    return (

        <View style={styles.container}>
            <Text style={styles.titulo}>¡Bienvenido a PailApp!</Text>

            <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Login')}
            >
                <Text style={styles.btnTexto}>Iniciar sesión</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate("Registro")}  style={styles.button}>
                <Text style={styles.btnTexto}>Registrarse</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate("Chatbot")}  style={styles.button}>
                <Text style={styles.btnTexto}>Chatbot</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate("ChatbotVoz")}  style={styles.button}>
                <Text style={styles.btnTexto}>Voz</Text>
            </TouchableOpacity>
        </View>
    );
}

    // Estilos

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#EDE4C7',
        justifyContent: 'center',
        alignItems: 'center',
    },
    titulo: {
        fontSize: 28,
        marginBottom: 40,
        fontWeight: 'bold',
    },
    button: {
        backgroundColor: '#000',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 8,
        marginBottom: 20,
    },
    btnTexto: {
        color: '#fff',
        fontSize: 16,
    },
});