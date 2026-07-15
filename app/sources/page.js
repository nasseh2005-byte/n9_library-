import Link from "next/link";
import sources from "@/data/official-sources.json";
import { getExternalDocs } from "@/lib/data";
import { normalizeAr } from "@/lib/ar";
import Icon from "@/components/Icon";

export const metadata = { title: "المصادر الرسمية" };

export default function SourcesPage({ searchParams }) {
  const q = String(searchParams?.q || "").trim();
  const source = String(searchParams?.source || "");
  const needle = normalizeAr(q);
  const all = getExternalDocs();
  const items = all.filter((doc) => {
    if (source && doc.source_name !== source) return false;
    if (!needle) return true;
    return normalizeAr(`${doc.title_ar} ${doc.category} ${doc.source_name} ${(doc.tags || []).join(" ")}`).includes(needle);
  }).slice(0, 240);
  const sourceNames = [...new Set(all.map((doc) => doc.source_name))];

  return (
    <div className="grid gap-8">
      <section className="source-hero card overflow-hidden p-7 md:p-10">
        <div className="relative max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-white/70 px-3 py-1 text-xs font-semibold text-gold-dark">
            <Icon name="shield" size={15} /> مصادر موثقة وروابط أصلية
          </div>
          <h1 className="text-3xl font-bold md:text-4xl">المصادر الرسمية للمكتبة</h1>
          <p className="mt-3 max-w-2xl leading-8 text-muted">
            تجمع N9 Library الأنظمة واللوائح والأحكام من الجهات السعودية الرسمية، وتحفظ رابط المصدر مع كل وثيقة. ملفات Google Drive مراجع مساندة للمكتب الرئيسي وليست بديلًا عن النسخة الرسمية.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sources.map((item) => (
          <article key={item.id} className="card source-card p-5">
            <div className="flex items-start justify-between gap-3">
              <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${item.official ? "bg-saudi/10 text-saudi" : "bg-gold/10 text-gold-dark"}`}>
                <Icon name={item.official ? "shield" : "folder"} size={22} />
              </span>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${item.official ? "bg-saudi/10 text-saudi-dark" : "bg-gold/10 text-gold-dark"}`}>
                {item.official ? "مصدر رسمي" : "مرجع المكتب"}
              </span>
            </div>
            <h2 className="mt-4 text-lg font-bold">{item.short_name}</h2>
            <div className="mt-1 text-xs font-semibold text-gold-dark">{item.scope}</div>
            <p className="mt-3 text-sm leading-7 text-muted">{item.description}</p>
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="btn-ghost mt-4 text-xs">زيارة المصدر ↗</a>
          </article>
        ))}
      </section>

      <section className="grid gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold">الوثائق المضافة من المصادر الجديدة</h2>
            <p className="mt-1 text-sm text-muted">{all.length.toLocaleString("ar-SA")} وثيقة ومرجع ضمن المكتب الرئيسي</p>
          </div>
          <form className="grid w-full gap-2 sm:grid-cols-[1fr_220px_auto] md:w-auto">
            <input name="q" defaultValue={q} className="input min-w-64" placeholder="ابحث بعنوان الوثيقة…" />
            <select name="source" defaultValue={source} className="input">
              <option value="">كل المصادر</option>
              {sourceNames.map((name) => <option key={name} value={name}>{name}</option>)}
            </select>
            <button className="btn-primary justify-center">بحث</button>
          </form>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {items.map((doc) => (
            <article key={doc.id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold leading-7">{doc.title_ar}</h3>
                  <div className="mt-1 text-xs text-muted">{doc.source_name} · {doc.category}</div>
                </div>
                <span className="shrink-0 rounded-full bg-saudi/10 px-2 py-1 text-[10px] font-semibold text-saudi-dark">المكتب الرئيسي</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href={`/doc/${doc.id}`} className="btn-ghost text-xs">التفاصيل</Link>
                {doc.pdf_source ? <a href={`/api/pdf?u=${encodeURIComponent(doc.pdf_source)}&download=1&filename=${encodeURIComponent(doc.title_ar)}`} className="btn-primary text-xs">تنزيل PDF</a> : null}
                {doc.generated_pdf ? <a href={`/api/generated-pdf?id=${encodeURIComponent(doc.id)}&download=1`} className="btn-primary text-xs">تنزيل PDF</a> : null}
                <a href={doc.source_page} target="_blank" rel="noopener noreferrer" className="btn-ghost text-xs">المصدر ↗</a>
              </div>
            </article>
          ))}
        </div>
        {items.length === 0 ? <div className="card p-10 text-center text-muted">لا توجد نتائج مطابقة.</div> : null}
      </section>
    </div>
  );
}
