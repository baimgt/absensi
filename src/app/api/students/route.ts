import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { ObjectId } from "mongodb";
import { getSession } from "@/lib/auth";


function isValidObjectId(v: string) {
  return /^[a-fA-F0-9]{24}$/.test(v);
}

export async function GET() {
  const db = await getDb();
  const user = await getSession();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (user.role === "SISWA") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const match: any = {};

  if (user.role === "WALI") {
    const waliClasses = await db
      .collection("classes")
      .find({ waliKelasId: new ObjectId(user.id) })
      .project({ _id: 1 })
      .toArray();

    const classIds = waliClasses.map((c) => c._id);
    match.classId = { $in: classIds };
  }

  const rows = await db.collection("students").aggregate([
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
  ]).toArray();

  return NextResponse.json(
    rows.map((s: any) => ({
      id: s._id.toString(),
      nis: s.nis,
      name: s.name,
      classId: s.classId?.toString() ?? "",
      className: s.className,
    }))
  );
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


