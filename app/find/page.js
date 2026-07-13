"use client";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Icon from "@/components/Icon";

function FindInner() {
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get("q") || "");
  const [d, setD] = useState(null);
  const [loading, setLoading] = useState(false);

  async function run(e) {
    e?.preventDefault();
    if (!q.trim()) return;
    setLoading(true);
    const r = await fetch(`/api/search-all?q=${encodeURIComponent(q)}`);
    setD(await r.json());
    setLoading(false);
  }

  const g = d?.groups || {};
  const Section = ({ icon, title, items, render }) => items?.length ? (
    <div className="card p-5">
      <div className="mb-3 flex items-center gap-2 font-bold"><Icon name={icon} size={18} /> {title} <span className="text-xs text-faint">({items.length})</span></div>
      <div className="grid gap-2">{items.map(render)}</div>
    </div>
  ) : null;

  return (
    <div className="grid gap-6">
      <div className="flex items-center gap-3">
        <span className="text-gold-c"><Icon name="search" size={24} /></span>
        <h1 className="font-serif text-2xl font-bold">البحث الشامل</h1>
      </div>
      <p className="text-sm text-muted">يبحث في الأرشيف الرسمي، وخزنة مكتبك، وحالاتك، وردودك — دفعة واحدة.</p>
      <form onSubmit={run} className="flex gap-2">
        <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث في كل شيء…" autoFocus />
        <button className="btn-primary shrink-0" disabled={loading}>{loading ? "…" : "بحث"}</button>
      </form>

      {d && (
        <div className="grid gap-4">
          <Section icon="scale" title="الأرشيف الرسمي" items={g.law} render={(r) => (
            <Link key={r.id} href={`/doc/${r.id}`} className="border-b py-1.5 text-sm text-muted hover:text-gold-c" style={{ borderColor: "var(--line)" }}>
              {r.title} <span className="text-xs text-faint">({r.year}هـ — {r.valid})</span>
            </Link>
          )} />
          <Section icon="folder" title="الخزنة الخاصة" items={g.vault} render={(r) => (
            <Link key={r.id} href="/vault" className="border-b py-1.5 text-sm text-muted hover:text-gold-c" style={{ borderColor: "var(--line)" }}>{r.title}</Link>
          )} />
          <Section icon="file" title="ملفات الحالات" items={g.cases} render={(r) => (
            <Link key={r.id} href={`/cases/${r.id.replace(/^case-/, "")}`} className="border-b py-1.5 text-sm text-muted hover:text-gold-c" style={{ borderColor: "var(--line)" }}>{r.title}</Link>
          )} />
          <Section icon="reply" title="الردود على القضاة" items={g.replies} render={(r) => (
            <Link key={r.id} href={`/replies/${r.id}`} className="border-b py-1.5 text-sm text-muted hover:text-gold-c" style={{ borderColor: "var(--line)" }}>{r.subject} <span className="text-xs text-faint">({r.kind})</span></Link>
          )} />
          {!d.member && <div className="text-center text-xs text-faint"><Link href="/login" className="text-gold-c underline">سجّل دخولك</Link> ليشمل البحث خزنتك وحالاتك وردودك</div>}
          {Object.values(g).every((x) => !x?.length) && <div className="card p-8 text-center text-muted">لا نتائج</div>}
        </div>
      )}
    </div>
  );
}

export default function FindPage() {
  return <Suspense><FindInner /></Suspense>;
}
