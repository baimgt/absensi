"use client";

import Link from "next/link";
import { useState } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

type StudentRow = {
  id: string;
  nis: string;
  name: string;
};

export default function SiswaKelasClient({
  classId,
  className,
  initialStudents,
}: {
  classId: string;
  className: string;
  initialStudents: StudentRow[];
}) {
  const [students, setStudents] = useState<StudentRow[]>(initialStudents);

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"ADD" | "EDIT">("ADD");
  const [loading, setLoading] = useState(false);

  const [formId, setFormId] = useState("");
  const [nis, setNis] = useState("");
  const [name, setName] = useState("");

  const inputCls =
    "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-sm outline-none transition " +
    "focus:border-blue-400 focus:ring-4 focus:ring-blue-100";

  const labelCls = "mb-2 block text-sm font-semibold text-slate-700";

  async function refresh() {
    const res = await fetch(`/api/students?classId=${classId}`, {
      cache: "no-store",
    });
    const data = await res.json();

    // API /api/students ngasih className juga; kita cuma pakai id/nis/name
    setStudents(
      (data ?? []).map((x: any) => ({
        id: String(x.id ?? x._id ?? ""),
        nis: String(x.nis ?? ""),
        name: String(x.name ?? ""),
      }))
    );
  }

  function openAdd() {
    setMode("ADD");
    setFormId("");
    setNis("");
    setName("");
    setOpen(true);
  }

  function openEdit(s: StudentRow) {
    setMode("EDIT");
    setFormId(s.id);
    setNis(s.nis);
    setName(s.name);
    setOpen(true);
  }

  async function onSubmit() {
    if (!nis.trim() || !name.trim()) return;

    setLoading(true);
    try {
      if (mode === "ADD") {
        await fetch("/api/students", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nis, name, classId }),
        });
      } else {
        await fetch("/api/students", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: formId, nis, name, classId }),
        });
      }

      setOpen(false);
      await refresh();
    } finally {
      setLoading(false);
    }
  }

  async function onDelete(id: string) {
    const ok = confirm("Yakin hapus siswa ini?");
    if (!ok) return;

    setLoading(true);
    try {
      await fetch(`/api/students?id=${id}`, { method: "DELETE" });
      await refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-3 text-sm font-semibold text-slate-600">
        <Link href="/kelas" className="hover:underline">
          Kelas
        </Link>{" "}
        <span className="mx-2 text-slate-400">/</span>
        <span className="text-slate-900">{className}</span>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">Siswa Kelas {className}</h1>
          <div className="mt-1 text-sm text-slate-500">
            Total: <span className="font-semibold">{students.length}</span> siswa
          </div>
        </div>

        <Button variant="primary" onClick={openAdd} disabled={loading}>
          + Tambah Siswa
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              {["No.", "NIS", "Nama Siswa", "Aksi"].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {students.map((s, idx) => (
              <tr key={s.id} className="border-t hover:bg-slate-50/50">
                <td className="px-4 py-3">{idx + 1}</td>
                <td className="px-4 py-3">{s.nis}</td>
                <td className="px-4 py-3 font-semibold">{s.name}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button
                      variant="warning"
                      className="rounded-lg px-3 py-1 text-xs"
                      onClick={() => openEdit(s)}
                      disabled={loading}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      className="rounded-lg px-3 py-1 text-xs"
                      onClick={() => onDelete(s.id)}
                      disabled={loading}
                    >
                      Hapus
                    </Button>
                  </div>
                </td>
              </tr>
            ))}

            {students.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-slate-500">
                  Belum ada siswa di kelas ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={mode === "ADD" ? "Tambah Siswa" : "Edit Siswa"}
        subtitle={`Kelas: ${className}`}
        footer={
          <>
            <Button variant="warning" onClick={() => setOpen(false)} disabled={loading}>
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
            <label className={labelCls}>NIS</label>
            <input
              className={inputCls}
              value={nis}
              onChange={(e) => setNis(e.target.value)}
              placeholder="contoh: 9522222"
              autoFocus
            />
          </div>

          <div>
            <label className={labelCls}>Nama Siswa</label>
            <input
              className={inputCls}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="contoh: Indah Yolanda"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
