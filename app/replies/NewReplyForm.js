"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewReplyForm({ kinds }) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ kind: kinds[0], subject: "", facts: "", opponent_claims: "", visibility: "office" });
  const [msg, setMsg] = useState("");
  const router = useRouter();

  async function submit(e) {
    e.preventDefault();
    setMsg("يُنشئ الرد ويجلب السند النظامي…");
    const res = await fetch("/api/replies", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f),
    });
    const j = await res.json().catch(() => ({}));
    if (res.ok) router.push(`/replies/${j.id}`);
    else setMsg(j.error || "فشل");
  }

  return (
    <div className="card card-gold p-5">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between font-bold">
        <span>إنشاء رد جديد على قضية</span><span className="text-faint">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <form onSubmit={submit} className="mt-4 grid gap-3">
          <select className="input" value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value })}>
            {kinds.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
          <input className="input" placeholder="موضوع القضية — مثال: استئناف حكم في دعوى مطالبة مالية رقم…"
            value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} required />
          <textarea className="input min-h-24" placeholder="وقائع القضية (سطر لكل واقعة)"
            value={f.facts} onChange={(e) => setF({ ...f, facts: e.target.value })} />
          <textarea className="input min-h-24"
            placeholder="أسباب الاستئناف / ادعاءات الخصم (سطر لكل سبب — سيُنشأ رد مقابل لكل سطر)"
            value={f.opponent_claims} onChange={(e) => setF({ ...f, opponent_claims: e.target.value })} />
          <div className="flex items-center gap-3">
            <select className="input w-44" value={f.visibility} onChange={(e) => setF({ ...f, visibility: e.target.value })}>
              <option value="office">خاص للمكتب</option>
              <option value="private">خاص لي</option>
            </select>
            <button className="btn-primary" disabled={!f.subject.trim()}>توليد الرد</button>
            <span className="text-sm text-muted">{msg}</span>
          </div>
        </form>
      )}
    </div>
  );
}
