import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { ObjectId } from "mongodb";

function isValidObjectId(v: string) {
  return /^[a-fA-F0-9]{24}$/.test(v);
}

function toId(v: string) {
  return isValidObjectId(v) ? new ObjectId(v) : v;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const date = String(body.date ?? "").trim(); // YYYY-MM-DD
  const studentId = String(body.studentId ?? "").trim();
  const classId = String(body.classId ?? "").trim();
  const status = String(body.status ?? "").trim(); // HADIR|SAKIT|IZIN|ALPA

  if (!date || !studentId || !status) {
    return NextResponse.json(
      { message: "date, studentId, status wajib ada" },
      { status: 400 }
    );
  }

  const db = await getDb();
  const doc = {
    date,
    studentId: toId(studentId),
    classId: classId ? toId(classId) : "",
    status,
    updatedAt: new Date(),
  };

  // upsert: 1 siswa 1 status per tanggal
  await db.collection("attendance").updateOne(
    { date, studentId: toId(studentId) },
    { $set: doc, $setOnInsert: { createdAt: new Date() } },
    { upsert: true }
  );

  const saved = await db.collection("attendance").findOne({
    date,
    studentId: toId(studentId),
  });

  return NextResponse.json({
    id: String(saved?._id),
    date: String(saved?.date),
    studentId: String(saved?.studentId),
    classId: saved?.classId ? String(saved?.classId) : "",
    status: String(saved?.status ?? "BELUM"),
    note: String(saved?.note ?? ""),
  });
}
