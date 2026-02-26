// Carga el cliente oficial de Gemini para Node
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY2;

//Si no encuentra la API, tira error
if (!apiKey) {
    throw new Error("Falta el Api");
}

//Se exporta el cliente al main
export const ai = new GoogleGenAI({ apiKey });