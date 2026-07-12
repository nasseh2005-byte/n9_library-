import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-panel/50">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 md:grid-cols-3">
        <div>
          <div className="font-bold text-white">N9 LIBRARY — Saudi Law Edition</div>
          <p className="mt-2 text-sm text-slate-400">
            مكتبة رقمية للأنظمة واللوائح السعودية. المحتوى الرسمي منسوب إلى
            المركز الوطني للوثائق والمحفوظات (ncar.gov.sa) مع رابط المصدر لكل وثيقة.
          </p>
        </div>
        <div className="text-sm">
          <div className="mb-2 font-semibold text-gold">روابط</div>
          <div className="grid gap-1">
            <Link href="/library" className="hover:text-saudi-light">تصفح المكتبة</Link>
            <Link href="/search" className="hover:text-saudi-light">البحث الذكي</Link>
            <Link href="/n9-law-system" className="hover:text-saudi-light">نظام N9 لإدارة القضايا</Link>
          </div>
        </div>
        <div className="text-sm">
          <div className="mb-2 font-semibold text-gold">الناشر</div>
          <div>NASSEH ZAHER ALNAMAN</div>
          <a href="mailto:NASSEH2005@GMAIL.COM" className="text-saudi-light">NASSEH2005@GMAIL.COM</a>
        </div>
      </div>
      <div className="border-t border-line py-3 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} N9 LIBRARY — جميع الوثائق الرسمية ملك لمصادرها
      </div>
    </footer>
  );
}
