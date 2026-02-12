import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { ObjectId } from "mongodb";

function isValidObjectId(v: string) {
  return /^[a-fA-F0-9]{24}$/.test(v);
}

function toObjectId(v: string) {
  return isValidObjectId(v) ? new ObjectId(v) : v;
}

export async function POST(req: Request) {
  try {
    const { nis } = await req.json();

    if (!nis) {
      return NextResponse.json({ message: "NIS wajib diisi" }, { status: 400 });
    }

    const db = await getDb();

    // 🔍 cari siswa berdasarkan NIS
    const siswa = await db.collection("students").findOne({ nis: String(nis) });

    if (!siswa) {
      return NextResponse.json({ message: "NIS tidak terdaftar" }, { status: 404 });
    }

    const studentId = String(siswa._id);
    const classId = siswa.classId ? String(siswa.classId) : "";

    // tanggal hari ini YYYY-MM-DD
    const today = new Date().toISOString().split("T")[0];

    // simpan absensi (upsert)
    const updateDoc = {
      studentId: toObjectId(studentId),
      classId: classId ? toObjectId(classId) : "",
      date: today,
      status: "HADIR", // default
      updatedAt: new Date(),
    };

    await db.collection("attendance").updateOne(
      { studentId: toObjectId(studentId), date: today },
      { $set: updateDoc, $setOnInsert: { createdAt: new Date() } },
      { upsert: true }
    );

    // ambil data attendance terakhir
    const saved = await db.collection("attendance").findOne({
      studentId: toObjectId(studentId),
      date: today,
    });

    return NextResponse.json({
      success: true,
      student: {
        studentId,
        nis: siswa.nis,
        name: siswa.name,
        classId,
      },
      attendanceId: saved ? String(saved._id) : null,
      status: saved ? saved.status : "HADIR",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Terjadi kesalahan server" }, { status: 500 });
  }
}
