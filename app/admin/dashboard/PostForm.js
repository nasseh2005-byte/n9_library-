"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PostForm() {
  const [form, setForm] = useState({ title: "", tags: "", content: "" });
  const [msg, setMsg] = useState("");
  const router = useRouter();

  async function publish(e) {
    e.preventDefault();
    setMsg("جاري النشر…");
    const res = await fetch("/api/admin/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const j = await res.json().catch(() => ({}));
    if (res.ok) {
      setMsg("تم النشر ✓");
      setForm({ title: "", tags: "", content: "" });
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
      <textarea className="input min-h-40" placeholder="المحتوى (يدعم Markdown)"
        value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required />
      <div className="flex items-center gap-3">
        <button className="btn-primary">نشر باسم NASSEH ZAHER ALNAMAN</button>
        <span className="text-sm text-slate-400">{msg}</span>
      </div>
    </form>
  );
}
