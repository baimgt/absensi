import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/mongo";
import { redirect } from "next/navigation";
import SuperadminClient from "./superadmin-client";

export default async function SuperadminPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");

  const db = await getDb();
  const classes = await db.collection("classes").find().toArray();

  return (
    <div>
      <h1 className="mb-6 text-3xl font-extrabold">Superadmin</h1>
      <SuperadminClient classes={JSON.parse(JSON.stringify(classes))} />
    </div>
  );
}