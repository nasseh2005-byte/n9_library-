import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const postsDir = path.join(process.cwd(), "content", "posts");

export function getPosts() {
  if (!fs.existsSync(postsDir)) return [];
  return fs
    .readdirSync(postsDir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const { data, content } = matter(fs.readFileSync(path.join(postsDir, f), "utf8"));
      return {
        slug: f.replace(/\.md$/, ""),
        title: data.title || f,
        date: data.date || "",
        tags: data.tags || [],
        author: data.author || "NASSEH ZAHER ALNAMAN",
        excerpt: content.trim().slice(0, 220),
        content,
      };
    })
    .sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

export function getPost(slug) {
  const safe = String(slug).replace(/[^0-9a-zA-Z-_؀-ۿ]/g, "");
  return getPosts().find((p) => p.slug === safe) || null;
}
