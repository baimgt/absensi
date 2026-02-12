"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Html5Qrcode } from "html5-qrcode";



type LogRow = {
  name: string;
  kelas: string;
  pulang?: string;
  status: "Hadir" | "Terlambat" | "Belum Absen";
};

type Student = {
  nis: string;
  name: string;
};

type KehadiranClientProps = {
  initialAttendance: {
    id: string;
    studentId: string;
    classId: string;
    date: string;
    status: string;
    note?: string;
  }[];
};

type Jadwal = { label: string; start: string; end: string };

// ✅ 10 jadwal (kamu bisa ganti jamnya)
const jadwal: Jadwal[] = [
  { label: "Jadwal 1", start: "07:00", end: "07:10" },
  { label: "Jadwal 2", start: "07:30", end: "07:40" },
  { label: "Jadwal 3", start: "08:00", end: "08:10" },
  { label: "Jadwal 4", start: "08:30", end: "08:40" },
  { label: "Jadwal 5", start: "09:00", end: "09:10" },
  { label: "Jadwal 6", start: "09:30", end: "09:40" },
  { label: "Jadwal 7", start: "10:00", end: "10:10" },
  { label: "Jadwal 8", start: "10:30", end: "10:40" },
  { label: "Jadwal 9", start: "11:00", end: "11:10" },
  { label: "Jadwal 10", start: "21:30", end: "23:40" },
];

type AbsenLog = {
  time: string; // "07:30:01"
  nis: string;
  name: string;
  status: string;
  slot: string; // label jadwal
};

const TZ = "Asia/Makassar"; // WITA

function getNowWITA() {
  return new Date();
}

function formatTimeWITA(d: Date) {
  const parts = new Intl.DateTimeFormat("id-ID", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(d);

  const hh = parts.find((p) => p.type === "hour")?.value ?? "00";
  const mm = parts.find((p) => p.type === "minute")?.value ?? "00";
  const ss = parts.find((p) => p.type === "second")?.value ?? "00";
  return `${hh}.${mm}.${ss}`;
}

function formatDateWITA(d: Date) {
  const parts = new Intl.DateTimeFormat("id-ID", {
    timeZone: TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).formatToParts(d);

  const weekday = (parts.find((p) => p.type === "weekday")?.value ?? "").toUpperCase();
  const day = parts.find((p) => p.type === "day")?.value ?? "";
  const month = (parts.find((p) => p.type === "month")?.value ?? "").toUpperCase();
  const year = parts.find((p) => p.type === "year")?.value ?? "";
  return `${weekday}, ${day} ${month} ${year}`;
}

function getMinutesWITA(d: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);

  const hh = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const mm = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  return hh * 60 + mm;
}

function hmToMinutes(hm: string) {
  const [h, m] = hm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

function Card({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={
        "rounded-2xl bg-white/10 ring-1 ring-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-xl " +
        className
      }
    >
      {children}
    </div>
  );
}

function StatPill({
  title,
  value,
  icon,
  className = "",
}: {
  title: string;
  value: string;
  icon: string;
  className?: string;
}) {
  return (
    <div
      className={
        "flex items-center gap-3 rounded-xl bg-white/85 px-4 py-3 text-slate-900 shadow-sm ring-1 ring-black/5 " +
        className
      }
    >
      <div className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-lg">
        {icon}
      </div>
      <div className="leading-tight">
        <div className="text-xs font-semibold text-slate-500">{title}</div>
        <div className="text-sm font-extrabold">{value}</div>
      </div>
    </div>
  );
}



export default function KehadiranClient({ initialAttendance }: KehadiranClientProps) {
 const [now, setNow] = useState<Date>(() => getNowWITA());


  // input scan (NIS)
  const [scan, setScan] = useState("");
  const [inputEl, setInputEl] = useState<HTMLInputElement | null>(null);
  const scannerRef = useRef<HTMLDivElement | null>(null);
  const lastScannedRef = useRef<string>("");
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const [attendance, setAttendance] = useState<KehadiranClientProps["initialAttendance"]>(
  initialAttendance || []
);

// inisialisasi QR scanner
useEffect(() => {
  if (!scannerRef.current) return;

  const html5QrCode = new Html5Qrcode("qr-scanner");
  html5QrCodeRef.current = html5QrCode;

  html5QrCode.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 250 },
    (decodedText) => {
      const nis = decodedText.trim();
      if (nis && lastScannedRef.current !== nis) {
        lastScannedRef.current = nis;
        setScan(nis);
        onSubmitScan(nis);
      }
    },
    (errorMessage) => {
      // optional debug
    }
  ).catch(console.error);

  return () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.getState() === 2) { 
      // 2 = SCANNING, 1 = STOPPED, 0 = PAUSED
      html5QrCodeRef.current.stop().catch(() => {});
    }
    lastScannedRef.current = "";
  };
}, []);

  // hasil scan terakhir
  const [lastScan, setLastScan] = useState<{
    time: string;
    name: string;
    status: string;
  } | null>(null);

  // animasi & text notif
  const [successPulse, setSuccessPulse] = useState(false);
  const [successText, setSuccessText] = useState<string>("");

  // logs absen (max 10)
  const [logs, setLogs] = useState<AbsenLog[]>([]);

  // dummy stats card (biar UI tetap ada)
  const [rows] = useState<LogRow[]>([
    { name: "Nama Siswa", kelas: "Kelas 2", pulang: "-", status: "Belum Absen" },
    { name: "Nama Siswa", kelas: "Kelas 1A", pulang: "-", status: "Hadir" },
    { name: "Nama Siswa", kelas: "Kelas 2A", pulang: "-", status: "Terlambat" },
  ]);

  useEffect(() => {
    const t = setInterval(() => setNow(getNowWITA()), 250);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    inputEl?.focus();
  }, [inputEl]);

  const stats = useMemo(() => {
    const onTime = rows.filter((r) => r.status === "Hadir").length;
    const late = rows.filter((r) => r.status === "Terlambat").length;
    const notYet = rows.filter((r) => r.status === "Belum Absen").length;
    const total = rows.length;
    return { onTime, late, notYet, total };
  }, [rows]);

  // ✅ cek jadwal aktif
  const nowMin = getMinutesWITA(now);
  const activeSlot = jadwal.find((j) => {
    const s = hmToMinutes(j.start);
    const e = hmToMinutes(j.end);
    return nowMin >= s && nowMin <= e;
  });
  const canScan = Boolean(activeSlot);

  function beepSuccess() {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();

      const o1 = ctx.createOscillator();
      const g1 = ctx.createGain();

      o1.type = "sine";
      o1.frequency.value = 880;
      g1.gain.value = 0.08;

      o1.connect(g1);
      g1.connect(ctx.destination);

      o1.start();

      setTimeout(() => {
        o1.stop();
        ctx.close();
      }, 140);
    } catch {}
  }

 async function onSubmitScan(nisParam?: string) {
  const nis = nisParam ?? scan.trim();
  if (!nis) return;

  if (!activeSlot) {
    setSuccessText("⛔ Absen hanya bisa pada jam jadwal yang ditentukan");
    setSuccessPulse(true);
    setTimeout(() => setSuccessPulse(false), 700);
    return;
  }

  try {
    // POST ke API attendance
    const res = await fetch("/api/absen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nis, 
        date: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
        status: "HADIR",
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setSuccessText(`❌ ${data.message || "NIS tidak terdaftar"}`);
      setSuccessPulse(true);
      setTimeout(() => setSuccessPulse(false), 650);
      return;
    }

    // beep & log sukses
    beepSuccess();
    const time = formatTimeWITA(getNowWITA());

    setLastScan({
      time,
      name: data.name || "Nama Siswa", // kalau API ngirim name
      status: data.status ?? "Hadir",
    });

    setLogs((prev) => [
      {
        time,
        nis,
        name: data.name || "Siswa",
        status: data.status ?? "Hadir",
        slot: activeSlot.label,
      },
      ...prev,
    ].slice(0, 10));

    setSuccessText("✅ Absen berhasil");
    setSuccessPulse(true);
    setTimeout(() => setSuccessPulse(false), 700);

    setScan("");
    lastScannedRef.current = "";

    // update attendance state
    setAttendance((prev = []) => {
  const existing = prev.find((a) => a.studentId === data.studentId);
  if (existing) {
    return prev.map((a) =>
      a.studentId === data.studentId
        ? { ...a, status: "Hadir", note: "", date: formatTimeWITA(getNowWITA()) }
        : a
    );
  }
  return [
    {
      id: data.attendanceId || new Date().getTime().toString(),
      studentId: data.studentId,
      classId: data.student.classId,
      date: formatTimeWITA(getNowWITA()),
      status: "Hadir",
      note: "",
    },
    ...prev,
  ];
});
  } catch (err) {
    console.error(err);
    setSuccessText("❌ Terjadi kesalahan");
    setSuccessPulse(true);
    setTimeout(() => setSuccessPulse(false), 700);
  }
}




  return (
    <div className="min-h-screen w-full">
      <div className="relative min-h-screen w-full overflow-hidden p-6">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#061b4f] via-[#0a4fb5] to-[#19a4ff]" />
        <div className="absolute inset-0 -z-10 opacity-40">
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute right-[-140px] top-10 h-96 w-96 rounded-full bg-black/10 blur-3xl" />
          <div className="absolute bottom-[-120px] left-1/3 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        </div>

        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/15 text-white ring-1 ring-white/15">
              S
            </div>
            <div>
              <div className="text-lg font-extrabold text-white">
                ABSENSI SISWA DIGITAL
              </div>
              <div className="text-xs font-semibold text-white/70">
                Dashboard Kehadiran
              </div>
            </div>
          </div>

          <div className="hidden text-right md:block">
            <div className="text-xs font-semibold text-white/70">
              Waktu: <span className="font-extrabold">{formatTimeWITA(now)}</span>{" "}
              <span className="text-white/60">(WITA)</span>
            </div>
            <div className="text-xs font-semibold text-white/70">
              {formatDateWITA(now)}
            </div>
          </div>
        </div>

        {/* Layout 3 kolom */}
        <div className="grid gap-5 lg:grid-cols-[380px_1fr_420px]">
          {/* LEFT */}
          <div className="space-y-5">
            <Card className="p-5">
              <div className="text-xs font-extrabold text-white/80">LOGS ABSEN</div>

              <div className="mt-3 overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/10">
                <div className="grid grid-cols-[92px_1fr_90px] gap-2 bg-white/10 px-4 py-3 text-[11px] font-extrabold text-white/75">
                  <div>Waktu</div>
                  <div>Nama (NIS)</div>
                  <div>Jadwal</div>
                </div>

                <div className="divide-y divide-white/10">
                  {logs.length === 0 ? (
                    <div className="px-4 py-6 text-center text-xs font-semibold text-white/70">
                      Belum ada absen
                    </div>
                  ) : (
                    logs.map((l, i) => (
                      <div
                        key={i}
                        className="grid grid-cols-[92px_1fr_90px] gap-2 px-4 py-3 text-[11px] font-semibold text-white/90"
                      >
                        <div className="tabular-nums">{l.time}</div>
                        <div className="truncate">
                          {l.name} <span className="text-white/70">({l.nis})</span>
                        </div>
                        <div className="truncate text-white/80">{l.slot}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-white/10 p-5 text-center ring-1 ring-white/10">
                <div className="text-5xl font-black tracking-wide text-white">
                  {formatTimeWITA(now)}
                </div>
                <div className="mt-2 text-xs font-extrabold text-white/85">
                  {formatDateWITA(now)} <span className="text-white/70">(WITA)</span>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-amber-400/95 p-4 text-slate-900 shadow-sm">
                  <div className="text-xs font-extrabold">On Time</div>
                  <div className="mt-1 text-2xl font-black">{stats.onTime}</div>
                </div>

                <div className="rounded-2xl bg-pink-500/95 p-4 text-white shadow-sm">
                  <div className="text-xs font-extrabold">Terlambat</div>
                  <div className="mt-1 text-2xl font-black">{stats.late}</div>
                </div>

                <div className="rounded-2xl bg-indigo-500/95 p-4 text-white shadow-sm">
                  <div className="text-xs font-extrabold">Belum Absen</div>
                  <div className="mt-1 text-2xl font-black">{stats.notYet}</div>
                </div>

                <div className="rounded-2xl bg-slate-200/95 p-4 text-slate-900 shadow-sm">
                  <div className="text-xs font-extrabold">Total Absen</div>
                  <div className="mt-1 text-2xl font-black">{stats.total}</div>
                </div>
              </div>
            </Card>
          </div>

          {/* CENTER */}
          <div className="space-y-5">
            <Card className="p-6">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="text-base font-extrabold text-white/90">
                  Scan NIS Siswa
                </div>

                <motion.div
                  initial={false}
                  animate={successPulse ? { scale: [1, 1.02, 1] } : { scale: 1 }}
                  transition={{ duration: 0.35 }}
                  className="w-full max-w-[540px]"
                >
                  {successText ? (
                    <motion.div
                      key={successText}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ type: "spring", stiffness: 320, damping: 24 }}
                      className={
                        "mb-3 rounded-2xl px-4 py-3 text-sm font-extrabold shadow-sm ring-1 " +
                        (successText.includes("berhasil")
                          ? "bg-emerald-400/95 text-slate-900 ring-white/20"
                          : "bg-rose-500/95 text-white ring-white/20")
                      }
                    >
                      {successText}
                    </motion.div>
                  ) : null}
                </motion.div>

                <motion.div
                  className="w-full max-w-[540px] rounded-2xl bg-amber-400/95 p-3 ring-1 ring-white/25 shadow-sm"
                  initial={{ y: 6, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 320, damping: 26 }}
                >
                  <div className="flex gap-3">
                    <input
                      ref={(el) => setInputEl(el)}
                      value={scan}
                      onChange={(e) => setScan(e.target.value)}
                      placeholder="Tempel / ketik NIS..."
                      className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none ring-1 ring-black/10"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") onSubmitScan();
                      }}
                    />

                    <motion.button
                      whileTap={canScan ? { scale: 0.98 } : undefined}
                      whileHover={canScan ? { y: -1 } : undefined}
                      onClick={onSubmitScan}
                      disabled={!canScan}
                      className={
                        "rounded-xl px-5 py-3 text-sm font-extrabold shadow-sm " +
                        (canScan
                          ? "bg-slate-900 text-white"
                          : "bg-slate-900/40 text-white/60 cursor-not-allowed")
                      }
                    >
                      Scan
                    </motion.button>
                  </div>

                  <div className="mt-2 text-left text-[11px] font-semibold text-slate-900/80">
                    Status jadwal:{" "}
                    <span className={canScan ? "text-emerald-900" : "text-rose-900"}>
                      {canScan ? `AKTIF (${activeSlot?.label})` : "TIDAK AKTIF"}
                    </span>
                  </div>
                </motion.div>

                <div className="mt-4 grid w-full place-items-center">
                  <motion.div
                    animate={
                      successPulse
                        ? { boxShadow: "0 0 0 6px rgba(52, 211, 153, 0.25)" }
                        : { boxShadow: "0 0 0 0px rgba(0,0,0,0)" }
                    }
                    transition={{ duration: 0.35 }}
                    className="w-full max-w-[420px] rounded-3xl bg-white/10 p-8 text-center ring-1 ring-white/15"
                  >
                   <div
  id="qr-scanner"
  ref={scannerRef}
  className="mx-auto mb-4 w-full max-w-[320px] rounded-3xl overflow-hidden bg-white/15 ring-1 ring-white/15"
/>

                    <div className="text-xs font-semibold text-white/70">Waktu Absen</div>
                    <div className="mt-1 text-sm font-extrabold text-white">
                      {lastScan?.time ?? "--:--:--"}
                    </div>

                    <div className="mt-3 text-xs font-semibold text-white/70">
                      Nama Siswa
                    </div>
                    <div className="mt-1 text-lg font-black text-white">
                      {lastScan?.name ?? "Nama Siswa"}
                    </div>

                    <div className="mt-3 text-xs font-semibold text-white/70">Status</div>
                    <div className="mt-1 text-sm font-extrabold text-white">
                      {lastScan?.status ?? "Status"}
                    </div>
                  </motion.div>
                </div>
              </div>
            </Card>
          </div>

          {/* RIGHT */}
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <StatPill title="Total Siswa" value="-" icon="👥" />
              <StatPill title="Total Kelas" value="-" icon="🏫" />
              <StatPill title="Zona Waktu" value="WITA" icon="🕒" />
              <StatPill
                title="Jadwal Aktif"
                value={canScan ? activeSlot!.label : "-"}
                icon="📌"
              />
            </div>

            <Card className="p-5">
              <div className="mb-3 text-sm font-extrabold text-white/90">
                JADWAL ABSEN (10 WAKTU)
              </div>

              <div className="mb-3 rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
                <div className="text-[12px] font-extrabold text-white/85">
                  Status Saat Ini:{" "}
                  <span className={canScan ? "text-emerald-300" : "text-rose-300"}>
                    {canScan ? `AKTIF (${activeSlot?.label})` : "TIDAK AKTIF"}
                  </span>
                </div>
                <div className="mt-1 text-[11px] font-semibold text-white/70">
                  Absen hanya bisa jika jam WITA berada di salah satu rentang jadwal.
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/15">
                <div className="grid grid-cols-[1fr_150px] bg-white/10 px-4 py-3 text-[12px] font-extrabold text-white/80">
                  <div>Jadwal</div>
                  <div>Jam</div>
                </div>

                <div className="divide-y divide-white/10">
                  {jadwal.map((j) => {
                    const s = hmToMinutes(j.start);
                    const e = hmToMinutes(j.end);
                    const isActive = nowMin >= s && nowMin <= e;

                    return (
                      <div
                        key={j.label}
                        className="grid grid-cols-[1fr_150px] items-center px-4 py-3 text-[12px] font-semibold text-white/90"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={
                              "inline-block h-2.5 w-2.5 rounded-full " +
                              (isActive ? "bg-emerald-300" : "bg-white/30")
                            }
                          />
                          <span className="truncate">{j.label}</span>
                        </div>
                        <div className="tabular-nums text-white/85">
                          {j.start} - {j.end}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
