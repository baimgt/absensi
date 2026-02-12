"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

type TeacherRow = { id: string; name: string };
type ClassRow = {
  id: string;
  name: string;
  academicYear: string;
  semester: string;
  waliKelasId: string;
  waliKelasName: string;
};

export default function KelasClient({
  initialTeachers,
  initialClasses,
}: {
  initialTeachers: TeacherRow[];
  initialClasses: ClassRow[];
}) {
  const [teachers] = useState<TeacherRow[]>(initialTeachers);
  const [classes, setClasses] = useState<ClassRow[]>(initialClasses);

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"ADD" | "EDIT">("ADD");
  const [loading, setLoading] = useState(false);

  const [formId, setFormId] = useState("");
  const [name, setName] = useState("");
  const [academicYear, setAcademicYear] = useState("2024/2025");
  const [semester, setSemester] = useState<"Ganjil" | "Genap">("Ganjil");
  const [waliKelasId, setWaliKelasId] = useState("");

  const inputCls =
    "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-sm outline-none transition " +
    "focus:border-blue-400 focus:ring-4 focus:ring-blue-100";
  const labelCls = "mb-2 block text-sm font-semibold text-slate-700";

  const tableRows = useMemo(() => classes, [classes]);

  async function refresh() {
    const res = await fetch("/api/classes", { cache: "no-store" });
    const data = await res.json();
    setClasses(data);
  }

  function openAdd() {
    setMode("ADD");
    setFormId("");
    setName("");
    setAcademicYear("2024/2025");
    setSemester("Ganjil");
    setWaliKelasId("");
    setOpen(true);
  }

  function openEdit(row: ClassRow) {
    setMode("EDIT");
    setFormId(row.id);
    setName(row.name);
    setAcademicYear(row.academicYear);
    setSemester((row.semester as any) || "Ganjil");
    setWaliKelasId(row.waliKelasId || "");
    setOpen(true);
  }

  async function onSubmit() {
    if (!name.trim()) return;

    setLoading(true);
    try {
      if (mode === "ADD") {
        await fetch("/api/classes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, academicYear, semester, waliKelasId }),
        });
      } else {
        await fetch("/api/classes", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: formId,
            name,
            academicYear,
            semester,
            waliKelasId,
          }),
        });
      }

      setOpen(false);
      await refresh();
    } finally {
      setLoading(false);
    }
  }

  async function onDelete(id: string) {
    const ok = confirm("Yakin hapus kelas ini?");
    if (!ok) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/classes?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        const msg = await res.json();
        alert(msg?.message ?? "Gagal menghapus kelas.");
      } else {
        await refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Semua Kelas</h1>

        <Button variant="primary" onClick={openAdd} disabled={loading}>
          + Tambah Kelas
        </Button>
      </div>

      {/* ===== DESKTOP TABLE ===== */}
<div className="hidden md:block overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
  <table className="w-full text-sm">
    <thead className="bg-slate-50">
      <tr>
        {[
          "No.",
          "Nama Kelas",
          "Wali Kelas",
          "Tahun Ajaran",
          "Semester",
          "Aksi",
        ].map((h) => (
          <th key={h} className="px-4 py-3 text-left font-semibold">
            {h}
          </th>
        ))}
      </tr>
    </thead>

    <tbody>
      {tableRows.map((row, idx) => {
        const href = `/kelas/${row.id}/siswa`;

        return (
          <tr key={row.id} className="border-t hover:bg-slate-50/50">
            <td className="px-4 py-3">{idx + 1}</td>
            <td className="px-4 py-3 font-semibold">{row.name}</td>
            <td className="px-4 py-3">{row.waliKelasName || "-"}</td>
            <td className="px-4 py-3">{row.academicYear}</td>
            <td className="px-4 py-3">{row.semester}</td>
            <td className="px-4 py-3">
              <div className="flex flex-wrap gap-2">
                <Link
                  href={href}
                  className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  Lihat Siswa
                </Link>

                <Button
                  variant="warning"
                  className="rounded-lg px-3 py-1 text-xs"
                  onClick={() => openEdit(row)}
                  disabled={loading}
                >
                  Edit
                </Button>

                <Button
                  variant="danger"
                  className="rounded-lg px-3 py-1 text-xs"
                  onClick={() => onDelete(row.id)}
                  disabled={loading}
                >
                  Hapus
                </Button>
              </div>
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
</div>

{/* ===== MOBILE CARDS ===== */}
<div className="grid gap-4 md:hidden">
  {tableRows.map((row, idx) => {
    const href = `/kelas/${row.id}/siswa`;

    return (
      <div
        key={row.id}
        className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5"
      >
        <div className="mb-2 text-sm text-slate-500">
          #{idx + 1}
        </div>

        <div className="text-lg font-extrabold">{row.name}</div>

        <div className="mt-2 space-y-1 text-sm text-slate-600">
          <div>
            <span className="font-semibold">Wali:</span>{" "}
            {row.waliKelasName || "-"}
          </div>
          <div>
            <span className="font-semibold">Tahun:</span>{" "}
            {row.academicYear}
          </div>
          <div>
            <span className="font-semibold">Semester:</span>{" "}
            {row.semester}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={href}
            className="flex-1 rounded-xl bg-emerald-600 py-2 text-center text-xs font-semibold text-white hover:bg-emerald-700"
          >
            Lihat Siswa
          </Link>

          <Button
            variant="warning"
            className="flex-1 rounded-xl py-2 text-xs"
            onClick={() => openEdit(row)}
            disabled={loading}
          >
            Edit
          </Button>

          <Button
            variant="danger"
            className="flex-1 rounded-xl py-2 text-xs"
            onClick={() => onDelete(row.id)}
            disabled={loading}
          >
            Hapus
          </Button>
        </div>
      </div>
    );
  })}

  {tableRows.length === 0 && (
    <div className="rounded-2xl bg-white py-12 text-center text-slate-500 shadow-sm ring-1 ring-black/5">
      Belum ada data kelas.
    </div>
  )}
</div>


      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={mode === "ADD" ? "Tambah Kelas" : "Edit Kelas"}
        subtitle="Isi data kelas, pilih wali kelas (opsional), lalu simpan."
        footer={
          <>
            <Button
              variant="warning"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button variant="primary" loading={loading} onClick={onSubmit}>
              {mode === "ADD" ? "Simpan" : "Update"}
            </Button>
          </>
        }
      >
        <div className="grid gap-5">
          <div>
            <label className={labelCls}>Nama Kelas</label>
            <input
              className={inputCls}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="contoh: Kelas 1 A"
              autoFocus
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Tahun Ajaran</label>
              <input
                className={inputCls}
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="contoh: 2024/2025"
              />
            </div>

            <div>
              <label className={labelCls}>Semester</label>
              <select
                className={inputCls + " font-semibold"}
                value={semester}
                onChange={(e) => setSemester(e.target.value as any)}
              >
                <option value="Ganjil">Ganjil</option>
                <option value="Genap">Genap</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls}>Wali Kelas (opsional)</label>
            <select
              className={inputCls + " font-semibold"}
              value={waliKelasId}
              onChange={(e) => setWaliKelasId(e.target.value)}
            >
              <option value="">- Pilih Wali Kelas -</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
}
