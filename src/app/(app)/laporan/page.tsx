import { getDb } from "@/lib/mongo";
import { ObjectId } from "mongodb";

type RankRow = {
  nis: string;
  name: string;
  kelas: string;
  total: number;
};

async function topByStatus(status: string): Promise<RankRow[]> {
  const db = await getDb();

  const rows = await db
    .collection("attendance") // ✅ ganti ke nama collection kamu
    .aggregate([
      { $match: { status } },

      // ✅ group per siswa
      { $group: { _id: "$studentId", total: { $sum: 1 } } },
      { $sort: { total: -1 } },
      { $limit: 5 },

      // ✅ ubah studentId string -> ObjectId kalau memungkinkan
      {
        $addFields: {
          studentObjId: {
            $cond: [
              { $eq: [{ $type: "$_id" }, "objectId"] },
              "$_id",
              {
                $cond: [
                  {
                    $and: [
                      { $eq: [{ $type: "$_id" }, "string"] },
                      { $regexMatch: { input: "$_id", regex: /^[a-fA-F0-9]{24}$/ } },
                    ],
                  },
                  { $toObjectId: "$_id" },
                  null,
                ],
              },
            ],
          },
        },
      },

      // ✅ join students pakai studentObjId
      {
        $lookup: {
          from: "students",
          localField: "studentObjId",
          foreignField: "_id",
          as: "student",
        },
      },
      { $unwind: { path: "$student", preserveNullAndEmptyArrays: true } },

      // ✅ join classes
      {
        $addFields: {
          classObjId: {
            $cond: [
              { $eq: [{ $type: "$student.classId" }, "objectId"] },
              "$student.classId",
              {
                $cond: [
                  {
                    $and: [
                      { $eq: [{ $type: "$student.classId" }, "string"] },
                      { $regexMatch: { input: "$student.classId", regex: /^[a-fA-F0-9]{24}$/ } },
                    ],
                  },
                  { $toObjectId: "$student.classId" },
                  null,
                ],
              },
            ],
          },
        },
      },
      {
        $lookup: {
          from: "classes",
          localField: "classObjId",
          foreignField: "_id",
          as: "class",
        },
      },
      { $unwind: { path: "$class", preserveNullAndEmptyArrays: true } },

      // ✅ output
      {
        $project: {
          _id: 0,
          nis: { $ifNull: ["$student.nis", "-"] },
          name: { $ifNull: ["$student.name", "-"] },
          kelas: { $ifNull: ["$class.name", "-"] },
          total: 1,
        },
      },
    ])
    .toArray();

  return rows as RankRow[];
}

function TableRank({ title, rows }: { title: string; rows: RankRow[] }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
      <div className="px-5 py-4 text-lg font-extrabold">{title}</div>
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-slate-700">
          <tr>
            <th className="px-5 py-3">NIS</th>
            <th className="px-5 py-3">Nama Siswa</th>
            <th className="px-5 py-3">Kelas</th>
            <th className="px-5 py-3">Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={`${r.nis}-${r.total}-${i}`} className="border-t">
              <td className="px-5 py-3">{r.nis}</td>
              <td className="px-5 py-3 font-semibold">{r.name}</td>
              <td className="px-5 py-3">{r.kelas}</td>
              <td className="px-5 py-3">{r.total}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td className="px-5 py-10 text-center text-slate-500" colSpan={4}>
                Belum ada data.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default async function LaporanPage() {
  const hadir = await topByStatus("HADIR");
  const sakit = await topByStatus("SAKIT");
  const izin = await topByStatus("IZIN");

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-slate-900">Laporan</h1>
      </div>

      <div className="grid gap-6">
        <TableRank title="Ranking Siswa Banyak Hadir" rows={hadir} />
        <TableRank title="Ranking Siswa Banyak Sakit" rows={sakit} />
        <TableRank title="Ranking Siswa Banyak Izin" rows={izin} />
      </div>
    </div>
  );
}
