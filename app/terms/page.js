import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { TERMS_COOKIE, getMember, termsAccepted } from "@/lib/members";

export const metadata = { title: "الشروط والأحكام — N9 LIBRARY" };
export const dynamic = "force-dynamic";

async function accept() {
  "use server";
  cookies().set(TERMS_COOKIE, "1", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 365 * 24 * 3600 });
  redirect("/vault");
}

export default function TermsPage() {
  const member = getMember();
  const accepted = termsAccepted();
  return (
    <div className="mx-auto max-w-3xl grid gap-6">
      <h1 className="text-2xl font-bold text-white">الشروط والأحكام — الوصول الكامل</h1>
      <div className="card p-6 leading-9 text-slate-300">
        <ol className="grid gap-3 pr-5 list-decimal">
          <li>المصادر الخاصة (الأحكام، المرفقات، ملفات المكاتب) سرية ولا يجوز نشرها أو مشاركتها خارج المنصة.</li>
          <li>صلاحية «المطوّر» تتيح الاطلاع على كل المحتوى بمستوياته (خاص/مكتب/عام) لأغراض التطوير والإدارة فقط.</li>
          <li>يلتزم المطلع بالحفاظ على خصوصية بيانات العملاء والقضايا وعدم استخدامها لغير أغراض العمل.</li>
          <li>كل عملية اطلاع مرتبطة بحسابك الشخصي وأنت مسؤول عنها نظامًا.</li>
          <li>المحتوى الرسمي منسوب للمركز الوطني للوثائق والمحفوظات، والمحتوى الخاص ملك لأصحابه.</li>
        </ol>
      </div>
      {member?.role === "developer" ? (
        accepted ? (
          <div className="card border-saudi/40 p-5 text-saudi-light">✓ وافقت على الشروط — الوصول الكامل مفعّل</div>
        ) : (
          <form action={accept}>
            <button className="btn-primary">أوافق على الشروط والأحكام — فعّل الوصول الكامل</button>
          </form>
        )
      ) : (
        <div className="card p-5 text-sm text-slate-400">
          الموافقة هنا مخصصة لحسابات المطوّرين — سجّل دخولك بحساب مطوّر لتفعيل الوصول الكامل.
        </div>
      )}
    </div>
  );
}
