"use client";
import { useEffect, useState } from "react";

const DEFAULTS = { theme: "light", palette: "n9", font: "modern" };

export default function ThemeToggle() {
  const [appearance, setAppearance] = useState(DEFAULTS);
  useEffect(() => {
    const next = { theme: localStorage.getItem("n9-theme") || "light", palette: localStorage.getItem("n9-palette") || "n9", font: localStorage.getItem("n9-font") || "modern" };
    setAppearance(next);
    apply(next);
  }, []);
  function apply(next) {
    document.documentElement.setAttribute("data-theme", next.theme);
    document.documentElement.setAttribute("data-palette", next.palette);
    document.documentElement.setAttribute("data-font", next.font);
  }
  function update(key, value) {
    const next = { ...appearance, [key]: value };
    setAppearance(next); localStorage.setItem(`n9-${key}`, value); apply(next);
  }
  return <details className="relative">
    <summary className="btn-ghost cursor-pointer list-none text-xs">المظهر</summary>
    <div className="card absolute left-0 top-full z-50 mt-2 grid w-64 gap-3 p-4 text-sm shadow-2xl">
      <label className="grid gap-1"><span className="text-muted">الوضع</span><select className="input" value={appearance.theme} onChange={(e) => update("theme", e.target.value)}><option value="light">فاتح (الافتراضي)</option><option value="dark">داكن</option></select></label>
      <label className="grid gap-1"><span className="text-muted">لوحة الألوان</span><select className="input" value={appearance.palette} onChange={(e) => update("palette", e.target.value)}><option value="n9">نيلي وذهبي</option><option value="sundus">أخضر سندس</option><option value="indigo">نيلي هادئ</option><option value="sand">ذهبي رملي</option></select></label>
      <label className="grid gap-1"><span className="text-muted">خط العرض</span><select className="input" value={appearance.font} onChange={(e) => update("font", e.target.value)}><option value="modern">حديث</option><option value="naskh">نسخ للقراءة</option><option value="large">قراءة كبيرة</option></select></label>
    </div>
  </details>;
}
