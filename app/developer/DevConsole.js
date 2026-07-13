"use client";
import { useEffect, useState } from "react";

export default function DevConsole() {
  const [data, setData] = useState({ members: [], offices: [] });
  const [mForm, setMForm] = useState({ user: "", pin: "", name: "", office: "", role: "member" });
  const [oName, setOName] = useState("");
  const [msg, setMsg] = useState("");

  async function load() {
    const r = await fetch("/api/developer");
    if (r.ok) setData(await r.json());
  }
  useEffect(() => { load(); }, []);

  async function addOffice(e) {
    e.preventDefault();
    const r = await fetch("/api/developer", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "office", name: oName }) });
    setMsg((await r.json()).error || "أُضيف المكتب ✓"); if (r.ok) { setOName(""); load(); }
  }
  async function addMember(e) {
    e.preventDefault();
    const r = await fetch("/api/developer", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "member", ...mForm }) });
    setMsg((await r.json()).error || "أُضيف العضو ✓"); if (r.ok) { setMForm({ user: "", pin: "", name: "", office: "", role: "member" }); load(); }
  }
  async function del(kind, key) {
    await fetch("/api/developer", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind, key }) });
    load();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* المكاتب */}
      <div className="card p-6">
        <h2 className="font-bold">المكاتب ({data.offices.length})</h2>
        <form onSubmit={addOffice} className="mt-3 flex gap-2">
          <input className="input" placeholder="اسم مكتب جديد" value={oName} onChange={(e) => setOName(e.target.value)} required />
          <button className="btn-primary shrink-0">إضافة</button>
        </form>
        <ul className="mt-3 grid gap-1 text-sm">
          {data.offices.map((o) => (
            <li key={o.id} className="flex items-center justify-between border-b py-1.5" style={{ borderColor: "var(--line)" }}>
              <span>{o.name}</span>
              <button onClick={() => del("office", o.name)} className="text-xs text-red-400 hover:underline">حذف</button>
            </li>
          ))}
          {data.offices.length === 0 && <li className="text-faint text-xs">لا مكاتب</li>}
        </ul>
      </div>

      {/* الأعضاء */}
      <div className="card p-6">
        <h2 className="font-bold">أعضاء المكاتب ({data.members.length})</h2>
        <form onSubmit={addMember} className="mt-3 grid gap-2">
          <div className="grid grid-cols-2 gap-2">
            <input className="input" dir="ltr" placeholder="username" value={mForm.user} onChange={(e) => setMForm({ ...mForm, user: e.target.value })} required />
            <input className="input text-center" dir="ltr" placeholder="رمز 6 أرقام" inputMode="numeric"
              value={mForm.pin} onChange={(e) => setMForm({ ...mForm, pin: e.target.value.replace(/\D/g, "").slice(0, 6) })} required />
          </div>
          <input className="input" placeholder="الاسم الكامل" value={mForm.name} onChange={(e) => setMForm({ ...mForm, name: e.target.value })} />
          <div className="grid grid-cols-2 gap-2">
            <select className="input" value={mForm.office} onChange={(e) => setMForm({ ...mForm, office: e.target.value })} required>
              <option value="">اختر المكتب</option>
              {data.offices.map((o) => <option key={o.id} value={o.name}>{o.name}</option>)}
            </select>
            <select className="input" value={mForm.role} onChange={(e) => setMForm({ ...mForm, role: e.target.value })}>
              <option value="member">عضو</option>
              <option value="developer">مطوّر</option>
            </select>
          </div>
          <button className="btn-primary justify-center" disabled={mForm.pin.length !== 6 || !mForm.office}>إنشاء العضو</button>
        </form>
        <div className="mt-1 text-xs text-gold-c">{msg}</div>
        <ul className="mt-3 grid gap-1 text-sm">
          {data.members.map((m) => (
            <li key={m.user} className="flex items-center justify-between border-b py-1.5" style={{ borderColor: "var(--line)" }}>
              <span dir="ltr" className="text-muted">{m.user} <span className="text-faint">({m.pin})</span></span>
              <span className="text-xs text-faint">{m.office} — {m.role === "developer" ? "مطوّر" : "عضو"}</span>
              <button onClick={() => del("member", m.user)} className="text-xs text-red-400 hover:underline">حذف</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
