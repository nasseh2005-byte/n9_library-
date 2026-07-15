"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AccountPanel({ user, googleEnabled }) {
  const [mode, setMode] = useState("login");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const params = useSearchParams();
  async function submit(event) {
    event.preventDefault();
    setMessage("جاري التحقق…");
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const response = await fetch("/api/user-auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: mode, ...values }) });
    const data = await response.json();
    if (!response.ok) return setMessage(data.error || "تعذر تسجيل الدخول");
    router.push(params.get("next") || "/favorites");
    router.refresh();
  }
  async function logout() { await fetch("/api/user-auth", { method: "DELETE" }); router.refresh(); }
  if (user) return <div className="card mx-auto max-w-lg p-8 text-center"><h1 className="text-2xl font-bold">مرحبًا {user.displayName}</h1><p className="mt-2 text-muted">هذا حساب حفظ شخصي ولا يمنح صلاحيات المكتب.</p><div className="mt-5 flex justify-center gap-2"><a href="/favorites" className="btn-primary">مفضلاتي</a><button onClick={logout} className="btn-ghost">تسجيل الخروج</button></div></div>;
  return <div className="card mx-auto max-w-lg p-7">
    <h1 className="text-2xl font-bold">حساب المكتبة الشخصي</h1>
    <p className="mt-1 text-sm text-muted">للمفضلة فقط؛ عضوية المكتب وتسجيلها الداخلي مستقلان.</p>
    <div className="mt-4 flex gap-2"><button onClick={() => setMode("login")} className={mode === "login" ? "btn-primary" : "btn-ghost"}>دخول</button><button onClick={() => setMode("register")} className={mode === "register" ? "btn-primary" : "btn-ghost"}>حساب جديد</button></div>
    <form onSubmit={submit} className="mt-4 grid gap-3">
      {mode === "register" ? <input className="input" name="displayName" placeholder="الاسم الظاهر" /> : null}
      <input className="input" name="username" dir="ltr" placeholder="username" required />
      <input className="input" name="password" type="password" dir="ltr" placeholder="كلمة المرور (6 أحرف على الأقل)" required minLength={6} />
      <button className="btn-primary justify-center">{mode === "login" ? "تسجيل الدخول" : "إنشاء الحساب"}</button>
    </form>
    {googleEnabled ? <a href="/api/user-auth/google" className="btn-ghost mt-3 w-full justify-center">المتابعة بحساب Google</a> : <p className="mt-3 text-xs text-faint">دخول Google يصبح متاحًا بعد إضافة GOOGLE_CLIENT_ID وGOOGLE_CLIENT_SECRET في Vercel.</p>}
    <p className="mt-3 text-sm text-red-500">{message}</p>
  </div>;
}
