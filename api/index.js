import app from "../src/server/api.js";

export default function handler(req, res) {
  return app(req, res);
}
