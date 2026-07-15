import { list } from "@vercel/blob";

export async function getCloudUploads() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return [];
  try {
    const records = [];
    let cursor;
    do {
      const page = await list({ prefix: "n9-records/", limit: 250, cursor });
      const rows = await Promise.all(page.blobs.map(async (blob) => {
        try {
          const res = await fetch(blob.url, { cache: "no-store" });
          return res.ok ? res.json() : null;
        } catch {
          return null;
        }
      }));
      records.push(...rows.filter(Boolean));
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor && records.length < 1000);
    return records.sort((a, b) => String(b.added_at).localeCompare(String(a.added_at)));
  } catch {
    return [];
  }
}
