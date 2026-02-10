"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";

const menu = [
  { label: "Dashboard", href: "/dashboard", group: "UTAMA" },

  { label: "Kelas", href: "/kelas", group: "KELAS" },
  { label: "Siswa", href: "/siswa", group: "KELAS" },
  { label: "Wali Kelas", href: "/wali-kelas", group: "KELAS" },
  { label: "Kehadiran", href: "/kehadiran", group: "KELAS" },
  { label: "Kehadiran-Siswa", href: "/kehadiran-siswa", group: "KELAS" },

  { label: "Laporan", href: "/laporan", group: "LAPORAN" },
  { label: "Rekap Absensi", href: "/rekap", group: "LAPORAN" },

  { label: "Semester", href: "/semester", group: "PENGATURAN" },
  { label: "Tahun Ajaran", href: "/tahun-ajaran", group: "PENGATURAN" },
  { label: "Super Admin", href: "/super-admin", group: "PENGATURAN" },

  
];

export default function Sidebar() {
  const pathname = usePathname();

  const groups = ["UTAMA", "KELAS", "LAPORAN", "PENGATURAN"] as const;

  return (
    <aside className="w-[260px] rounded-[22px] bg-white/90 p-5 shadow-sm ring-1 ring-black/5 backdrop-blur">
      <div className="mb-8 text-xl font-extrabold">Onlen Sch.</div>

      {groups.map((g) => (
        <div key={g} className="mb-5">
          <div className="mb-2 text-xs font-bold tracking-widest text-slate-400">
            {g}
          </div>

          <div className="space-y-1">
            {menu
              .filter((m) => m.group === g)
              .map((m) => {
                const active =
                  pathname === m.href || pathname.startsWith(m.href + "/");

                return (
                  <Link
                    key={m.href}
                    href={m.href}
                    className={[
                      "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition",
                      "cursor-pointer select-none",
                      active
                        ? "bg-[#3f63e6] text-white shadow-sm"
                        : "text-slate-700 hover:bg-slate-100",
                    ].join(" ")}
                  >
                    {m.label}
                  </Link>
                );
              })}
          </div>
        </div>
      ))}
      <div className="p-3">
        <LogoutButton />
      </div>
    </aside>
  );
}
