"use client";
import { useState } from "react";
import Link from "next/link";

export default function AssistantPage() {
  const [q, setQ] = useState("");
  const [d, setD] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("broad");

  async function ask(e) {
    e.preventDefault();
    if (!q.trim()) return;
    setLoading(true);
    const r = await fetch(`/api/assistant?q=${encodeURIComponent(q)}&mode=${mode}`);
    setD(await r.json());
    setLoading(false);
  }

  return (
    <div className="mx-auto grid max-w-3xl gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white">المساعد القانوني <span className="text-saudi-light">المدموج</span></h1>
        <p className="mt-2 text-sm text-slate-400">
          يجيب من الأرشيف الرسمي وخزنة مكتبك مباشرة — مجاني بالكامل ويعمل داخل المنصة بدون أي خدمة خارجية
        </p>
      </div>
      <form onSubmit={ask} className="flex gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} className="input"
          placeholder="اسأل: ما عقوبة تقسيم المبنى لوحدات مخالفة؟ متى يسقط رسم الأرض البيضاء؟" autoFocus />
        <button className="btn-primary shrink-0" disabled={loading}>{loading ? "يفكر…" : "اسأل"}</button>
      </form>
      <div className="flex justify-center gap-2"><button onClick={() => setMode("broad")} className={mode === "broad" ? "btn-primary" : "btn-ghost"}>بحث شامل وتحمل أخطاء</button><button onClick={() => setMode("exact")} className={mode === "exact" ? "btn-primary" : "btn-ghost"}>بحث دقيق</button></div>

      {d?.answer && (
        <div className="card border-saudi/40 p-6">
          <div className="text-xs font-semibold text-gold">الجواب المستخلص</div>
          <p className="mt-2 leading-9 text-slate-200">{d.answer.text}…</p>
          <div className="mt-3 text-xs text-saudi-light">المصدر: {d.answer.source}</div>
          {d.answer.keyPoints?.length ? <ul className="mt-4 list-disc space-y-2 pr-5 text-sm text-muted">{d.answer.keyPoints.map((point, index) => <li key={index}>{point}</li>)}</ul> : null}
          <div className="mt-3 text-xs text-faint">درجة الثقة: {d.answer.confidence}</div>
        </div>
      )}
      {d && !d.answer && <div className="card p-8 text-center text-slate-400">لم أجد جوابًا — جرّب صياغة أخرى</div>}
      {d && !d.answer ? <a href={d.webPdfUrl} target="_blank" rel="noopener noreferrer" className="btn-primary mx-auto">ابحث عن ملفات PDF حكومية مرتبطة</a> : null}

      {d?.pageHits?.length > 0 && (
        <div className="card p-5">
          <h2 className="mb-2 text-sm font-bold text-gold-c">نتائج بمستوى الصفحة</h2>
          {d.pageHits.map((p, i) => (
            <Link key={i} href={`/doc/${p.docId}`} className="block border-b border-line py-2 text-sm hover:text-saudi-light">
              {p.title} — <b className="text-gold">صفحة {p.page}</b>
              <span className="block text-xs text-slate-500 line-clamp-1">{p.snippet}</span>
            </Link>
          ))}
        </div>
      )}
      {d?.laws?.length > 0 && (
        <div className="card p-5">
          <h2 className="mb-2 text-sm font-bold" style={{ color: "var(--text)" }}>من الأرشيف الرسمي</h2>
          {d.laws.map((l) => (
            <Link key={l.id} href={`/doc/${l.id}`} className="block border-b border-line py-2 text-sm text-slate-300 hover:text-saudi-light">
              {l.title} <span className="text-xs text-slate-500">({l.number} — {l.year}هـ — {l.valid})</span>
            </Link>
          ))}
        </div>
      )}
      {d?.office?.length > 0 && (
        <div className="card p-5">
          <h2 className="mb-2 text-sm font-bold" style={{ color: "var(--text)" }}>من خزنة مكتبك</h2>
          {d.office.map((o) => (
            <Link key={o.id} href={o.kind === "case" ? `/cases/${o.id.replace(/^case-/, "")}` : "/vault"}
              className="block border-b border-line py-2 text-sm text-slate-300 hover:text-saudi-light">
              {o.title} <span className="text-xs text-slate-500">({o.category})</span>
            </Link>
          ))}
        </div>
      )}
      {d && !d.memberSearched && (
        <div className="text-center text-xs text-slate-500">
          <Link href="/login" className="text-saudi-light underline">سجّل دخولك</Link> ليبحث المساعد أيضًا في أحكام ومرفقات مكتبك
        </div>
      )}
    </div>
  );
}
