"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function SearchInner() {
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get("q") || "");
  const [validOnly, setValidOnly] = useState(false);
  const [cat, setCat] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("broad");

  async function run(query) {
    if (!query.trim()) return;
    setLoading(true);
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&mode=${mode}`);
    setData(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    const initial = sp.get("q");
    if (initial) run(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cats = data ? [...new Set(data.results.map((r) => r.category))] : [];
  const filtered = (data?.results || []).filter(
    (r) => (!validOnly || r.valid === 1) && (!cat || r.category === cat)
  );
  const best = filtered[0];

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-bold text-white">البحث الذكي</h1>
      <form onSubmit={(e) => { e.preventDefault(); setCat(""); run(q); }} className="flex gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} className="input"
          placeholder="اكتب سؤالك — التطبيع تلقائي: «الاداره» تجد «الإدارة»…" />
        <button className="btn-primary shrink-0" disabled={loading}>
          {loading ? "يبحث…" : "بحث"}
        </button>
      </form>
      <div className="flex gap-2"><button onClick={() => setMode("broad")} className={mode === "broad" ? "btn-primary" : "btn-ghost"}>بحث شامل</button><button onClick={() => setMode("exact")} className={mode === "exact" ? "btn-primary" : "btn-ghost"}>بحث دقيق</button></div>

      {data && data.results.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <button onClick={() => setValidOnly(!validOnly)}
            className={`tag-pill ${validOnly ? "border-saudi text-saudi-light" : ""}`}>
            السارية فقط {validOnly ? "✓" : ""}
          </button>
          {cats.slice(0, 5).map((c) => (
            <button key={c} onClick={() => setCat(cat === c ? "" : c)}
              className={`tag-pill ${cat === c ? "border-saudi text-saudi-light" : ""}`}>
              {c} {cat === c ? "✓" : ""}
            </button>
          ))}
          <span className="mr-auto text-slate-500">
            {filtered.length} من {data.total} نتيجة {data.relaxed ? "(بحث موسّع)" : ""}
          </span>
        </div>
      )}

      {best ? (
        <div className="card border-saudi/40 p-6">
          <div className="text-xs font-semibold text-gold">أفضل نتيجة — الجواب المقترح</div>
          <Link href={`/doc/${best.id}`} className="mt-1 block text-lg font-bold text-white hover:text-saudi-light">
            {best.title}
          </Link>
          {best.snippet ? <p className="mt-2 leading-8 text-slate-300">{best.snippet}…</p> : null}
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-400">
            <span>{best.category}</span>
            {best.year ? <span>{best.year}هـ</span> : null}
            {best.number ? <span>رقم {best.number}</span> : null}
            <span className={best.valid === 1 ? "text-saudi-light" : "text-slate-500"}>
              {best.valid === 1 ? "سارية" : "غير سارية"}
            </span>
          </div>
          <Link href={`/doc/${best.id}`} className="btn-primary mt-4">
            عرض الوثيقة وتحميل المصدر
          </Link>
        </div>
      ) : null}

      {data && (
        <div className="grid gap-3">
          {filtered.slice(1).map((r) => (
            <Link key={r.id} href={`/doc/${r.id}`} className="card block p-4 hover:border-saudi transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="font-semibold text-slate-100">{r.title}</div>
                <span className={`shrink-0 text-[11px] ${r.valid === 1 ? "text-saudi-light" : "text-slate-500"}`}>
                  {r.valid === 1 ? "سارية" : "غير سارية"}
                </span>
              </div>
              {r.snippet ? <p className="mt-1 text-sm leading-7 text-slate-400 line-clamp-2">{r.snippet}</p> : null}
              <div className="mt-2 flex gap-3 text-xs text-slate-500">
                <span>{r.category}</span>
                {r.year ? <span>{r.year}هـ</span> : null}
              </div>
            </Link>
          ))}
          {filtered.length === 0 && (
            <div className="card p-10 text-center text-slate-400">
              لا نتائج — جرّب كلمات أخرى أو <Link href="/library" className="text-saudi-light">تصفح المكتبة</Link>
            </div>
          )}
          {filtered.length === 0 && data.webPdfUrl ? <a href={data.webPdfUrl} target="_blank" rel="noopener noreferrer" className="btn-primary mx-auto">بحث عام عن PDF حكومي</a> : null}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return <Suspense><SearchInner /></Suspense>;
}
