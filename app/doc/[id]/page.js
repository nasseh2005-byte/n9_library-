import Link from "next/link";
import { notFound } from "next/navigation";
import { getDoc } from "@/lib/data";
import PdfViewer from "@/components/PdfViewer";

export async function generateMetadata({ params }) {
  const doc = getDoc(params.id);
  if (!doc) return { title: "غير موجود" };
  return {
    title: doc.title_ar,
    description: (doc.summary_ar || doc.title_ar).slice(0, 160),
  };
}

export default function DocPage({ params }) {
  const doc = getDoc(params.id);
  if (!doc) notFound();
  const isValid = doc.external || (String(doc.valid).includes("سارية") && !String(doc.valid).includes("غير"));

  return (
    <div className="grid gap-6">
      <nav className="text-xs text-slate-500">
        <Link href="/library" className="hover:text-saudi-light">المكتبة</Link>
        {" / "}
        <Link href={`/library?cat=${encodeURIComponent(doc.category)}`} className="hover:text-saudi-light">
          {doc.category}
        </Link>
        {doc.hijri_year ? <>{" / "}<Link href={`/library?year=${doc.hijri_year}`} className="hover:text-saudi-light">{doc.hijri_year}هـ</Link></> : null}
      </nav>

      <div className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="max-w-3xl text-2xl font-bold leading-10 text-white">{doc.title_ar}</h1>
          <span className={`rounded-full px-3 py-1 text-sm font-semibold ${
            isValid ? "bg-saudi/15 text-saudi-light" : "bg-slate-500/15 text-slate-400"
          }`}>{doc.valid || "—"}</span>
        </div>
        {doc.title_en && doc.title_en !== doc.title_ar ? (
          <div className="mt-1 text-sm text-slate-500" dir="ltr">{doc.title_en}</div>
        ) : null}

        <dl className="mt-5 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["أداة الاعتماد", doc.instrument],
            ["الرقم", doc.number],
            ["التاريخ الهجري", doc.hijri_date],
            ["التصنيف", doc.category],
            ["عدد أم القرى", doc.gazette_issue],
            ["المصدر", doc.source_name],
          ].filter(([, v]) => v).map(([k, v]) => (
            <div key={k} className="flex gap-2">
              <dt className="text-slate-500">{k}:</dt>
              <dd className="font-semibold text-slate-200">{v}</dd>
            </div>
          ))}
        </dl>

        {doc.summary_ar ? (
          <div className="mt-5 rounded-lg border border-line bg-night p-4">
            <div className="mb-1 text-xs font-semibold text-gold">الملخص الرسمي</div>
            <p className="leading-8 text-slate-300">{doc.summary_ar}</p>
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-2">
          {(doc.tags || []).map((t) => (
            <Link key={t} href={`/tags/${encodeURIComponent(t)}`} className="tag-pill">{t}</Link>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {doc.pdf_source ? (
            <>
              <a href={`/api/pdf?u=${encodeURIComponent(doc.pdf_source)}`} target="_blank" rel="noopener noreferrer" className="btn-ghost">
                عرض PDF
              </a>
              <a href={`/api/pdf?u=${encodeURIComponent(doc.pdf_source)}&download=1&filename=${encodeURIComponent(doc.title_ar)}`} className="btn-primary">
                تنزيل PDF
              </a>
            </>
          ) : null}
          {doc.source_page ? (
            <a href={doc.source_page} target="_blank" rel="noopener noreferrer" className="btn-ghost">
              صفحة الوثيقة في المصدر الأصلي
            </a>
          ) : null}
        </div>
      </div>

      {doc.timeline?.items?.length > 1 ? (
        <div className="card p-6">
          <h2 className="mb-4 font-bold text-white">الخط الزمني للنظام وتعديلاته</h2>
          <ol className="relative mr-3 border-r-2 border-line">
            {doc.timeline.items.map((it) => (
              <li key={it.id} className="mb-4 mr-4">
                <span className={`absolute -right-[9px] mt-1.5 h-4 w-4 rounded-full border-2 ${
                  it.current ? "border-gold bg-gold" : it.isBase ? "border-saudi bg-saudi" : "border-line bg-panel"}`} />
                {it.current ? (
                  <div className="rounded-lg border border-gold/40 bg-night p-3">
                    <div className="text-xs text-gold">← الوثيقة الحالية</div>
                    <div className="text-sm font-semibold text-slate-200">{it.t}</div>
                    <div className="text-xs text-slate-500">{it.date}هـ {it.isBase ? "• النظام الأساسي" : "• تعديل"}</div>
                  </div>
                ) : (
                  <Link href={`/doc/${it.id}`} className="block rounded-lg p-3 hover:bg-night">
                    <div className="text-sm text-slate-300 hover:text-saudi-light">{it.t}</div>
                    <div className="text-xs text-slate-500">{it.date || it.year}هـ {it.isBase ? "• النظام الأساسي" : "• تعديل"}</div>
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      {doc.cites?.length ? (
        <div className="card p-6">
          <h2 className="mb-3 font-bold" style={{ color: "var(--text)" }}>يستشهد بالأنظمة</h2>
          <ul className="grid gap-2 text-sm md:grid-cols-2">
            {doc.cites.map((r) => (
              <li key={r.id}>
                <Link href={`/doc/${r.id}`} className="text-muted hover:text-gold-c">{r.t}</Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {doc.related?.length ? (
        <div className="card p-6">
          <h2 className="mb-3 font-bold text-white">وثائق ذات صلة</h2>
          <ul className="grid gap-2 text-sm md:grid-cols-2">
            {doc.related.map((r) => (
              <li key={r.id}>
                <Link href={`/doc/${r.id}`} className="text-slate-300 hover:text-saudi-light">• {r.t}</Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {doc.pdf_source ? <PdfViewer src={doc.pdf_source} title={doc.title_ar} /> : null}

      {doc.siblings?.length ? (
        <div className="card p-6">
          <h2 className="mb-3 font-bold text-white">
            وثائق نفس عدد أم القرى {doc.gazette_issue ? `(${doc.gazette_issue})` : ""}
          </h2>
          <ul className="grid gap-2 text-sm">
            {doc.siblings.map((s) => (
              <li key={s.id}>
                <Link href={`/doc/${s.id}`} className="text-slate-300 hover:text-saudi-light">• {s.t}</Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
