import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";

export async function GET() {
  const db = await getDb();

  const rows = await db
    .collection("teachers")
    .find({})
    .sort({ createdAt: -1 })
    .toArray();

  const data = rows.map((t: any) => ({
    id: String(t._id),
    name: String(t.name ?? ""),
    nip: t.nip ? String(t.nip) : "",
    phone: t.phone ? String(t.phone) : "",
  }));

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  if (!body?.name || !body?.password) {
    return NextResponse.json(
      { message: "name & password wajib" },
      { status: 400 }
    );
  }

  const db = await getDb();

  // 1️⃣ simpan teacher
  const teacherRes = await db.collection("teachers").insertOne({
    name: String(body.name),
    nip: body.nip ? String(body.nip) : null,
    phone: body.phone ? String(body.phone) : null,
    createdAt: new Date(),
  });

  // 2️⃣ buat akun user wali
  await db.collection("users").insertOne({
    username: `wali_${teacherRes.insertedId}`,
    passwordHash: await bcrypt.hash(body.password, 10),
    role: "WALI",
    teacherId: teacherRes.insertedId,
    classIds: [],
    name: body.name,
    createdAt: new Date(),
  });

  return NextResponse.json({ insertedId: teacherRes.insertedId.toString() });
}

export async function PUT(req: Request) {
  const body = await req.json();
  if (!body?.id || !body?.name) {
    return NextResponse.json({ message: "id & name wajib" }, { status: 400 });
  }

  const db = await getDb();
  await db.collection("teachers").updateOne(
    { _id: new ObjectId(body.id) },
    {
      $set: {
        name: String(body.name),
        nip: body.nip ? String(body.nip) : null,
        phone: body.phone ? String(body.phone) : null,
        updatedAt: new Date(),
      },
    }
  );

  return NextResponse.json({ message: "updated" });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ message: "id wajib" }, { status: 400 });
  }

  const db = await getDb();
  const teacherId = new ObjectId(id);

  // cek apakah wali masih dipakai kelas
  const used = await db.collection("classes").countDocuments({
    waliUserId: { $exists: true },
  });

  if (used > 0) {
    return NextResponse.json(
      { message: "Wali masih digunakan di kelas." },
      { status: 409 }
    );
  }

  // hapus user wali
  await db.collection("users").deleteOne({ teacherId });

  // hapus teacher
  await db.collection("teachers").deleteOne({ _id: teacherId });

  return NextResponse.json({ message: "deleted" });
}

