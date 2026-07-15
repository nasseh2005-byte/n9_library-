# N9 LIBRARY — Saudi Law Edition

المكتبة القانونية السعودية الرقمية — Next.js 14 + Tailwind، عربي RTL.

**الناشر:** NASSEH ZAHER ALNAMAN — NASSEH2005@GMAIL.COM
**مصدر الوثائق الرسمية:** المركز الوطني للوثائق والمحفوظات (ncar.gov.sa)

---

## التشغيل محليًا

```powershell
npm install          # مرة واحدة
npm run build-index  # يبني بيانات الموقع من ..\Archive\_index\library.json
npm run dev          # ثم افتح http://localhost:3000
```

## تحديث بيانات الأرشيف (بعد أي سحب جديد)

```powershell
# في مجلد scraper:
.\Get-N9Archive.ps1 -RebuildIndex
# ثم في مجلد الموقع:
npm run build-index
```

## مزامنة المصادر الرسمية الجديدة

تسحب هذه المهمة فهارس ديوان المظالم ولجان المنازعات والمخالفات المصرفية والتمويلية، ثم تحدّث `data/official-docs.json`:

```powershell
npm run sync-sources
```

وثائق مجلد Google Drive مفهرسة في `data/drive-docs.json`. وتظهر جميع الجهات المعتمدة في صفحة `/sources`.

## تفعيل رفع المطوّر على Vercel

1. من مشروع Vercel افتح **Storage** ثم أنشئ **Blob** من النوع **Public** واربطه ببيئات المشروع.
2. الربط الحديث يضيف `BLOB_STORE_ID` ويفعّل System Environment Variables (OIDC) تلقائيًا؛ أعد النشر بعد الربط. المتغير القديم `BLOB_READ_WRITE_TOKEN` مدعوم أيضًا إن ظهر في مشروع قديم.
3. قسم المطوّر يقبل الملفات العامة حتى 4MB أو رابطًا خارجيًا للملفات الأكبر. مرفقات الردود وبيانات الأعضاء تُشفّر قبل رفعها، أما مرفقات المدونة فهي عامة.

## الرفع على GitHub (كل محتويات هذا المجلد)

```powershell
cd n9-library-site
git init
git add .
git commit -m "N9 Library v1"
# أنشئ ريبو خاص باسم n9-library على github.com ثم:
git remote add origin https://github.com/<اسمك>/n9-library.git
git branch -M main
git push -u origin main
```

**ما يُرفع:** كل شيء هنا بما فيه مجلد `data/` (فهارس JSON فقط — بدون PDF).
**ما لا يُرفع:** `node_modules/` و`.next/` (مستثناة تلقائيًا في .gitignore)،
ومجلد `Archive/` (الـ PDF) يبقى خارج هذا المجلد أصلًا.

## متغيرات البيئة (لمرحلة Vercel)

| المتغير | الوصف |
|---|---|
| `ADMIN_PASSWORD` | كلمة مرور لوحة الإدارة (محليًا الافتراضية: n9admin) |
| `JWT_SECRET` | نص عشوائي طويل لتوقيع جلسات الإدارة |
| `MEMBERS_JSON` | حساب الدخول الأولي؛ بعد إضافة أعضاء تُحفظ القائمة الدائمة مشفّرة في Blob |
| `MEMBERS_PIN_PEPPER` | مفتاح سري إضافي لتشفير PIN؛ يجب أن يطابق قيمة إنشاء بيانات الأعضاء |
| `BLOB_STORE_ID` | يضيفه ربط Vercel Blob الحديث تلقائيًا ويعمل مع OIDC |
| `BLOB_READ_WRITE_TOKEN` | بديل مدعوم للمشاريع القديمة فقط |
| `SITE_URL` | عنوان الموقع النهائي، مثل `https://n9-library.vercel.app` |

يمكن تصدير نسخة Excel محلية من بيانات الأعضاء الموجودة في البيئة بالأمر `npm run build-members-sheet`. يحفظها داخل `private-data/` المستثنى من Git، ولا يطبع بيانات الأعضاء في الطرفية.

## البنية

- `app/` — الصفحات: الرئيسية، المكتبة، الوثيقة، البحث، التاغات، المدونة، حول، N9 LAW SYSTEM، الإدارة
- `data/` — فهارس مولدة (docs-lite، search-index، docs/*.json) — تُرفع مع الريبو
- `content/posts/` — تدوينات Markdown (مصدر 3)
- `content/books/` — تعريفات الكتب (مصدر 2)
- `scripts/build-index.mjs` — مولد البيانات من مخرجات السكربت
