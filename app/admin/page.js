"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const router = useRouter();

  async function login(e) {
    e.preventDefault();
    setErr("");
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) router.push("/admin/dashboard");
    else setErr("كلمة المرور غير صحيحة");
  }

  return (
    <div className="mx-auto max-w-sm">
      <div className="card p-8">
        <h1 className="text-xl font-bold text-white">لوحة الإدارة</h1>
        <p className="mt-1 text-sm text-slate-400">الدخول للمدير فقط</p>
        <form onSubmit={login} className="mt-6 grid gap-3">
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="input" placeholder="كلمة المرور" autoFocus />
          {err ? <div className="text-sm text-red-400">{err}</div> : null}
          <button className="btn-primary justify-center">دخول</button>
        </form>
      </div>
    </div>
  );
}
