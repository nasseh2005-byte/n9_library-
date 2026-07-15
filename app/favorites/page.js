import Link from "next/link";
import { redirect } from "next/navigation";
import { currentPublicUser } from "@/lib/publicUsers";
import { getDoc } from "@/lib/data";

export const dynamic = "force-dynamic";
export const metadata = { title: "مفضلاتي — N9 LIBRARY" };
export default async function FavoritesPage() {
  const user = await currentPublicUser();
  if (!user) redirect("/account?next=/favorites");
  const docs = (user.favorites || []).map(getDoc).filter(Boolean).reverse();
  return <div className="grid gap-5"><div className="flex items-center justify-between"><h1 className="text-2xl font-bold">مفضلاتي</h1><span className="text-muted">{docs.length} محفوظة</span></div><div className="grid gap-3 md:grid-cols-2">{docs.map((doc) => <Link key={doc.id} href={`/doc/${doc.id}`} className="card p-5 hover:border-gold"><h2 className="font-bold">{doc.title_ar}</h2><p className="mt-2 text-sm text-muted">{doc.category} — {doc.source_name}</p></Link>)}</div>{!docs.length ? <div className="card p-10 text-center text-muted">لا توجد محفوظات بعد. افتح أي وثيقة واضغط «أضف للمفضلة».</div> : null}</div>;
}
