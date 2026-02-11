import KehadiranSiswaClient from "./KehadiranSiswaClient";
import { getDb } from "@/lib/mongo";
import { getSession } from "@/lib/auth";
import { ObjectId } from "mongodb";

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
  const user = await getSession();
  if (!user) throw new Error("Unauthorized");

  const date = todayWitaYYYYMMDD();

  let classMatch: any = {};
  let studentMatch: any = {};
  let attendanceMatch: any = { date };

  // ======================
  // ROLE: WALI
  // ======================
  if (user.role === "WALI") {
    const waliClasses = await db
      .collection("classes")
      .find({ waliKelasId: new ObjectId(user.id) })
      .project({ _id: 1 })
      .toArray();

    const classIds = waliClasses.map((c) => c._id);

    classMatch = { _id: { $in: classIds } };
    studentMatch = { classId: { $in: classIds } };
    attendanceMatch.classId = { $in: classIds };
  }

  // ======================
  // ROLE: SISWA
  // ======================
  if (user.role === "SISWA") {
    const student = await db.collection("students").findOne({
      userId: new ObjectId(user.id),
    });

    if (!student) throw new Error("Student not found");

    studentMatch = { _id: student._id };
    attendanceMatch.studentId = String(student._id);
    classMatch = { _id: student.classId };
  }

  // ======================
  // CLASSES
  // ======================
  const classesRaw = await db.collection("classes").find(classMatch).toArray();
  const classes = classesRaw.map((c: any) => ({
    id: String(c._id),
    name: String(c.name ?? ""),
  }));

  // ======================
  // STUDENTS
  // ======================
  const studentsRaw = await db.collection("students").find(studentMatch).toArray();
  const students = studentsRaw.map((s: any) => ({
    id: String(s._id),
    nis: String(s.nis ?? ""),
    name: String(s.name ?? ""),
    classId: s.classId ? String(s.classId) : "",
  }));

  // ======================
  // ATTENDANCE
  // ======================
  const attRaw = await db
    .collection("attendance")
    .find(attendanceMatch)
    .toArray();

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
