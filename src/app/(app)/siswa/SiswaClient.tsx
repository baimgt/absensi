"use client";

import { useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { QRCodeCanvas } from "qrcode.react";


type ClassRow = { id: string; name: string };
type StudentRow = {
  id: string;
  nis: string;
  name: string;
  classId: string;
  className: string;
};

export default function SiswaClient({
  initialClasses,
  initialStudents,
}: {
  initialClasses: ClassRow[];
  initialStudents: StudentRow[];
}) {
  const [classes] = useState<ClassRow[]>(initialClasses);
  const [students, setStudents] = useState<StudentRow[]>(initialStudents);

  const [filterClassId, setFilterClassId] = useState<string>("ALL");

  // modal add/edit
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"ADD" | "EDIT">("ADD");
  const [loading, setLoading] = useState(false);

  const [formId, setFormId] = useState<string>("");
  const [formNis, setFormNis] = useState<string>("");
  const [formName, setFormName] = useState<string>("");
  const [formClassId, setFormClassId] = useState<string>(classes[0]?.id ?? "");
  const inputCls =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-sm outline-none transition " +
  "focus:border-blue-400 focus:ring-4 focus:ring-blue-100";

const labelCls = "mb-2 block text-sm font-semibold text-slate-700";


  const filtered = useMemo(() => {
    if (filterClassId === "ALL") return students;
    return students.filter((s) => s.classId === filterClassId);
  }, [students, filterClassId]);

  function openAdd() {
    setMode("ADD");
    setFormId("");
    setFormNis("");
    setFormName("");
    setFormClassId(classes[0]?.id ?? "");
    setOpen(true);
  }

  function openEdit(s: StudentRow) {
    setMode("EDIT");
    setFormId(s.id);
    setFormNis(s.nis);
    setFormName(s.name);
    setFormClassId(s.classId);
    setOpen(true);
  }

  function downloadQR(student: StudentRow) {
  const canvas = document.createElement("canvas");
  const qrValue = student.nis; // atau JSON { nis, name, class } kalau mau lebih lengkap
  const qr = <QRCodeCanvas value={qrValue} size={256} />;

  // render QR ke canvas sementara
  const tempDiv = document.createElement("div");
  tempDiv.style.position = "absolute";
  tempDiv.style.left = "-9999px";
  document.body.appendChild(tempDiv);
  import("react-dom/client").then(({ createRoot }) => {
    const root = createRoot(tempDiv);
    root.render(qr);

    setTimeout(() => {
      const canvasEl = tempDiv.querySelector("canvas") as HTMLCanvasElement;
      if (canvasEl) {
        const link = document.createElement("a");
        link.href = canvasEl.toDataURL("image/png");
        link.download = `QR-${student.nis}.png`;
        link.click();
      }
      root.unmount();
      tempDiv.remove();
    }, 100);
  });
}


  async function refreshList() {
    const qs = filterClassId === "ALL" ? "" : `?classId=${filterClassId}`;
    const res = await fetch(`/api/students${qs}`, { cache: "no-store" });
    const data = await res.json();
    // server mengembalikan className juga (lihat API di bawah)
    setStudents(data);
  }

  async function onSubmit() {
    if (!formNis || !formName || !formClassId) return;

    setLoading(true);
    try {
      if (mode === "ADD") {
        await fetch("/api/students", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nis: formNis,
            name: formName,
            classId: formClassId,
          }),
        });
      } else {
        await fetch("/api/students", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: formId,
            nis: formNis,
            name: formName,
            classId: formClassId,
          }),
        });
      }

      setOpen(false);
      await refreshList();
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
      await refreshList();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Siswa</h1>

        <div className="flex items-center gap-3">
          <select
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm"
            value={filterClassId}
            onChange={(e) => setFilterClassId(e.target.value)}
          >
            <option value="ALL">Semua Kelas</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <Button variant="primary" onClick={openAdd} disabled={loading}>
            + Tambah Siswa
          </Button>
        </div>
      </div>

      <div className="hidden md:block overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
  <table className="w-full text-sm">
    <thead className="bg-slate-50">
      <tr>
        {["No.", "NIS", "Nama Siswa", "Kelas", "Aksi"].map((h) => (
          <th key={h} className="px-4 py-3 text-left font-semibold">
            {h}
          </th>
        ))}
      </tr>
    </thead>

    <tbody>
      {filtered.map((s, idx) => (
        <tr key={s.id} className="border-t hover:bg-slate-50/50">
          <td className="px-4 py-3">{idx + 1}</td>
          <td className="px-4 py-3">{s.nis}</td>
          <td className="px-4 py-3 font-semibold">{s.name}</td>
          <td className="px-4 py-3">{s.className}</td>
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
              <Button
                variant="primary"
                className="rounded-lg px-3 py-1 text-xs"
                onClick={() => downloadQR(s)}
              >
                QR
              </Button>
            </div>
          </td>
        </tr>
      ))}

      {filtered.length === 0 && (
        <tr>
          <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
            Belum ada data siswa.
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>

{/* ===== MOBILE CARD VIEW ===== */}
<div className="grid gap-4 md:hidden">
  {filtered.map((s, idx) => (
    <div
      key={s.id}
      className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5"
    >
      <div className="text-sm text-slate-500">#{idx + 1}</div>

      <div className="mt-1 text-lg font-extrabold">{s.name}</div>

      <div className="mt-2 space-y-1 text-sm text-slate-600">
        <div>
          <span className="font-semibold">NIS:</span> {s.nis}
        </div>
        <div>
          <span className="font-semibold">Kelas:</span> {s.className}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          variant="warning"
          className="flex-1 rounded-xl py-2 text-xs"
          onClick={() => openEdit(s)}
          disabled={loading}
        >
          Edit
        </Button>

        <Button
          variant="danger"
          className="flex-1 rounded-xl py-2 text-xs"
          onClick={() => onDelete(s.id)}
          disabled={loading}
        >
          Hapus
        </Button>

        <Button
          variant="primary"
          className="flex-1 rounded-xl py-2 text-xs"
          onClick={() => downloadQR(s)}
        >
          QR
        </Button>
      </div>
    </div>
  ))}

  {filtered.length === 0 && (
    <div className="rounded-2xl bg-white py-12 text-center text-slate-500 shadow-sm ring-1 ring-black/5">
      Belum ada data siswa.
    </div>
  )}
</div>


      {/* MODAL */}
     <Modal
  open={open}
  onClose={() => setOpen(false)}
  title={mode === "ADD" ? "Tambah Siswa" : "Edit Siswa"}
  subtitle="Isi data dengan benar lalu simpan."
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
      <label className="mb-2 block text-sm font-semibold text-slate-700">NIS</label>
      <input
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
        value={formNis}
        onChange={(e) => setFormNis(e.target.value)}
        placeholder="contoh: 9522222"
      />
    </div>

    {formNis && (
  <div className="mt-4 flex flex-col items-center">
    <div className="text-sm font-semibold text-slate-700">Preview QR</div>
    <QRCodeCanvas
      value={formNis}
      size={120}
      className="mt-2"
      bgColor="#ffffff"  // background putih
      fgColor="#b43939"  // foreground hitam
      level="H"           // level koreksi error tertinggi
    />
  </div>
)}

    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        Nama Siswa
      </label>
      <input
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
        value={formName}
        onChange={(e) => setFormName(e.target.value)}
        placeholder="contoh: Indah Yolanda"
      />
    </div>

    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">Kelas</label>
      <select
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
        value={formClassId}
        onChange={(e) => setFormClassId(e.target.value)}
      >
        {classes.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  </div>
</Modal>


    </div>
  );
}
