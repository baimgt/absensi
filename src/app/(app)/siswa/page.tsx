import { getDb } from "@/lib/mongo";
import { getSession } from "@/lib/auth";
import { ObjectId } from "mongodb";

type ClassRow = {
  id: string;
  name: string;
};

type StudentRow = {
  id: string;
  nis: string;
  name: string;
  classId: string;
  className: string;
};

export default async function SiswaPage() {
  const db = await getDb();
  const user = await getSession();

  if (!user) throw new Error("Unauthorized");
  if (user.role === "SISWA") throw new Error("Forbidden");

  // ==========================
  // FILTER BERDASARKAN ROLE
  // ==========================
  let studentMatch: any = {};
  let classMatch: any = {};

  if (user.role === "WALI") {
    const waliClasses = await db
      .collection("classes")
      .find({ waliKelasId: new ObjectId(user.id) })
      .project({ _id: 1 })
      .toArray();

    const classIds = waliClasses.map((c) => c._id);

    studentMatch = { classId: { $in: classIds } };
    classMatch = { _id: { $in: classIds } };
  }

  // ==========================
  // CLASSES (UNTUK DROPDOWN)
  // ==========================
  const classesRaw = await db
    .collection("classes")
    .find(classMatch)
    .sort({ createdAt: 1 })
    .toArray();

  const classes: ClassRow[] = classesRaw.map((c: any) => ({
    id: String(c._id),
    name: String(c.name ?? "-"),
  }));

  // ==========================
  // STUDENTS + JOIN CLASS
  // ==========================
  const studentsAgg = await db
    .collection("students")
    .aggregate([
      { $match: studentMatch },
      {
        $lookup: {
          from: "classes",
          localField: "classId",
          foreignField: "_id",
          as: "class",
        },
      },
      { $unwind: { path: "$class", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          nis: 1,
          name: 1,
          classId: 1,
          className: { $ifNull: ["$class.name", "-"] },
        },
      },
      { $sort: { createdAt: -1 } },
    ])
    .toArray();

  const students: StudentRow[] = studentsAgg.map((s: any) => ({
    id: String(s._id),
    nis: String(s.nis ?? ""),
    name: String(s.name ?? ""),
    classId: String(s.classId ?? ""),
    className: String(s.className ?? "-"),
  }));

  const SiswaClient = (await import("./SiswaClient")).default;

  return (
    <SiswaClient
      initialClasses={classes}
      initialStudents={students}
    />
  );
}
