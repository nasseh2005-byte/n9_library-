"use client";
import { useState } from "react";

// عارض PDF عبر البروكسي الداخلي (يتجاوز منع NCAR للتضمين) مع بديل احتياطي
export default function PdfViewer({ src, title }) {
  const [failed, setFailed] = useState(false);
  const proxied = String(src || "").startsWith("/api/") ? src : `/api/pdf?u=${encodeURIComponent(src)}`;
  const download = `${proxied}${proxied.includes("?") ? "&" : "?"}download=1&filename=${encodeURIComponent(title || "document")}`;
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-line px-4 py-2 text-sm text-slate-400">
        <span>عارض الوثيقة</span>
        <div className="flex flex-wrap gap-2">
          <a href={proxied} target="_blank" rel="noopener noreferrer" className="btn-ghost px-3 py-1.5 text-xs">فتح في تبويب جديد ↗</a>
          <a href={download} className="btn-primary px-3 py-1.5 text-xs">تنزيل PDF</a>
        </div>
      </div>
      {failed ? (
        <div className="grid place-items-center gap-3 p-10 text-center">
          <p className="text-slate-400">تعذّر عرض الملف داخل الصفحة.</p>
          <div className="flex flex-wrap justify-center gap-2">
            <a href={proxied} target="_blank" rel="noopener noreferrer" className="btn-ghost">فتح الوثيقة</a>
            <a href={download} className="btn-primary">تنزيل PDF</a>
          </div>
        </div>
      ) : (
        <object data={proxied} type="application/pdf" className="h-[80vh] w-full bg-white" onError={() => setFailed(true)}>
          <iframe src={proxied} className="h-[80vh] w-full bg-white" title={title} onError={() => setFailed(true)} />
        </object>
      )}
    </div>
  );
}
