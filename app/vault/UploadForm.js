"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UploadForm({ defaultOpen = false, developerMode = false } = {}) {
  const [form, setForm] = useState({ title: "", desc: "", tags: "", visibility: developerMode ? "public" : "private", external_url: "" });
  const [analysis, setAnalysis] = useState(null);
  const [msg, setMsg] = useState("");
  const [open, setOpen] = useState(defaultOpen);
  const router = useRouter();

  // التحليل المنطقي اللحظي: يفهم العنوان ويقترح التاغات والتصنيف قبل الحفظ
  async function analyze(title, desc) {
    if (!title.trim()) { setAnalysis(null); return; }
    const res = await fetch("/api/analyze", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, desc }),
    });
    if (res.ok) setAnalysis(await res.json());
  }

  async function submit(e) {
    e.preventDefault();
    setMsg("جاري الحفظ والتحليل…");
    const fd = new FormData(e.target);
    const res = await fetch("/api/vault", { method: "POST", body: fd });
    const j = await res.json().catch(() => ({}));
    if (res.ok) {
      setMsg(`تم ✓ — صُنف تلقائيًا: ${j.category} (${j.type})`);
      e.target.reset();
      setForm({ title: "", desc: "", tags: "", visibility: developerMode ? "public" : "private", external_url: "" });
      setAnalysis(null);
      router.refresh();
    } else setMsg(j.error || "فشل الحفظ");
  }

  return (
    <div className="card p-5">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between font-bold">
        <span>{developerMode ? "تزويد المكتبة بملف أو مرجع جديد كمطور" : "رفع حكم أو مرفق جديد (تحليل وتصنيف تلقائي)"}</span>
        <span className="text-faint">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <form onSubmit={submit} className="mt-4 grid gap-3">
          <input name="title" className="input" placeholder="العنوان — مثال: حكم استئناف في دعوى مطالبة مالية رقم…"
            value={form.title}
            onChange={(e) => { setForm({ ...form, title: e.target.value }); analyze(e.target.value, form.desc); }}
            required />
          <textarea name="desc" className="input min-h-24"
            placeholder="وصف الحكم/المرفق: ملخص الوقائع، المبدأ القضائي، ما يُستفاد منه كسابقة — يحسّن التحليل والبحث"
            value={form.desc}
            onChange={(e) => { setForm({ ...form, desc: e.target.value }); analyze(form.title, e.target.value); }} />
          {analysis && (
            <div className="rounded-lg border border-gold/30 surface-2 p-3 text-sm">
              <div className="text-xs font-semibold text-gold-c">فهم النظام للمرفق:</div>
              <div className="mt-1 text-muted">
                التصنيف: <b className="text-gold-c">{analysis.category}</b> — النوع: <b className="text-gold-c">{analysis.type}</b>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {analysis.tags.slice(0, 12).map((t) => <span key={t} className="tag-pill text-[10px]">{t}</span>)}
              </div>
            </div>
          )}
          <input name="tags" className="input" placeholder="تاغات إضافية يدوية (اختياري، مفصولة بفواصل)"
            value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
          <div className="grid gap-3 md:grid-cols-3">
            {developerMode ? (
              <>
                <input type="hidden" name="visibility" value="public" />
                <div className="input flex items-center">عام للمكتبة</div>
              </>
            ) : (
              <select name="visibility" className="input" value={form.visibility}
                onChange={(e) => setForm({ ...form, visibility: e.target.value })}>
                <option value="private">خاص لي فقط</option>
                <option value="office">خاص للمكتب</option>
                <option value="public">عام للجميع</option>
              </select>
            )}
            <input name="file" type="file" className="input md:col-span-2"
              accept=".pdf,.png,.jpg,.jpeg,.docx,.xlsx,.md,.txt" />
          </div>
          {developerMode ? <div className="text-xs text-muted">يُحفظ الملف كمورد عام في Vercel Blob ويظهر ضمن مصادر المكتبة. الحد المباشر 4MB؛ للملفات الأكبر استخدم رابط المصدر الخارجي. لا ترفع مستندات سرية من هذا القسم.</div> : null}
          <input name="external_url" className="input" dir="ltr"
            placeholder="رابط مصدر خارجي (اختياري) https://…"
            value={form.external_url} onChange={(e) => setForm({ ...form, external_url: e.target.value })} />
          <div className="flex items-center gap-3">
            <button className="btn-primary">حفظ في الخزنة</button>
            <span className="text-sm text-slate-400">{msg}</span>
          </div>
        </form>
      )}
    </div>
  );
}
