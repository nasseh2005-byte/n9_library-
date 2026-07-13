import Link from "next/link";
import { redirect } from "next/navigation";
import { getMember } from "@/lib/members";
import { officeStats } from "@/lib/office";

export const metadata = { title: "لوحة المكتب" };
export const dynamic = "force-dynamic";

export default function OfficePage() {
  const member = getMember();
  if (!member) redirect("/login");
  const s = officeStats(member.office);
  const visMax = Math.max(1, s.byVis.public, s.byVis.office, s.byVis.private);
  const members = Object.entries(s.byMember).sort((a, b) => b[1] - a[1]);
  const memMax = Math.max(1, ...members.map(([, n]) => n));

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>لوحة المكتب</h1>
        <span className="text-sm text-muted">{member.office}</span>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[["مرفقات", s.uploads], ["ملفات حالات", s.cases], ["حالات مفتوحة", s.openCases], ["أعضاء نشطون", members.length]].map(([k, v]) => (
          <div key={k} className="card p-5 text-center">
            <div className="stat-num">{Number(v).toLocaleString("ar-SA")}</div>
            <div className="mt-1 text-sm text-muted">{k}</div>
          </div>
        ))}
      </div>

      {s.soon.length > 0 && (
        <div className="card border-gold/40 p-5">
          <h2 className="mb-2 font-bold text-gold-c">مهل نظامية قريبة الانقضاء</h2>
          <ul className="grid gap-2 text-sm">
            {s.soon.map((c) => (
              <li key={c.id} className="flex justify-between">
                <Link href={`/cases/${c.id}`} className="text-muted hover:text-saudi-light">{c.title}</Link>
                <span className={c.days <= 2 ? "text-red-400" : "text-gold"}>باقٍ {c.days} يوم ({c.deadline})</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="card p-6">
          <h2 className="mb-4 font-bold" style={{ color: "var(--text)" }}>توزيع المرفقات بالخصوصية</h2>
          {[["عام", s.byVis.public, "#25935f"], ["للمكتب", s.byVis.office, "#D4AF37"], ["خاص", s.byVis.private, "#64748b"]].map(([k, v, c]) => (
            <div key={k} className="mb-3 grid grid-cols-[5rem_1fr_2.5rem] items-center gap-3 text-sm">
              <span className="text-muted">{k}</span>
              <div className="h-4 overflow-hidden rounded surface-2">
                <div className="h-full rounded-l" style={{ width: `${(v / visMax) * 100}%`, backgroundColor: c }} />
              </div>
              <span className="text-left text-xs text-muted">{v}</span>
            </div>
          ))}
        </div>

        <div className="card p-6">
          <h2 className="mb-4 font-bold" style={{ color: "var(--text)" }}>نشاط الأعضاء</h2>
          {members.slice(0, 6).map(([u, n]) => (
            <div key={u} className="mb-3 grid grid-cols-[6rem_1fr_2.5rem] items-center gap-3 text-sm">
              <span className="truncate text-muted" dir="ltr">{u}</span>
              <div className="h-4 overflow-hidden rounded surface-2">
                <div className="h-full rounded-l bg-saudi" style={{ width: `${(n / memMax) * 100}%` }} />
              </div>
              <span className="text-left text-xs text-muted">{n}</span>
            </div>
          ))}
          {members.length === 0 && <div className="text-sm text-faint">لا نشاط بعد</div>}
        </div>
      </div>

      <div className="card p-6">
        <h2 className="mb-3 font-bold" style={{ color: "var(--text)" }}>سجل التدقيق — من فعل ماذا</h2>
        <ul className="grid gap-1.5 text-sm">
          {s.audit.map((a, i) => (
            <li key={i} className="flex items-center justify-between border-b py-1.5" style={{ borderColor: "var(--line)" }}>
              <span className="text-muted">
                <b style={{ color: "var(--text)" }} dir="ltr">{a.user}</b> — {a.action}: {a.target}
              </span>
              <span className="shrink-0 text-xs text-faint">{String(a.at).slice(0, 16).replace("T", " ")}</span>
            </li>
          ))}
          {s.audit.length === 0 && <li className="text-faint">لا أحداث مسجلة بعد</li>}
        </ul>
      </div>
    </div>
  );
}
