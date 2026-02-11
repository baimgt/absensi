"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ===================== TYPE =====================
type Teacher = {
  id: string;
  name: string;
  nip: string;
  phone: string | null;
};

type Student = {
  _id: string;
  name: string;
  nis: string;
  classId: string;
};

type Class = {
  _id: string;
  name: string;
  waliKelasId: string;
};

interface SuperadminClientProps {
  classes: Class[];
}

// ===================== MAIN COMPONENT =====================
export default function SuperadminClient({ classes }: SuperadminClientProps) {
  const [role, setRole] = useState<"ADMIN" | "WALI" | "SISWA">("ADMIN");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [msg, setMsg] = useState("");
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // ================= FETCH DATA =================
  useEffect(() => {
    if (role === "WALI") {
      setLoadingTeachers(true);
      fetch("/api/teachers")
        .then((r) => r.json())
        .then(setTeachers)
        .finally(() => setLoadingTeachers(false));
    }
    if (role === "SISWA") {
      setLoadingStudents(true);
      fetch("/api/students")
        .then((r) => r.json())
        .then(setStudents)
        .finally(() => setLoadingStudents(false));
    }
  }, [role]);

  // ================= SUBMIT =================
  async function submit() {
    setMsg("");
    let body: any = { role, password };

    // ===== ADMIN =====
    if (role === "ADMIN") {
      if (!username) return setMsg("Username harus diisi");
      body.username = username;
      body.name = username;
    }

    // ===== WALI =====
if (role === "WALI") {
  if (!teacherId) return setMsg("Pilih Wali dulu");
  const t = teachers.find((x) => x.id === teacherId);
  if (!t) return setMsg("Wali tidak ditemukan");

  const kelas = classes.find((c) => c.waliKelasId === teacherId);

  body.username = `wali_${t.id}`;
  body.name = t.name;
  body.teacherId = t.id; // ✅ FIX PALING PENTING

  if (kelas) {
    body.classIds = [kelas._id];
  }
}


    // ===== SISWA =====
    if (role === "SISWA") {
      if (!studentId) return setMsg("Pilih Siswa dulu");
      const s = students.find((x) => x?._id === studentId);
      if (!s) return setMsg("Siswa tidak ditemukan");

      body.username = `siswa_${s.nis}`;
      body.name = s.name;
      body.classId = s.classId; // otomatis assign classId
    }

    // ===== POST TO BACKEND =====
    try {
      const res = await fetch("/api/superadmin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) return setMsg(data.message || "Gagal");
      setMsg("✅ Akun berhasil dibuat");
      setPassword("");
    } catch (err) {
      setMsg("Terjadi kesalahan server");
    }
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
          onChange={(e) => {
            setRole(e.target.value as any);
            setTeacherId("");
            setStudentId("");
          }}
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
                  <option key={t.id} value={t.id}>
                    {t.name} — {t.nip}
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
          disabled={loadingTeachers || loadingStudents}
          className="mt-5 w-full rounded-xl bg-slate-900 py-3 text-white font-extrabold hover:bg-slate-800 disabled:opacity-50"
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
