import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("session")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    // @ts-ignore
    req.headers.set("x-user-role", payload.role);
    // @ts-ignore
    req.headers.set("x-user-id", payload.id);
    // @ts-ignore
    req.headers.set("x-user-classid", payload.classId || "");
    return NextResponse.next();
  } catch (err) {
    console.error("JWT verify error:", err);
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

// middleware berlaku untuk semua halaman, kecuali login
export const config = {
  matcher: ["/((?!login).*)"], 
};
