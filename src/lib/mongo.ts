import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI!;
const dbName = process.env.MONGODB_DB!;

if (!uri) throw new Error("Missing MONGODB_URI in .env.local");
if (!dbName) throw new Error("Missing MONGODB_DB in .env.local");

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// cache biar ga connect ulang tiap request (penting di dev)
const globalForMongo = globalThis as unknown as {
  _mongoClientPromise?: Promise<MongoClient>;
};

if (!globalForMongo._mongoClientPromise) {
  client = new MongoClient(uri);
  globalForMongo._mongoClientPromise = client.connect();
}

clientPromise = globalForMongo._mongoClientPromise;

export async function getDb() {
  const c = await clientPromise;
  return c.db(dbName);
}
