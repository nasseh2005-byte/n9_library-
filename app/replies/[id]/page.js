import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getMember, termsAccepted, canSee } from "@/lib/members";
import { getReply } from "@/lib/replies";
import ReplyEditor from "./ReplyEditor";

export const dynamic = "force-dynamic";

export default function ReplyPage({ params }) {
  const member = getMember();
  if (!member) redirect("/login");
  const r = getReply(params.id);
  if (!r || !canSee(r, member, termsAccepted())) notFound();

  return (
    <div className="grid gap-6">
      <nav className="text-xs text-faint">
        <Link href="/replies" className="hover:text-gold-c">الردود على القضاة</Link> / {r.subject}
      </nav>
      <div className="card card-gold p-6">
        <h1 className="font-serif text-2xl font-bold">{r.subject}</h1>
        <div className="mt-2 text-xs text-faint">{r.kind} • {r.owner} • {r.office} • {String(r.created_at).slice(0, 10)}</div>
      </div>

      {r.legal?.length ? (
        <div className="card p-5">
          <h2 className="mb-2 font-bold">السند النظامي المقترح</h2>
          <ul className="grid gap-1 text-sm">
            {r.legal.map((l) => (
              <li key={l.id}>
                <Link href={`/doc/${l.id}`} className="text-muted hover:text-gold-c">
                  {l.title} <span className="text-xs text-faint">({l.number} — {l.year}هـ)</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <ReplyEditor id={r.id} initial={r.draft} status={r.status} />
    </div>
  );
}
