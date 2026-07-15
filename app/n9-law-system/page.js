export const metadata = { title: "N9 LAW SYSTEM — إدارة القضايا للشركات القانونية" };

const features = [
  ["إدارة القضايا", "متابعة كاملة لدورة حياة القضية من القيد حتى الحكم والتنفيذ"],
  ["الجلسات والمواعيد", "جدولة الجلسات مع عدّاد أيام تلقائي وتنبيهات قبل الموعد"],
  ["المخالفات", "تسجيل ومتابعة المخالفات والاعتراضات ومهلها النظامية"],
  ["العملاء والموكلين", "ملف متكامل لكل عميل: قضاياه، مستنداته، مدفوعاته"],
  ["المستندات", "أرشفة اللوائح والمذكرات وربطها بالقضية والجلسة"],
  ["تقارير الشركة", "لوحات متابعة للإنتاجية وحالة القضايا"],
];

export default function N9LawSystemPage() {
  return (
    <div className="grid gap-8">
      <section className="card relative overflow-hidden p-10 text-center">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.12),transparent_60%)]" />
        <div className="relative">
          <div className="text-xs font-semibold text-gold">من مطوّر N9 LIBRARY</div>
          <h1 className="mt-2 text-3xl font-bold text-white md:text-4xl">N9 LAW SYSTEM</h1>
          <p className="mx-auto mt-3 max-w-2xl text-slate-400">
            نظام عربي متكامل لإدارة القضايا والمخالفات في الشركات القانونية —
            مصمم لسير العمل الحقيقي في المحاكم والجهات السعودية (معين، ناجز).
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a href="https://n9-apps-script-edition.vercel.app/" target="_blank" rel="noopener noreferrer"
              className="btn-primary">جرّب النظام مباشرة ↗</a>
            <a href="mailto:NASSEH2005@GMAIL.COM?subject=N9%20LAW%20SYSTEM" className="btn-ghost">
              تواصل للحصول عليه
            </a>
          </div>
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {features.map(([t, d]) => (
          <div key={t} className="card p-5">
            <div className="font-bold text-saudi-light">{t}</div>
            <p className="mt-2 text-sm leading-7 text-slate-400">{d}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
