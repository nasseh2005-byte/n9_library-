# N9 LIBRARY — دليل التسليم الشامل للذكاء الاصطناعي (AI Handoff Guide)

> مرجع كامل لأي AI أو مطوّر يعمل على هذا المشروع. اقرأه كاملًا قبل تعديل أي كود.
> آخر تحديث: 2026-07-13 (v7). المستودع: https://github.com/nasseh2005-byte/n9_library-.git

---

## 1) الفكرة

**N9 LIBRARY** منصة قانونية سعودية متعددة الوحدات:
1. **مكتبة أرشيف رسمي**: 6,718 وثيقة (أنظمة/لوائح/مراسيم/قرارات) من المركز الوطني للوثائق والمحفوظات (ncar.gov.sa)، 1350هـ–1448هـ، مفهرسة بـ15,410 تاغ.
2. **بحث بمستوى الصفحة**: 16,146 صفحة نص مستخرجة من ملفات PDF.
3. **نظام مكاتب المحاماة** (بعد تسجيل الدخول): خزنة أحكام ومرفقات خاصة، ملفات حالات، ردود على القضاة، مولّد مذكرات، لوحات مكتب، لوحة مطوّر.

**بالتعاون مع** مكتب سلطان محمد المالكي للمحاماة والاستشارات القانونية (شعاره في البانر والفوتر).
**المطوّر/الناشر:** NASSEH ZAHER ALNAMAN — nasseh2005@gmail.com.
**منتج شقيق:** N9 LAW SYSTEM (https://n9-apps-script-edition.vercel.app/).

## 2) التقنية

- Next.js 14 App Router (JavaScript) + Tailwind 3، عربي RTL كامل
- خطوط: IBM Plex Sans Arabic (النص) + **Amiri** (العناوين h1/h2، عبر `--font-amiri`)
- بحث: MiniSearch (فهارس مبنية مسبقًا)
- تخزين: JSON — عام في `data/` (يُرفع)، خاص في `private-data/` (**gitignored، لا يُرفع أبدًا**)
- استضافة مستهدفة: Vercel (لم يتم بعد؛ كتابة private-data تعمل محليًا فقط، على Vercel تحتاج Supabase/R2)
- تشغيل: `npm install` → `npm run build-index` → `npm run dev` (منفذ 3000)

## 3) الهوية البصرية (v6 — قانونية: كحلي ملكي + ذهبي)

- ألوان (`tailwind.config.js` + `globals.css` بمتغيرات CSS للثيمين):
  - داكن: خلفية `#0A0F2C`، بطاقات `#121A3F`، حدود `#26305F`
  - فاتح (عاجي رسمي): خلفية `#F7F5EF`، بطاقات `#FFFFFF`
  - ذهبي `#C9A227` (الأزرار والعناوين المميزة)، أخضر `#1B8354` (فقط لشارة "سارية")
- الوضعان مدعومان عبر `data-theme` على `<html>` — بدّلهما `components/ThemeToggle.js`
- **لا إيموجي في التصميم** — الأيقونات كلها SVG عبر `components/Icon.js` (استدعِ `<Icon name="scale|gavel|search|folder|file|shield|reply|building|users|..." />`)
- كلاسات: `.card` `.card-gold` (خط ذهبي علوي) `.btn-primary` (ذهبي متدرج) `.btn-ghost` `.tag-pill` `.input` `.hero-title` `.stat-num` `.partner-bar` + ألوان نصية `.text-muted .text-faint .text-gold-c .surface-2`
- الشعارات: `public/n9-logo.png` (N9 أخضر، يوضع في شارة بيضاء بإطار ذهبي) + `public/malki-logo.jpg` (شعار المكتب)

## 4) الأدوار والصلاحيات

| الدور | الدخول | يرى |
|---|---|---|
| زائر | — | العام فقط (الأرشيف، المدونة، الإحصائيات، البحث) |
| عضو `member` | يوزر + رمز 6 أرقام | العام + خاص مكتبه + خاصّه |
| مطوّر `developer` | نفس الدخول | كل شيء بعد قبول `/terms` (كوكي `n9_terms`) + لوحة `/developer` |
| مدير الموقع | كلمة مرور `ADMIN_PASSWORD` في `/admin` | إدارة (مدونة أساسًا؛ إدارة الأعضاء انتقلت للوحة المطوّر) |

**كلمات المرور الافتراضية** (غيّرها في الإنتاج عبر متغيرات البيئة):
- مطوّر: المستخدم `nasseh` / الرمز `990011`
- مدير الموقع: `ADMIN_PASSWORD` الافتراضي `n9admin`

**منطق الرؤية** `lib/members.js → canSee(rec, member, termsOk)`:
`public` للجميع • `office` لنفس المكتب • `private` للمالك • developer+terms يتجاوز الكل. تحميل الملفات محكوم عبر `/api/file/[id]`.

## 5) خريطة الصفحات

| المسار | الوظيفة | حماية |
|---|---|---|
| `/` | بوابة N9 LIBRARY: بانر التعاون + بطاقة البوابة السعودية + أدوات + إعلان N9 LAW SYSTEM | عام |
| `/sa` | رئيسية البوابة السعودية: بحث + إحصاءات + بانر جديد التشريعات + أحدث الوثائق | عام |
| `/library` | تصفح بفلاتر (تصنيف/أداة/سنة/سريان/تاغ/بحث مطبع) + ترتيب + شارات فلاتر قابلة للإزالة | عام |
| `/doc/[id]` | الوثيقة: بيانات + ملخص + 20 تاغ + **عارض PDF عبر البروكسي** + خط زمني + استشهادات + ذات صلة + شقيقات | عام |
| `/search` | البحث الذكي بالأرشيف (أفضل نتيجة كجواب) | عام |
| `/find` | **البحث الشامل**: الأرشيف + الخزنة + الحالات + الردود دفعة واحدة | عام (يوسّع بعد الدخول) |
| `/assistant` | المساعد القانوني المدموج (مجاني، استخلاصي): أرشيف + صفحات + خزنة | عام |
| `/stats` | لوحة بيانية SVG (عقود/سريان/تصنيفات/أدوات) | عام |
| `/tags` `/tags/[tag]` | سحابة كل التاغات مع بحث + صفحة التاغ | عام |
| `/vault` | الخزنة: بحث عميق بالمحتوى + رفع أحكام/مرفقات بتحليل تلقائي لحظي | عضو |
| `/cases` `/cases/[id]` | ملفات الحالات: أنواع متعددة، سياقات، مرفقات من الخزنة، مهل نظامية، مولّد مذكرات | عضو |
| `/replies` `/replies/[id]` | **الردود على القضاة**: تصف القضية → مسودة رد على الاستئناف/الخصم + سند نظامي + تنزيل Word | عضو |
| `/office` | لوحة المكتب: إحصاءات + مهل قريبة + سجل تدقيق المكتب | عضو |
| `/developer` | **لوحة المطوّر**: إنشاء مكاتب + إنشاء أعضاء (يوزر+رمز+دور) + سجل تدقيق شامل | مطوّر |
| `/profile` `/login` `/terms` | الملف الشخصي / الدخول / شروط المطوّر | — |
| `/blog` `/admin` `/about` `/n9-law-system` | المدونة / إدارة الموقع / حول / إعلان المنتج | متنوّع |

## 6) واجهات API

| Method | Path | Auth | الوظيفة |
|---|---|---|---|
| GET | `/api/search?q=&cat=&valid=` | — | بحث الأرشيف |
| GET | `/api/search-all?q=` | — | البحث الشامل (يوسّع للأعضاء) |
| GET | `/api/assistant?q=` | — | المساعد الاستخلاصي |
| GET | `/api/pdf?u=<ncar-url>` | — | **بروكسي PDF** (يتجاوز منع NCAR للتضمين، 3 محاولات، حد 40MB، نطاق ncar.gov.sa فقط) |
| POST | `/api/analyze` | — | تحليل: `{tags[20], category, type}` |
| POST | `/api/vault` (multipart) | عضو | رفع حكم/مرفق |
| GET | `/api/file/[id]` | canSee | تقديم ملف خاص (+audit) |
| POST/PATCH | `/api/cases` | عضو | حالة: إنشاء + `context`/`attach`/`link`/`status` (+deadline) |
| POST/PATCH | `/api/replies` | عضو | رد: إنشاء (يولّد مسودة) + تعديل/`regenerate`/`status` |
| GET | `/api/memo?id=` | عضو | توليد مذكرة من ملف حالة |
| POST/DELETE | `/api/member-auth` | — | دخول/خروج العضو (rate-limit + قفل تخمين) |
| POST | `/api/auth` | — | دخول المدير (rate-limit + قفل تخمين) |
| GET/POST/DELETE | `/api/developer` | مطوّر | إدارة المكاتب والأعضاء |

## 7) نماذج البيانات (private-data/)

- `members.json`: `[{user, pin(6), name, office, role:"member|developer", added_at}]`
- `offices.json`: `[{id, name, logo, added_at}]`
- `uploads/{id}.json`: `{id, title, desc, tags[], category, type, visibility, owner, office, file|null, source_path|null, external_url|null, added_at}`
- `cases/{id}.json`: `{id, title, case_types[], status, contexts[{text,author,added_at}], attachments[{id,title}], links[], deadline|null, visibility, owner, office, created_at, updated_at}`
- `replies/{id}.json`: `{id, kind, subject, facts, opponent_claims, draft(md), legal[], status, visibility, owner, office, created_at, updated_at}`
- `audit.log.jsonl`: سطر JSON لكل حدث `{at, user, office, role, action, target}`

بيانات عامة `data/`: `docs/{id}.json`، `docs-lite.json`، `index-meta.json`، `search-index.json`، `tags-full.json`، `pages-index.json` (16K صفحة)، `new-docs.json` (تنبيهات).

## 8) المنطق الجوهري (لا يُكسر)

1. **التطبيع العربي** `lib/ar.js normalizeAr` (+نسخة في `lib/tags.mjs`): يُستخدم كـ`processTerm` في MiniSearch **وقت البناء ووقت التحميل** — يجب أن يبقى متطابقًا في: `scripts/build-index.mjs`، `scripts/extract-pages.mjs`، `app/api/search/route.js`، `app/api/assistant/route.js`، `app/api/search-all/route.js`، `lib/vaultIndex.js`، `lib/replyGen.js`.
2. **حقل `valid` في فهرس البحث رقم (0/1) وليس نصًا** — عند الفلترة استخدم `r.valid === 1` (خطأ شائع سبب أعطالًا).
3. **المحلل** `lib/tags.mjs analyzeDoc` → 20 تاغ + تصنيف + نوع.
4. **مولّد الردود** `lib/replyGen.js` والمذكرات `/api/memo`: يجلبان السند النظامي من فهرس الأرشيف (الساري فقط).
5. **بروكسي PDF إلزامي**: NCAR يرسل `Content-Security-Policy: frame-ancestors 'self'` فلا يُعرض مباشرة — استخدم دومًا `/api/pdf?u=` عبر `components/PdfViewer.js`. الشهادة ناقصة السلسلة → البروكسي يستخدم `https.Agent({rejectUnauthorized:false})`.
6. **`private-data/` gitignored** — تحقق قبل كل push بـ `git status --porcelain | grep private-data` (يجب ألا يظهر شيء).
7. **خط أنابيب الأرشيف**: `../scraper/Get-N9Archive.ps1` (سحب) → `-RebuildIndex` → `npm run build-index` → `npm run build-index` ثم `node scripts/extract-pages.mjs` (فهرس الصفحات).

## 9) السكربتات

```
npm run build-index                          # data/ من الأرشيف
node scripts/extract-pages.mjs               # فهرس الصفحات (16K صفحة، مستأنف)
node scripts/check-updates.mjs               # تنبيهات جديد NCAR → data/new-docs.json
node scripts/ingest-local.mjs "<مجلد>" office nasseh   # استيراد ملفات مكتب
node scripts/seed-sources.mjs                # زرع مصادر خارجية رسمية
```

## 10) القيود المعروفة

- كتابة private-data/content تعمل محليًا فقط (Vercel قراءة فقط) — النشر الحي يحتاج Supabase + R2
- ملفات PDF الأرشيف (15.4GB) خارج الريبو — العرض عبر بروكسي من NCAR
- السند النظامي في الردود/المذكرات مبني على تطابق نصي (ليس فهمًا دلاليًا عميقًا) — للاسترشاد، يُراجعه المحامي
- الوثائق الممسوحة ضوئيًا (بلا طبقة نص) خارج فهرس الصفحات — تحتاج OCR عربي (مرحلة قادمة)

## 11) الأفكار المتبقية (Roadmap)

OCR عربي للممسوح • جراف استشهادات تفاعلي مرئي • RAG بنموذج مفتوح مجاني محلي • تصدير ملف الحالة PDF كامل • تنبيهات بريد/تليجرام للتشريعات • PWA أوفلاين موسّع • API عامة موثقة • تفعيل وحدات قانونية جديدة (البنية جاهزة عبر بطاقات البوابة) • ربط الأحكام بمواد الأنظمة تلقائيًا.
