import bcrypt from "bcryptjs";
import { MongoClient, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.log("❌ MONGODB_URI belum di set di .env.local");
  process.exit(1);
}

const client = new MongoClient(uri);

async function run() {
  await client.connect();
  const db = client.db(); // otomatis dari URI
  const users = db.collection("users");

  // ✅ (opsional) cari 1 kelas untuk wali kelas
  const kelas = await db.collection("classes").findOne({});
  const classId = kelas ? kelas._id : null;

  // ====== ADMIN ======
  const adminEmail = "admin@absen.com";
  const adminPass = "admin123";
  const adminHash = await bcrypt.hash(adminPass, 10);

  await users.updateOne(
    { email: adminEmail },
    {
      $set: {
        email: adminEmail,
        passwordHash: adminHash,
        role: "admin",
        teacherId: null,
        updatedAt: new Date(),
      },
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true }
  );

  // ====== WALI KELAS ======
  const waliEmail = "wali@absen.com";
  const waliPass = "wali123";
  const waliHash = await bcrypt.hash(waliPass, 10);

  await users.updateOne(
    { email: waliEmail },
    {
      $set: {
        email: waliEmail,
        passwordHash: waliHash,
        role: "wali_kelas",
        // ✅ kalau kamu pakai akses berdasarkan classIds:
        classIds: classId ? [classId] : [],
        updatedAt: new Date(),
      },
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true }
  );

  console.log("✅ Seed selesai!");
  console.log("ADMIN  :", adminEmail, " / ", adminPass);
  console.log("WALI   :", waliEmail, " / ", waliPass);
  console.log("KELAS  :", classId ? String(classId) : "(belum ada kelas)");
  await client.close();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
