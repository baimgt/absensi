import { getDb } from "@/lib/mongo";
import { ObjectId } from "mongodb";

type StudentRow = {
  id: string;
  nis: string;
  name: string;
};

function isValidObjectId(v: string) {
  return /^[a-fA-F0-9]{24}$/.test(v);
}

export default async function SiswaPerKelasPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // ✅ WAJIB di Next terbaru
  const classId = id;

  const db = await getDb();

  // ambil kelas (aman)
  const kelas = isValidObjectId(classId)
    ? await db.collection("classes").findOne({ _id: new ObjectId(classId) })
    : await db.collection("classes").findOne({ _id: classId as any });

  // ambil siswa (support string + ObjectId)
  const filter = isValidObjectId(classId)
    ? { $or: [{ classId: new ObjectId(classId) }, { classId: classId }] }
    : { classId: classId };

  const studentsRaw = await db
    .collection("students")
    .find(filter)
    .sort({ createdAt: -1 })
    .toArray();

  const students: StudentRow[] = studentsRaw.map((s: any) => ({
    id: String(s._id),
    nis: String(s.nis ?? ""),
    name: String(s.name ?? ""),
  }));

  const Client = (await import("./SiswaKelasClient")).default;

  return (
    <Client
      classId={classId}
      className={String(kelas?.name ?? "-")}
      initialStudents={students}
    />
  );
}
