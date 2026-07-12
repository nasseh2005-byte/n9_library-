import Link from "next/link";
import Image from "next/image";

const nav = [
  { href: "/sa", label: "🇸🇦 السعودية" },
  { href: "/library", label: "المكتبة" },
  { href: "/search", label: "البحث الذكي" },
  { href: "/stats", label: "الإحصائيات" },
  { href: "/vault", label: "الخزنة" },
  { href: "/cases", label: "الحالات" },
  { href: "/blog", label: "المدونة" },
  { href: "/n9-law-system", label: "N9 LAW SYSTEM" },
  { href: "/about", label: "حول" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-night/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/n9-logo.svg" alt="N9" width={42} height={42} priority />
          <div className="leading-tight">
            <div className="font-bold text-white">N9 LIBRARY</div>
            <div className="text-[11px] text-saudi-light">Saudi Law Edition</div>
          </div>
        </Link>
        <nav className="hidden gap-1 lg:flex">
          {nav.map((n) => (
            <Link key={n.href} href={n.href}
              className="rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-panel hover:text-white transition-colors">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          <Link href="/login" className="btn-ghost text-xs">دخول الأعضاء</Link>
          <Link href="/admin" className="btn-ghost text-xs">الإدارة</Link>
        </div>
        {/* قائمة الجوال */}
        <details className="relative lg:hidden">
          <summary className="btn-ghost cursor-pointer list-none text-sm">☰ القائمة</summary>
          <div className="absolute left-0 top-full z-50 mt-2 grid w-56 gap-1 rounded-xl border border-line bg-panel p-2 shadow-xl">
            {nav.map((n) => (
              <Link key={n.href} href={n.href}
                className="rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-night hover:text-white">
                {n.label}
              </Link>
            ))}
            <div className="my-1 border-t border-line" />
            <Link href="/login" className="rounded-lg px-3 py-2 text-sm text-saudi-light hover:bg-night">دخول الأعضاء</Link>
            <Link href="/admin" className="rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-night">الإدارة</Link>
          </div>
        </details>
      </div>
    </header>
  );
}
