import Link from "next/link";
import Image from "next/image";
import ThemeToggle from "./ThemeToggle";
import SWRegister from "./SWRegister";
import Icon from "./Icon";

const primary = [
  { href: "/library", label: "المكتبة", icon: "book" },
  { href: "/find", label: "البحث الشامل", icon: "search" },
  { href: "/assistant", label: "المساعد", icon: "sparkle" },
  { href: "/stats", label: "الإحصائيات", icon: "chart" },
];
const secondary = [
  { href: "/vault", label: "الخزنة الخاصة", icon: "folder" },
  { href: "/cases", label: "ملفات الحالات", icon: "file" },
  { href: "/replies", label: "الردود على القضاة", icon: "reply" },
  { href: "/office", label: "لوحة المكتب", icon: "building" },
  { href: "/developer", label: "لوحة المطوّر", icon: "shield" },
  { href: "/blog", label: "المدونة", icon: "edit" },
  { href: "/n9-law-system", label: "N9 LAW SYSTEM", icon: "scale" },
  { href: "/about", label: "حول", icon: "home" },
];
const all = [{ href: "/sa", label: "البوابة السعودية", icon: "scale" }, ...primary, ...secondary];

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
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-muted hover:text-gold-c transition-colors">
              <Icon name={n.icon} size={15} /> {n.label}
            </Link>
          ))}
          <details className="relative">
            <summary className="cursor-pointer list-none rounded-lg px-3 py-2 text-sm text-muted hover:text-gold-c">المزيد ▾</summary>
            <div className="card absolute left-0 top-full z-50 mt-2 grid w-56 gap-0.5 p-2 shadow-2xl">
              {secondary.map((n) => (
                <Link key={n.href} href={n.href} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted hover:surface-2 hover:text-gold-c">
                  <Icon name={n.icon} size={15} /> {n.label}
                </Link>
              ))}
            </div>
          </details>
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <ThemeToggle />
          <Link href="/login" className="btn-ghost text-xs">دخول الأعضاء</Link>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <details className="relative">
            <summary className="btn-ghost cursor-pointer list-none text-sm">القائمة</summary>
            <div className="card absolute left-0 top-full z-50 mt-2 grid w-60 gap-0.5 p-2 shadow-2xl">
              {all.map((n) => (
                <Link key={n.href} href={n.href} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted hover:surface-2 hover:text-gold-c">
                  <Icon name={n.icon} size={15} /> {n.label}
                </Link>
              ))}
              <div className="my-1 border-t" style={{ borderColor: "var(--line)" }} />
              <Link href="/login" className="rounded-lg px-3 py-2 text-sm text-gold-c">دخول الأعضاء</Link>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
