import Link from "next/link";

export default function Pagination({ page, pages, basePath, params = {} }) {
  if (pages <= 1) return null;
  const mk = (p) => {
    const sp = new URLSearchParams({ ...params, page: String(p) });
    return `${basePath}?${sp.toString()}`;
  };
  const around = [];
  for (let p = Math.max(1, page - 2); p <= Math.min(pages, page + 2); p++) around.push(p);
  return (
    <div className="mt-8 flex items-center justify-center gap-2 text-sm">
      {page > 1 && <Link href={mk(page - 1)} className="btn-ghost">السابق</Link>}
      {around[0] > 1 && <span className="text-slate-500">…</span>}
      {around.map((p) => (
        <Link key={p} href={mk(p)}
          className={`rounded-lg px-3 py-2 ${p === page ? "bg-saudi text-white" : "border border-line hover:border-saudi"}`}>
          {p}
        </Link>
      ))}
      {around[around.length - 1] < pages && <span className="text-slate-500">…</span>}
      {page < pages && <Link href={mk(page + 1)} className="btn-ghost">التالي</Link>}
    </div>
  );
}
