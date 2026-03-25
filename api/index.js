import app from "../src/server/api.js";

// Adaptador mínimo para exponer la app de Express en Vercel.
export default function handler(req, res) {
  return app(req, res);
}
