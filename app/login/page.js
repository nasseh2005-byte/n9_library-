"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [user, setUser] = useState("");
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");
  const router = useRouter();

  async function login(e) {
    e.preventDefault();
    setErr("");
    const res = await fetch("/api/member-auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user, pin }),
    });
    const j = await res.json().catch(() => ({}));
    if (res.ok) router.push("/vault");
    else setErr(j.error || "فشل الدخول");
  }

  return (
    <div className="mx-auto max-w-sm">
      <div className="card p-8">
        <h1 className="text-xl font-bold text-white">دخول الأعضاء</h1>
        <p className="mt-1 text-sm text-slate-400">
          للمكاتب المنضمة للمجموعة — يمنحك الوصول للمصادر الخاصة (الأحكام والمرفقات)
        </p>
        <form onSubmit={login} className="mt-6 grid gap-3">
          <input value={user} onChange={(e) => setUser(e.target.value)}
            className="input" placeholder="اسم المستخدم" autoFocus dir="ltr" />
          <input value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="input text-center tracking-[0.5em]" placeholder="●●●●●●"
            inputMode="numeric" type="password" dir="ltr" />
          <div className="text-xs text-slate-500">الرمز 6 أرقام — يحدده مدير المكتبة من صفحة الإعدادات</div>
          {err ? <div className="text-sm text-red-400">{err}</div> : null}
          <button className="btn-primary justify-center" disabled={pin.length !== 6 || !user}>دخول</button>
        </form>
      </div>
    </div>
  );
}
