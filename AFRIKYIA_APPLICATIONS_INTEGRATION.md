# تقرير تكامل قسم التطبيقات الرقمية في موقع AFRIKYIA
**AFRIKYIA Digital Applications Integration Report**
*التاريخ: 18 أكتوبر 2026*

---

## 1. بيانات المشروع والمسار
- **اسم المشروع:** موقع شركة أفريقيا المؤسسي (AFRIKYIA Corporate Website)
- **المسار على النظام:** `/Users/lahyabderrahmane/Desktop/Web-Projects/Perso/Afrikyia`
- **حزمة التقنيات المعتمدة:**
  - Next.js 16 (App Router)
  - React 19
  - TypeScript 5
  - Tailwind CSS 4
  - next-intl (ar, fr, en)
  - Framer Motion

---

## 2. نطاق العمل والتنفيذ
تمت إضافة قسم مؤسسي احترافي جديد بعنوان **«تطبيقاتنا | Nos applications»** يبرز الحلول والتطبيقات الرقمية الأربعة التي تطورها شركة AFRIKYIA، مع الحفاظ الكامل على الهوية البصرية للشركة والأنماط المعمارية المعمول بها في المشروع، ودون المساس بالمشاريع المستقلة للتطبيقات الأربعة.

---

## 3. مكان ظهور القسم وتسلسل الصفحة
- **الموقع في الصفحة الرئيسية (`src/app/[locale]/page.tsx`):**
  تم وضع المكون `<Applications />` مباشرة بعد قسم الخدمات (`<Services />`) وقبل قسم الإنجازات (`<Achievements />`)، مما يضمن تسلسلاً بصرياً ومنطقياً متدرجاً من الخدمات الاستشارية والتقنية إلى المنتجات الرقمية والتطبيقات الفعلية، ثم الأعمال والإنجازات السابقة.
- **التكامل مع شريط التنقل (`Header.tsx`):**
  تمت إضافة رابط سلس يحمل المعرّف `/#applications` إلى قائمة الروابط الرئيسية، بحيث يظهر بعنوان «تطبيقاتنا» في النسخة العربية، و«Nos applications» في النسخة الفرنسية، و«Our Applications» في النسخة الإنجليزية.

---

## 4. التطبيقات الأربعة والتعريفات المعتمدة والروابط

| التطبيق | الشعار والأصل المعتمد | الرابط الرسمي | الحالة والنوع |
| :--- | :--- | :--- | :--- |
| **DIFTAR \| دفتر** | `/apps/diftar-logo.png` | `https://www.diftar.online/` | PWA / منصة ويب مباشرة |
| **SANAD \| سند** | `/apps/sanad-mark.png` | `https://sanadrim.com/` | PWA / منصة ويب مباشرة |
| **ELBET \| البت** | `/apps/elbet-logo.png` | `https://www.elbet.art/` | منصة ويب وتطبيق PWA |
| **BADILA \| بديلة** | `/apps/badila-logo.png` | `https://www.badila.online/` | PWA / منصة ويب مباشرة |

### النصوص والتعريفات المعتمدة نصياً:
1. **DIFTAR \| دفتر:**
   - **عربي:** «منصة دفاتر رقمية مخصصة لوكلاء الدفع، تتيح تسجيل عمليات السحب والإيداع، ومراقبة سيولة الصناديق، واحتساب العمولات والأرباح، وإصدار تقارير الإغلاق اليومية، مع دعم العمل دون اتصال بالإنترنت ومزامنة البيانات بين الأجهزة.»
   - **فرنسي:** «Une plateforme de gestion numérique destinée aux agents de paiement, permettant d'enregistrer les opérations de dépôt et de retrait, de suivre la liquidité des caisses, de calculer les commissions et les bénéfices, et de générer des rapports de clôture quotidiens, avec un fonctionnement hors ligne et une synchronisation entre appareils.»
   - *ملاحظة:* تم الالتزام بتعريف التطبيق بوصفه منصة دفاتر متخصصة لوكلاء الدفع وضبط السيولة، دون استخدام الوصف القديم لنقاط البيع العامة.

2. **SANAD \| سند:**
   - **عربي:** «تطبيق لتنظيم إيصالات التحويلات البنكية، واستخراج بياناتها تلقائيا من الصور، وتصنيف العمليات المالية وتحويلها إلى كشوفات منظمة قابلة للمراجعة والتصدير.»
   - **فرنسي:** «Une application permettant d'organiser les reçus de virements bancaires, d'extraire automatiquement les données à partir des images, de classer les opérations financières et de produire des relevés structurés, consultables et exportables.»

3. **ELBET \| البت:**
   - **عربي:** «منصة رقمية تربط العملاء بالشعراء الشعبيين والفصيحين لطلب القصائد و"أطلع" و"الگيفان".»
   - **فرنسي:** «Une plateforme numérique mettant en relation les clients avec des poètes de tradition populaire et de poésie classique arabe, pour commander des poèmes, des « Atlaa » et des « Guivane ».»
   - *ملاحظة:* تم الحفاظ حرفياً على مصطلحي «أطلع» و«الگيفان» و« Atlaa » و« Guivane » واحترام البعد الثقافي الموريتاني.

4. **BADILA \| بديلة:**
   - **عربي:** «منصة رقمية تتيح للمستخدمين مبادلة السلع والأغراض فيما بينهم مباشرة، دون استخدام النقود، من خلال عرض الممتلكات واقتراح المبادلات والتواصل بين الأطراف.»
   - **فرنسي:** «Une plateforme numérique permettant aux utilisateurs d'échanger directement des biens et des objets sans utiliser d'argent, grâce à la publication d'annonces, aux propositions d'échange et à la communication entre les parties.»

---

## 5. مصادر الشعارات الرسمية والأصول
تم استخراج الشعارات الأصلية عالية الدقة من مجلدات المشاريع المحلية في `/Users/lahyabderrahmane/Desktop/Web-Projects` ونسخها إلى مجلد `public/apps/` داخل مشروع AFRIKYIA دون التعديل على ملفات المشاريع الأصلية:
1. **DIFTAR:**
   - المصدر: `/Users/lahyabderrahmane/Desktop/Web-Projects/Clients/diftar/public/logo.png`
   - النسخة في المشروع: `/public/apps/diftar-logo.png` (PNG شفاف 1954×1954)
2. **SANAD:**
   - المصدر: `/Users/lahyabderrahmane/Desktop/Web-Projects/sanad/public/brand/sanad-mark.png` و `icon.svg`
   - النسخة في المشروع: `/public/apps/sanad-mark.png` و `/public/apps/sanad-logo.png`
3. **ELBET:**
   - المصدر: `/Users/lahyabderrahmane/Desktop/Web-Projects/Perso/elBet/public/brand/elbet-logo.png`
   - النسخة في المشروع: `/public/apps/elbet-logo.png` (PNG شفاف 2354×2354)
4. **BADILA:**
   - المصدر: `/Users/lahyabderrahmane/Desktop/Web-Projects/Perso/badila/src/assets/logo-badila.png`
   - النسخة في المشروع: `/public/apps/badila-logo.png` (PNG شفاف 1768×1768)

---

## 6. التحقق والمقارنة مع المواقع الحية (Live Websites Audit)
- **دفتر (`https://www.diftar.online/`):** الموقع الحي يركز بالكامل على إدارة سيولة وكلاء الدفع وحسابات الصناديق والعمل أوفلاين، وهو متطابق بنسبة 100% مع التعريف المعتمد.
- **سند (`https://sanadrim.com/`):** الموقع الحي يدعم محافظ موريتانيا (بنكيلي، مصرفي، سداد، كليك، بيم بانك، أمانتي، باميس) ويستخرج الإيصالات ويصدر كشوفات Excel و PDF، مطابق تماماً للتعريف.
- **البت (`https://www.elbet.art/`):** الموقع الحي يقدم لغن والشعر الموريتاني (بت العرسان، بت الحوصه، بت المرظه، گيفان)، مطابق تماماً للهوية الأدبية والمصطلحات المعتمدة.
- **بديلة (`https://www.badila.online/`):** الموقع الحي مخصص للتبادل المباشر بدون نقود («خُذ وأعطِ»)، مطابق تماماً للتعريف.
- **طبيعة المنصات والمتاجر:** التطبيقات الأربعة تعمل كمنصات ويب تقدمية خفيفة وسريعة (PWA / Web Apps)، ولم يتم اختراع روابط وهمية لمتاجر التطبيقات تماشياً مع الضوابط الصارمة لدفتر الشروط.

---

## 7. الملفات والمكونات الجديدة والمعدلة
### الملفات الجديدة:
1. `src/components/sections/Applications.tsx`: مكون القسم الرئيسي ومبني بأسلوب React Client Component مع دعم Framer Motion والترجمة والتجاوب الكامل وتتبع النقرات.
2. `public/apps/*`: أصول الشعارات الأربعة الرسمية عالية الدقة.

### الملفات المعدلة:
1. `messages/ar.json`: إضافة مفتاح `applications` في شريط التنقل `nav` وقسم البيانات الكامل بالعربية.
2. `messages/fr.json`: إضافة مفتاح `applications` في شريط التنقل `nav` وقسم البيانات الكامل بالفرنسية.
3. `messages/en.json`: مزامنة المفاتيح في شريط التنقل `nav` وقسم البيانات بالإنجليزية.
4. `src/components/layout/Header.tsx`: إضافة رابط `/#applications` إلى مصفوفة الروابط للمكتب وشاشات الجوال.
5. `src/app/[locale]/page.tsx`: استيراد وإدراج مكون `<Applications />` بين الخدمات والإنجازات.

---

## 8. التصميم البصري والتجربة التفاعلية
- **الأسلوب البصري:** Modern — Minimalist — Corporate — Premium.
- **نظام الألوان:** استخدام درجات Slate الأنيقة، مع خط أحمر ولمسات تتطابق مع لون الهوية للشركة `brand-red` (`#E11D48`) وخطوط الموقع الرسمية (`Almarai` للعربية و`Outfit / Geist` للغات اللاتينية).
- **التجاوب (Responsive Breakdown):**
  - **شاشات الحواسيب المكتبية (Desktop):** 4 بطاقات متوازنة في صف واحد (`lg:grid-cols-4`).
  - **الأجهزة اللوحية (Tablet):** بطاقتان في كل صف (`md:grid-cols-2`).
  - **الهواتف الذكية (Mobile):** بطاقة واحدة في الصف (`grid-cols-1`) مع هوامش مريحة وتجنب تام للتمرير الأفقي.
- **التفاعل والأمان:**
  - تأثير hover سلس على البطاقات لرفعها خفيفاً وإبراز الحواف.
  - جميع روابط فتح التطبيقات تستخدم:
    `target="_blank" rel="noopener noreferrer"`

---

## 9. قياس التفاعل (Analytics & Tracking)
تمت إضافة دالة تتبع آمنة ودفاعية `trackAppClick` داخل المكون تستجيب لحدث النقر على أزرار فتح التطبيقات:
- **اسم الحدث:** `application_click`
- **المعاملات المرسلة:**
  - `app_name`: اسم التطبيق (دفتر، سند، البت، بديلة)
  - `app_url`: الرابط المستهدف
  - `page_location`: رابط الصفحة الحالية
- **التوافقية:** تعمل تلقائياً في حال وجود `window.gtag` (Google Analytics 4) أو `window.dataLayer` (GTM) دون إحداث أخطاء في الكونسول أو التأثير على الأداء في حال غيابهما.

---

## 10. نتائج الاختبارات التقنية وضمان الجودة (QA)
- **TypeScript:** تم التحقق بنجاح مع عدم وجود أي أخطاء (Strict Type Safety).
- **ESLint:** فحص ملف `Applications.tsx` أظهر: **0 أخطاء و 0 تحذيرات**.
- **Next.js Production Build:** تم تشغيل `npm run build` وانتهى بنجاح تام (Exit Code: 0)، حيث تم تجميع جميع المسارات بنجاح:
  ```
  ✓ Compiled successfully in 5.2s
  ✓ Finished TypeScript in 2.3s
  ✓ Generating static pages using 9 workers (28/28)
  ```
- **فحص استجابة الأصول (HTTP 200 Verification):**
  - `/apps/diftar-logo.png` -> HTTP 200 OK
  - `/apps/sanad-mark.png` -> HTTP 200 OK
  - `/apps/elbet-logo.png` -> HTTP 200 OK
  - `/apps/badila-logo.png` -> HTTP 200 OK
- **التحقق من خادم التطوير الحي:**
  تم فحص استجابة الصفحتين `/ar` و `/fr` وتأكيد سلامة تصيير HTML للقسم كاملاً بما في ذلك العناوين والشعارات والأزرار ومحددات المعرفات (`btn-open-diftar`, `btn-open-sanad`, `btn-open-elbet`, `btn-open-badila`).

---

## 11. النواقص أو الملاحظات
- لا توجد أي نواقص فنية أو أخطاء برمجية عالقة.
- التطبيقات الأربعة تعمل جميعها على روابطها الحية وتستقبل الزوار بصورة طبيعية.
