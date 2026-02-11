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
  const role = req.headers.get("x-user-role");
  const classIdFromJWT = req.headers.get("x-user-classid");
  const userId = req.headers.get("x-user-id");
  

  const { searchParams } = new URL(req.url);
  let classIdQuery = searchParams.get("classId")?.trim() || "";

  const db = await getDb();
  let classId: string | null = null;

  if (role === "WALI") classId = classIdFromJWT!;
  else if (role === "SISWA") classId = null;
  else classId = classIdQuery || null;

  const dateFilter: any = {};
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  if (start) dateFilter.$gte = start;
  if (end) dateFilter.$lte = end;

  const match: any = {};
  if (classId) match.classId = new ObjectId(classId);
  if (start || end) match.date = dateFilter;
  if (role === "SISWA") match.studentId = new ObjectId(userId!);

  const rows = await db.collection("attendance").aggregate([
    { $match: match },
    { $addFields: { studentIdStr: { $toString: "$studentId" } } },
    {
      $group: {
        _id: "$studentIdStr",
        hadir: { $sum: { $cond: [{ $eq: ["$status", "HADIR"] }, 1, 0] } },
        sakit: { $sum: { $cond: [{ $eq: ["$status", "SAKIT"] }, 1, 0] } },
        izin: { $sum: { $cond: [{ $eq: ["$status", "IZIN"] }, 1, 0] } },
        alpa: { $sum: { $cond: [{ $eq: ["$status", "ALPA"] }, 1, 0] } },
        total: { $sum: 1 },
      },
    },
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
    {
      $lookup: {
        from: "students",
        localField: "studentObjId",
        foreignField: "_id",
        as: "student",
      },
    },
    { $unwind: { path: "$student", preserveNullAndEmptyArrays: true } },
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
