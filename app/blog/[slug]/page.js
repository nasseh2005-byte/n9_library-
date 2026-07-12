import { notFound } from "next/navigation";
import { marked } from "marked";
import { getPost } from "@/lib/posts";

export default function PostPage({ params }) {
  const post = getPost(decodeURIComponent(params.slug));
  if (!post) notFound();
  return (
    <article className="card p-6 md:p-8">
      <h1 className="text-2xl font-bold text-white">{post.title}</h1>
      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
        <span className="text-gold">{post.author}</span>
        <span>{post.date}</span>
        {post.tags.map((t) => <span key={t} className="tag-pill">{t}</span>)}
      </div>
      <div className="prose-ar mt-6" dangerouslySetInnerHTML={{ __html: marked.parse(post.content) }} />
    </article>
  );
}
