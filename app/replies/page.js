import Link from "next/link";
import { getMember, termsAccepted, canSee } from "@/lib/members";
import { getReplies, REPLY_KINDS } from "@/lib/replies";
import Icon from "@/components/Icon";
import NewReplyForm from "./NewReplyForm";

export const metadata = { title: "الردود على القضاة — N9 LIBRARY" };
export const dynamic = "force-dynamic";

export default function RepliesPage() {
  const member = getMember();
  if (!member) {
    return (
      <div className="mx-auto max-w-lg card card-gold p-10 text-center">
        <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full surface-2 text-gold-c">
          <Icon name="reply" size={28} />
        </div>
        <h1 className="font-serif text-xl font-bold">الردود على القضاة</h1>
        <p className="mt-3 text-muted leading-8">
          اكتب القضية، فيولّد النظام ردًا جاهزًا على الاستئناف أو مذكرة الخصم مستندًا إلى الأنظمة السارية. للأعضاء فقط.
        </p>
        <Link href="/login" className="btn-primary mt-6">دخول الأعضاء</Link>
      </div>
    );
  }
  const termsOk = termsAccepted();
  const replies = getReplies().filter((r) => canSee(r, member, termsOk));

  return (
    <div className="grid gap-6">
      <div className="flex items-center gap-3">
        <span className="text-gold-c"><Icon name="reply" size={26} /></span>
        <h1 className="font-serif text-2xl font-bold">الردود على القضاة</h1>
        <span className="text-muted">({replies.length})</span>
      </div>
      <p className="text-sm text-muted">
        نظام كتابي: تصف القضية وأسباب الخصم، فيُنشئ النظام مسودة رد قانونية منظّمة مع السند النظامي — تحرّرها وتنزّلها Word.
      </p>

      <NewReplyForm kinds={REPLY_KINDS} />

      <div className="grid gap-3">
        {replies.map((r) => (
          <Link key={r.id} href={`/replies/${r.id}`} className="card block p-4 transition-colors hover:border-gold">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold">{r.subject}</h3>
              <span className="shrink-0 rounded-full surface-2 px-2 py-0.5 text-[11px] text-gold-c">{r.status}</span>
            </div>
            <div className="mt-1 text-xs text-faint">{r.kind} • {r.owner} • {String(r.created_at).slice(0, 10)}</div>
          </Link>
        ))}
        {replies.length === 0 && <div className="card p-8 text-center text-muted">لا ردود بعد — أنشئ أول رد من الأعلى</div>}
      </div>
    </div>
  );
}
