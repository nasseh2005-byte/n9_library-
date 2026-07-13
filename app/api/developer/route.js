import { NextResponse } from "next/server";
import { parseMemberToken, MEMBER_COOKIE, getMembersList, saveMembersList, getOffices, saveOffices } from "@/lib/members";
import { audit } from "@/lib/audit";

// كل عمليات هذه الواجهة للمطوّر فقط (role === developer)
function dev(req) {
  const m = parseMemberToken(req.cookies.get(MEMBER_COOKIE)?.value);
  return m?.role === "developer" ? m : null;
}

export async function GET(req) {
  if (!dev(req)) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  return NextResponse.json({
    members: getMembersList().map((m) => ({ ...m, pin: `••${String(m.pin).slice(-2)}` })),
    offices: getOffices(),
  });
}

export async function POST(req) {
  const d = dev(req);
  if (!d) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  const body = await req.json().catch(() => ({}));

  if (body.type === "office") {
    const name = String(body.name || "").trim();
    if (name.length < 2) return NextResponse.json({ error: "اسم المكتب مطلوب" }, { status: 400 });
    const offices = getOffices().filter((o) => o.name !== name);
    offices.push({ id: name, name, logo: body.logo || null, added_at: new Date().toISOString() });
    try { saveOffices(offices); audit(d, "أضاف مكتبًا", name); return NextResponse.json({ ok: true }); }
    catch { return NextResponse.json({ error: "الحفظ محليًا فقط حاليًا" }, { status: 500 }); }
  }

  if (body.type === "member") {
    const { user, pin, name, office, role } = body;
    if (!user || !/^[a-zA-Z0-9_.-]{3,30}$/.test(user))
      return NextResponse.json({ error: "اسم مستخدم لاتيني 3-30 حرفًا" }, { status: 400 });
    if (!/^\d{6}$/.test(String(pin || "")))
      return NextResponse.json({ error: "الرمز 6 أرقام بالضبط" }, { status: 400 });
    const list = getMembersList().filter((m) => m.user.toLowerCase() !== user.toLowerCase());
    list.push({
      user, pin: String(pin), name: name || user, office: office || "المكتب الرئيسي",
      role: role === "developer" ? "developer" : "member", added_at: new Date().toISOString().slice(0, 10),
    });
    try { saveMembersList(list); audit(d, "أنشأ عضوًا", `${user} (${office})`); return NextResponse.json({ ok: true }); }
    catch { return NextResponse.json({ error: "الحفظ محليًا فقط حاليًا" }, { status: 500 }); }
  }

  return NextResponse.json({ error: "نوع غير معروف" }, { status: 400 });
}

export async function DELETE(req) {
  const d = dev(req);
  if (!d) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  const { kind, key } = await req.json().catch(() => ({}));
  if (kind === "member") {
    saveMembersList(getMembersList().filter((m) => m.user !== key));
    audit(d, "حذف عضوًا", key);
  } else if (kind === "office") {
    saveOffices(getOffices().filter((o) => o.name !== key));
    audit(d, "حذف مكتبًا", key);
  }
  return NextResponse.json({ ok: true });
}
