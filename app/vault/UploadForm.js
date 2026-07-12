"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UploadForm() {
  const [form, setForm] = useState({ title: "", desc: "", tags: "", visibility: "private", external_url: "" });
  const [analysis, setAnalysis] = useState(null);
  const [msg, setMsg] = useState("");
  const [open, setOpen] = useState(false);
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
      setForm({ title: "", desc: "", tags: "", visibility: "private", external_url: "" });
      setAnalysis(null);
      router.refresh();
    } else setMsg(j.error || "فشل الحفظ");
  }

  return (
    <div className="card p-5">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between font-bold text-white">
        <span>+ رفع مرفق جديد (تحليل وتصنيف تلقائي)</span>
        <span className="text-slate-500">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <form onSubmit={submit} className="mt-4 grid gap-3">
          <input name="title" className="input" placeholder="عنوان المرفق — النظام يفهم منه التصنيف والتاغات"
            value={form.title}
            onChange={(e) => { setForm({ ...form, title: e.target.value }); analyze(e.target.value, form.desc); }}
            required />
          <textarea name="desc" className="input min-h-20" placeholder="وصف اختياري — يحسن دقة التحليل"
            value={form.desc}
            onChange={(e) => { setForm({ ...form, desc: e.target.value }); analyze(form.title, e.target.value); }} />
          {analysis && (
            <div className="rounded-lg border border-saudi/30 bg-night p-3 text-sm">
              <div className="text-xs font-semibold text-gold">فهم النظام للمرفق:</div>
              <div className="mt-1 text-slate-300">
                التصنيف: <b className="text-saudi-light">{analysis.category}</b> — النوع: <b className="text-saudi-light">{analysis.type}</b>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {analysis.tags.slice(0, 12).map((t) => <span key={t} className="tag-pill text-[10px]">{t}</span>)}
              </div>
            </div>
          )}
          <input name="tags" className="input" placeholder="تاغات إضافية يدوية (اختياري، مفصولة بفواصل)"
            value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
          <div className="grid gap-3 md:grid-cols-3">
            <select name="visibility" className="input" value={form.visibility}
              onChange={(e) => setForm({ ...form, visibility: e.target.value })}>
              <option value="private">خاص لي فقط</option>
              <option value="office">خاص للمكتب</option>
              <option value="public">عام للجميع</option>
            </select>
            <input name="file" type="file" className="input md:col-span-2"
              accept=".pdf,.png,.jpg,.jpeg,.docx,.xlsx,.md,.txt" />
          </div>
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
