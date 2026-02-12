import KehadiranClient from "./KehadiranClient";
import { getDb } from "@/lib/mongo";

export default async function KehadiranPage() {
  const db = await getDb();

  const today = new Date().toISOString().slice(0, 10);

  const attendance = await db
    .collection("attendance")
    .find({ date: today })
    .toArray();

  const initialAttendance = attendance.map((a) => ({
    id: String(a._id),
    studentId: String(a.studentId),
    classId: a.classId ? String(a.classId) : "",
    date: a.date,
    status: a.status,
    note: a.note ?? "",
  }));

  return <KehadiranClient initialAttendance={initialAttendance} />;
}
