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

export async function GET(req) {
  const url = new URL(req.url).searchParams.get("u");
  if (!url || !ALLOWED.test(url)) {
    return NextResponse.json({ error: "مصدر غير مسموح" }, { status: 400 });
  }
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
    return NextResponse.json({ error: "فشل الاتصال بالمصدر" }, { status: 502 });
  }
}
