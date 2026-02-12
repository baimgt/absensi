"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

type TeacherRow = {
  id: string;
  name: string;
  nip: string;
  phone: string;
};

export default function WaliKelasClient({
  initialTeachers,
}: {
  initialTeachers: TeacherRow[];
}) {
  const [teachers, setTeachers] = useState<TeacherRow[]>(initialTeachers);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"ADD" | "EDIT">("ADD");
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [formId, setFormId] = useState("");
  const [name, setName] = useState("");
  const [nip, setNip] = useState("");
  const [phone, setPhone] = useState("");

  const inputCls =
    "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-sm outline-none transition " +
    "focus:border-blue-400 focus:ring-4 focus:ring-blue-100";

  const labelCls = "mb-2 block text-sm font-semibold text-slate-700";

  async function refresh() {
    const res = await fetch("/api/teachers", { cache: "no-store" });
    const data = await res.json();
    setTeachers(data);
  }

 function openAdd() {
  setMode("ADD");
  setFormId("");
  setName("");
  setNip("");
  setPhone("");
  setPassword("");
  setOpen(true);
}

  function openEdit(t: TeacherRow) {
    setMode("EDIT");
    setFormId(t.id);
    setName(t.name);
    setNip(t.nip ?? "");
    setPhone(t.phone ?? "");
    setOpen(true);
  }

  async function onSubmit() {
    if (!name.trim()) return;

    setLoading(true);
    try {
      if (mode === "ADD") {
        await fetch("/api/teachers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, nip, phone, password }),
        });
      } else {
        await fetch("/api/teachers", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: formId, name, nip, phone }),
        });
      }
      setOpen(false);
      await refresh();
    } finally {
      setLoading(false);
    }
  }

  async function onDelete(id: string) {
    const ok = confirm("Yakin hapus wali kelas ini?");
    if (!ok) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/teachers?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        const msg = await res.json();
        alert(msg?.message ?? "Gagal menghapus.");
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
        <h1 className="text-2xl font-extrabold">Wali Kelas</h1>
        <Button variant="primary" onClick={openAdd} disabled={loading}>
          + Tambah Wali Kelas
        </Button>
      </div>

      {/* ===== DESKTOP TABLE ===== */}
<div className="hidden md:block overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
  <table className="w-full text-sm">
    <thead className="bg-slate-50">
      <tr>
        {["No.", "Nama", "NIP", "No. HP", "Aksi"].map((h) => (
          <th key={h} className="px-4 py-3 text-left font-semibold">
            {h}
          </th>
        ))}
      </tr>
    </thead>

    <tbody>
      {teachers.map((t, idx) => (
        <tr key={t.id} className="border-t hover:bg-slate-50/50">
          <td className="px-4 py-3">{idx + 1}</td>
          <td className="px-4 py-3 font-semibold">{t.name}</td>
          <td className="px-4 py-3">{t.nip || "-"}</td>
          <td className="px-4 py-3">{t.phone || "-"}</td>
          <td className="px-4 py-3">
            <div className="flex gap-2">
              <Button
                variant="warning"
                className="rounded-lg px-3 py-1 text-xs"
                onClick={() => openEdit(t)}
                disabled={loading}
              >
                Edit
              </Button>
              <Button
                variant="danger"
                className="rounded-lg px-3 py-1 text-xs"
                onClick={() => onDelete(t.id)}
                disabled={loading}
              >
                Hapus
              </Button>
            </div>
          </td>
        </tr>
      ))}

      {teachers.length === 0 && (
        <tr>
          <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
            Belum ada data wali kelas.
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>

{/* ===== MOBILE CARD VIEW ===== */}
<div className="grid gap-4 md:hidden">
  {teachers.map((t, idx) => (
    <div
      key={t.id}
      className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5"
    >
      <div className="text-sm text-slate-500">#{idx + 1}</div>

      <div className="mt-1 text-lg font-extrabold">{t.name}</div>

      <div className="mt-2 space-y-1 text-sm text-slate-600">
        <div>
          <span className="font-semibold">NIP:</span>{" "}
          {t.nip || "-"}
        </div>
        <div>
          <span className="font-semibold">No. HP:</span>{" "}
          {t.phone || "-"}
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <Button
          variant="warning"
          className="flex-1 rounded-xl py-2 text-xs"
          onClick={() => openEdit(t)}
          disabled={loading}
        >
          Edit
        </Button>

        <Button
          variant="danger"
          className="flex-1 rounded-xl py-2 text-xs"
          onClick={() => onDelete(t.id)}
          disabled={loading}
        >
          Hapus
        </Button>
      </div>
    </div>
  ))}

  {teachers.length === 0 && (
    <div className="rounded-2xl bg-white py-12 text-center text-slate-500 shadow-sm ring-1 ring-black/5">
      Belum ada data wali kelas.
    </div>
  )}
</div>



      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={mode === "ADD" ? "Tambah Wali Kelas" : "Edit Wali Kelas"}
        subtitle="Isi data guru/wali kelas, lalu simpan."
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
            <label className={labelCls}>Nama</label>
            <input
              className={inputCls}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="contoh: Muhammad Yunus Almeida"
              autoFocus
            />
          </div>

          <div>
  <label className={labelCls}>Password Login</label>
  <input
    type="password"
    className={inputCls}
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    placeholder="Password untuk login wali"
  />
</div>

          <div>
            <label className={labelCls}>NIP (opsional)</label>
            <input
              className={inputCls}
              value={nip}
              onChange={(e) => setNip(e.target.value)}
              placeholder="contoh: 1987xxxxxx"
            />
          </div>

          <div>
            <label className={labelCls}>No. HP (opsional)</label>
            <input
              className={inputCls}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="contoh: 08xxxxxxxxxx"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
