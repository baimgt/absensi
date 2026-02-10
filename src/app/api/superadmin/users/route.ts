import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import bcrypt from "bcryptjs";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function POST(req: Request) {
  try {
    // ================= AUTH =================
    const cookie = req.headers.get("cookie") || "";
    const match = cookie.match(/session=([^;]+)/);

    if (!match) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = match[1];
    const { payload } = await jwtVerify(token, JWT_SECRET);

    if (payload.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // ================= BODY =================
    const body = await req.json();
    const { name, username, password, role, classIds, classId } = body;

    if (!name || !username || !password || !role) {
      return NextResponse.json(
        { message: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    if (!["ADMIN", "WALI", "SISWA"].includes(role)) {
      return NextResponse.json(
        { message: "Role tidak valid" },
        { status: 400 }
      );
    }

    const db = await getDb();

    // ================= DUPLIKASI =================
    const exists = await db
      .collection("users")
      .findOne({ username });

    if (exists) {
      return NextResponse.json(
        { message: "Username sudah dipakai" },
        { status: 400 }
      );
    }

    // ================= INSERT =================
    const passwordHash = await bcrypt.hash(password, 10);

    await db.collection("users").insertOne({
      name,
      username,
      passwordHash,
      role,
      classIds: role === "WALI" ? classIds || [] : [],
      classId: role === "SISWA" ? classId || null : null,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("SUPERADMIN CREATE USER ERROR:", err);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
