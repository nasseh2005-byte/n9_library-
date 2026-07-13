import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getMember, termsAccepted, canSee } from "@/lib/members";
import { getCase } from "@/lib/cases";
import CaseTools from "./CaseTools";

export const dynamic = "force-dynamic";

export default function CasePage({ params }) {
  const member = getMember();
  if (!member) redirect("/login");
  const c = getCase(params.id);
  if (!c || !canSee(c, member, termsAccepted())) notFound();

  return (
    <div className="grid gap-6">
      <nav className="text-xs text-slate-500">
        <Link href="/cases" className="hover:text-saudi-light">ملفات الحالات</Link> / {c.title}
      </nav>
      <div className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-2xl font-bold text-white">{c.title}</h1>
          <span className={`rounded-full px-3 py-1 text-sm ${c.status === "مفتوحة" ? "bg-saudi/15 text-saudi-light" : "bg-slate-500/20 text-slate-400"}`}>{c.status}</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {c.case_types.map((t) => <span key={t} className="tag-pill">{t}</span>)}
        </div>
        <div className="mt-2 text-xs text-slate-500">{c.owner} • {c.office} • فتحت {String(c.created_at).slice(0, 10)}</div>
        {c.deadline && (() => {
          const days = Math.ceil((new Date(c.deadline) - Date.now()) / 86400000);
          return (
            <div className={`mt-3 w-fit rounded-lg px-3 py-1.5 text-sm font-bold ${
              days < 0 ? "bg-red-500/15 text-red-400" : days <= 5 ? "bg-gold/15 text-gold" : "bg-saudi/15 text-saudi-light"}`}>
              المهلة النظامية: {c.deadline} — {days < 0 ? `انقضت منذ ${-days} يوم!` : `باقٍ ${days} يوم`}
            </div>
          );
        })()}
      </div>

      <div className="card p-6">
        <h2 className="mb-3 font-bold text-white">السياقات ({c.contexts.length})</h2>
        <div className="grid gap-3">
          {c.contexts.map((x, i) => (
            <div key={i} className="rounded-lg border border-line bg-night p-4">
              <p className="leading-8 text-slate-300 whitespace-pre-wrap">{x.text}</p>
              <div className="mt-2 text-xs text-slate-500">{x.author} — {String(x.added_at).slice(0, 16).replace("T", " ")}</div>
            </div>
          ))}
          {c.contexts.length === 0 && <div className="text-sm text-slate-500">لا سياقات بعد</div>}
        </div>
      </div>

      {(c.attachments.length > 0 || c.links.length > 0) && (
        <div className="card p-6">
          <h2 className="mb-3 font-bold text-white">المرفقات والروابط</h2>
          <ul className="grid gap-2 text-sm">
            {c.attachments.map((a) => (
              <li key={a.id}>
                <a href={`/api/file/${a.id}`} target="_blank" className="text-gold-c hover:underline">{a.title}</a>
              </li>
            ))}
            {c.links.map((l, i) => (
              <li key={i}><a href={l.url} target="_blank" rel="noopener noreferrer" className="text-gold-c hover:underline break-all">{l.url}</a></li>
            ))}
          </ul>
        </div>
      )}

      <CaseTools caseId={c.id} status={c.status} />
    </div>
  );
}
