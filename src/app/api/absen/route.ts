import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";

export async function POST(req: Request) {
  const { nis } = await req.json();

  if (!nis) {
    return NextResponse.json(
      { message: "NIS wajib diisi" },
      { status: 400 }
    );
  }

  const db = await getDb();

  // 🔍 cari siswa berdasarkan NIS
  const siswa = await db.collection("students").findOne({ nis: String(nis) });

  if (!siswa) {
    return NextResponse.json(
      { message: "NIS tidak terdaftar" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    student: {
      id: String(siswa._id),
      nis: siswa.nis,
      name: siswa.name,
      classId: siswa.classId,
    },
  });
}
