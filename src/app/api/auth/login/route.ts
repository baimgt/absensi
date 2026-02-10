  import { NextResponse } from "next/server";
  import { getDb } from "@/lib/mongo";
  import bcrypt from "bcryptjs";
  import { SignJWT } from "jose";

  const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

  export async function POST(req: Request) {
    const { username, password } = await req.json();
    const db = await getDb();

    const user = await db.collection("users").findOne({ username });
    if (!user) {
      return NextResponse.json({ message: "User tidak ditemukan" }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ message: "Password salah" }, { status: 401 });
    }

    const token = await new SignJWT({
      id: user._id.toString(),
      name: user.name,
      role: user.role,
      classIds: user.classIds || [],
      classId: user.classId || null,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1d")
      .sign(JWT_SECRET);

    const res = NextResponse.json({ success: true });

    res.cookies.set("session", token, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
    });

    return res;
  }
