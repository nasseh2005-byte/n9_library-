"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CaseTools({ caseId, status }) {
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [q, setQ] = useState("");
  const [hits, setHits] = useState([]);
  const [msg, setMsg] = useState("");
  const [memo, setMemo] = useState("");
  const router = useRouter();

  async function genMemo() {
    setMsg("يولّد المذكرة…");
    const r = await fetch(`/api/memo?id=${caseId}`);
    const j = await r.json();
    if (r.ok) { setMemo(j.md); setMsg(`تم ✓ (سند نظامي: ${j.legal_count})`); }
    else setMsg(j.error || "فشل");
  }
  function downloadMemo() {
    const blob = new Blob([`<html dir="rtl"><meta charset="utf-8"><body style="font-family:Arial">${memo.replace(/^# (.*)$/gm, "<h1>$1</h1>").replace(/^## (.*)$/gm, "<h2>$1</h2>").replace(/\*\*(.*?)\*\*/g, "<b>$1</b>").replace(/\n/g, "<br>")}</body></html>`], { type: "application/msword" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `مذكرة-${caseId}.doc`;
    a.click();
  }

  async function patch(body) {
    const r = await fetch("/api/cases", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: caseId, ...body }),
    });
    if (r.ok) { setMsg("تم ✓"); router.refresh(); } else setMsg("فشل");
  }

  async function searchVault(query) {
    setQ(query);
    if (query.trim().length < 2) { setHits([]); return; }
    const r = await fetch(`/api/vault-search?q=${encodeURIComponent(query)}`);
    if (r.ok) setHits((await r.json()).results.filter((x) => x.kind === "upload").slice(0, 6));
  }

  return (
    <div className="card grid gap-4 p-6">
      <h2 className="font-bold text-white">أدوات الملف <span className="text-xs text-slate-500">{msg}</span></h2>

      <div className="grid gap-2">
        <textarea className="input min-h-20" placeholder="أضف سياقًا جديدًا (تطور، جلسة، مذكرة…)"
          value={text} onChange={(e) => setText(e.target.value)} />
        <button className="btn-primary w-fit" disabled={!text.trim()}
          onClick={() => { patch({ action: "context", text }); setText(""); }}>إضافة السياق</button>
      </div>

      <div className="grid gap-2 border-t border-line pt-4">
        <div className="text-sm text-slate-400">ربط مرفق من الخزنة (ابحث بالمحتوى — سوابق، أحكام، مخالفات):</div>
        <input className="input" placeholder="ابحث… مثال: مخالفه بلديه تقسيم مبنى"
          value={q} onChange={(e) => searchVault(e.target.value)} />
        {hits.map((h) => (
          <button key={h.id} onClick={() => { patch({ action: "attach", upload_id: h.id, upload_title: h.title }); setHits([]); setQ(""); }}
            className="rounded-lg border border-line p-2 text-right text-sm text-slate-300 hover:border-saudi">
            📎 {h.title} <span className="text-xs text-slate-500">({h.category})</span>
          </button>
        ))}
      </div>

      <div className="grid gap-2 border-t border-line pt-4 md:grid-cols-[1fr_auto]">
        <input className="input" dir="ltr" placeholder="https://… رابط خارجي (حكم منشور، نظام، خبر)"
          value={url} onChange={(e) => setUrl(e.target.value)} />
        <button className="btn-ghost" disabled={!url.trim()}
          onClick={() => { patch({ action: "link", url }); setUrl(""); }}>ربط</button>
      </div>

      <div className="grid gap-2 border-t border-line pt-4">
        <div className="flex gap-2">
          <button className="btn-primary" onClick={genMemo}>📝 توليد مذكرة من الملف</button>
          {memo && <button className="btn-ghost" onClick={downloadMemo}>تنزيل Word</button>}
        </div>
        {memo && <textarea className="input min-h-72 text-sm leading-7" value={memo} onChange={(e) => setMemo(e.target.value)} />}
      </div>

      <div className="border-t border-line pt-4">
        <button className="btn-ghost text-xs"
          onClick={() => patch({ action: "status", status: status === "مفتوحة" ? "مغلقة" : "مفتوحة" })}>
          {status === "مفتوحة" ? "إغلاق الملف" : "إعادة فتح الملف"}
        </button>
      </div>
    </div>
  );
}
