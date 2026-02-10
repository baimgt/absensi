import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { ObjectId } from "mongodb";

export async function GET() {
  const db = await getDb();

  const rows = await db
    .collection("classes")
    .aggregate([
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "teachers",
          localField: "waliKelasId",
          foreignField: "_id",
          as: "wali",
        },
      },
      { $unwind: { path: "$wali", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          name: 1,
          academicYear: 1,
          semester: 1,
          waliKelasId: 1,
          waliKelasName: { $ifNull: ["$wali.name", "-"] },
          createdAt: 1,
        },
      },
    ])
    .toArray();

  const data = rows.map((c: any) => ({
    id: String(c._id),
    name: String(c.name ?? ""),
    academicYear: String(c.academicYear ?? ""),
    semester: String(c.semester ?? ""),
    waliKelasId: c.waliKelasId ? String(c.waliKelasId) : "",
    waliKelasName: String(c.waliKelasName ?? "-"),
  }));

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();

  if (!body?.name || !body?.academicYear || !body?.semester) {
    return NextResponse.json(
      { message: "name, academicYear, semester wajib" },
      { status: 400 }
    );
  }

  const db = await getDb();

  const waliKelasId =
    body.waliKelasId && String(body.waliKelasId).trim()
      ? new ObjectId(String(body.waliKelasId))
      : null;

  const result = await db.collection("classes").insertOne({
    name: String(body.name),
    academicYear: String(body.academicYear),
    semester: String(body.semester),
    waliKelasId,
    createdAt: new Date(),
  });

  return NextResponse.json({ insertedId: String(result.insertedId) });
}

export async function PUT(req: Request) {
  const body = await req.json();

  if (!body?.id || !body?.name || !body?.academicYear || !body?.semester) {
    return NextResponse.json(
      { message: "id, name, academicYear, semester wajib" },
      { status: 400 }
    );
  }

  const db = await getDb();

  const waliKelasId =
    body.waliKelasId && String(body.waliKelasId).trim()
      ? new ObjectId(String(body.waliKelasId))
      : null;

  await db.collection("classes").updateOne(
    { _id: new ObjectId(String(body.id)) },
    {
      $set: {
        name: String(body.name),
        academicYear: String(body.academicYear),
        semester: String(body.semester),
        waliKelasId,
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

  // optional: blok hapus kalau masih ada siswa di kelas ini
  const used = await db.collection("students").countDocuments({
    classId: new ObjectId(id),
  });
  if (used > 0) {
    return NextResponse.json(
      { message: "Kelas ini masih memiliki siswa. Hapus siswa dulu." },
      { status: 409 }
    );
  }

  await db.collection("classes").deleteOne({ _id: new ObjectId(id) });
  return NextResponse.json({ message: "deleted" });
}
