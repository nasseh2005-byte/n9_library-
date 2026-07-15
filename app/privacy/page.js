export const metadata = { title: "سياسة الخصوصية — N9 LIBRARY" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto grid max-w-3xl gap-6">
      <h1 className="text-2xl font-bold">سياسة الخصوصية</h1>
      <div className="card grid gap-6 p-7 leading-8 text-muted">
        <section>
          <h2 className="font-bold" style={{ color: "var(--text)" }}>نطاق السياسة</h2>
          <p className="mt-2">توضح هذه السياسة كيفية تعامل N9 Library وشركة سلطان المالكي للمحاماة والاستشارات القانونية مع بيانات الحسابات والمفضلات والمحتوى الذي يضيفه المستخدمون.</p>
        </section>
        <section>
          <h2 className="font-bold" style={{ color: "var(--text)" }}>البيانات المستخدمة</h2>
          <p className="mt-2">قد نعالج اسم المستخدم والاسم الظاهر والبريد المرتبط بحساب Google، إضافة إلى الوثائق المحفوظة في المفضلات والمحتوى الذي يرفعه أعضاء فريق الشركة.</p>
        </section>
        <section>
          <h2 className="font-bold" style={{ color: "var(--text)" }}>الغرض من الاستخدام</h2>
          <p className="mt-2">تستخدم البيانات لتسجيل الدخول، وحفظ المفضلات، وإتاحة المساحات الخاصة، وتحسين البحث وتجربة استخدام المكتبة.</p>
        </section>
        <section>
          <h2 className="font-bold" style={{ color: "var(--text)" }}>الحماية والمشاركة</h2>
          <p className="mt-2">تحفظ البيانات الخاصة بصورة آمنة، ولا تباع لأطراف أخرى. ولا يشارك المحتوى الخاص خارج نطاق الصلاحيات الممنوحة للحساب إلا عند وجود التزام نظامي.</p>
        </section>
        <section>
          <h2 className="font-bold" style={{ color: "var(--text)" }}>المصادر الرسمية</h2>
          <p className="mt-2">الوثائق العامة منسوبة إلى جهاتها الرسمية، وتبقى حقوقها ومحتوياتها لتلك الجهات. تحتفظ المكتبة برابط المصدر لتمكين المستخدم من الرجوع إلى الأصل.</p>
        </section>
        <section>
          <h2 className="font-bold" style={{ color: "var(--text)" }}>التواصل</h2>
          <p className="mt-2">للاستفسارات المتعلقة بالخصوصية: <a href="mailto:NASSEH2005@GMAIL.COM" className="text-gold-c" dir="ltr">NASSEH2005@GMAIL.COM</a></p>
        </section>
      </div>
    </div>
  );
}
