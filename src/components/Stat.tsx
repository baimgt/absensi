function Stat({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
      <div className="text-sm font-medium text-slate-500">{title}</div>
      <div className="mt-2 text-4xl font-extrabold text-slate-900">
        {value}
      </div>
    </div>
  );
}
