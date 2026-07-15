import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { cloudStoreEnabled, listCloudJson, readCloudJson, writeCloudJson } from "@/lib/cloudStore";

const postsDir = path.join(process.cwd(), "content", "posts");
const CLOUD_DIR = "n9-blog-posts/";

function getLocalPosts() {
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
        category: data.category || "",
        kind: data.kind || "",
        excerpt: content.trim().slice(0, 220),
        content,
      };
    })
    .sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

export async function getPosts() {
  const local = getLocalPosts();
  if (!cloudStoreEnabled()) return local;
  let cloud = [];
  try { cloud = await listCloudJson(CLOUD_DIR); } catch { return local; }
  const bySlug = new Map(local.map((post) => [post.slug, post]));
  cloud.forEach((post) => { if (post?.slug) bySlug.set(post.slug, post); });
  return [...bySlug.values()].sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

export async function getPost(slug) {
  const safe = String(slug).replace(/[^0-9a-zA-Z-_؀-ۿ]/g, "");
  if (cloudStoreEnabled()) {
    try {
      const cloud = await readCloudJson(`${CLOUD_DIR}${safe}.json`);
      if (cloud) return cloud;
    } catch {
      // Fall through to repository posts.
    }
  }
  return getLocalPosts().find((p) => p.slug === safe) || null;
}

export async function savePost(post) {
  if (cloudStoreEnabled()) return writeCloudJson(`${CLOUD_DIR}${post.slug}.json`, post);
  fs.mkdirSync(postsDir, { recursive: true });
  const tagList = Array.isArray(post.tags) ? post.tags : [];
  const md = `---\ntitle: "${String(post.title).replace(/"/g, "'")}"\ndate: "${post.date}"\nauthor: "${post.author}"\ncategory: "${String(post.category || "").replace(/"/g, "'")}"\nkind: "${String(post.kind || "").replace(/"/g, "'")}"\ntags: [${tagList.map((tag) => `"${String(tag).replace(/"/g, "'")}"`).join(", ")}]\n---\n\n${post.content}\n`;
  fs.writeFileSync(path.join(postsDir, `${post.slug}.md`), md, "utf8");
  return post;
}
