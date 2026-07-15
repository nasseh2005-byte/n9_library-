import Image from "next/image";

// بانر التعاون: شعار N9 + شعار مكتب سلطان المالكي جنبًا إلى جنب
export default function PartnerBar() {
  return (
    <div className="partner-bar flex flex-col items-center justify-center gap-5 rounded-xl p-5 sm:flex-row sm:gap-8">
      <div className="flex items-center gap-3">
        <span className="overflow-hidden rounded-lg bg-white p-1.5 shadow-md ring-1 ring-gold/40">
          <Image src="/n9-library-logo.png" alt="N9 Library" width={56} height={56} className="h-12 w-12 scale-[1.24] rounded-md object-cover" />
        </span>
        <span className="font-serif text-lg font-bold" style={{ color: "var(--text)" }}>N9 LIBRARY</span>
      </div>

      <div className="hidden h-10 w-px sm:block" style={{ backgroundColor: "var(--line)" }} />
      <div className="text-center text-xs font-semibold tracking-widest text-gold-c">بالتعاون مع</div>
      <div className="hidden h-10 w-px sm:block" style={{ backgroundColor: "var(--line)" }} />

      <div className="flex items-center gap-3">
        <Image src="/malki-logo.jpg" alt="مكتب سلطان المالكي للمحاماة" width={52} height={52}
          className="rounded-lg border-2 border-gold/40 shadow-lg" />
        <div className="text-center sm:text-right">
          <div className="font-serif text-base font-bold" style={{ color: "var(--text)" }}>
            مكتب سلطان محمد المالكي للمحاماة
          </div>
          <div className="text-[11px] text-faint" dir="ltr">Attorneys And Legal Consultant</div>
        </div>
      </div>
    </div>
  );
}
