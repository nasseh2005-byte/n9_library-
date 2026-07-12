import Link from "next/link";
import { getMeta, getDocsLite } from "@/lib/data";

export const metadata = { title: "اللوحة البيانية — N9 LIBRARY" };

// أعمدة SVG أفقية RTL
function HBar({ label, value, max, href }) {
  const w = Math.max(2, Math.round((value / max) * 100));
  const inner = (
    <div className="grid grid-cols-[10rem_1fr_3.5rem] items-center gap-3 text-sm">
      <span className="truncate text-slate-300">{label}</span>
      <div className="h-5 rounded bg-night overflow-hidden border border-line">
        <div className="h-full rounded-l bg-gradient-to-l from-saudi to-saudi-dark transition-all group-hover:from-saudi-light"
          style={{ width: `${w}%` }} />
      </div>
      <span className="text-left text-xs text-gold" dir="ltr">{value.toLocaleString("ar-SA")}</span>
    </div>
  );
  return href ? <Link href={href} className="group block">{inner}</Link> : inner;
}

export default function StatsPage() {
  const meta = getMeta();
  const docs = getDocsLite();

  // وثائق كل عقد هجري
  const decades = new Map();
  for (const y of meta.years) {
    if (!y.y) continue;
    const d = `${y.y.slice(0, 3)}0`;
    decades.set(d, (decades.get(d) || 0) + y.count);
  }
  const decArr = [...decades].sort((a, b) => a[0].localeCompare(b[0]));
  const decMax = Math.max(...decArr.map(([, c]) => c));

  const validCount = docs.filter((d) => d.v === 1).length;
  const validPct = Math.round((validCount / docs.length) * 100);
  const cats = meta.categories.slice(0, 10);
  const catMax = cats[0]?.count || 1;
  const insts = meta.instruments.slice(0, 8);
  const insMax = insts[0]?.count || 1;

  // دائرة السريان SVG
  const R = 54, C = 2 * Math.PI * R;

  return (
    <div className="grid gap-8">
      <h1 className="text-2xl font-bold text-white">اللوحة البيانية <span className="text-base font-normal text-slate-400">— أرقام المكتبة الحية</span></h1>

      <div className="grid gap-4 md:grid-cols-4">
        {[["إجمالي الوثائق", meta.total], ["التاغات الفريدة", meta.tagTotal],
          ["التصنيفات", meta.categories.length], ["أدوات الاعتماد", meta.instruments.length]].map(([k, v]) => (
          <div key={k} className="card p-5 text-center">
            <div className="stat-num">{Number(v).toLocaleString("ar-SA")}</div>
            <div className="mt-1 text-sm text-slate-400">{k}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        {/* الإنتاج التشريعي عبر العقود */}
        <div className="card p-6">
          <h2 className="mb-4 font-bold text-white">الإنتاج التشريعي عبر العقود الهجرية</h2>
          <svg viewBox={`0 0 ${decArr.length * 46} 190`} className="w-full" role="img" aria-label="وثائق كل عقد">
            {decArr.map(([dec, count], i) => {
              const h = Math.max(4, Math.round((count / decMax) * 140));
              return (
                <g key={dec}>
                  <rect x={i * 46 + 8} y={160 - h} width="30" height={h} rx="4"
                    fill="url(#gradBar)" />
                  <text x={i * 46 + 23} y={155 - h} textAnchor="middle" fontSize="11" fill="#D4AF37">{count}</text>
                  <text x={i * 46 + 23} y={180} textAnchor="middle" fontSize="10" fill="#94a3b8">{dec}هـ</text>
                </g>
              );
            })}
            <defs>
              <linearGradient id="gradBar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#25935F" /><stop offset="1" stopColor="#14573A" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* دائرة السريان */}
        <div className="card grid place-items-center p-6">
          <h2 className="font-bold text-white">حالة السريان</h2>
          <svg viewBox="0 0 140 140" className="mt-3 w-44">
            <circle cx="70" cy="70" r={R} fill="none" stroke="#1E2A44" strokeWidth="16" />
            <circle cx="70" cy="70" r={R} fill="none" stroke="#25935F" strokeWidth="16"
              strokeDasharray={`${(validPct / 100) * C} ${C}`} strokeLinecap="round"
              transform="rotate(-90 70 70)" />
            <text x="70" y="66" textAnchor="middle" fontSize="24" fontWeight="bold" fill="#fff">{validPct}%</text>
            <text x="70" y="86" textAnchor="middle" fontSize="11" fill="#94a3b8">سارية</text>
          </svg>
          <div className="mt-2 text-xs text-slate-400">
            {validCount.toLocaleString("ar-SA")} سارية • {(docs.length - validCount).toLocaleString("ar-SA")} غير سارية
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="card grid gap-3 p-6">
          <h2 className="font-bold text-white">أكبر 10 تصنيفات</h2>
          {cats.map((c) => (
            <HBar key={c.name} label={c.name} value={c.count} max={catMax}
              href={`/library?cat=${encodeURIComponent(c.name)}`} />
          ))}
        </div>
        <div className="card grid gap-3 p-6">
          <h2 className="font-bold text-white">أدوات الاعتماد</h2>
          {insts.map((x) => (
            <HBar key={x.name} label={x.name} value={x.count} max={insMax}
              href={`/library?ins=${encodeURIComponent(x.name)}`} />
          ))}
        </div>
      </div>

      <div className="card p-6">
        <h2 className="mb-3 font-bold text-white">أكثر 20 تاغًا</h2>
        <div className="flex flex-wrap gap-2">
          {meta.topTags.slice(0, 20).map(({ tag, count }) => (
            <Link key={tag} href={`/tags/${encodeURIComponent(tag)}`} className="tag-pill">
              {tag} <span className="text-gold">{count.toLocaleString("ar-SA")}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
