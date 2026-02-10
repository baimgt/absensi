import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { ObjectId } from "mongodb";


function isValidObjectId(v: string) {
  return /^[a-fA-F0-9]{24}$/.test(v);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const classIdRaw = searchParams.get("classId");

  const db = await getDb();

  const match: any = {};

  // ✅ kalau null / "undefined" / "" -> jangan filter
  const classId = (classIdRaw ?? "").trim();
  if (classId && classId !== "undefined" && classId !== "null") {
    if (isValidObjectId(classId)) {
      match.$or = [
        { classId: new ObjectId(classId) }, // ObjectId
        { classId: classId },               // string
      ];
    } else {
      // kalau bukan 24 hex, anggap string saja
      match.classId = classId;
    }
  }


  const rows = await db
    .collection("students")
    .aggregate([
      { $match: match },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "classes",
          localField: "classId",
          foreignField: "_id",
          as: "class",
        },
      },
      { $unwind: { path: "$class", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          nis: 1,
          name: 1,
          classId: 1,
          className: { $ifNull: ["$class.name", "-"] },
        },
      },
    ])
    .toArray();

  const data = rows.map((s: any) => ({
    id: String(s._id),
    nis: String(s.nis ?? ""),
    name: String(s.name ?? ""),
    classId: String(s.classId ?? ""),
    className: String(s.className ?? "-"),
  }));

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();

  if (!body?.nis || !body?.name || !body?.classId) {
    return NextResponse.json(
      { message: "nis, name, classId wajib" },
      { status: 400 }
    );
  }

  const db = await getDb();
  const result = await db.collection("students").insertOne({
    nis: String(body.nis),
    name: String(body.name),
    classId: new ObjectId(body.classId),
    createdAt: new Date(),
  });

  return NextResponse.json({ insertedId: String(result.insertedId) });
}

export async function PUT(req: Request) {
  const body = await req.json();

  if (!body?.id || !body?.nis || !body?.name || !body?.classId) {
    return NextResponse.json(
      { message: "id, nis, name, classId wajib" },
      { status: 400 }
    );
  }

  const db = await getDb();
  await db.collection("students").updateOne(
    { _id: new ObjectId(body.id) },
    {
      $set: {
        nis: String(body.nis),
        name: String(body.name),
        classId: new ObjectId(body.classId),
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
  await db.collection("students").deleteOne({ _id: new ObjectId(id) });

  return NextResponse.json({ message: "deleted" });
}
