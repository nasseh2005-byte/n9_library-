import Image from "next/image";

// شريط التعاون مع مكتب سلطان محمد المالكي للمحاماة
export default function PartnerBar() {
  return (
    <div className="partner-bar flex flex-col items-center justify-center gap-4 rounded-xl p-5 sm:flex-row">
      <Image src="/malki-logo.jpg" alt="مكتب سلطان المالكي للمحاماة" width={64} height={64}
        className="rounded-lg border-2 border-gold/40 shadow-lg" />
      <div className="text-center sm:text-right">
        <div className="text-xs font-semibold text-gold-c">بالتعاون مع</div>
        <div className="font-serif text-lg font-bold" style={{ color: "var(--text)" }}>
          مكتب سلطان محمد المالكي للمحاماة والاستشارات القانونية
        </div>
        <div className="text-xs text-faint" dir="ltr">Attorneys And Legal Consultant</div>
      </div>
    </div>
  );
}
