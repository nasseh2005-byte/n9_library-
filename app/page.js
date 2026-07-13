import Link from "next/link";
import Image from "next/image";
import { getMeta } from "@/lib/data";

export default function Hub() {
  const meta = getMeta();
  return (
    <div className="grid gap-12 py-6">
      <section className="text-center">
        <div className="mx-auto flex w-fit items-center gap-4">
          <Image src="/n9-logo.svg" alt="N9" width={72} height={72} priority />
          <div className="text-right">
            <h1 className="hero-title text-5xl font-bold md:text-6xl">N9 LIBRARY</h1>
            <div className="mt-1 text-sm tracking-widest text-muted">المكتبة القانونية الرقمية</div>
          </div>
        </div>
        <p className="mx-auto mt-6 max-w-2xl leading-9 text-muted">
          منصة قانونية شاملة — بحث ذكي بالمحتوى، مساعد قانوني مدموج، خزنة خاصة للمكاتب،
          وملفات حالات تعمل فعليًا. ابدأ من البوابة السعودية.
        </p>
      </section>

      {/* البوابة السعودية - بطاقة رئيسية بارزة */}
      <section>
        <Link href="/sa"
          className="card group relative block overflow-hidden border-saudi/40 p-8 transition-all hover:-translate-y-1 hover:border-saudi hover:shadow-[0_16px_50px_-12px_rgba(27,131,84,0.45)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(27,131,84,0.2),transparent_60%)]" />
          <div className="relative flex flex-col items-center gap-6 md:flex-row md:justify-between">
            <div className="text-center md:text-right">
              <div className="text-5xl">🇸🇦</div>
              <h2 className="mt-3 text-2xl font-bold" style={{ color: "var(--text)" }}>البوابة القانونية السعودية</h2>
              <div className="text-sm text-saudi-light">Saudi Law Edition</div>
              <p className="mt-3 max-w-md text-sm leading-7 text-muted">
                {meta.total.toLocaleString("ar-SA")} وثيقة رسمية — أنظمة ولوائح ومراسيم وقرارات —
                منذ 1350هـ، مفهرسة بـ{meta.tagTotal.toLocaleString("ar-SA")} تاغ مع رابط المصدر لكل وثيقة.
              </p>
            </div>
            <div className="btn-primary shrink-0 px-6 py-3 text-base">ادخل البوابة ←</div>
          </div>
        </Link>
      </section>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[["وثيقة رسمية", meta.total], ["تصنيف", meta.categories.length],
          ["تاغ فريد", meta.tagTotal], ["سنة تشريعية", meta.years.length]].map(([k, v]) => (
          <div key={k} className="card p-5 text-center">
            <div className="stat-num">{Number(v).toLocaleString("ar-SA")}</div>
            <div className="mt-1 text-sm text-muted">{k}</div>
          </div>
        ))}
      </section>

      {/* روابط سريعة للأدوات */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["🔍", "البحث الذكي", "ابحث في العناوين والملخصات والتاغات", "/search"],
          ["🤖", "المساعد القانوني", "اسأل واحصل على جواب من الأرشيف — مجانًا", "/assistant"],
          ["📊", "الإحصائيات", "لوحة بيانية حية لأرقام المكتبة", "/stats"],
          ["🔒", "خزنة المكاتب", "أحكام ومرفقات وملفات حالات خاصة", "/vault"],
        ].map(([icon, title, desc, href]) => (
          <Link key={href} href={href} className="card p-5 transition-all hover:-translate-y-0.5 hover:border-saudi">
            <div className="text-2xl">{icon}</div>
            <div className="mt-2 font-bold text-saudi-light">{title}</div>
            <p className="mt-1 text-xs leading-6 text-muted">{desc}</p>
          </Link>
        ))}
      </section>

      <section className="card flex flex-col items-center justify-between gap-4 border-gold/30 p-7 md:flex-row">
        <div>
          <div className="text-xs font-semibold" style={{ color: "#b8901f" }}>من نفس المطور</div>
          <h2 className="mt-1 text-xl font-bold" style={{ color: "var(--text)" }}>N9 LAW SYSTEM — إدارة القضايا ومكاتب المحاماة</h2>
        </div>
        <Link href="/n9-law-system" className="btn-primary">تعرف عليه</Link>
      </section>
    </div>
  );
}
