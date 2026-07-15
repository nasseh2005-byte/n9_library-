import Link from "next/link";
import Image from "next/image";
import { getMeta } from "@/lib/data";
import PartnerBar from "@/components/PartnerBar";
import Icon from "@/components/Icon";

export default function Hub() {
  const meta = getMeta();
  return (
    <div className="grid gap-12 py-6">
      <section className="source-hero card overflow-hidden p-7 md:p-10">
        <div className="relative grid items-center gap-8 md:grid-cols-[1fr_240px]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-saudi/20 bg-white/75 px-3 py-1 text-xs font-semibold text-saudi-dark">
              <Icon name="shield" size={14} /> مكتبة قانونية سعودية متعددة المصادر
            </div>
            <h1 className="hero-title mt-5 text-5xl font-bold md:text-7xl">N9 LIBRARY</h1>
            <div className="mt-2 text-lg font-semibold text-gold-dark">المكتبة القانونية الرقمية</div>
            <p className="mt-5 max-w-2xl leading-9 text-muted">
              وصول موحّد إلى الأنظمة واللوائح والمدونات القضائية والمراجع المهنية، مستند إلى الأرشيف الوطني السعودي وديوان المظالم والجهات الرسمية، مع رابط المصدر وتنزيل الوثيقة.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/library" className="btn-primary px-6 py-3">تصفح المكتبة</Link>
              <Link href="/sources" className="btn-ghost px-6 py-3">المصادر الرسمية</Link>
            </div>
          </div>
          <div className="mx-auto overflow-hidden rounded-[2rem] bg-white p-2 shadow-xl ring-1 ring-gold/25">
            <Image src="/n9-library-logo.png" alt="شعار N9 Library" width={230} height={230} priority className="h-auto w-full scale-[1.18] rounded-[1.5rem]" />
          </div>
        </div>
      </section>

      <PartnerBar />

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["shield", "مصادر رسمية", "الأرشيف الوطني السعودي وديوان المظالم واللجان المصرفية", "/sources"],
          ["book", "7 آلاف+ مرجع", "فهرس موحّد للوثائق الرسمية والمراجع المضافة للمكتب الرئيسي", "/library"],
          ["folder", "تزويد مستمر", "رفع ملفات المطور وفهرسة المصادر الجديدة داخل المنصة", "/developer"],
        ].map(([icon, title, desc, href]) => (
          <Link key={href} href={href} className="card source-card p-5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-saudi/10 text-saudi"><Icon name={icon} size={20} /></span>
            <h2 className="mt-3 text-lg font-bold">{title}</h2>
            <p className="mt-1 text-sm leading-7 text-muted">{desc}</p>
          </Link>
        ))}
      </section>

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
