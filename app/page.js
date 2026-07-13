import Link from "next/link";
import Image from "next/image";
import { getMeta } from "@/lib/data";
import PartnerBar from "@/components/PartnerBar";
import Icon from "@/components/Icon";

export default function Hub() {
  const meta = getMeta();
  return (
    <div className="grid gap-12 py-6">
      <section className="text-center">
        <div className="mx-auto flex w-fit items-center gap-5">
          <span className="rounded-xl bg-white p-2 shadow-xl ring-2 ring-gold/50">
            <Image src="/n9-logo.png" alt="N9" width={96} height={44} priority className="h-11 w-auto" />
          </span>
          <div className="text-right">
            <h1 className="hero-title text-5xl font-bold md:text-6xl">N9 LIBRARY</h1>
            <div className="mt-1 text-sm tracking-widest text-muted">المكتبة القانونية الرقمية</div>
          </div>
        </div>
        <div className="mx-auto mt-4 h-0.5 w-40 rounded-full"
          style={{ background: "linear-gradient(90deg, transparent, #C9A227, transparent)" }} />
        <p className="mx-auto mt-5 max-w-2xl leading-9 text-muted">
          منصة قانونية شاملة — بحث ذكي بالمحتوى، مساعد قانوني مدموج، خزنة خاصة للمكاتب،
          وملفات حالات تعمل فعليًا. ابدأ من البوابة السعودية.
        </p>
      </section>

      <PartnerBar />

      {/* البوابة السعودية - بطاقة رئيسية بارزة */}
      <section>
        <Link href="/sa"
          className="card card-gold group relative block overflow-hidden p-8 transition-all hover:-translate-y-1 hover:border-gold hover:shadow-[0_16px_50px_-12px_rgba(201,162,39,0.4)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(201,162,39,0.14),transparent_60%)]" />
          <div className="relative flex flex-col items-center gap-6 md:flex-row md:justify-between">
            <div className="flex items-center gap-5 text-center md:text-right">
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl surface-2 text-gold-c ring-1 ring-gold/30">
                <Icon name="scale" size={34} />
              </span>
              <div>
                <h2 className="font-serif text-2xl font-bold" style={{ color: "var(--text)" }}>البوابة القانونية السعودية</h2>
                <div className="text-sm text-gold-c">Saudi Law Edition</div>
                <p className="mt-3 max-w-md text-sm leading-7 text-muted">
                  {meta.total.toLocaleString("ar-SA")} وثيقة رسمية — أنظمة ولوائح ومراسيم وقرارات —
                  منذ 1350هـ، مفهرسة بـ{meta.tagTotal.toLocaleString("ar-SA")} تاغ مع رابط المصدر لكل وثيقة.
                </p>
              </div>
            </div>
            <div className="btn-primary shrink-0 px-6 py-3 text-base">ادخل البوابة</div>
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
          ["search", "البحث الشامل", "ابحث في الأرشيف والخزنة والحالات دفعة واحدة", "/find"],
          ["sparkle", "المساعد القانوني", "اسأل واحصل على جواب من الأرشيف — مجانًا", "/assistant"],
          ["reply", "الردود على القضاة", "رد جاهز على الاستئناف ومذكرات الخصم", "/replies"],
          ["folder", "خزنة المكاتب", "أحكام ومرفقات وملفات حالات خاصة", "/vault"],
        ].map(([icon, title, desc, href]) => (
          <Link key={href} href={href} className="card p-5 transition-all hover:-translate-y-0.5 hover:border-gold">
            <span className="grid h-10 w-10 place-items-center rounded-lg surface-2 text-gold-c"><Icon name={icon} size={20} /></span>
            <div className="mt-3 font-bold" style={{ color: "var(--text)" }}>{title}</div>
            <p className="mt-1 text-xs leading-6 text-muted">{desc}</p>
          </Link>
        ))}
      </section>

      <section className="card card-gold flex flex-col items-center justify-between gap-4 p-7 md:flex-row">
        <div>
          <div className="text-xs font-semibold text-gold-c">من نفس المطور</div>
          <h2 className="mt-1 text-xl font-bold">N9 LAW SYSTEM — إدارة القضايا ومكاتب المحاماة</h2>
        </div>
        <div className="flex gap-2">
          <a href="https://n9-apps-script-edition.vercel.app/" target="_blank" rel="noopener noreferrer"
            className="btn-primary">جرّب النظام مباشرة ↗</a>
          <Link href="/n9-law-system" className="btn-ghost">التفاصيل</Link>
        </div>
      </section>
    </div>
  );
}
