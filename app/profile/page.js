import Link from "next/link";
import { redirect } from "next/navigation";
import { getMember, termsAccepted, getUploads } from "@/lib/members";
import LogoutButton from "./LogoutButton";

export const metadata = { title: "الملف الشخصي — N9 LIBRARY" };
export const dynamic = "force-dynamic";

export default function ProfilePage() {
  const member = getMember();
  if (!member) redirect("/login");
  const mine = getUploads().filter((r) => r.owner === member.user);
  const counts = {
    private: mine.filter((r) => r.visibility === "private").length,
    office: mine.filter((r) => r.visibility === "office").length,
    public: mine.filter((r) => r.visibility === "public").length,
  };

  return (
    <div className="mx-auto max-w-2xl grid gap-6">
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">{member.user}</h1>
            <div className="mt-1 text-sm text-slate-400">{member.office}</div>
            <div className="mt-1 text-xs">
              {member.role === "developer"
                ? <span className="text-gold">مطوّر {termsAccepted() ? "— وصول كامل مفعّل ✓" : "— "}{!termsAccepted() && <Link href="/terms" className="underline">فعّل الوصول الكامل</Link>}</span>
                : <span className="text-saudi-light">عضو مكتب</span>}
            </div>
          </div>
          <LogoutButton />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[["خاص لي", counts.private], ["للمكتب", counts.office], ["عام", counts.public]].map(([k, v]) => (
          <div key={k} className="card p-4 text-center">
            <div className="text-xl font-bold text-gold">{v}</div>
            <div className="text-xs text-slate-400">{k}</div>
          </div>
        ))}
      </div>
      <div className="card p-6">
        <h2 className="mb-3 font-bold text-white">مرفوعاتي ({mine.length})</h2>
        <ul className="grid gap-2 text-sm">
          {mine.slice(0, 20).map((r) => (
            <li key={r.id} className="flex justify-between border-b border-line pb-2">
              <span className="text-slate-300">{r.title}</span>
              <span className="text-xs text-slate-500">{String(r.added_at).slice(0, 10)}</span>
            </li>
          ))}
          {mine.length === 0 && <li className="text-slate-500">لا مرفوعات — <Link href="/vault" className="text-saudi-light">ارفع من الخزنة</Link></li>}
        </ul>
      </div>
    </div>
  );
}
