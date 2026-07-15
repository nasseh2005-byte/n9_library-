import Link from "next/link";
import Image from "next/image";
import ThemeToggle from "./ThemeToggle";
import SWRegister from "./SWRegister";
import Icon from "./Icon";

const primary = [
  { href: "/library", label: "المكتبة", icon: "book" },
  { href: "/sources", label: "المصادر", icon: "shield" },
  { href: "/find", label: "البحث الشامل", icon: "search" },
  { href: "/assistant", label: "المساعد", icon: "sparkle" },
  { href: "/stats", label: "الإحصائيات", icon: "chart" },
];
const secondary = [
  { href: "/favorites", label: "مفضلاتي", icon: "star" },
  { href: "/account", label: "حسابي الشخصي", icon: "home" },
  { href: "/suggestions", label: "الاقتراحات", icon: "edit" },
  { href: "/vault", label: "الخزنة الخاصة", icon: "folder" },
  { href: "/cases", label: "ملفات الحالات", icon: "file" },
  { href: "/replies", label: "الردود على القضاة", icon: "reply" },
  { href: "/office", label: "لوحة الشركة", icon: "building" },
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
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5">
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <span className="overflow-hidden rounded-xl bg-white p-0.5 shadow-sm ring-1 ring-gold/30">
            <Image src="/n9-library-logo.png" alt="N9 Library" width={48} height={48} priority className="h-11 w-11 scale-[1.28] object-cover" />
          </span>
          <div className="leading-tight">
            <div className="font-serif text-lg font-bold tracking-wide" style={{ color: "var(--text)" }}>N9 LIBRARY</div>
            <div className="text-[10px] font-semibold text-gold-c">المكتبة القانونية السعودية</div>
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
          <Link href="/account" className="btn-ghost text-xs">حسابي</Link>
          <Link href="/login" className="btn-ghost text-xs">دخول فريق الشركة</Link>
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
              <Link href="/login" className="rounded-lg px-3 py-2 text-sm text-gold-c">دخول فريق الشركة</Link>
              <Link href="/account" className="rounded-lg px-3 py-2 text-sm text-gold-c">حسابي الشخصي</Link>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
