import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
const COOKIE_NAME = "session";

export type SessionUser = {
  id: string;
  name: string;
  role: "ADMIN" | "WALI" | "SISWA";
  classIds?: string[];
  classId?: string | null;
};

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as SessionUser;
  } catch {
    return null;
  }
}
