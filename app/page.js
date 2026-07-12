import Link from "next/link";
import Image from "next/image";
import { getMeta } from "@/lib/data";

export default function Hub() {
  const meta = getMeta();
  const editions = [
    {
      code: "sa", flag: "🇸🇦", active: true, href: "/sa",
      name: "النسخة السعودية", en: "Saudi Law Edition",
      desc: `${meta.total.toLocaleString("ar-SA")} وثيقة رسمية • ${meta.tagTotal.toLocaleString("ar-SA")} تاغ • منذ 1350هـ`,
    },
    { code: "gcc", flag: "🕌", active: false, name: "النسخة الخليجية", en: "GCC Edition", desc: "الأنظمة الخليجية الموحدة — قريبًا" },
    { code: "int", flag: "⚖️", active: false, name: "الاتفاقيات الدولية", en: "International", desc: "المعاهدات والاتفاقيات — قريبًا" },
  ];
  return (
    <div className="grid gap-12 py-6">
      <section className="text-center">
        <div className="mx-auto flex w-fit items-center gap-4">
          <Image src="/n9-logo.svg" alt="N9" width={72} height={72} priority />
          <div className="text-right">
            <h1 className="hero-title text-5xl font-bold md:text-6xl">N9 LIBRARY</h1>
            <div className="mt-1 text-sm tracking-widest text-slate-400">المكتبة القانونية الرقمية</div>
          </div>
        </div>
        <p className="mx-auto mt-6 max-w-2xl leading-9 text-slate-400">
          منصة شاملة للتشريعات والأنظمة — اختر النسخة لتفتح بياناتها: بحث ذكي بالمحتوى،
          تصنيفات وتاغات، خزنة خاصة للمكاتب، وملفات حالات تعمل فعليًا.
        </p>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {editions.map((e) =>
          e.active ? (
            <Link key={e.code} href={e.href}
              className="card group relative overflow-hidden border-saudi/50 p-7 transition-all hover:-translate-y-1 hover:border-saudi hover:shadow-[0_10px_40px_-10px_rgba(27,131,84,0.4)]">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(27,131,84,0.18),transparent_65%)]" />
              <div className="relative">
                <div className="text-4xl">{e.flag}</div>
                <h2 className="mt-3 text-xl font-bold text-white">{e.name}</h2>
                <div className="text-xs text-saudi-light">{e.en}</div>
                <p className="mt-3 text-sm leading-7 text-slate-400">{e.desc}</p>
                <div className="btn-primary mt-5 w-fit">ادخل المكتبة ←</div>
              </div>
            </Link>
          ) : (
            <div key={e.code} className="card p-7 opacity-60">
              <div className="text-4xl grayscale">{e.flag}</div>
              <h2 className="mt-3 text-xl font-bold text-slate-300">{e.name}</h2>
              <div className="text-xs text-slate-500">{e.en}</div>
              <p className="mt-3 text-sm leading-7 text-slate-500">{e.desc}</p>
              <div className="mt-5 w-fit rounded-lg border border-line px-4 py-2 text-xs text-slate-500">قريبًا</div>
            </div>
          )
        )}
      </section>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[["وثيقة رسمية", meta.total], ["تصنيف", meta.categories.length],
          ["تاغ فريد", meta.tagTotal], ["سنة تشريعية", meta.years.length]].map(([k, v]) => (
          <div key={k} className="card p-5 text-center">
            <div className="stat-num">{Number(v).toLocaleString("ar-SA")}</div>
            <div className="mt-1 text-sm text-slate-400">{k}</div>
          </div>
        ))}
      </section>

      <section className="card flex flex-col items-center justify-between gap-4 border-gold/30 p-7 md:flex-row">
        <div>
          <div className="text-xs font-semibold text-gold">من نفس المطور</div>
          <h2 className="mt-1 text-xl font-bold text-white">N9 LAW SYSTEM — إدارة القضايا ومكاتب المحاماة</h2>
        </div>
        <Link href="/n9-law-system" className="btn-primary">تعرف عليه</Link>
      </section>
    </div>
  );
}
