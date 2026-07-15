import Link from "next/link";
import { getMeta, filterDocs } from "@/lib/data";
import DocCard from "@/components/DocCard";
import Pagination from "@/components/Pagination";

export const metadata = { title: "المكتبة — N9 LIBRARY" };

export default function Library({ searchParams }) {
  const meta = getMeta();
  const { q = "", cat = "", year = "", valid = "", ins = "", tag = "", mode = "broad", sort = "new", page = "1" } =
    searchParams || {};
  const res = filterDocs({ q, cat, year, valid, ins, tag, mode, sort, page });
  const active = Object.entries({ q, cat, year, valid, ins, tag }).filter(([, v]) => v);
  const params = Object.fromEntries([...active, ["mode", mode], ["sort", sort]].filter(([, v]) => v && v !== "new" && v !== "broad"));

  // رابط يزيل فلترا واحدا مع بقاء البقية
  const removeLink = (key) => {
    const sp = new URLSearchParams(Object.fromEntries(active.filter(([k]) => k !== key)));
    const s = sp.toString();
    return s ? `/library?${s}` : "/library";
  };
  const validLabel = { 1: "سارية", 0: "غير سارية" };

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">المكتبة</h1>
        <span className="text-sm text-slate-400">{meta.total.toLocaleString("ar-SA")} وثيقة</span>
      </div>

      <form className="card grid gap-3 p-4 md:grid-cols-8">
        <input name="q" defaultValue={q} className="input md:col-span-2"
          placeholder="بحث بالعنوان أو الرقم (يتجاهل الهمزات والتشكيل)…" />
        <select name="cat" defaultValue={cat} className="input">
          <option value="">كل التصنيفات</option>
          {meta.categories.map((c) => <option key={c.name} value={c.name}>{c.name} ({c.count})</option>)}
        </select>
        <select name="mode" defaultValue={mode} className="input">
          <option value="broad">بحث شامل</option>
          <option value="exact">بحث دقيق</option>
        </select>
        <select name="ins" defaultValue={ins} className="input">
          <option value="">كل الأدوات</option>
          {meta.instruments.slice(0, 8).map((x) => <option key={x.name} value={x.name}>{x.name} ({x.count})</option>)}
        </select>
        <select name="year" defaultValue={year} className="input">
          <option value="">كل السنوات</option>
          {meta.years.map((yy) => <option key={yy.y} value={yy.y}>{yy.y}هـ ({yy.count})</option>)}
        </select>
        <select name="valid" defaultValue={valid} className="input">
          <option value="">السريان: الكل</option>
          <option value="1">سارية</option>
          <option value="0">غير سارية</option>
        </select>
        <div className="flex gap-2">
          <select name="sort" defaultValue={sort} className="input">
            <option value="new">الأحدث أولًا</option>
            <option value="old">الأقدم أولًا</option>
          </select>
          <button className="btn-primary shrink-0">تصفية</button>
        </div>
        {tag ? <input type="hidden" name="tag" value={tag} /> : null}
      </form>

      {active.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-slate-500">الفلاتر:</span>
          {active.map(([k, v]) => (
            <Link key={k} href={removeLink(k)}
              className="tag-pill border-saudi/50 text-saudi-light"
              title="اضغط للإزالة">
              {k === "valid" ? validLabel[v] : k === "year" ? `${v}هـ` : v} ✕
            </Link>
          ))}
          <Link href="/library" className="text-xs text-slate-500 underline">مسح الكل</Link>
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-slate-400">
        <span>{res.total.toLocaleString("ar-SA")} نتيجة</span>
        <span>صفحة {res.page} من {res.pages}</span>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {res.items.map((d) => <DocCard key={d.id} d={d} />)}
      </div>
      {res.items.length === 0 && (
        <div className="card p-10 text-center text-slate-400">
          لا توجد نتائج مطابقة — <Link href="/library" className="text-saudi-light">امسح الفلاتر</Link>
        </div>
      )}

      <Pagination page={res.page} pages={res.pages} basePath="/library" params={params} />
    </div>
  );
}
