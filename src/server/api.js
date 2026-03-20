import "dotenv/config";
import express from "express";
import cors from "cors";
import { Readable } from "node:stream";
import { Agente, AgenteStream } from "../Agente/agente.js";
import { conectarDB } from "../db/mongo.js";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
let db;
const elevenlabs = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });

const app = express();

app.use(cors({
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use("/api/tts", express.text({ type: "*/*", limit: "50mb" }));
app.use(express.json({ limit: "50mb" }));

async function getDB() {
  if (!db) db = await conectarDB();
  return db;
}

function getUserId(tipoUsuario = "free") {
  return String(tipoUsuario || "free");
}

async function cargarConversacion(database, userId) {
  const conversacion = await database.collection("conversaciones").findOne({ userId });
  return conversacion || { userId, mensajes: [] };
}

async function guardarConversacion(database, userId, mensajes) {
  const mensajesRecortados = mensajes.length > 20 ? mensajes.slice(-20) : mensajes;
  await database.collection("conversaciones").updateOne(
    { userId },
    {
      $set: {
        userId,
        mensajes: mensajesRecortados,
        ultimaActualizacion: new Date(),
        totalMensajes: mensajesRecortados.length,
      },
    },
    { upsert: true }
  );
  return mensajesRecortados;
}

function validarMensaje(mensaje) {
  if (!mensaje || typeof mensaje !== "string") return false;
  const trimmed = mensaje.trim();
  return trimmed.length >= 1 && trimmed.length <= 2000;
}

function sseSend(res, event, payload) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

function parseTtsBody(body) {
  if (typeof body === "string") {
    const trimmed = body.trim();
    if (!trimmed) return {};

    if (trimmed.startsWith("{")) {
      try {
        return JSON.parse(trimmed);
      } catch {
        return { text: trimmed };
      }
    }

    return { text: trimmed };
  }

  if (body && typeof body === "object") {
    return body;
  }

  return {};
}

app.get("/", async (req, res) => {
  try {
    await getDB();
    res.json({ status: "OK", mongo: !!db, message: "PAILAPP API corriendo" });
  } catch (err) {
    console.error("Mongo error:", err.message);
    res.status(503).json({ status: "API OK", mongo: false, message: "MongoDB no disponible" });
  }
});

app.post("/api/chat", async (req, res) => {
  try {
    const { mensaje, tipoUsuario = "free" } = req.body;
    if (!validarMensaje(mensaje)) {
      return res.status(400).json({ error: "Mensaje inválido (1-2000 caracteres)" });
    }

    const database = await getDB();
    const userId = getUserId(tipoUsuario);
    const trimmedMessage = mensaje.trim();
    const conversacion = await cargarConversacion(database, userId);
    const esPrimerMensaje = conversacion.mensajes.length === 0;

    conversacion.mensajes.push({ role: "user", content: trimmedMessage, timestamp: new Date() });
    const respuesta = await Agente(trimmedMessage, tipoUsuario, conversacion.mensajes, esPrimerMensaje);
    conversacion.mensajes.push({ role: "assistant", content: respuesta, timestamp: new Date() });
    const mensajesGuardados = await guardarConversacion(database, userId, conversacion.mensajes);

    res.json({ respuesta, tipoUsuario, esPrimerMensaje, totalMensajes: mensajesGuardados.length });
  } catch (err) {
    console.error("Chat endpoint error:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

app.post("/api/chat/stream", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  if (typeof res.flushHeaders === "function") res.flushHeaders();

  try {
    const { mensaje, tipoUsuario = "free" } = req.body || {};
    if (!validarMensaje(mensaje)) {
      sseSend(res, "error", { error: "Mensaje inválido (1-2000 caracteres)" });
      res.end();
      return;
    }

    const database = await getDB();
    const userId = getUserId(tipoUsuario);
    const trimmedMessage = mensaje.trim();
    const conversacion = await cargarConversacion(database, userId);
    const esPrimerMensaje = conversacion.mensajes.length === 0;

    conversacion.mensajes.push({ role: "user", content: trimmedMessage, timestamp: new Date() });
    let respuestaFinal = "";
    let firstChunkSent = false;

    sseSend(res, "meta", { esPrimerMensaje });

    for await (const delta of AgenteStream(trimmedMessage, tipoUsuario, conversacion.mensajes, esPrimerMensaje)) {
      if (!delta) continue;
      respuestaFinal += delta;
      firstChunkSent = true;
      sseSend(res, "chunk", { delta });
    }

    if (!firstChunkSent || !respuestaFinal.trim()) {
      throw new Error("El agente no devolvió contenido");
    }

    conversacion.mensajes.push({ role: "assistant", content: respuestaFinal, timestamp: new Date() });
    const mensajesGuardados = await guardarConversacion(database, userId, conversacion.mensajes);

    sseSend(res, "done", { respuesta: respuestaFinal, tipoUsuario, esPrimerMensaje, totalMensajes: mensajesGuardados.length });
    res.end();
  } catch (err) {
    console.error("Chat stream error:", err);
    sseSend(res, "error", { error: "Error interno del servidor" });
    res.end();
  }
});

app.post("/api/tts", async (req, res) => {
  try {
    const { text, voiceId = "HIGUfNOdjuWQwwapnTRW" } = parseTtsBody(req.body);
    if (!text || typeof text !== "string" || text.length > 5000) {
      return res.status(400).json({ error: "Texto inválido" });
    }

    if (!process.env.ELEVENLABS_API_KEY) {
      return res.status(500).json({ error: "Falta ELEVENLABS_API_KEY" });
    }

    const audioStream = await elevenlabs.textToSpeech.convert(voiceId, {
      text: text.trim(),
      modelId: "eleven_turbo_v2_5",
      outputFormat: "mp3_44100_128",
    });

    const nodeStream = Readable.fromWeb(audioStream);
    const chunks = [];
    for await (const chunk of nodeStream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const audioBuffer = Buffer.concat(chunks);

    res.set({
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    });
    res.json({
      audioBase64: audioBuffer.toString("base64"),
      mimeType: "audio/mpeg",
      voiceId,
    });
  } catch (err) {
    console.error("TTS error:", err);
    res.status(500).json({ error: err?.message || "Error TTS" });
  }
});

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({
      error: "JSON inválido",
      detalle: "Envia un objeto JSON como {\"text\":\"hola\"} o texto plano en el body para /api/tts",
    });
  }
  next(err);
});

app.post("/api/get-token", async (req, res) => {
  try {
    const { agentId, tipoUsuario = "free" } = req.body;
    if (!agentId) return res.status(400).json({ error: "Falta agentId" });

    const response = await fetch(`https://api.elevenlabs.io/v1/agents/${agentId}/tokens`, {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        permissions: ['agent:play', 'agent:speak'],
        duration_seconds: 3600
      })
    });

    if (!response.ok) throw new Error(`ElevenLabs: ${response.status}`);
    const { token } = await response.json();

    res.json({ token, agentId, tipoUsuario });
  } catch (err) {
    console.error("Token error:", err);
    res.status(500).json({ error: "Error token" });
  }
});

function startServer() {
  const PORT = process.env.PORT || 4000;
  return app.listen(PORT, () => {
    console.log(`PAILAPP API en http://localhost:${PORT}`);
  });
}

if (process.env.VERCEL !== "1") {
  process.on("SIGINT", () => {
    console.log("\nCerrando servidor...");
    process.exit(0);
  });
  startServer();
}

export { app, startServer };
export default app;
