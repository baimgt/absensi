import { getDb } from "@/lib/mongo";

type TeacherRow = {
  id: string;
  name: string;
  nip: string;
  phone: string;
};

export default async function WaliKelasPage() {
  const db = await getDb();

  const teachersRaw = await db
    .collection("teachers")
    .find({})
    .sort({ createdAt: -1 })
    .toArray();

  const teachers: TeacherRow[] = teachersRaw.map((t: any) => ({
    id: String(t._id),
    name: String(t.name ?? ""),
    nip: t.nip ? String(t.nip) : "",
    phone: t.phone ? String(t.phone) : "",
  }));

  const WaliKelasClient = (await import("./WaliKelasClient")).default;
  return <WaliKelasClient initialTeachers={teachers} />;
}
