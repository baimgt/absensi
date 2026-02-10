"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Button from "@/components/ui/Button";
import LogoutButton from "@/components/LogoutButton";


const nav = [
  { label: "Dashboard", href: "/dashboard", group: "UTAMA" },
  { label: "Kelas", href: "/kelas", group: "KELAS" },
  { label: "Siswa", href: "/siswa", group: "KELAS" },
  { label: "Wali Kelas", href: "/wali-kelas", group: "KELAS" },
  { label: "Kehadiran", href: "/kehadiran", group: "KELAS" },
  { label: "Laporan", href: "/laporan", group: "LAPORAN" },
  { label: "Rekap Absensi", href: "/rekap-absensi", group: "LAPORAN" },
  { label: "Semester", href: "/pengaturan/semester", group: "PENGATURAN" },
  { label: "Tahun Ajaran", href: "/pengaturan/tahun-ajaran", group: "PENGATURAN" },
  { label: "Super Admin", href: "/admin/users", group: "PENGATURAN" },
];

export default function Sidebar() {
  const pathname = usePathname();

  const groups = Array.from(new Set(nav.map((n) => n.group)));

  return (
    <aside className="h-screen w-[260px] shrink-0 rounded-2xl bg-white/80 p-5 shadow-sm ring-1 ring-black/5">
      <div className="mb-6">
        <div className="text-lg font-extrabold">Onlen Sch.</div>
      </div>

      <div className="space-y-6">
        {groups.map((g) => (
          <div key={g}>
            <div className="mb-2 text-xs font-semibold tracking-wider text-slate-500">
              {g}
            </div>

            <div className="space-y-1">
              {nav
                .filter((n) => n.group === g)
                .map((n) => {
                  const active = pathname === n.href;
                  return (
                    <Link
                      key={n.href}
                      href={n.href}
                      className={[
                        "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition",
                        active
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-slate-700 hover:bg-slate-100",
                      ].join(" ")}
                    >
                      <span className="h-2 w-2 rounded-full bg-current opacity-70" />
                      {n.label}
                    </Link>
                  );
                })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 border-t pt-4">
        <Button className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100">
          Log Out
        </Button>
      </div>
    </aside>
  );
}
