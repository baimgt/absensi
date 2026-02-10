"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";

type ClassRow = { id: string; name: string };
type StudentRow = { id: string; nis: string; name: string; classId: string };

type AttendanceRow = {
  id: string;
  date: string; // YYYY-MM-DD
  studentId: string;
  classId: string;
  status: string; // HADIR | SAKIT | IZIN | ALPA | BELUM
  note?: string;
};

const STATUS = [
  { key: "HADIR", label: "Hadir", cls: "bg-emerald-500 text-white" },
  { key: "SAKIT", label: "Sakit", cls: "bg-amber-400 text-slate-900" },
  { key: "IZIN", label: "Izin", cls: "bg-sky-500 text-white" },
  { key: "ALPA", label: "Alpa", cls: "bg-rose-500 text-white" },
  { key: "BELUM", label: "Belum", cls: "bg-slate-200 text-slate-900" },
] as const;

function pillClass(status: string) {
  const found = STATUS.find((s) => s.key === status);
  return found?.cls ?? "bg-slate-200 text-slate-900";
}

export default function KehadiranSiswaClient({
  initialDate,
  initialClasses,
  initialStudents,
  initialAttendance,
}: {
  initialDate: string;
  initialClasses: ClassRow[];
  initialStudents: StudentRow[];
  initialAttendance: AttendanceRow[];
}) {
  const [date, setDate] = useState(initialDate);
  const [classId, setClassId] = useState<string>("ALL");
  const [q, setQ] = useState("");

  const [attendance, setAttendance] = useState<AttendanceRow[]>(initialAttendance);
  const [loadingId, setLoadingId] = useState<string>("");

  const attendanceMap = useMemo(() => {
    const m = new Map<string, AttendanceRow>();
    for (const a of attendance) {
      if (a.date === date) m.set(a.studentId, a);
    }
    return m;
  }, [attendance, date]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return initialStudents.filter((s) => {
      const matchClass = classId === "ALL" ? true : s.classId === classId;
      const matchQ =
        !qq ||
        s.name.toLowerCase().includes(qq) ||
        s.nis.toLowerCase().includes(qq);
      return matchClass && matchQ;
    });
  }, [initialStudents, classId, q]);

  async function setStatus(student: StudentRow, status: string) {
    setLoadingId(student.id);
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          studentId: student.id,
          classId: student.classId,
          status,
        }),
      });

      if (!res.ok) {
        const msg = await res.json().catch(() => ({}));
        alert(msg?.message ?? "Gagal update kehadiran.");
        return;
      }

      const saved = await res.json();
      // merge / replace row di state
      setAttendance((prev) => {
        const next = prev.filter((x) => !(x.studentId === student.id && x.date === date));
        next.unshift(saved);
        return next;
      });
    } finally {
      setLoadingId("");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Kehadiran Siswa</h1>
            <p className="text-sm font-semibold text-slate-500">
              Pilih tanggal & kelas, lalu set status: Hadir / Sakit / Izin / Alpa.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <label className="text-xs font-extrabold text-slate-600">Tanggal</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm outline-none focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm outline-none focus:ring-4 focus:ring-blue-100"
            >
              <option value="ALL">Semua Kelas</option>
              {initialClasses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari nama / NIS..."
              className="w-full sm:w-64 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm outline-none focus:ring-4 focus:ring-blue-100"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
          <div className="grid grid-cols-[80px_1fr_140px_260px] gap-0 bg-slate-50 px-4 py-3 text-xs font-extrabold text-slate-600">
            <div>No</div>
            <div>Siswa</div>
            <div>Status</div>
            <div>Aksi</div>
          </div>

          <div className="divide-y">
            {filtered.map((s, idx) => {
              const a = attendanceMap.get(s.id);
              const st = a?.status ?? "BELUM";

              return (
                <div
                  key={s.id}
                  className="grid grid-cols-[80px_1fr_140px_260px] items-center gap-0 px-4 py-3"
                >
                  <div className="text-sm font-bold text-slate-600">{idx + 1}</div>

                  <div>
                    <div className="text-sm font-extrabold text-slate-900">{s.name}</div>
                    <div className="text-xs font-semibold text-slate-500">NIS: {s.nis}</div>
                  </div>

                  <div>
                    <span className={`inline-flex rounded-xl px-3 py-1 text-xs font-extrabold ${pillClass(st)}`}>
                      {STATUS.find((x) => x.key === st)?.label ?? st}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {STATUS.filter((x) => x.key !== "BELUM").map((x) => (
                      <motion.button
                        key={x.key}
                        whileTap={{ scale: 0.98 }}
                        whileHover={{ y: -1 }}
                        disabled={loadingId === s.id}
                        onClick={() => setStatus(s, x.key)}
                        className={
                          "rounded-xl px-3 py-2 text-xs font-extrabold shadow-sm ring-1 ring-black/5 " +
                          (x.key === "HADIR"
                            ? "bg-emerald-600 text-white hover:bg-emerald-700"
                            : x.key === "SAKIT"
                            ? "bg-amber-400 text-slate-900 hover:bg-amber-300"
                            : x.key === "IZIN"
                            ? "bg-sky-600 text-white hover:bg-sky-700"
                            : "bg-rose-600 text-white hover:bg-rose-700") +
                          (loadingId === s.id ? " opacity-70 cursor-not-allowed" : "")
                        }
                      >
                        {loadingId === s.id ? "..." : x.label}
                      </motion.button>
                    ))}
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="px-4 py-10 text-center text-sm font-semibold text-slate-500">
                Tidak ada siswa untuk filter ini.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
