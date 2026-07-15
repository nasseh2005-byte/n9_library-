"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PostForm() {
  const [form, setForm] = useState({ title: "", tags: "", category: "", kind: "", content: "" });
  const [files, setFiles] = useState([]);
  const [msg, setMsg] = useState("");
  const router = useRouter();

  async function publish(e) {
    e.preventDefault();
    setMsg("جاري النشر…");
    const body = new FormData();
    Object.entries(form).forEach(([key, value]) => body.append(key, value));
    files.forEach((file) => body.append("attachments", file));
    const res = await fetch("/api/admin/posts", { method: "POST", body });
    const j = await res.json().catch(() => ({}));
    if (res.ok) {
      setMsg("تم النشر ✓");
      setForm({ title: "", tags: "", category: "", kind: "", content: "" });
      setFiles([]);
      router.refresh();
    } else setMsg(j.error || "فشل النشر");
  }

  return (
    <form onSubmit={publish} className="card grid gap-3 p-6">
      <h2 className="font-bold text-white">تدوينة جديدة</h2>
      <input className="input" placeholder="العنوان" value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })} required />
      <input className="input" placeholder="تاغات مفصولة بفواصل: قانون, عقارات, شرح"
        value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
      <div className="grid gap-3 md:grid-cols-2">
        <input className="input" placeholder="التصنيف المخصص" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        <input className="input" placeholder="النوع: تدوينة، سابقة قضائية، تعليق…" value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })} />
      </div>
      <textarea className="input min-h-40" placeholder="المحتوى (يدعم Markdown)"
        value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required />
      <label className="grid gap-1 text-sm text-muted">
        <span className="font-semibold">مرفقات التدوينة (اختياري)</span>
        <input className="input" type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.docx,.xlsx,.md,.txt"
          onChange={(e) => setFiles(Array.from(e.target.files || []).slice(0, 4))} />
        <span className="text-xs text-faint">حتى 4 ملفات وبإجمالي 4MB، وتظهر روابط تنزيلها داخل التدوينة.</span>
        {files.length > 0 && <span className="text-xs text-gold-c">{files.map((file) => file.name).join("، ")}</span>}
      </label>
      <div className="flex items-center gap-3">
        <button className="btn-primary">نشر باسم NASSEH ZAHER ALNAMAN</button>
        <span className="text-sm text-slate-400">{msg}</span>
      </div>
    </form>
  );
}
