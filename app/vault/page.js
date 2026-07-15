import Link from "next/link";
import { getMember, termsAccepted } from "@/lib/members";
import { vaultSearch } from "@/lib/vaultIndex";
import UploadForm from "./UploadForm";
import { getCloudUploads } from "@/lib/cloudUploads";
import { canSee } from "@/lib/members";

export const metadata = { title: "الخزنة الخاصة — N9 LIBRARY" };
export const dynamic = "force-dynamic";

const VIS = {
  public: ["عام", "bg-saudi/15 text-saudi-light"],
  office: ["للمكتب", "bg-gold/15 text-gold"],
  private: ["خاص", "bg-slate-500/20 text-slate-400"],
};

export default async function VaultPage({ searchParams }) {
  const member = getMember();
  const termsOk = termsAccepted();
  const q = (searchParams?.q || "").trim();

  if (!member) {
    return (
      <div className="mx-auto max-w-lg card p-10 text-center">
        <h1 className="text-xl font-bold text-white">الخزنة الخاصة</h1>
        <p className="mt-3 text-slate-400 leading-8">
          مصادر المكاتب الخاصة: الأحكام، المرفقات، اللوائح الداخلية —
          متاحة للأعضاء المنضمين فقط.
        </p>
        <Link href="/login" className="btn-primary mt-6">دخول الأعضاء</Link>
      </div>
    );
  }

  // بحث عميق: العنوان + الوصف + التاغات + محتوى الملفات النصية + سياقات الحالات، مع تحمل الخطأ الإملائي
  const localItems = vaultSearch(q, member, termsOk, 60);
  const cloud = await getCloudUploads();
  const needle = q.toLowerCase();
  const cloudItems = cloud.filter((r) => canSee(r, member, termsOk))
    .filter((r) => !needle || `${r.title} ${r.desc || ""} ${(r.tags || []).join(" ")}`.toLowerCase().includes(needle))
    .map((r) => ({ ...r, kind: "upload", tagsArr: r.tags || [], hasFile: Boolean(r.file_url), snippet: r.desc || "" }));
  const items = [...cloudItems, ...localItems.filter((r) => !cloudItems.some((c) => c.id === r.id))].slice(0, 60);

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">الخزنة الخاصة</h1>
          <div className="mt-1 text-sm text-slate-400">
            مرحبًا {member.user} — {member.office}
            {member.role === "developer" && (
              termsOk
                ? <span className="mr-2 text-gold">• مطوّر (وصول كامل)</span>
                : <Link href="/terms" className="mr-2 text-gold underline">• فعّل وصول المطوّر</Link>
            )}
          </div>
        </div>
        <form className="flex gap-2">
          <input name="q" defaultValue={q} className="input w-64" placeholder="بحث في الخزنة (مطبع)…" />
          <button className="btn-primary shrink-0">بحث</button>
        </form>
      </div>

      <UploadForm />

      <div className="text-sm text-slate-400">{items.length} عنصر {q ? `يطابق «${q}»` : ""}</div>
      <div className="grid gap-3 md:grid-cols-2">
        {items.map((r) => {
          const [label, cls] = VIS[r.visibility] || VIS.private;
          return (
            <div key={r.id} className="card p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold leading-7 text-slate-100">
                  {r.title}
                </h3>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${cls}`}>{label}</span>
              </div>
              {r.snippet ? (
                <p className="mt-1 text-sm leading-7 text-slate-400 line-clamp-3">{r.snippet}</p>
              ) : r.desc ? <p className="mt-1 text-sm text-slate-400 line-clamp-2">{r.desc}</p> : null}
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                <span>{r.category}</span><span>{r.type}</span>
                <span>{r.owner}</span><span>{String(r.added_at).slice(0, 10)}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(r.tagsArr || []).slice(0, 6).map((t) => <span key={t} className="tag-pill">{t}</span>)}
              </div>
              <div className="mt-3 flex gap-2">
                {r.kind === "case" ? (
                  <Link href={`/cases/${r.id.replace(/^case-/, "")}`} className="btn-primary text-xs">فتح ملف الحالة</Link>
                ) : r.file_url ? (
                  <a href={r.download_url || r.file_url} target="_blank" rel="noopener noreferrer" className="btn-primary text-xs">تنزيل الملف</a>
                ) : r.hasFile ? (
                  <a href={`/api/file/${r.id}`} target="_blank" className="btn-primary text-xs">فتح الملف</a>
                ) : null}
                {r.external_url ? (
                  <a href={r.external_url} target="_blank" rel="noopener noreferrer" className="btn-ghost text-xs">مصدر خارجي</a>
                ) : null}
              </div>
            </div>
          );
        })}
        {items.length === 0 && (
          <div className="card p-10 text-center text-slate-400 md:col-span-2">لا عناصر بعد — ارفع أول مرفق من الأعلى</div>
        )}
      </div>
    </div>
  );
}
