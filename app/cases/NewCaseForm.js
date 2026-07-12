"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewCaseForm({ types }) {
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState([]);
  const [form, setForm] = useState({ title: "", custom_type: "", context: "", visibility: "office" });
  const [msg, setMsg] = useState("");
  const router = useRouter();

  async function submit(e) {
    e.preventDefault();
    setMsg("…");
    const res = await fetch("/api/cases", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, case_types: sel }),
    });
    const j = await res.json().catch(() => ({}));
    if (res.ok) router.push(`/cases/${j.id}`);
    else setMsg(j.error || "فشل");
  }

  return (
    <div className="card p-5">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between font-bold text-white">
        <span>+ فتح ملف حالة جديد</span><span className="text-slate-500">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <form onSubmit={submit} className="mt-4 grid gap-3">
          <input className="input" placeholder="عنوان الحالة — مثال: اعتراض على رسوم أرض بيضاء حي النرجس"
            value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <div>
            <div className="mb-2 text-xs text-slate-400">نوع الحالة (اختيار متعدد):</div>
            <div className="flex flex-wrap gap-2">
              {types.map((t) => (
                <button type="button" key={t}
                  onClick={() => setSel(sel.includes(t) ? sel.filter((x) => x !== t) : [...sel, t])}
                  className={`tag-pill ${sel.includes(t) ? "border-saudi text-saudi-light" : ""}`}>
                  {t} {sel.includes(t) ? "✓" : ""}
                </button>
              ))}
            </div>
            <input className="input mt-2" placeholder="نوع مخصص إضافي (اختياري)"
              value={form.custom_type} onChange={(e) => setForm({ ...form, custom_type: e.target.value })} />
          </div>
          <textarea className="input min-h-24" placeholder="السياق الأول: وقائع الحالة، الأطراف، ما تم حتى الآن…"
            value={form.context} onChange={(e) => setForm({ ...form, context: e.target.value })} />
          <div className="flex items-center gap-3">
            <select className="input w-44" value={form.visibility}
              onChange={(e) => setForm({ ...form, visibility: e.target.value })}>
              <option value="office">خاص للمكتب</option>
              <option value="private">خاص لي</option>
              <option value="public">عام</option>
            </select>
            <button className="btn-primary" disabled={sel.length === 0 && !form.custom_type.trim()}>فتح الملف</button>
            <span className="text-sm text-red-400">{msg}</span>
          </div>
        </form>
      )}
    </div>
  );
}
