export const metadata = { title: "حول — N9 LIBRARY" };

export default function AboutPage() {
  return (
    <div className="mx-auto grid max-w-3xl gap-6">
      <h1 className="text-2xl font-bold text-white">حول المكتبة</h1>
      <div className="card p-6 leading-9 text-slate-300">
        <p>
          <strong className="text-white">N9 LIBRARY — Saudi Law Edition</strong> مكتبة رقمية
          تجمع الأنظمة واللوائح والمراسيم والقرارات الرسمية في المملكة العربية السعودية في
          مكان واحد، مع بحث ذكي وتصنيفات وتاغات تسهّل الوصول للوثيقة المطلوبة وتحميلها من مصدرها.
        </p>
        <p className="mt-4">
          جميع الوثائق الرسمية منسوبة إلى مصدرها:
          <a href="https://ncar.gov.sa" target="_blank" rel="noopener noreferrer" className="text-saudi-light"> المركز الوطني للوثائق والمحفوظات — الأرشيف السعودي الرسمي</a>،
          وكل صفحة وثيقة تحتوي رابط المصدر الأصلي المباشر.
        </p>
      </div>
      <div className="card p-6">
        <div className="text-xs font-semibold text-gold">الشريك المهني</div>
        <div className="mt-2 text-xl font-bold text-white">شركة سلطان المالكي للمحاماة والاستشارات القانونية</div>
        <p className="mt-2 text-sm leading-7 text-muted">منصة قانونية تجمع المصادر الرسمية والمراجع المهنية وتسهّل الوصول إليها للباحثين والممارسين.</p>
        <a href="mailto:NASSEH2005@GMAIL.COM" className="mt-1 block text-saudi-light">
          NASSEH2005@GMAIL.COM
        </a>
      </div>
    </div>
  );
}
