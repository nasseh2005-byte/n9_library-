import Link from "next/link";
import { getTagsFull } from "@/lib/data";
import { normalizeAr } from "@/lib/ar";

export const metadata = { title: "التاغات — N9 LIBRARY" };

export default function TagsPage({ searchParams }) {
  const q = (searchParams?.q || "").trim();
  const all = getTagsFull();
  const needle = normalizeAr(q);
  const filtered = q ? all.filter((t) => t.tn.includes(needle)) : all;
  const shown = filtered.slice(0, 300);
  const max = shown[0]?.count || 1;

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-white">
          التاغات <span className="text-base font-normal text-slate-400">({all.length.toLocaleString("ar-SA")} تاغ)</span>
        </h1>
        <form className="flex gap-2">
          <input name="q" defaultValue={q} className="input w-64" placeholder="ابحث في التاغات…" />
          <button className="btn-primary shrink-0">بحث</button>
        </form>
      </div>

      {q && (
        <div className="text-sm text-slate-400">
          {filtered.length.toLocaleString("ar-SA")} تاغ يطابق «{q}»
          {" — "}<Link href="/tags" className="text-saudi-light underline">عرض الكل</Link>
        </div>
      )}

      <div className="card flex flex-wrap items-baseline gap-x-4 gap-y-3 p-6">
        {shown.map(({ tag, count }) => {
          const scale = 0.8 + Math.min(1, count / max) * 0.8;
          return (
            <Link key={tag} href={`/tags/${encodeURIComponent(tag)}`}
              className="text-slate-300 hover:text-saudi-light transition-colors"
              style={{ fontSize: `${scale}rem` }}>
              {tag} <span className="text-[10px] text-slate-500">({count.toLocaleString("ar-SA")})</span>
            </Link>
          );
        })}
        {shown.length === 0 && <div className="text-slate-400">لا تاغات مطابقة</div>}
      </div>
      {filtered.length > 300 && (
        <div className="text-center text-xs text-slate-500">
          يعرض أعلى 300 تاغ — ضيّق البحث لرؤية البقية
        </div>
      )}
    </div>
  );
}
