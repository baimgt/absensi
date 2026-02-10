import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { ObjectId } from "mongodb";
import ExcelJS from "exceljs";

function isObjectId(v: string) {
  return /^[a-fA-F0-9]{24}$/.test(v);
}
function toId(v: string) {
  return isObjectId(v) ? new ObjectId(v) : v;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const classId = String(searchParams.get("classId") ?? "").trim();
  const start = String(searchParams.get("start") ?? "").trim();
  const end = String(searchParams.get("end") ?? "").trim();
  const className = String(searchParams.get("className") ?? "kelas").trim();

  if (!classId) {
    return NextResponse.json({ message: "classId wajib" }, { status: 400 });
  }

  const db = await getDb();

  const dateFilter: any = {};
  if (start) dateFilter.$gte = start;
  if (end) dateFilter.$lte = end;

  const match: any = {
    $or: [{ classId: toId(classId) }, { classId: String(classId) }],
  };
  if (start || end) match.date = dateFilter;

  const rows = await db.collection("attendance").aggregate([
    { $match: match },
    { $addFields: { studentIdStr: { $toString: "$studentId" } } },
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

  // ✅ bikin workbook
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Rekap");

  ws.columns = [
    { header: "NIS", key: "nis", width: 14 },
    { header: "Nama", key: "name", width: 28 },
    { header: "Hadir", key: "hadir", width: 10 },
    { header: "Sakit", key: "sakit", width: 10 },
    { header: "Izin", key: "izin", width: 10 },
    { header: "Alpa", key: "alpa", width: 10 },
    { header: "Total", key: "total", width: 10 },
  ];

  ws.addRows(rows as any);

  ws.getRow(1).font = { bold: true };
  ws.autoFilter = "A1:G1";

  const buf = await wb.xlsx.writeBuffer();

  const safeName = className.replace(/[^\w\- ]+/g, "").replace(/\s+/g, "_");
  const period = `${start || "ALL"}_${end || "ALL"}`;
  const filename = `rekap_${safeName}_${period}.xlsx`;

  return new NextResponse(Buffer.from(buf), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
