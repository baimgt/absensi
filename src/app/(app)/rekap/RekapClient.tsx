"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";

type ClassRow = { id: string; name: string };
type RekapRow = {
  nis: string;
  name: string;
  hadir: number;
  sakit: number;
  izin: number;
  alpa: number;
  total: number;
};

export default function RekapClient({ classes }: { classes: ClassRow[] }) {
  const [selected, setSelected] = useState<ClassRow | null>(null);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [rows, setRows] = useState<RekapRow[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadRekap(c: ClassRow) {
    setSelected(c);
    setLoading(true);
    try {
      const qs = new URLSearchParams({
        classId: c.id,
        start,
        end,
      });
      const res = await fetch(`/api/rekap?${qs.toString()}`);
      const data = await res.json();
      setRows(data.rows ?? []);
    } finally {
      setLoading(false);
    }
  }

  function exportExcel() {
    if (!selected) return;
    const qs = new URLSearchParams({
      classId: selected.id,
      className: selected.name,
      start,
      end,
    });
    window.location.href = `/api/rekap/export?${qs.toString()}`;
  }

  const recap = useMemo(() => {
    return rows.reduce(
      (acc, r) => {
        acc.hadir += r.hadir || 0;
        acc.sakit += r.sakit || 0;
        acc.izin += r.izin || 0;
        acc.alpa += r.alpa || 0;
        acc.total += r.total || 0;
        return acc;
      },
      { hadir: 0, sakit: 0, izin: 0, alpa: 0, total: 0 }
    );
  }, [rows]);

  return (
    <div>
      <div className="mx-auto max-w-7xl">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Rekap Absensi</h1>
            <p className="text-sm font-semibold text-slate-500">
              Pilih kelas dulu, lalu tampil rekap. Bisa export ke Excel.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold"
            />
            
            <button
              onClick={exportExcel}
              disabled={!selected || loading}
              className={
                "rounded-xl px-4 py-2 text-sm font-extrabold shadow-sm " +
                (!selected || loading
                  ? "bg-slate-300 text-slate-600 cursor-not-allowed"
                  : "bg-emerald-600 text-white hover:bg-emerald-700")
              }
            >
              Export Excel
            </button>
          </div>
        </div>

        {/* LIST KELAS DULU */}
        {!selected ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {classes.map((c) => (
              <motion.button
                key={c.id}
                whileTap={{ scale: 0.98 }}
                whileHover={{ y: -2 }}
                onClick={() => loadRekap(c)}
                className="text-left rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 hover:ring-black/10"
              >
                <div className="text-xs font-extrabold text-slate-500">KELAS</div>
                <div className="mt-1 text-lg font-black text-slate-900">{c.name}</div>
                <div className="mt-2 text-sm font-semibold text-slate-500">
                  Klik untuk lihat rekap
                </div>
              </motion.button>
            ))}
          </div>
        ) : (
          <>
            {/* HEADER KELAS */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
              <div>
                <div className="text-xs font-extrabold text-slate-500">KELAS DIPILIH</div>
                <div className="text-xl font-black text-slate-900">{selected.name}</div>
                <div className="text-xs font-semibold text-slate-500">
                  Periode: {start || "SEMUA"} → {end || "SEMUA"}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => loadRekap(selected)}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-extrabold text-white hover:bg-slate-800"
                >
                  Refresh
                </button>
                <button
                  onClick={() => {
                    setSelected(null);
                    setRows([]);
                  }}
                  className="rounded-xl bg-slate-200 px-4 py-2 text-sm font-extrabold text-slate-900 hover:bg-slate-300"
                >
                  Kembali
                </button>
              </div>
            </div>

            {/* REKAP TOTAL */}
            <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-5">
              <Stat title="Hadir" value={recap.hadir} cls="bg-emerald-600 text-white" />
              <Stat title="Sakit" value={recap.sakit} cls="bg-amber-400 text-slate-900" />
              <Stat title="Izin" value={recap.izin} cls="bg-sky-600 text-white" />
              <Stat title="Alpa" value={recap.alpa} cls="bg-rose-600 text-white" />
              <Stat title="Total" value={recap.total} cls="bg-slate-900 text-white" />
            </div>

            {/* TABLE */}
           <div className="hidden md:block overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
              <div className="grid grid-cols-[70px_120px_1fr_90px_90px_90px_90px_90px] bg-slate-50 px-4 py-3 text-xs font-extrabold text-slate-600">
                <div>No</div>
                <div>NIS</div>
                <div>Nama</div>
                <div>Hadir</div>
                <div>Sakit</div>
                <div>Izin</div>
                <div>Alpa</div>
                <div>Total</div>
              </div>

              {loading ? (
                <div className="p-10 text-center text-sm font-semibold text-slate-500">
                  Loading...
                </div>
              ) : rows.length === 0 ? (
                <div className="p-10 text-center text-sm font-semibold text-slate-500">
                  Belum ada data untuk periode ini.
                </div>
              ) : (
                rows.map((r, i) => (
                  <div
                    key={`${r.nis}-${i}`}
                    className="grid grid-cols-[70px_120px_1fr_90px_90px_90px_90px_90px] items-center border-t px-4 py-3 text-sm"
                  >
                    <div className="font-bold text-slate-600">{i + 1}</div>
                    <div className="font-semibold">{r.nis}</div>
                    <div className="font-extrabold text-slate-900">{r.name}</div>
                    <div>{r.hadir}</div>
                    <div>{r.sakit}</div>
                    <div>{r.izin}</div>
                    <div>{r.alpa}</div>
                    <div className="font-black">{r.total}</div>
                  </div>
                ))
              )}
            </div>

            {/* ================= MOBILE CARD ================= */}
<div className="grid gap-4 md:hidden">
  {loading ? (
    <div className="rounded-2xl bg-white py-10 text-center text-sm font-semibold text-slate-500 shadow-sm ring-1 ring-black/5">
      Loading...
    </div>
  ) : rows.length === 0 ? (
    <div className="rounded-2xl bg-white py-10 text-center text-sm font-semibold text-slate-500 shadow-sm ring-1 ring-black/5">
      Belum ada data untuk periode ini.
    </div>
  ) : (
    rows.map((r, i) => (
      <div
        key={`${r.nis}-${i}`}
        className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5"
      >
        <div className="flex items-center justify-between">
          <div className="text-xs font-extrabold text-slate-500">
            #{i + 1}
          </div>
          <div className="text-xs font-bold text-slate-500">
            NIS: {r.nis}
          </div>
        </div>

        <div className="mt-1 text-lg font-black text-slate-900">
          {r.name}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm font-extrabold">
          <StatMini title="Hadir" value={r.hadir} cls="bg-emerald-600 text-white" />
          <StatMini title="Sakit" value={r.sakit} cls="bg-amber-400 text-slate-900" />
          <StatMini title="Izin" value={r.izin} cls="bg-sky-600 text-white" />
          <StatMini title="Alpa" value={r.alpa} cls="bg-rose-600 text-white" />
        </div>

        <div className="mt-3 rounded-xl bg-slate-900 px-4 py-2 text-center text-sm font-black text-white">
          Total: {r.total}
        </div>
      </div>
    ))
  )}
</div>

          </>
          
        )}
      </div>
    </div>
  );
}

function StatMini({
  title,
  value,
  cls,
}: {
  title: string;
  value: number;
  cls: string;
}) {
  return (
    <div className={"rounded-xl px-3 py-2 text-center shadow-sm " + cls}>
      <div className="text-xs font-extrabold opacity-90">{title}</div>
      <div className="text-lg font-black">{value}</div>
    </div>
  );
}


function Stat({ title, value, cls }: { title: string; value: number; cls: string }) {
  return (
    <div className={"rounded-2xl p-4 shadow-sm ring-1 ring-black/5 " + cls}>
      <div className="text-xs font-extrabold opacity-90">{title}</div>
      <div className="mt-1 text-2xl font-black">{value}</div>
    </div>
  );
}
