# Afrikyia

## الهدف
موقع «أفريقيا | الاصطناع الذكي»، وصفه في الصفحة: منصة ثقافية رقمية عالمية تدمج الثقافة والإبداع والتكنولوجيا. بثلاث لغات (العربية والإنجليزية والفرنسية)، وأقسام عرض (من نحن، الخدمات، المشاريع، الإنجازات، الرؤية، التواصل) وصفحة أعمال ولوحة إدارة.

- العميل / الجهة: TODO: to be filled by owner
- حالة المشروع: TODO: to be filled by owner

## التقنيات
- Next.js 16 (App Router) وReact 19 وTypeScript
- Tailwind CSS 4 وframer-motion
- `next-intl` للترجمة (ar وen وfr)
- Supabase
- jsPDF وxlsx للتصدير

## البنية
```
src/app/[locale]/    الصفحات: الرئيسية وworks وadmin وprivacy وterms
src/app/api/         achievements وfiles وprojects
src/components/      sections/ (أقسام الصفحة الرئيسية) وlayout/ وadmin/ وicons/
src/lib/ src/context/ src/data/ src/i18n/
messages/            ar.json وen.json وfr.json
scripts/             healthcheck.ts
```
- أضف أي نص جديد إلى ملفات `messages/` للغات الثلاث.
- `Hero.tsx.bak` في `src/components/sections/` نسخة قديمة، فلا تعدّلها.
- في الجذر سكربتات Python (`fix_*` و`contrast_check*` و`adjust_animations.py` و`generate_sitemap.py`) أعمال مساعدة غير موثقة. لا تشغّلها دون سؤال.

## الأوامر
```bash
npm install
npm run dev
npm run build
npm run start
npm run lint
npm run check:health   # npx tsx scripts/healthcheck.ts. راجع السكربت قبل تشغيله
```
لا توجد اختبارات مضبوطة في `scripts`.

## ملاحظات
- المتغيرات في `.env.local`. لا تقرأه ولا تنسخ قيمه.
- `Perso/Afrikyia Growth OS` مشروع منفصل في المجلد نفسه بتقنيات مختلفة. TODO: to be filled by owner (العلاقة بينهما).
