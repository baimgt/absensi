import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

const MONGO_URI = process.env.MONGODB_URI!;
const DB_NAME = process.env.MONGODB_DB || "absensi";

async function seedAdmin() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();

  const db = client.db(DB_NAME);

  const exists = await db.collection("users").findOne({
    username: "admin",
  });

  if (exists) {
    console.log("❌ Admin sudah ada");
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash("admin123", 10);

  await db.collection("users").insertOne({
    username: "admin",
    name: "Super Admin",
    passwordHash,
    role: "ADMIN",
    classIds: [],
    classId: null,
    createdAt: new Date(),
  });

  console.log("✅ Admin berhasil dibuat");
  console.log("USERNAME: admin");
  console.log("PASSWORD: admin123");

  process.exit(0);
}

seedAdmin();