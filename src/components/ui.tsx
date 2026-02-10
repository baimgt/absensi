import Link from "next/link";
import Button from "@/components/ui/Button";


export function PageTitle({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <h1 className="text-3xl font-extrabold text-slate-900">{title}</h1>
      {right}
    </div>
  );
}

export function CardStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
      <div className="text-sm font-semibold text-slate-600">{label}</div>
      <div className="mt-2 text-3xl font-extrabold text-slate-900">{value}</div>
    </div>
  );
}

export function BtnLink({
  href,
  variant,
  children,
}: {
  href: string;
  variant?: "primary" | "success" | "warning" | "danger";
  children: React.ReactNode;
}) {
  const cls =
    variant === "success"
      ? "bg-emerald-600 hover:bg-emerald-700"
      : variant === "warning"
      ? "bg-amber-500 hover:bg-amber-600"
      : variant === "danger"
      ? "bg-rose-600 hover:bg-rose-700"
      : "bg-blue-600 hover:bg-blue-700";
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition ${cls}`}
    >
      {children}
    </Link>
  );
}

export function Btn({
  variant,
  children,
  onClick,
  type,
}: {
  variant?: "primary" | "success" | "warning" | "danger";
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  const cls =
    variant === "success"
      ? "bg-emerald-600 hover:bg-emerald-700"
      : variant === "warning"
      ? "bg-amber-500 hover:bg-amber-600"
      : variant === "danger"
      ? "bg-rose-600 hover:bg-rose-700"
      : "bg-blue-600 hover:bg-blue-700";
  return (
    <Button
      type={type ?? "button"}
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition ${cls}`}
    >
      {children}
    </Button>
  );
}
