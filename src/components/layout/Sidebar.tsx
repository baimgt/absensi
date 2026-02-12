"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import LogoutButton from "@/components/LogoutButton";

type Role = "ADMIN" | "WALI" | "SISWA";

const menu = [
  { label: "Dashboard", href: "/dashboard", group: "UTAMA", roles: ["ADMIN","WALI","SISWA"] },
  { label: "Kelas", href: "/kelas", group: "KELAS", roles: ["ADMIN","WALI"] },
  { label: "Siswa", href: "/siswa", group: "KELAS", roles: ["ADMIN","WALI"] },
  { label: "Wali Kelas", href: "/wali-kelas", group: "KELAS", roles: ["ADMIN"] },
  { label: "Kehadiran", href: "/kehadiran", group: "KELAS", roles: ["ADMIN","WALI"] },
  { label: "Kehadiran-Siswa", href: "/kehadiran-siswa", group: "KELAS", roles: ["ADMIN","WALI"] },
  { label: "Laporan", href: "/laporan", group: "LAPORAN", roles: ["ADMIN"] },
  { label: "Rekap Absensi", href: "/rekap", group: "LAPORAN", roles: ["ADMIN","WALI","SISWA"] },
  { label: "Semester", href: "/semester", group: "PENGATURAN", roles: ["ADMIN"] },
  { label: "Tahun Ajaran", href: "/tahun-ajaran", group: "PENGATURAN", roles: ["ADMIN"] },
  { label: "Super Admin", href: "/superadmin", group: "PENGATURAN", roles: ["ADMIN"] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [role, setRole] = useState<Role | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => setRole(data?.role ?? null))
      .catch(() => setRole(null));
  }, []);

  const groups = ["UTAMA", "KELAS", "LAPORAN", "PENGATURAN"] as const;

  return (
    <>
      {/* Tombol hamburger (mobile only) */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 rounded-lg bg-white p-2 shadow"
      >
        ☰
      </button>

      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* ===== DESKTOP (ASLI, TIDAK DIUBAH) ===== */}
      <aside className="hidden md:block w-[260px] rounded-[22px] bg-white/90 p-5 shadow-sm ring-1 ring-black/5 backdrop-blur">
        <SidebarContent
          pathname={pathname}
          role={role}
          groups={groups}
        />
      </aside>

      {/* ===== MOBILE (SLIDE) ===== */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: isOpen ? 0 : -300 }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
        className="fixed top-0 left-0 z-50 h-full w-[260px] rounded-r-[22px] bg-white/90 p-5 shadow-sm ring-1 ring-black/5 backdrop-blur md:hidden"
      >
        <SidebarContent
          pathname={pathname}
          role={role}
          groups={groups}
          onNavigate={() => setIsOpen(false)}
        />
      </motion.aside>
    </>
  );
}

/* ===== DIPISAH BIAR RAPI ===== */
function SidebarContent({
  pathname,
  role,
  groups,
  onNavigate,
}: {
  pathname: string;
  role: Role | null;
  groups: readonly string[];
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className="mb-8 text-xl font-extrabold">Onlen Sch.</div>

      {groups.map((g) => {
        const items = menu.filter(
          (m) => m.group === g && role && m.roles.includes(role)
        );
        if (!items.length) return null;

        return (
          <div key={g} className="mb-5">
            <div className="mb-2 text-xs font-bold tracking-widest text-slate-400">
              {g}
            </div>

            <div className="space-y-1">
              {items.map((m) => {
                const active =
                  pathname === m.href || pathname.startsWith(m.href + "/");

                return (
                  <Link
                    key={m.href}
                    href={m.href}
                    onClick={onNavigate}
                    className={[
                      "flex rounded-xl px-3 py-3 text-sm font-semibold transition",
                      active
                        ? "bg-[#3f63e6] text-white"
                        : "text-slate-700 hover:bg-slate-100",
                    ].join(" ")}
                  >
                    {m.label}
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}

      <div className="p-3">
        <LogoutButton />
      </div>
    </>
  );
}
