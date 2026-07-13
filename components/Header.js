import Link from "next/link";
import Image from "next/image";
import ThemeToggle from "./ThemeToggle";
import SWRegister from "./SWRegister";

// روابط أساسية (تظهر دائمًا على الشاشات الكبيرة)
const primary = [
  { href: "/library", label: "المكتبة" },
  { href: "/search", label: "البحث" },
  { href: "/assistant", label: "المساعد" },
  { href: "/stats", label: "الإحصائيات" },
];
// روابط الأعضاء والثانوية
const secondary = [
  { href: "/vault", label: "الخزنة" },
  { href: "/cases", label: "الحالات" },
  { href: "/office", label: "لوحة المكتب" },
  { href: "/blog", label: "المدونة" },
  { href: "/n9-law-system", label: "N9 LAW SYSTEM" },
  { href: "/about", label: "حول" },
];
const all = [{ href: "/sa", label: "🇸🇦 البوابة السعودية" }, ...primary, ...secondary];

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b backdrop-blur"
      style={{ borderColor: "var(--line)", backgroundColor: "color-mix(in srgb, var(--bg) 88%, transparent)" }}>
      <SWRegister />
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <span className="rounded-lg bg-white p-1 shadow-md ring-1 ring-gold/40">
            <Image src="/n9-logo.png" alt="N9" width={52} height={24} priority className="h-6 w-auto" />
          </span>
          <div className="leading-tight">
            <div className="font-serif font-bold" style={{ color: "var(--text)" }}>N9 LIBRARY</div>
            <div className="text-[11px] text-gold-c">Saudi Law Edition</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex">
          {primary.map((n) => (
            <Link key={n.href} href={n.href}
              className="rounded-lg px-3 py-2 text-sm text-muted hover:text-saudi-light transition-colors">
              {n.label}
            </Link>
          ))}
          {/* قائمة المزيد */}
          <details className="relative">
            <summary className="cursor-pointer list-none rounded-lg px-3 py-2 text-sm text-muted hover:text-saudi-light">المزيد ▾</summary>
            <div className="card absolute left-0 top-full z-50 mt-2 grid w-52 gap-0.5 p-2 shadow-2xl">
              {secondary.map((n) => (
                <Link key={n.href} href={n.href} className="rounded-lg px-3 py-2 text-sm text-muted hover:surface-2 hover:text-saudi-light">{n.label}</Link>
              ))}
            </div>
          </details>
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <ThemeToggle />
          <Link href="/login" className="btn-ghost text-xs">دخول الأعضاء</Link>
          <Link href="/admin" className="btn-ghost text-xs">الإدارة</Link>
        </div>

        {/* الجوال */}
        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <details className="relative">
            <summary className="btn-ghost cursor-pointer list-none text-sm">☰</summary>
            <div className="card absolute left-0 top-full z-50 mt-2 grid w-56 gap-0.5 p-2 shadow-2xl">
              {all.map((n) => (
                <Link key={n.href} href={n.href} className="rounded-lg px-3 py-2 text-sm text-muted hover:surface-2 hover:text-saudi-light">{n.label}</Link>
              ))}
              <div className="my-1 border-t" style={{ borderColor: "var(--line)" }} />
              <Link href="/login" className="rounded-lg px-3 py-2 text-sm text-saudi-light">دخول الأعضاء</Link>
              <Link href="/admin" className="rounded-lg px-3 py-2 text-sm text-faint">الإدارة</Link>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
