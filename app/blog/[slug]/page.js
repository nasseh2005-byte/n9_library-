import { notFound } from "next/navigation";
import { marked } from "marked";
import { getPost } from "@/lib/posts";

export const dynamic = "force-dynamic";

export default async function PostPage({ params }) {
  const post = await getPost(decodeURIComponent(params.slug));
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
      {post.attachments?.length ? (
        <section className="mt-8 border-t border-line pt-5">
          <h2 className="mb-3 font-bold">مرفقات التدوينة</h2>
          <div className="flex flex-wrap gap-2">
            {post.attachments.map((attachment, index) => (
              <a key={`${attachment.name}-${index}`} className="btn-ghost" href={attachment.url} target="_blank" rel="noopener noreferrer">
                تنزيل {attachment.name}
              </a>
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
