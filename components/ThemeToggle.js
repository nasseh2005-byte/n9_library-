"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState("light");
  useEffect(() => {
    const saved = localStorage.getItem("n9-theme") || "light";
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);
  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("n9-theme", next);
    document.documentElement.setAttribute("data-theme", next);
  }
  return (
    <button onClick={toggle} className="btn-ghost text-xs" title="تبديل الوضع" aria-label="تبديل الوضع الليلي/النهاري">
      {theme === "dark" ? "الوضع الفاتح" : "الوضع الليلي"}
    </button>
  );
}
