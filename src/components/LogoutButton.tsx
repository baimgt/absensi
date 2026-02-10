"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <button
      onClick={logout}
      className="w-full rounded-xl bg-rose-500 px-4 py-2 text-sm font-extrabold text-white hover:bg-rose-600"
    >
      Logout
    </button>
  );
}
