import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { ObjectId } from "mongodb"; // ✅ WAJIB

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function POST(req: Request) {
  const { username, password } = await req.json();
  const db = await getDb();

  const user: any = await db.collection("users").findOne({ username });
  if (!user)
    return NextResponse.json({ message: "User tidak ditemukan" }, { status: 401 });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok)
    return NextResponse.json({ message: "Password salah" }, { status: 401 });

  // ===== AMBIL KELAS UNTUK WALI =====
  let classIds: string[] = [];

  if (user.role === "WALI" && user.teacherId) {
    const classes = await db
      .collection("classes")
      .find({ waliKelasId: new ObjectId(user.teacherId) })
      .toArray();

    classIds = classes.map((c) => c._id.toString());
  }

  // ===== JWT =====
  const token = await new SignJWT({
    id: user._id.toString(),
    name: user.name,
    role: user.role,
    teacherId: user.teacherId ?? null,
    classIds, // ✅ FIX UTAMA
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1d")
    .sign(JWT_SECRET);

  const res = NextResponse.json({
    success: true,
    role: user.role,
  });

  res.cookies.set("session", token, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
  });

  return res;
}
