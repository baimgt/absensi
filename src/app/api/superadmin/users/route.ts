import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = await getDb();

    // validasi minimal
    if (!body.username || !body.name || !body.role || !body.password) {
      return NextResponse.json(
        { message: "username, name, role, password wajib" },
        { status: 400 }
      );
    }

    // hash password
    const passwordHash = await bcrypt.hash(body.password, 10);

   const newUser: any = {
  username: body.username,
  name: body.name,
  role: body.role,
  passwordHash,
  teacherId: body.teacherId ? new ObjectId(body.teacherId) : null, // ✅ WAJIB
  classIds: Array.isArray(body.classIds)
    ? body.classIds.map((id: string) => new ObjectId(id))
    : [],
  createdAt: new Date(),
};



    const result = await db.collection("users").insertOne(newUser);
    return NextResponse.json({ insertedId: String(result.insertedId) });
  } catch (err) {
    console.error("POST /superadmin/users error:", err);
    return NextResponse.json(
      { message: "Terjadi error server" },
      { status: 500 }
    );
  }
}
