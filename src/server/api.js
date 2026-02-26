import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { Agente } from "../Agente/agente.js";
import { conectarDB } from "../db/mongo.js";

let db;

const app = express();

// Middlewares
app.use(
  cors({
    // Para pruebas móviles/web (incluyendo Vercel/Tailscale) reflejamos el origin.
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json({ limit: "10mb" }));


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, 
  message: "Demasiadas peticiones, intenta más tarde"
});
app.use("/api/", limiter);


app.get("/", async (req, res) => {
  try {
    if (!db) {
      db = await conectarDB();
    }
    res.json({ 
      status: "OK", 
      mongo: !!db,
      message: "PAILAPP API corriendo" 
    });
  } catch (err) {
    console.error("Mongo error:", err.message);
    res.status(503).json({ 
      status: "API OK", 
      mongo: false,
      message: "MongoDB no disponible"
    });
  }
});

// Chat endpoint mejorado
app.post("/api/chat", async (req, res) => {
  try {
    if (!db) {
      db = await conectarDB();
    }

    const { mensaje, tipoUsuario = "free" } = req.body;

    // Validaciones
    if (!mensaje || mensaje.trim().length < 1 || mensaje.length > 2000) {
      return res.status(400).json({ 
        error: "Mensaje inválido (1-2000 caracteres)" 
      });
    }

    const userId = tipoUsuario;
    const trimmedMessage = mensaje.trim();

    // Obtener conversación
    const conversacion = await db.collection("conversaciones").findOne({ 
      userId 
    }) || { mensajes: [] };

    const esPrimerMensaje = conversacion.mensajes.length === 0;

    // Agregar mensaje usuario
    conversacion.mensajes.push({ 
      role: "user", 
      content: trimmedMessage,
      timestamp: new Date()
    });

    // Llamar agente
    const respuesta = await Agente(
      trimmedMessage, 
      tipoUsuario, 
      conversacion.mensajes, 
      esPrimerMensaje
    );

    // Agregar respuesta AI
    conversacion.mensajes.push({ 
      role: "assistant", 
      content: respuesta,
      timestamp: new Date()
    });

    // Mantener solo últimas 20 interacciones
    if (conversacion.mensajes.length > 20) {
      conversacion.mensajes = conversacion.mensajes.slice(-20);
    }

    // Guardar en DB
    await db.collection("conversaciones").updateOne(
      { userId },
      { 
        $set: { 
          userId, 
          mensajes: conversacion.mensajes,
          ultimaActualizacion: new Date(),
          totalMensajes: conversacion.mensajes.length
        } 
      },
      { upsert: true }
    );

    res.json({ 
      respuesta, 
      tipoUsuario, 
      esPrimerMensaje,
      totalMensajes: conversacion.mensajes.length
    });

  } catch (err) {
    console.error("Chat endpoint error:", err);
    res.status(500).json({ 
      error: "Error interno del servidor",
      details: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
});

function startServer() {
  const PORT = process.env.PORT || 4000;
  return app.listen(PORT, () => {
    console.log(`PAILAPP API en http://localhost:${PORT}`);
    console.log(`http://localhost:${PORT}/`);
  });
}

if (process.env.VERCEL !== "1") {
  process.on("SIGINT", async () => {
    console.log("\n Cerrando servidor...");
    if (db) {
      console.log("MongoDB conexión cerrada");
    }
    process.exit(0);
  });

  startServer();
}

export { app, startServer };
export default app;
