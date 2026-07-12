import Link from "next/link";
import { notFound } from "next/navigation";
import { getDoc } from "@/lib/data";

export async function generateMetadata({ params }) {
  const doc = getDoc(params.id);
  if (!doc) return { title: "غير موجود — N9 LIBRARY" };
  return {
    title: `${doc.title_ar} — N9 LIBRARY`,
    description: (doc.summary_ar || doc.title_ar).slice(0, 160),
  };
}

export default function DocPage({ params }) {
  const doc = getDoc(params.id);
  if (!doc) notFound();
  const isValid = String(doc.valid).includes("سارية") && !String(doc.valid).includes("غير");

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
            <a href={doc.pdf_source} target="_blank" rel="noopener noreferrer" className="btn-primary">
              تحميل PDF من المصدر
            </a>
          ) : null}
          {doc.source_page ? (
            <a href={doc.source_page} target="_blank" rel="noopener noreferrer" className="btn-ghost">
              صفحة الوثيقة في المركز الوطني
            </a>
          ) : null}
        </div>
      </div>

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

      {doc.pdf_source ? (
        <div className="card overflow-hidden">
          <div className="border-b border-line px-4 py-2 text-sm text-slate-400">عارض الوثيقة</div>
          <iframe src={doc.pdf_source} className="h-[75vh] w-full bg-white" title={doc.title_ar} loading="lazy" />
        </div>
      ) : null}

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
