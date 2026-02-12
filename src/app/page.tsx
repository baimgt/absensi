import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function HomePage() {
  try {
    const session = await getSession();

    if (!session) {
      redirect("/login");
    }

    redirect("/dashboard");
  } catch (error) {
    redirect("/login");
  }
}
