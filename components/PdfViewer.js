"use client";
import { useState } from "react";

// عارض PDF عبر البروكسي الداخلي (يتجاوز منع NCAR للتضمين) مع بديل احتياطي
export default function PdfViewer({ src, title }) {
  const [failed, setFailed] = useState(false);
  const proxied = `/api/pdf?u=${encodeURIComponent(src)}`;
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-line px-4 py-2 text-sm text-slate-400">
        <span>عارض الوثيقة</span>
        <a href={proxied} target="_blank" rel="noopener noreferrer" className="text-saudi-light hover:underline">فتح في تبويب جديد ↗</a>
      </div>
      {failed ? (
        <div className="grid place-items-center gap-3 p-10 text-center">
          <p className="text-slate-400">تعذّر عرض الملف داخل الصفحة.</p>
          <a href={proxied} target="_blank" rel="noopener noreferrer" className="btn-primary">فتح الوثيقة</a>
        </div>
      ) : (
        <object data={proxied} type="application/pdf" className="h-[80vh] w-full bg-white" onError={() => setFailed(true)}>
          <iframe src={proxied} className="h-[80vh] w-full bg-white" title={title} onError={() => setFailed(true)} />
        </object>
      )}
    </div>
  );
}
