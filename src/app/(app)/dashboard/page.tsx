import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/mongo";
import { redirect } from "next/navigation";

function Stat({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="mt-2 text-3xl font-extrabold">{value}</div>
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

    return (
      <div>
        <h1 className="mb-6 text-3xl font-extrabold">Dashboard Admin</h1>
        <div className="grid grid-cols-2 gap-6">
          <Stat title="Total Kelas" value={totalKelas} />
          <Stat title="Total Siswa" value={totalSiswa} />
        </div>
      </div>
    );
  }

  // ================= WALI =================
  if (session.role === "WALI") {
    const classIds = session.classIds || [];
    const totalSiswa = await db.collection("students").countDocuments({
      classId: { $in: classIds },
    });

    return (
      <div>
        <h1 className="mb-6 text-3xl font-extrabold">Dashboard Wali Kelas</h1>
        <div className="grid grid-cols-2 gap-6">
          <Stat title="Jumlah Kelas" value={classIds.length} />
          <Stat title="Total Siswa" value={totalSiswa} />
        </div>
      </div>
    );
  }

  // ================= SISWA =================
  redirect("/absen");
}
