"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function LoginPage() {
  const r = useRouter();
  const [username, setUsername] = useState(""); // ⬅️ GANTI
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setErr("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data.message ?? "Gagal login");
        return;
      }

      r.replace("/dashboard");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-[#061b4f] via-[#0a4fb5] to-[#19a4ff] p-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl bg-white/10 p-6 ring-1 ring-white/15 backdrop-blur-xl shadow-[0_30px_80px_rgba(0,0,0,0.35)]"
      >
        <div className="text-2xl font-black text-white">Login</div>
        <div className="mt-1 text-sm font-semibold text-white/70">
          Admin / Wali Kelas
        </div>

        {err ? (
          <div className="mt-4 rounded-2xl bg-rose-500/95 px-4 py-3 text-sm font-extrabold text-white">
            {err}
          </div>
        ) : null}

        <div className="mt-5 space-y-3">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none ring-1 ring-black/10"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none ring-1 ring-black/10"
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />

          <button
            disabled={loading}
            onClick={submit}
            className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-extrabold text-white shadow-sm hover:bg-slate-800 disabled:opacity-70"
          >
            {loading ? "Loading..." : "Masuk"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
