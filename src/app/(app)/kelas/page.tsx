import { getDb } from "@/lib/mongo";
import { ObjectId } from "mongodb";
import KelasClient from "./KelasClient";

type TeacherRow = { id: string; name: string };
type ClassRow = {
  id: string;
  name: string;
  academicYear: string;
  semester: string;
  waliKelasId: string;
  waliKelasName: string;
};

export default async function KelasPage() {
  const db = await getDb();

  const teachersRaw = await db
    .collection("teachers")
    .find({})
    .sort({ createdAt: -1 })
    .toArray();

  const teachers: TeacherRow[] = teachersRaw.map((t: any) => ({
    id: String(t._id),
    name: String(t.name ?? ""),
  }));

  const classesAgg = await db
    .collection("classes")
    .aggregate([
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "teachers",
          localField: "waliKelasId",
          foreignField: "_id",
          as: "wali",
        },
      },
      { $unwind: { path: "$wali", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          name: 1,
          academicYear: 1,
          semester: 1,
          waliKelasId: 1,
          waliKelasName: { $ifNull: ["$wali.name", "-"] },
        },
      },
    ])
    .toArray();

  const classes: ClassRow[] = classesAgg.map((c: any) => ({
    id: String(c._id),
    name: String(c.name ?? ""),
    academicYear: String(c.academicYear ?? ""),
    semester: String(c.semester ?? ""),
    waliKelasId: c.waliKelasId ? String(c.waliKelasId) : "",
    waliKelasName: String(c.waliKelasName ?? "-"),
  }));

  return <KelasClient initialTeachers={teachers} initialClasses={classes} />;
}
