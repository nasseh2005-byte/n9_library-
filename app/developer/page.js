import { redirect } from "next/navigation";
import { getMember } from "@/lib/members";
import { readAudit } from "@/lib/audit";
import Icon from "@/components/Icon";
import DevConsole from "./DevConsole";
import UploadForm from "@/app/vault/UploadForm";

export const metadata = { title: "لوحة المطوّر — N9 LIBRARY" };
export const dynamic = "force-dynamic";

export default function DeveloperPage() {
  const member = getMember();
  if (!member) redirect("/login");
  if (member.role !== "developer") {
    return (
      <div className="mx-auto max-w-lg card p-10 text-center">
        <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full surface-2 text-gold-c">
          <Icon name="lock" size={26} />
        </div>
        <h1 className="font-serif text-xl font-bold">لوحة المطوّر</h1>
        <p className="mt-3 text-muted">هذه الصفحة مخصّصة لحسابات المطوّرين فقط.</p>
      </div>
    );
  }
  const audit = readAudit(null, 40);
  return (
    <div className="grid gap-6">
      <div className="flex items-center gap-3">
        <span className="text-gold-c"><Icon name="shield" size={26} /></span>
        <h1 className="font-serif text-2xl font-bold">لوحة المطوّر</h1>
      </div>
      <DevConsole />
      <UploadForm defaultOpen developerMode />

      <div className="card p-6">
        <div className="mb-3 flex items-center gap-2 font-bold"><Icon name="clock" size={18} /> سجل التدقيق (كل المكاتب)</div>
        <div className="max-h-80 overflow-auto text-sm">
          <table className="w-full text-right">
            <thead className="text-xs text-faint">
              <tr><th className="py-1">الوقت</th><th>المستخدم</th><th>المكتب</th><th>الإجراء</th><th>الهدف</th></tr>
            </thead>
            <tbody>
              {audit.map((a, i) => (
                <tr key={i} className="border-t" style={{ borderColor: "var(--line)" }}>
                  <td className="py-1.5 text-xs text-faint" dir="ltr">{String(a.at).slice(0, 16).replace("T", " ")}</td>
                  <td className="text-muted">{a.user}</td>
                  <td className="text-muted">{a.office}</td>
                  <td className="text-gold-c">{a.action}</td>
                  <td className="text-muted">{a.target}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {audit.length === 0 && <div className="py-6 text-center text-faint">لا سجلات بعد</div>}
        </div>
      </div>
    </div>
  );
}
