"use client";
import { useEffect, useState } from "react";

export default function MembersForm() {
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState({ user: "", pin: "", name: "", office: "", role: "member" });
  const [msg, setMsg] = useState("");

  async function load() {
    const r = await fetch("/api/admin/members");
    if (r.ok) setMembers((await r.json()).members);
  }
  useEffect(() => { load(); }, []);

  async function add(e) {
    e.preventDefault();
    setMsg("");
    const r = await fetch("/api/admin/members", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    });
    const j = await r.json().catch(() => ({}));
    if (r.ok) { setMsg("أُضيف ✓"); setForm({ user: "", pin: "", name: "", office: "", role: "member" }); load(); }
    else setMsg(j.error || "فشل");
  }
  async function del(user) {
    await fetch("/api/admin/members", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user }) });
    load();
  }

  return (
    <div className="card p-6">
      <h2 className="font-bold text-white">الإعدادات — أعضاء المجموعة (المكاتب)</h2>
      <p className="mt-1 text-xs text-slate-500">هنا تحدد اسم المستخدم والرمز السري (6 أرقام) لكل مكتب منضم</p>
      <form onSubmit={add} className="mt-4 grid gap-2 md:grid-cols-6">
        <input className="input" dir="ltr" placeholder="username" value={form.user}
          onChange={(e) => setForm({ ...form, user: e.target.value })} required />
        <input className="input text-center" dir="ltr" placeholder="123456" inputMode="numeric"
          value={form.pin} onChange={(e) => setForm({ ...form, pin: e.target.value.replace(/\D/g, "").slice(0, 6) })} required />
        <input className="input" placeholder="الاسم" value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="input" placeholder="المكتب" value={form.office}
          onChange={(e) => setForm({ ...form, office: e.target.value })} />
        <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option value="member">عضو</option>
          <option value="developer">مطوّر (يرى الكل)</option>
        </select>
        <button className="btn-primary justify-center" disabled={form.pin.length !== 6}>إضافة</button>
      </form>
      <span className="text-xs text-saudi-light">{msg}</span>
      <ul className="mt-3 grid gap-1 text-sm">
        {members.map((m) => (
          <li key={m.user} className="flex items-center justify-between border-b border-line py-1.5">
            <span dir="ltr" className="text-slate-300">{m.user} <span className="text-slate-500">({m.pin})</span></span>
            <span className="text-xs text-slate-400">{m.name} — {m.office} — {m.role === "developer" ? "مطوّر" : "عضو"}</span>
            <button onClick={() => del(m.user)} className="text-xs text-red-400 hover:underline">حذف</button>
          </li>
        ))}
        {members.length === 0 && <li className="text-slate-500 text-xs">لا أعضاء بعد</li>}
      </ul>
    </div>
  );
}
