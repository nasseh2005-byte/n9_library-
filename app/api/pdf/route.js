import { NextResponse } from "next/server";
import https from "node:https";

export const runtime = "nodejs";

const MAX_BYTES = 80 * 1024 * 1024;
const MAX_REDIRECTS = 5;
const ALLOWED_HOSTS = [
  "ncar.gov.sa",
  "bog.gov.sa",
  "bfc.gov.sa",
  "drive.google.com",
  "drive.usercontent.google.com",
  "googleusercontent.com",
];

function isAllowed(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return false;
    return ALLOWED_HOSTS.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`));
  } catch {
    return false;
  }
}

function safeFileName(value) {
  return String(value || "document.pdf")
    .replace(/[\r\n"\\/:*?<>|]/g, " ")
    .trim()
    .slice(0, 140) || "document.pdf";
}

function fetchBuffer(value, range, redirects = 0) {
  return new Promise((resolve, reject) => {
    if (!isAllowed(value)) return reject(new Error("disallowed source"));
    const url = new URL(value);
    const insecureNcar = url.hostname === "ncar.gov.sa" || url.hostname.endsWith(".ncar.gov.sa");
    const agent = insecureNcar ? new https.Agent({ rejectUnauthorized: false }) : undefined;
    const headers = {
      "User-Agent": "Mozilla/5.0 N9Library/2.0",
      Accept: "application/pdf,application/octet-stream;q=0.9,*/*;q=0.5",
    };
    if (range) headers.Range = range;

    https.get(url, { agent, headers }, (res) => {
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
        res.resume();
        if (redirects >= MAX_REDIRECTS) return reject(new Error("too many redirects"));
        const next = new URL(res.headers.location, url).toString();
        if (!isAllowed(next)) return reject(new Error("redirect blocked"));
        return fetchBuffer(next, range, redirects + 1).then(resolve, reject);
      }
      if (![200, 206].includes(res.statusCode)) {
        res.resume();
        return reject(new Error(`status ${res.statusCode}`));
      }
      const chunks = [];
      let size = 0;
      res.on("data", (chunk) => {
        size += chunk.length;
        if (size > MAX_BYTES) {
          res.destroy();
          reject(new Error("too large"));
          return;
        }
        chunks.push(chunk);
      });
      res.on("end", () => resolve({
        buffer: Buffer.concat(chunks),
        status: res.statusCode,
        headers: res.headers,
      }));
    }).on("error", reject);
  });
}

export async function GET(req) {
  const params = new URL(req.url).searchParams;
  const source = params.get("u");
  if (!source || !isAllowed(source)) {
    return NextResponse.json({ error: "مصدر الملف غير مسموح" }, { status: 400 });
  }

  try {
    const result = await fetchBuffer(source, req.headers.get("range"));
    const download = params.get("download") === "1";
    const fileName = safeFileName(params.get("filename"));
    const disposition = `${download ? "attachment" : "inline"}; filename="document.pdf"; filename*=UTF-8''${encodeURIComponent(fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`)}`;
    const headers = {
      "Content-Type": result.headers["content-type"] || "application/pdf",
      "Content-Disposition": disposition,
      "Content-Length": String(result.buffer.length),
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      "Accept-Ranges": result.headers["accept-ranges"] || "bytes",
    };
    if (result.headers["content-range"]) headers["Content-Range"] = result.headers["content-range"];
    return new NextResponse(result.buffer, { status: result.status, headers });
  } catch (error) {
    return NextResponse.json({
      error: "تعذر جلب الملف من المصدر حاليًا",
      source,
      detail: process.env.NODE_ENV === "development" ? error.message : undefined,
    }, { status: 502 });
  }
}
