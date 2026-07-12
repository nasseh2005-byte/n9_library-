import Link from "next/link";
import { getPosts } from "@/lib/posts";

export const metadata = { title: "المدونة — N9 LIBRARY" };

export default function BlogPage() {
  const posts = getPosts();
  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-bold text-white">المدونة</h1>
      <div className="grid gap-4">
        {posts.map((p) => (
          <Link key={p.slug} href={`/blog/${encodeURIComponent(p.slug)}`}
            className="card block p-5 hover:border-saudi transition-colors">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-slate-100">{p.title}</h2>
              <span className="text-xs text-slate-500">{p.date}</span>
            </div>
            <p className="mt-2 text-sm leading-7 text-slate-400">{p.excerpt}…</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {p.tags.map((t) => <span key={t} className="tag-pill">{t}</span>)}
              <span className="mr-auto text-xs text-gold">{p.author}</span>
            </div>
          </Link>
        ))}
        {posts.length === 0 && (
          <div className="card p-10 text-center text-slate-400">لا تدوينات بعد</div>
        )}
      </div>
    </div>
  );
}
