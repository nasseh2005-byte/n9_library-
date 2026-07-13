import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="border-t" style={{ borderColor: "var(--line)", backgroundColor: "var(--panel-2)" }}>
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-white p-1 ring-1 ring-gold/40">
              <Image src="/n9-logo.png" alt="N9" width={44} height={20} className="h-5 w-auto" />
            </span>
            <span className="font-serif font-bold" style={{ color: "var(--text)" }}>N9 LIBRARY</span>
          </div>
          <p className="mt-3 text-sm leading-7 text-muted">
            المكتبة القانونية السعودية الرقمية. المحتوى الرسمي منسوب إلى
            المركز الوطني للوثائق والمحفوظات (ncar.gov.sa) مع رابط المصدر لكل وثيقة.
          </p>
        </div>

        <div>
          <div className="mb-2 text-sm font-semibold text-gold-c">بالتعاون مع</div>
          <div className="flex items-center gap-3">
            <Image src="/malki-logo.jpg" alt="مكتب سلطان المالكي" width={52} height={52}
              className="rounded-lg border border-gold/30" />
            <div className="text-sm">
              <div className="font-serif font-bold" style={{ color: "var(--text)" }}>مكتب سلطان محمد المالكي</div>
              <div className="text-xs text-muted">للمحاماة والاستشارات القانونية</div>
            </div>
          </div>
          <a href="https://n9-apps-script-edition.vercel.app/" target="_blank" rel="noopener noreferrer"
            className="mt-4 block text-sm text-gold-c hover:underline">
            N9 LAW SYSTEM — نظام إدارة القضايا ↗
          </a>
        </div>

        <div className="text-sm">
          <div className="mb-2 font-semibold text-gold-c">روابط وتواصل</div>
          <div className="grid gap-1.5">
            <Link href="/library" className="text-muted hover:text-gold-c">تصفح المكتبة</Link>
            <Link href="/assistant" className="text-muted hover:text-gold-c">المساعد القانوني</Link>
            <Link href="/about" className="text-muted hover:text-gold-c">حول المنصة</Link>
            <a href="mailto:NASSEH2005@GMAIL.COM" className="text-gold-c" dir="ltr">NASSEH2005@GMAIL.COM</a>
          </div>
        </div>
      </div>
      <div className="border-t py-3 text-center text-xs text-faint" style={{ borderColor: "var(--line)" }}>
        © {new Date().getFullYear()} N9 LIBRARY — NASSEH ZAHER ALNAMAN — جميع الوثائق الرسمية ملك لمصادرها
      </div>
    </footer>
  );
}
