import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { ObjectId } from "mongodb";

function isObjectId(v: string) {
  return /^[a-fA-F0-9]{24}$/.test(v);
}
function toId(v: string) {
  return isObjectId(v) ? new ObjectId(v) : v;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const classId = String(searchParams.get("classId") ?? "").trim();
  const start = String(searchParams.get("start") ?? "").trim(); // YYYY-MM-DD
  const end = String(searchParams.get("end") ?? "").trim();     // YYYY-MM-DD

  if (!classId) {
    return NextResponse.json({ message: "classId wajib" }, { status: 400 });
  }

  const db = await getDb();

  // match date range (kalau kosong -> semua)
  const dateFilter: any = {};
  if (start) dateFilter.$gte = start;
  if (end) dateFilter.$lte = end;

  const match: any = {
    $or: [{ classId: toId(classId) }, { classId: String(classId) }],
  };
  if (start || end) match.date = dateFilter;

  const rows = await db.collection("attendance").aggregate([
    { $match: match },

    // samakan studentId jadi string biar aman (ObjectId/string)
    { $addFields: { studentIdStr: { $toString: "$studentId" } } },

    // hitung per status
    {
      $group: {
        _id: "$studentIdStr",
        hadir: { $sum: { $cond: [{ $eq: ["$status", "HADIR"] }, 1, 0] } },
        sakit: { $sum: { $cond: [{ $eq: ["$status", "SAKIT"] }, 1, 0] } },
        izin:  { $sum: { $cond: [{ $eq: ["$status", "IZIN"] }, 1, 0] } },
        alpa:  { $sum: { $cond: [{ $eq: ["$status", "ALPA"] }, 1, 0] } },
        total: { $sum: 1 },
      },
    },

    // convert _id string -> ObjectId jika valid
    {
      $addFields: {
        studentObjId: {
          $cond: [
            { $regexMatch: { input: "$_id", regex: /^[a-fA-F0-9]{24}$/ } },
            { $toObjectId: "$_id" },
            null,
          ],
        },
      },
    },

    // join students
    {
      $lookup: {
        from: "students",
        localField: "studentObjId",
        foreignField: "_id",
        as: "student",
      },
    },
    { $unwind: { path: "$student", preserveNullAndEmptyArrays: true } },

    // output rapi
    {
      $project: {
        _id: 0,
        studentId: "$_id",
        nis: { $ifNull: ["$student.nis", "-"] },
        name: { $ifNull: ["$student.name", "-"] },
        hadir: 1,
        sakit: 1,
        izin: 1,
        alpa: 1,
        total: 1,
      },
    },

    { $sort: { name: 1 } },
  ]).toArray();

  return NextResponse.json({ rows });
}
