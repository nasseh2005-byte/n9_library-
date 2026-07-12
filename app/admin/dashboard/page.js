import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { getPosts } from "@/lib/posts";
import { getMeta } from "@/lib/data";
import PostForm from "./PostForm";
import MembersForm from "./MembersForm";

export const dynamic = "force-dynamic";

export default function Dashboard() {
  if (!isAdmin()) redirect("/admin");
  const posts = getPosts();
  const meta = getMeta();
  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-bold text-white">لوحة الإدارة</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          ["وثائق الأرشيف", meta.total],
          ["التصنيفات", meta.categories.length],
          ["التاغات", meta.tagTotal],
          ["التدوينات", posts.length],
        ].map(([k, v]) => (
          <div key={k} className="card p-4 text-center">
            <div className="text-xl font-bold text-gold">{Number(v).toLocaleString("ar-SA")}</div>
            <div className="text-xs text-slate-400">{k}</div>
          </div>
        ))}
      </div>

      <MembersForm />

      <PostForm />

      <div className="card p-6">
        <h2 className="mb-3 font-bold text-white">التدوينات المنشورة</h2>
        <ul className="grid gap-2 text-sm">
          {posts.map((p) => (
            <li key={p.slug} className="flex justify-between border-b border-line pb-2">
              <span>{p.title}</span>
              <span className="text-slate-500">{p.date}</span>
            </li>
          ))}
          {posts.length === 0 && <li className="text-slate-500">لا تدوينات</li>}
        </ul>
      </div>

      <div className="card border-gold/30 p-6 text-sm leading-7 text-slate-400">
        <div className="font-bold text-gold">تحديث الأرشيف (مصدر 1)</div>
        بعد اكتمال السحب: شغّل <code className="text-saudi-light">Get-N9Archive.ps1 -RebuildIndex</code> ثم
        <code className="text-saudi-light"> npm run build-index</code> ثم ارفع التغييرات على GitHub.
        <div className="mt-2 font-bold text-gold">رفع الكتب (مصدر 2)</div>
        أضف ملف تعريف الكتاب في <code className="text-saudi-light">content/books/</code> —
        سيُفعّل الرفع المباشر مع التخزين السحابي في مرحلة Vercel.
      </div>
    </div>
  );
}
