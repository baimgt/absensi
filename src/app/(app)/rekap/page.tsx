import { getDb } from "@/lib/mongo";
import RekapClient from "./RekapClient";

export default async function RekapPage() {
  const db = await getDb();

  const classes = (await db.collection("classes").find({}).toArray()).map((c: any) => ({
    id: String(c._id),
    name: String(c.name ?? "-"),
  }));

  return <RekapClient classes={classes} />;
}
