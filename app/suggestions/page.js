"use client";
import { useState } from "react";

export default function SuggestionsPage() {
  const [message, setMessage] = useState("");
  async function submit(event) {
    event.preventDefault(); setMessage("جاري الإرسال…");
    const body = Object.fromEntries(new FormData(event.currentTarget));
    const response = await fetch("/api/suggestions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await response.json();
    if (response.ok) { event.currentTarget.reset(); setMessage("شكرًا، تم استلام اقتراحك ✓"); } else setMessage(data.error || "تعذر الإرسال");
  }
  return <div className="mx-auto max-w-2xl"><div className="card p-7"><h1 className="text-2xl font-bold">اقتراحات الزوار</h1><p className="mt-2 text-muted">اقترح ملفًا أو مصدرًا أو تطويرًا للمكتبة دون الحاجة إلى تسجيل الدخول.</p><form onSubmit={submit} className="mt-5 grid gap-3"><div className="grid gap-3 md:grid-cols-2"><input className="input" name="name" placeholder="الاسم (اختياري)" /><input className="input" name="email" type="email" dir="ltr" placeholder="البريد للرد (اختياري)" /></div><textarea className="input min-h-40" name="text" placeholder="اكتب اقتراحك أو رابط الملف المقترح…" required minLength={10} /><button className="btn-primary justify-center">إرسال الاقتراح</button><p className="text-center text-sm text-gold-c">{message}</p></form></div></div>;
}
