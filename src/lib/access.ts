import { getDb } from "@/lib/mongo";
import { ObjectId } from "mongodb";
import { SessionUser } from "@/lib/auth";

function isObjectId(v: string) {
  return /^[a-fA-F0-9]{24}$/.test(v);
}
function toObjId(v: string) {
  return isObjectId(v) ? new ObjectId(v) : null;
}

export async function getAllowedClassIds(session: SessionUser) {
  if (session.role === "admin") return null; // null = all

  const db = await getDb();
  const uid = toObjId(session.id);

  // ✅ asumsi: classes punya field waliKelasUserId
  const classes = await db
    .collection("classes")
    .find({ waliKelasUserId: uid })
    .project({ _id: 1 })
    .toArray();

  return classes.map((c: any) => String(c._id));
}
