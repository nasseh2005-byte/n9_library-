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
  if (user) return <div className="card mx-auto max-w-lg p-8 text-center"><h1 className="text-2xl font-bold">مرحبًا {user.displayName}</h1><p className="mt-2 text-muted">حسابك الشخصي مخصص لحفظ الوثائق والمفضلات، وهو مستقل عن حسابات فريق الشركة.</p><div className="mt-5 flex justify-center gap-2"><a href="/favorites" className="btn-primary">مفضلاتي</a><button onClick={logout} className="btn-ghost">تسجيل الخروج</button></div></div>;
  const googleError = params.get("google");
  return <div className="card mx-auto max-w-lg p-7">
    <h1 className="text-2xl font-bold">حسابي في N9 Library</h1>
    <p className="mt-1 text-sm text-muted">احفظ الوثائق المهمة في مفضلاتك وارجع إليها من أي جهاز.</p>
    <div className="mt-4 flex gap-2"><button onClick={() => setMode("login")} className={mode === "login" ? "btn-primary" : "btn-ghost"}>تسجيل الدخول</button><button onClick={() => setMode("register")} className={mode === "register" ? "btn-primary" : "btn-ghost"}>إنشاء حساب</button></div>
    <form onSubmit={submit} className="mt-4 grid gap-3">
      {mode === "register" ? <input className="input" name="displayName" placeholder="الاسم الظاهر" /> : null}
      <input className="input" name="username" dir="ltr" placeholder="اسم المستخدم" required />
      <input className="input" name="password" type="password" dir="ltr" placeholder="كلمة المرور (6 أحرف على الأقل)" required minLength={6} />
      <button className="btn-primary justify-center">{mode === "login" ? "تسجيل الدخول" : "إنشاء الحساب"}</button>
    </form>
    {googleEnabled ? <a href="/api/user-auth/google" className="btn-ghost mt-3 w-full justify-center">المتابعة بحساب Google</a> : null}
    <p className="mt-3 text-sm text-red-500">{message || (googleError ? "تعذر إكمال تسجيل الدخول عبر Google. حاول مرة أخرى." : "")}</p>
  </div>;
}
