import { NextResponse } from "next/server";
import https from "node:https";

export const runtime = "nodejs";

// بروكسي PDF: يجلب ملف NCAR من الخادم ويقدّمه من نطاقنا
// (المصدر يمنع التضمين المباشر بترويسة frame-ancestors 'self')
// يُسمح فقط بمصادر NCAR الرسمية لمنع إساءة استخدام البروكسي
const ALLOWED = /^https:\/\/ncar\.gov\.sa\//;

// شهادة NCAR ناقصة السلسلة الوسيطة - نتجاوز التحقق لهذا النطاق الحكومي فقط
const agent = new https.Agent({ rejectUnauthorized: false });

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { agent, headers: { "User-Agent": "Mozilla/5.0 N9Library" } }, (res) => {
      if (res.statusCode !== 200) { reject(new Error(`status ${res.statusCode}`)); res.resume(); return; }
      const chunks = [];
      let size = 0;
      res.on("data", (c) => {
        size += c.length;
        if (size > MAX_BYTES) { res.destroy(); reject(new Error("too large")); return; }
        chunks.push(c);
      });
      res.on("end", () => resolve({ buf: Buffer.concat(chunks), ct: res.headers["content-type"] || "application/pdf" }));
    }).on("error", reject);
  });
}

const MAX_BYTES = 40 * 1024 * 1024; // حد 40MB

// صفحة خطأ أنيقة تُعرض داخل الإطار بدل JSON خام
function errorPage(sourceUrl) {
  const html = `<!doctype html><html dir="rtl" lang="ar"><head><meta charset="utf-8">
<style>body{font-family:Arial;background:#f6f8fb;color:#1a2434;display:grid;place-items:center;height:95vh;margin:0}
.box{text-align:center;padding:2rem}.b{display:inline-block;margin:.4rem;padding:.6rem 1.4rem;border-radius:.6rem;
background:#1b8354;color:#fff;text-decoration:none;font-weight:bold}.g{background:#fff;color:#1a2434;border:1px solid #dbe3ee}</style>
</head><body><div class="box"><div style="font-size:2.5rem">📄</div>
<h3>خادم المصدر بطيء أو مشغول حاليًا</h3><p>الملف موجود — جرّب مرة أخرى خلال لحظات</p>
<a class="b" href="javascript:location.reload()">إعادة المحاولة</a>
<a class="b g" href="${sourceUrl}" target="_blank" rel="noopener">فتح من المصدر مباشرة</a>
</div></body></html>`;
  return new NextResponse(html, { status: 502, headers: { "Content-Type": "text/html; charset=utf-8" } });
}

export async function GET(req) {
  const url = new URL(req.url).searchParams.get("u");
  if (!url || !ALLOWED.test(url)) {
    return NextResponse.json({ error: "مصدر غير مسموح" }, { status: 400 });
  }
  // 3 محاولات بتراجع - خادم المصدر بطيء أحيانا
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const { buf, ct } = await fetchBuffer(url);
      return new NextResponse(buf, {
        headers: {
          "Content-Type": ct,
          "Content-Disposition": "inline",
          "Cache-Control": "public, max-age=86400",
        },
      });
    } catch {
      if (attempt < 3) await new Promise((r) => setTimeout(r, attempt * 1500));
    }
  }
  return errorPage(url);
}
