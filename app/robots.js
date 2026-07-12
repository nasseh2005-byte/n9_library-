const BASE = process.env.SITE_URL || "https://n9library.vercel.app";

export default function robots() {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/vault", "/cases", "/profile", "/api/"] }],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
