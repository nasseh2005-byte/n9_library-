import Link from "next/link";
import fs from "node:fs";
import path from "node:path";
import { getMeta, getDocsLite } from "@/lib/data";
import DocCard from "@/components/DocCard";
import PartnerBar from "@/components/PartnerBar";

function getNewDocs() {
  try {
    const p = path.join(process.cwd(), "data", "new-docs.json");
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch { return null; }
}

export default function Home() {
  const meta = getMeta();
  const latest = getDocsLite().slice(0, 6);
  const updates = getNewDocs();
  return (
    <div className="grid gap-10">
      {updates?.new_count > 0 && (
        <div className="card border-gold/50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-bold" style={{ color: "#b8901f" }}>
              {updates.new_count} تشريع جديد صدر في المصدر الرسمي ولم يُضف بعد
            </span>
            <span className="text-xs text-faint">آخر فحص: {String(updates.checked_at).slice(0, 10)}</span>
          </div>
          <ul className="mt-2 grid gap-1 text-sm text-muted">
            {updates.items.slice(0, 3).map((u) => (
              <li key={u.title}>• {u.title} <span className="text-xs text-faint">({u.instrument})</span></li>
            ))}
          </ul>
        </div>
      )}
      {/* البطل + البحث */}
      <section className="card card-gold relative overflow-hidden p-8 md:p-12 text-center">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,162,39,0.15),transparent_60%)]" />
        <h1 className="hero-title relative text-3xl font-bold md:text-4xl">
          المكتبة القانونية السعودية الرقمية
        </h1>
        <p className="relative mx-auto mt-3 max-w-2xl text-slate-400">
          {meta.total.toLocaleString("ar-SA")} وثيقة رسمية — أنظمة ولوائح ومراسيم وقرارات —
          مفهرسة بـ{meta.tagTotal.toLocaleString("ar-SA")} تاغ، مع رابط المصدر الرسمي لكل وثيقة.
        </p>
        <form action="/search" className="relative mx-auto mt-6 flex max-w-xl gap-2">
          <input name="q" className="input" placeholder="اسأل أو ابحث: مثلًا عقوبات جرائم المخدرات…" />
          <button className="btn-primary shrink-0">بحث</button>
        </form>
        <div className="relative mt-4 flex flex-wrap justify-center gap-2 text-xs">
          {meta.topTags.slice(0, 8).map(({ tag }) => (
            <Link key={tag} href={`/tags/${encodeURIComponent(tag)}`} className="tag-pill">{tag}</Link>
          ))}
        </div>
      </section>

      {/* إحصاءات */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          ["وثيقة رسمية", meta.total],
          ["تصنيف", meta.categories.length],
          ["تاغ فريد", meta.tagTotal],
          ["سنة تشريعية", meta.years.length],
        ].map(([label, n]) => (
          <div key={label} className="card p-5 text-center">
            <div className="text-2xl font-bold text-gold">{Number(n).toLocaleString("ar-SA")}</div>
            <div className="mt-1 text-sm text-slate-400">{label}</div>
          </div>
        ))}
      </section>

      {/* التصنيفات */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">التصنيفات</h2>
          <Link href="/library" className="text-sm text-saudi-light">تصفح الكل ←</Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {meta.categories.slice(0, 9).map((c) => (
            <Link key={c.name} href={`/library?cat=${encodeURIComponent(c.name)}`}
              className="card flex items-center justify-between p-4 hover:border-saudi transition-colors">
              <span className="font-semibold">{c.name}</span>
              <span className="rounded-full bg-saudi/15 px-2.5 py-0.5 text-xs text-saudi-light">
                {c.count.toLocaleString("ar-SA")}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <PartnerBar />

      {/* أحدث الوثائق */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-white">أحدث الوثائق</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {latest.map((d) => <DocCard key={d.id} d={d} />)}
        </div>
      </section>

      {/* إعلان N9 LAW SYSTEM */}
      <section className="card relative overflow-hidden border-saudi/40 p-8">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(27,131,84,0.15),transparent_50%)]" />
        <div className="relative flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="text-xs font-semibold text-gold">إعلان</div>
            <h2 className="mt-1 text-2xl font-bold text-white">N9 LAW SYSTEM</h2>
            <p className="mt-2 max-w-xl text-slate-400">
              نظام متكامل لإدارة القضايا والمخالفات ومكاتب المحاماة — الجلسات، المواعيد،
              العملاء، والمستندات في مكان واحد.
            </p>
          </div>
          <Link href="/n9-law-system" className="btn-primary">تعرف على النظام</Link>
        </div>
      </section>
    </div>
  );
}
