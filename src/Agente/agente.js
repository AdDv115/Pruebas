import { ai } from "../config/gemini.js";
import { pSistema } from "../prompts/pSistema.js";
import { pLogica } from "../prompts/pLogica.js";
import { pRules } from "../prompts/pRules.js";

export async function Agente(mensajeUser, tipoUsuario = "free", historial = [], esPrimeraCharla = false) {
  const modelo = "gemini-3-flash-preview";

  const historialTexto = historial.slice(-8).map(msg => 
    `[${msg.role.toUpperCase()}] ${msg.content}`
  ).join("\n\n");

  const contexto = esPrimeraCharla 
    ? "PRIMERA CHARLA: incluye saludo rolo" 
    : "CONTINÚA: directo sin saludo";

  const prompt = `
[SISTEMA] ${pSistema}

[RULES] ${pRules}

[CONTEXTO] ${contexto}

[HISTORIAL] ${historialTexto || "Charla nueva"}

[USUARIO] ${mensajeUser}

[LOGICA] ${pLogica}
`;

  const respuesta = await ai.models.generateContent({
    model: modelo,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  const candidate = respuesta.candidates?.[0];
  if (!candidate) {
    throw new Error("No se recibió ninguna candidate de Gemini");
  }

  const parts = candidate.content?.parts || [];
  const texto = parts
    .map((part) => part.text || "")
    .join(" ")
    .trim();

  const indice = texto.indexOf("RESPUESTA:");
  if (indice === -1) return texto;

  return texto.slice(indice + "RESPUESTA:".length).trim();
}
