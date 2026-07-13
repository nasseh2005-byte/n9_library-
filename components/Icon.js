// أيقونات SVG احترافية (بدل الإيموجي) - خط موحّد نظيف
const paths = {
  scale: "M12 3v18M7 7h10M6 7l-3 6a3 3 0 006 0L6 7zm12 0l-3 6a3 3 0 006 0l-3-6zM8 21h8",
  gavel: "M14 4l6 6-3 3-6-6 3-3zM3 21l7-7M9 11l4 4M5 15l4 4",
  search: "M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.3-4.3",
  folder: "M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z",
  file: "M6 2h9l5 5v13a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2zM14 2v6h6",
  shield: "M12 2l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V5l8-3z",
  chart: "M4 20V10M10 20V4M16 20v-7M22 20H2",
  book: "M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2V5zM19 3v18",
  tag: "M20 12l-8 8-9-9V4h7l10 8zM7.5 7.5h.01",
  bell: "M18 9a6 6 0 10-12 0c0 7-3 8-3 8h18s-3-1-3-8M13.7 21a2 2 0 01-3.4 0",
  user: "M20 21a8 8 0 00-16 0M12 11a4 4 0 100-8 4 4 0 000 8z",
  users: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.9M16 3.1a4 4 0 010 7.8",
  building: "M3 21h18M5 21V5a2 2 0 012-2h6a2 2 0 012 2v16M15 21V9h4v12M9 7h.01M9 11h.01M9 15h.01",
  reply: "M9 17l-5-5 5-5M4 12h11a5 5 0 015 5v2",
  edit: "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.1 2.1 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
  clock: "M12 22a10 10 0 100-20 10 10 0 000 20zM12 6v6l4 2",
  link: "M10 13a5 5 0 007 0l3-3a5 5 0 00-7-7l-1.5 1.5M14 11a5 5 0 00-7 0l-3 3a5 5 0 007 7l1.5-1.5",
  check: "M20 6L9 17l-5-5",
  download: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3",
  external: "M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3",
  home: "M3 12l9-9 9 9M5 10v10a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V10",
  plus: "M12 5v14M5 12h14",
  lock: "M5 11h14v10H5zM8 11V7a4 4 0 018 0v4",
  sparkle: "M12 3l1.9 5.8L20 10l-6.1 1.2L12 17l-1.9-5.8L4 10l6.1-1.2L12 3z",
};

export default function Icon({ name, size = 18, className = "", stroke = 1.8 }) {
  const d = paths[name];
  if (!d) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
      className={className} aria-hidden="true">
      {d.split("M").filter(Boolean).map((seg, i) => <path key={i} d={"M" + seg} />)}
    </svg>
  );
}
