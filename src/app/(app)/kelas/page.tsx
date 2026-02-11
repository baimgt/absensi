import { getDb } from "@/lib/mongo";
import { ObjectId } from "mongodb";
import KelasClient from "./KelasClient";
import { getSession } from "@/lib/auth";


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
  const user = await getSession();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // ==========================
  // FILTER BERDASARKAN ROLE
  // ==========================
  let classFilter: any = {};

  if (user.role === "WALI") {
    classFilter = {
      waliKelasId: new ObjectId(user.id),
    };
  }

  if (user.role === "SISWA") {
    // siswa TIDAK BOLEH masuk halaman kelas
    throw new Error("Forbidden");
  }

  const classesAgg = await db
  .collection("classes")
  .aggregate([
    { $match: classFilter },
    { $sort: { createdAt: -1 } },
    {
      $lookup: {
        from: "users",
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

  const classes = classesAgg.map((c: any) => ({
    id: String(c._id),
    name: String(c.name ?? ""),
    academicYear: String(c.academicYear ?? ""),
    semester: String(c.semester ?? ""),
    waliKelasId: c.waliKelasId ? String(c.waliKelasId) : "",
    waliKelasName: String(c.waliKelasName ?? "-"),
  }));

  const teachersRaw = await db
  .collection("users")
  .find({ role: "WALI" })
  .sort({ name: 1 })
  .toArray();

const teachers = teachersRaw.map((u: any) => ({
  id: String(u._id),
  name: String(u.name ?? "-"),
}));


  const KelasClient = (await import("./KelasClient")).default;
  return (
  <KelasClient
    initialTeachers={teachers}
    initialClasses={classes}
  />
);
}