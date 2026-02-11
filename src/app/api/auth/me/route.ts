// src/app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function GET(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const match = cookie.match(/session=([^;]+)/);

  if (!match) {
    return NextResponse.json({ role: null }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(match[1], JWT_SECRET);

    return NextResponse.json({
      id: payload.id,
      name: payload.name,
      role: payload.role,
      classId: payload.classId ?? null,
    });
  } catch {
    return NextResponse.json({ role: null }, { status: 401 });
  }
}
