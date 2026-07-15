import Link from "next/link";
import { getMember, termsAccepted, canSee } from "@/lib/members";
import { getCases, CASE_TYPES } from "@/lib/cases";
import NewCaseForm from "./NewCaseForm";

export const metadata = { title: "ملفات الحالات — N9 LIBRARY" };
export const dynamic = "force-dynamic";

export default function CasesPage() {
  const member = getMember();
  if (!member) {
    return (
      <div className="mx-auto max-w-lg card p-10 text-center">
        <h1 className="text-xl font-bold text-white">ملفات الحالات</h1>
        <p className="mt-3 text-slate-400">مساحة خاصة لإدارة حالات شركة سلطان المالكي ومرفقاتها.</p>
        <Link href="/login" className="btn-primary mt-6">دخول فريق الشركة</Link>
      </div>
    );
  }
  const termsOk = termsAccepted();
  const cases = getCases().filter((c) => canSee(c, member, termsOk));
  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-bold text-white">ملفات الحالات <span className="text-base font-normal text-slate-400">({cases.length})</span></h1>
      <NewCaseForm types={CASE_TYPES} />
      <div className="grid gap-3 md:grid-cols-2">
        {cases.map((c) => (
          <Link key={c.id} href={`/cases/${c.id}`} className="card block p-4 hover:border-saudi transition-colors">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-slate-100">{c.title}</h3>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] ${c.status === "مفتوحة" ? "bg-saudi/15 text-saudi-light" : "bg-slate-500/20 text-slate-400"}`}>{c.status}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {c.case_types.map((t) => <span key={t} className="tag-pill">{t}</span>)}
            </div>
            <div className="mt-2 text-xs text-slate-500">
              {c.contexts.length} سياق • {c.attachments.length} مرفق • {c.owner} • {String(c.created_at).slice(0, 10)}
            </div>
          </Link>
        ))}
        {cases.length === 0 && <div className="card p-8 text-center text-slate-400 md:col-span-2">لا حالات بعد</div>}
      </div>
    </div>
  );
}
