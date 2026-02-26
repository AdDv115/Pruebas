import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

interface Props {
    title: string;
    onPress?: () => void;
}

export default function Boton({ title,onPress }: Props) {
    return (
        <TouchableOpacity style={styles.button} onPress={onPress}>
            <Text style={styles.text}>{title}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: "#000",
        paddingVertical: 8,
        borderRadius: 6,
        alignItems: "center",
        marginTop: 10,
        width: 100,
        alignSelf: "center",
    },
    text: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});