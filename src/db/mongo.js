import { MongoClient } from "mongodb";

// URI de conexión centralizada para todo el proyecto.
const uri = process.env.MONGODB_URI;

// Se cachea la base para no abrir una conexión nueva por petición.
let db;

async function conectarDB() {
    if (db) return db;

    if (!uri) {
        throw new Error("Falta MONGODB_URI");
    }

    // MongoClient abre la conexión; db() toma la base definida en la URI.
    const client = new MongoClient(uri);
    await client.connect();

    db = client.db();
    console.log("MongoDB Conectado");
    return db;
}

export { conectarDB };
