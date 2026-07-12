import Link from "next/link";

export default function DocCard({ d }) {
  return (
    <Link href={`/doc/${d.id}`} className="card block p-4 hover:border-saudi transition-colors">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold leading-7 text-slate-100">{d.t}</h3>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
          d.v ? "bg-saudi/15 text-saudi-light" : "bg-slate-500/15 text-slate-400"
        }`}>
          {d.v ? "سارية" : "غير سارية"}
        </span>
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
        <span>{d.cat}</span>
        {d.y ? <span>{d.y}هـ</span> : null}
        {d.n ? <span>رقم {d.n}</span> : null}
        {d.ins ? <span>{d.ins}</span> : null}
      </div>
      {d.tags?.length ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {d.tags.slice(0, 6).map((t) => (
            <span key={t} className="tag-pill">{t}</span>
          ))}
        </div>
      ) : null}
    </Link>
  );
}
