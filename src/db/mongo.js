import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

let db;

async function conectarDB() {
    if (db) return db;

    const client = new MongoClient(uri);
    await client.connect();

    db = client.db();
    console.log("MongoDB Conectado")
    return db;
}

export { conectarDB };