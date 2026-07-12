import { getDocsLite } from "@/lib/data";

const BASE = process.env.SITE_URL || "https://n9library.vercel.app";

export default function sitemap() {
  const statics = ["", "/sa", "/library", "/search", "/assistant", "/stats", "/tags", "/blog", "/about", "/n9-law-system"]
    .map((p) => ({ url: `${BASE}${p}`, changeFrequency: "weekly", priority: p === "" ? 1 : 0.7 }));
  const docs = getDocsLite().slice(0, 5000).map((d) => ({
    url: `${BASE}/doc/${d.id}`, changeFrequency: "yearly", priority: 0.5,
  }));
  return [...statics, ...docs];
}
