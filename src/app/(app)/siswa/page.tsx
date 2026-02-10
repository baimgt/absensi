import { getDb } from "@/lib/mongo";

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

  const classesRaw = await db
    .collection("classes")
    .find({})
    .sort({ createdAt: 1 })
    .toArray();

  const classes: ClassRow[] = classesRaw.map((c: any) => ({
    id: String(c._id),
    name: c.name ?? "-",
  }));

  // join students -> class name
  const studentsAgg = await db
    .collection("students")
    .aggregate([
      { $sort: { createdAt: -1 } },
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

  return <SiswaClient initialClasses={classes} initialStudents={students} />;
}
