import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/mongo";
import { redirect } from "next/navigation";
import { ObjectId } from "mongodb";
import DashboardAdminChart from "./DashboardAdminChart";
import DashboardWaliChart from "./DashboardWaliChart";

function Stat({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
      <div className="text-sm font-semibold text-slate-500">{title}</div>
      <div className="mt-2 text-3xl font-extrabold text-slate-900">{value}</div>
    </div>
  );
}

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const db = await getDb();

  // ================= ADMIN =================
  if (session.role === "ADMIN") {
  const totalKelas = await db.collection("classes").countDocuments();
  const totalSiswa = await db.collection("students").countDocuments();

  const perClassRaw = await db
    .collection("students")
    .aggregate([
      {
        $group: {
          _id: "$classId",
          total: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "classes",
          localField: "_id",
          foreignField: "_id",
          as: "class",
        },
      },
      { $unwind: { path: "$class", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          className: { $ifNull: ["$class.name", "Tanpa Kelas"] },
          total: 1,
        },
      },
      { $sort: { total: -1 } },
    ])
    .toArray();

  // 🔑 INI YANG PENTING (TYPE FIX)
  const perClass: { className: string; total: number }[] = perClassRaw.map(
    (r: any) => ({
      className: String(r.className),
      total: Number(r.total),
    })
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold">Dashboard Admin</h1>

      <div className="grid grid-cols-2 gap-6">
        <Stat title="Total Kelas" value={totalKelas} />
        <Stat title="Total Siswa" value={totalSiswa} />
      </div>

      <DashboardAdminChart data={perClass} />
    </div>
  );
}

  // ================= WALI =================
 if (session.role === "WALI") {
  // cari kelas yang diwali
  const waliClasses = await db
    .collection("classes")
    .find({ waliKelasId: new ObjectId(session.id) })
    .project({ _id: 1 })
    .toArray();

  const classIds = waliClasses.map((c) => c._id);

  const attendanceRaw = await db
    .collection("attendance")
    .aggregate([
      {
        $match: {
          classId: { $in: classIds },
          status: { $ne: "BELUM" },
        },
      },
      {
        $group: {
          _id: "$status",
          total: { $sum: 1 },
        },
      },
    ])
    .toArray();

  // 🔑 FIX TYPE DI SINI
  const attendance: { _id: string; total: number }[] =
    attendanceRaw.map((r: any) => ({
      _id: String(r._id),
      total: Number(r.total),
    }));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold">Dashboard Wali Kelas</h1>

      <DashboardWaliChart data={attendance} />
    </div>
  );
}

  // ================= SISWA =================
  redirect("/kehadiran-siswa");
}
