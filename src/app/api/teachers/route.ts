import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { ObjectId } from "mongodb";

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
  if (!body?.name) {
    return NextResponse.json({ message: "name wajib" }, { status: 400 });
  }

  const db = await getDb();
  const result = await db.collection("teachers").insertOne({
    name: String(body.name),
    nip: body.nip ? String(body.nip) : null,
    phone: body.phone ? String(body.phone) : null,
    createdAt: new Date(),
  });

  return NextResponse.json({ insertedId: String(result.insertedId) });
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

  // optional: kalau wali kelas masih dipakai oleh kelas, blok hapus
  const used = await db.collection("classes").countDocuments({
    waliKelasId: new ObjectId(id),
  });

  if (used > 0) {
    return NextResponse.json(
      { message: "Guru ini masih dipakai sebagai wali kelas." },
      { status: 409 }
    );
  }

  await db.collection("teachers").deleteOne({ _id: new ObjectId(id) });
  return NextResponse.json({ message: "deleted" });
}
