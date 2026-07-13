"use client";
import { useState } from "react";

export default function ReplyEditor({ id, initial, status }) {
  const [draft, setDraft] = useState(initial);
  const [msg, setMsg] = useState("");

  async function patch(body) {
    setMsg("…");
    const r = await fetch("/api/replies", {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ...body }),
    });
    setMsg(r.ok ? "حُفظ ✓" : "فشل");
  }
  async function regenerate() {
    setMsg("يعيد التوليد…");
    await fetch("/api/replies", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action: "regenerate" }) });
    location.reload();
  }
  function downloadWord() {
    const html = `<html dir="rtl"><meta charset="utf-8"><body style="font-family:'Traditional Arabic',Arial;font-size:15px;line-height:1.9">${
      draft.replace(/^# (.*)$/gm, "<h1 style='text-align:center'>$1</h1>")
        .replace(/^## (.*)$/gm, "<h2>$1</h2>").replace(/\*\*(.*?)\*\*/g, "<b>$1</b>").replace(/\n/g, "<br>")
    }</body></html>`;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([html], { type: "application/msword" }));
    a.download = `${id}.doc`;
    a.click();
  }

  return (
    <div className="card grid gap-3 p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-bold">مسودة الرد <span className="text-xs text-faint">{msg}</span></h2>
        <div className="flex gap-2">
          <button className="btn-ghost text-xs" onClick={regenerate}>إعادة التوليد</button>
          <button className="btn-ghost text-xs" onClick={() => patch({ draft })}>حفظ</button>
          <button className="btn-primary text-xs" onClick={downloadWord}>تنزيل Word</button>
        </div>
      </div>
      <textarea className="input min-h-[32rem] font-serif text-[15px] leading-8"
        value={draft} onChange={(e) => setDraft(e.target.value)} />
      <div className="flex gap-2">
        {["مسودة", "قيد المراجعة", "جاهز"].map((s) => (
          <button key={s} onClick={() => patch({ status: s })}
            className={`tag-pill ${status === s ? "border-gold text-gold-c" : ""}`}>{s}</button>
        ))}
      </div>
    </div>
  );
}
