import { getDb } from "@/lib/mongo";
import { getSession } from "@/lib/auth";
import { ObjectId } from "mongodb";
import RekapClient from "./RekapClient";

export default async function RekapPage() {
  const db = await getDb();
  const user = await getSession();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // siswa tidak boleh akses rekap
  if (user.role === "SISWA") {
    throw new Error("Forbidden");
  }

  let classFilter: any = {};

  // ======================
  // ROLE: WALI
  // ======================
  if (user.role === "WALI") {
    classFilter = {
      waliKelasId: new ObjectId(user.id),
    };
  }

  // ======================
  // AMBIL KELAS
  // ======================
  const classesRaw = await db
    .collection("classes")
    .find(classFilter)
    .sort({ createdAt: 1 })
    .toArray();

  const classes = classesRaw.map((c: any) => ({
    id: String(c._id),
    name: String(c.name ?? "-"),
  }));

  return <RekapClient classes={classes} />;
}
