import KehadiranSiswaClient from "./KehadiranSiswaClient";
import { getDb } from "@/lib/mongo";
import { ObjectId } from "mongodb";

function isValidObjectId(v: string) {
  return /^[a-fA-F0-9]{24}$/.test(v);
}

function todayWitaYYYYMMDD() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Makassar",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const y = parts.find((p) => p.type === "year")?.value ?? "0000";
  const m = parts.find((p) => p.type === "month")?.value ?? "00";
  const d = parts.find((p) => p.type === "day")?.value ?? "00";
  return `${y}-${m}-${d}`;
}

export default async function KehadiranSiswaPage() {
  const db = await getDb();
  const date = todayWitaYYYYMMDD();

  const classesRaw = await db.collection("classes").find({}).sort({ createdAt: -1 }).toArray();
  const classes = classesRaw.map((c: any) => ({
    id: String(c._id),
    name: String(c.name ?? ""),
  }));

  // ambil siswa (minimal)
  const studentsRaw = await db.collection("students").find({}).sort({ createdAt: -1 }).toArray();
  const students = studentsRaw.map((s: any) => ({
    id: String(s._id),
    nis: String(s.nis ?? ""),
    name: String(s.name ?? ""),
    classId: s.classId ? String(s.classId) : "",
  }));

  // ambil attendance hari ini
  const attRaw = await db.collection("attendance").find({ date }).toArray();
  const attendance = attRaw.map((a: any) => ({
    id: String(a._id),
    date: String(a.date),
    studentId: String(a.studentId),
    classId: a.classId ? String(a.classId) : "",
    status: String(a.status ?? "BELUM"),
    note: String(a.note ?? ""),
  }));

  return (
    <KehadiranSiswaClient
      initialDate={date}
      initialClasses={classes}
      initialStudents={students}
      initialAttendance={attendance}
    />
  );
}
