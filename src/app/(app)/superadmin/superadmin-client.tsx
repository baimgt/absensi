"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Teacher = { _id: string; name: string };
type Student = { _id: string; name: string; nis: string };

export default function SuperAdminClient() {
  const [role, setRole] = useState("ADMIN");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [msg, setMsg] = useState("");

  // ================= FETCH DATA =================
  useEffect(() => {
    if (role === "WALI") {
      fetch("/api/teachers")
        .then((r) => r.json())
        .then(setTeachers);
    }

    if (role === "SISWA") {
      fetch("/api/students")
        .then((r) => r.json())
        .then(setStudents);
    }
  }, [role]);

  // ================= SUBMIT =================
  async function submit() {
  setMsg("");

  let body: any = { role, password };

  if (role === "ADMIN") {
    body.username = username;
    body.name = username;
  }

  console.log("teacherId:", teacherId);
console.log("teachers:", teachers.map(t => t._id));


  if (role === "WALI") {
    const t = teachers.find((x) => x._id === teacherId);
    if (!t) return setMsg("Pilih wali dulu");

    body.username = `wali_${teacherId}`;
    body.name = t.name;
  }

  if (role === "SISWA") {
    const s = students.find((x) => x._id === studentId);
    if (!s) return setMsg("Pilih siswa dulu");

    body.username = `siswa_${s.nis}`;
    body.name = s.name;
  }

  const res = await fetch("/api/superadmin/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) return setMsg(data.message || "Gagal");

  setMsg("✅ Akun berhasil dibuat");
  setPassword("");
}


  // ================= UI =================
  return (
    <div className="max-w-xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-white/80 backdrop-blur-xl p-6 shadow-xl ring-1 ring-black/5"
      >
        <h1 className="text-2xl font-black mb-5">Buat Akun</h1>

        {/* ROLE */}
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full mb-4 rounded-xl px-4 py-3 font-semibold ring-1 ring-black/10"
        >
          <option value="ADMIN">Admin</option>
          <option value="WALI">Wali Kelas</option>
          <option value="SISWA">Siswa</option>
        </select>

        <AnimatePresence mode="wait">
          {role === "ADMIN" && (
            <MotionBlock key="admin">
              <input
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input"
              />
            </MotionBlock>
          )}

          {role === "WALI" && (
            <MotionBlock key="wali">
              <select
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                className="input"
              >
                <option value="">Pilih Wali</option>
                {teachers.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </MotionBlock>
          )}

          {role === "SISWA" && (
            <MotionBlock key="siswa">
              <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="input"
              >
                <option value="">Pilih Siswa</option>
                {students.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.nis} — {s.name}
                  </option>
                ))}
              </select>
            </MotionBlock>
          )}
        </AnimatePresence>

        {/* PASSWORD */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input mt-3"
        />

        <button
          onClick={submit}
          className="mt-5 w-full rounded-xl bg-slate-900 py-3 text-white font-extrabold hover:bg-slate-800"
        >
          Simpan Akun
        </button>

        {msg && (
          <div className="mt-4 rounded-xl bg-emerald-100 px-4 py-3 text-sm font-bold text-emerald-700">
            {msg}
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ================= SMALL COMPONENT =================
function MotionBlock({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mb-3"
    >
      {children}
    </motion.div>
  );
}
