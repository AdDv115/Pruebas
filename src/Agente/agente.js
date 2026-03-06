import { ai } from "../config/gemini.js";
import { pSistema } from "../prompts/pSistema.js";
import { pLogica } from "../prompts/pLogica.js";
import { pRules } from "../prompts/pRules.js";

const MODELOS_FALLBACK = [
  process.env.GEMINI_MODEL,
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
].filter((v, i, arr) => Boolean(v) && arr.indexOf(v) === i);
const RESPUESTA_MARKER = "RESPUESTA:";

function buildPrompt(
  mensajeUser,
  tipoUsuario = "free",
  historial = [],
  esPrimeraCharla = false,
) {
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

  return prompt;
}

function extractRespuesta(texto = "") {
  const limpio = String(texto || "").trim();
  const indice = limpio.indexOf(RESPUESTA_MARKER);
  if (indice === -1) return limpio;
  return limpio.slice(indice + RESPUESTA_MARKER.length).trim();
}

function isModelNotSupportedError(error) {
  const status = error?.status;
  const message = String(error?.message || "").toLowerCase();
  return (
    status === 404 ||
    message.includes("not found") ||
    message.includes("not supported for generatecontent")
  );
}

async function generateWithFallback(prompt) {
  let lastError = null;
  for (const model of MODELOS_FALLBACK) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });
      return { response, model };
    } catch (error) {
      lastError = error;
      if (!isModelNotSupportedError(error)) {
        throw error;
      }
      console.warn(`Modelo no disponible para generateContent: ${model}`);
    }
  }

  throw lastError || new Error("No hay modelos compatibles disponibles");
}

async function generateStreamWithFallback(prompt) {
  let lastError = null;
  for (const model of MODELOS_FALLBACK) {
    try {
      const stream = await ai.models.generateContentStream({
        model,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });
      return { stream, model };
    } catch (error) {
      lastError = error;
      if (!isModelNotSupportedError(error)) {
        throw error;
      }
      console.warn(`Modelo no disponible para generateContentStream: ${model}`);
    }
  }

  throw lastError || new Error("No hay modelos compatibles disponibles para stream");
}

export async function Agente(
  mensajeUser,
  tipoUsuario = "free",
  historial = [],
  esPrimeraCharla = false,
) {
  const prompt = buildPrompt(
    mensajeUser,
    tipoUsuario,
    historial,
    esPrimeraCharla,
  );

  const { response: respuesta } = await generateWithFallback(prompt);

  const candidate = respuesta.candidates?.[0];
  if (!candidate) {
    throw new Error("No se recibió ninguna candidate de Gemini");
  }

  const parts = candidate.content?.parts || [];
  const texto = parts
    .map((part) => part.text || "")
    .join(" ")
    .trim();

  return extractRespuesta(texto);
}

export async function* AgenteStream(
  mensajeUser,
  tipoUsuario = "free",
  historial = [],
  esPrimeraCharla = false,
) {
  const prompt = buildPrompt(
    mensajeUser,
    tipoUsuario,
    historial,
    esPrimeraCharla,
  );
  const { stream } = await generateStreamWithFallback(prompt);

  let raw = "";
  let emitted = 0;

  for await (const chunk of stream) {
    const deltaRaw = chunk?.text || "";
    if (!deltaRaw) continue;

    raw += deltaRaw;
    const textoActual = extractRespuesta(raw);
    const delta = textoActual.slice(emitted);

    if (delta) {
      emitted += delta.length;
      yield delta;
    }
  }

  const finalText = extractRespuesta(raw);
  if (!finalText) {
    throw new Error("No se recibió texto de respuesta del agente");
  }

  if (emitted < finalText.length) {
    yield finalText.slice(emitted);
  }
}
