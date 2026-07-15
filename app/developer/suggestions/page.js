import { redirect } from "next/navigation";
import { getMember } from "@/lib/members";
import { getSuggestions } from "@/lib/suggestions";

export const dynamic = "force-dynamic";
export default async function DeveloperSuggestionsPage() {
  const member = getMember();
  if (!member) redirect("/login");
  if (member.role !== "developer") redirect("/developer");
  const suggestions = await getSuggestions();
  return <div className="grid gap-5"><div className="flex items-center justify-between"><h1 className="text-2xl font-bold">اقتراحات الزوار</h1><span className="text-muted">{suggestions.length}</span></div><div className="grid gap-3">{suggestions.map((item) => <article key={item.id} className="card p-5"><div className="flex flex-wrap justify-between gap-2"><b>{item.name || "زائر"}</b><time className="text-xs text-faint" dir="ltr">{String(item.createdAt).slice(0, 16).replace("T", " ")}</time></div><p className="mt-3 whitespace-pre-wrap leading-8 text-muted">{item.text}</p>{item.email ? <a className="mt-2 block text-sm text-gold-c" href={`mailto:${item.email}`}>{item.email}</a> : null}</article>)}</div>{!suggestions.length ? <div className="card p-10 text-center text-muted">لا توجد اقتراحات بعد.</div> : null}</div>;
}
