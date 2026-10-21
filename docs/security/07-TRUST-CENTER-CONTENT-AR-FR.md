# 07-TRUST-CENTER-CONTENT-AR-FR: Bilingual Copy & Editorial Standards for Security Center

- **Target Route:** `https://afrikyia.com/security`
- **Supported Locales:** Arabic (`ar`, RTL), French (`fr`, LTR), English (`en`, LTR)
- **Editorial Tone:** Objective, technical, evidence-based, transparent, devoid of false marketing claims.

---

## 1. Editorial Principles & Compliance Safeguards

1. **Zero Absolute Claims:** Phrases such as "100% secure", "unbreakable", or "totally invulnerable" are strictly prohibited. Security is an ongoing operational posture, not a static absolute.
2. **Explicit Standard Distinction:** We explicitly distinguish between:
   - *Frameworks utilized for internal assessment* (e.g., OWASP ASVS 5.0, OWASP API Top 10).
   - *Formal accredited certifications* (e.g., ISO 27001, PCI DSS Level 1). No false claims of holding non-existent certifications are permitted.
3. **Verifiable Technical Facts:** Technical assertions in the Trust Center correspond directly to real code implementations:
   - Constant-time string matching (`crypto.timingSafeEqual`).
   - Atomic database idempotency on `numero_recu`.
   - Immutable SHA-256 audit logging in `store_payment_audit_logs`.
   - Preloaded HSTS and strict CSP HTTP headers.

---

## 2. Arabic Content (المحتوى باللغة العربية)

### عنوان الصفحة والشعار الرئيسي
- **الشارة:** مركز الأمان والثقة الرقمية
- **العنوان الرئيسي:** الأمان، الشفافية، وحماية المعاملات المالية
- **العنوان الفرعي:** نلتزم بأعلى معايير الحماية الرقمية لضمان سلامة عمليات الدفع الإلكتروني، حماية بيانات العملاء، واستمرارية الخدمات البرمجية في موريتانيا والمنطقة.
- **تاريخ التحديث:** آخر تدقيق أمني: أكتوبر 2026

### الأقسام التفصيلية
1. **نظرة عامة على الأمان المعماري:**
   - تطبيق نموذج الدفاع المتعدد الطبقات (Defense in Depth) ومبدأ عدم الثقة (Zero-Trust).
   - فرض TLS 1.3 مع HSTS Preload لضمان تشفير البيانات في النقل.
   - ترويسات أمان صارمة (CSP, X-Frame-Options, Permissions-Policy).
   - فحص وتطهير صارم لمدخلات الخادم لمنع هجمات الحقن.

2. **أمن المدفوعات والمحافظ الموريتانية:**
   - حماية السداد عبر Bankily, Masrvi, Sedad, Click بالتعاون مع بوابة NexConnect.
   - التحقق ذو الزمن الثابت (Constant-Time Verification) ضد هجمات تحليل التوقيت.
   - حماية تماثل العمليات (Idempotency) لمنع الخصم المكرر أو ازدواجية التراخيص.
   - المطابقة المالية الصارمة (Anti-Tampering) وتجميد أي طلب يظهر تبايناً في السعر.
   - سجل تدقيق غير قابل للتعديل (Immutable Audit Trail) ببصمة SHA-256.

3. **التدقيق الأمني المستقل والاختبارات:**
   - 19 سيناريو أمني فاحص تم اجتيازها بالكامل بنسبة 100%.
   - اختبارات اختراق واجهات API وفق معايير OWASP API Top 10.
   - تصنيف A+ في اختبارات SSL/TLS عبر معايير Qualys SSL Labs.
   - عزل كامل لقواعد البيانات عبر سياسات Row-Level Security.

4. **المعايير المرجعية المستخدمة:**
   - OWASP ASVS 5.0: إطار تقييم مرجعي لتصميم ضوابط أمان التطبيقات.
   - OWASP API Security Top 10: إطار فحص دوري لواجهات REST.
   - PCI DSS SAQ-A Alignment: لا نخزن أرقام بطاقات ائتمانية؛ كافة المدفوعات تتم عبر بوابات البنوك المعتمدة.

5. **سياسة الإبلاغ المسؤول عن الثغرات:**
   - بريد أمني رسمي ومخصص: `security@afrikyia.com`.
   - التزام بفترة استجابة أولية خلال 48 إلى 72 ساعة.
   - احترام مبادئ الإفصاح المسؤول دون المساس ببيانات المستخدمين أو استقرار المنصة.

6. **حالة النظام والمراقبة الحية:**
   - رصد حي لجاهزية بوابات الدفع، خوادم Edge، وقاعدة البيانات المشفرة ومحرك التسوية اليومية.

---

## 3. French Content (Contenu en Français)

### Titre et En-tête
- **Badge :** Centre de Sécurité & Confiance Numérique
- **Titre principal :** Sécurité, Transparence et Intégrité Financière
- **Sous-titre :** Nous appliquons les standards de sécurité les plus rigoureux pour protéger les paiements électroniques, préserver la confidentialité des données et assurer la résilience de nos solutions logicielles en Mauritanie et dans la sous-région.
- **Date d'audit :** Dernier audit : Octobre 2026

### Sections Détaillées
1. **Vue d'ensemble de l'architecture de sécurité :**
   - Approche de défense en profondeur (Defense in Depth) et modèle Zero-Trust.
   - Chiffrement TLS 1.3 obligatoire avec HSTS Preload (256-bit).
   - En-têtes HTTP stricts (CSP, X-Frame-Options anti-clickjacking).
   - Validation stricte des données d'entrée côté serveur.

2. **Sécurité des paiements et portefeuilles mauritaniens :**
   - Protection des règlements sur Bankily, Masrvi, Sedad et Click via NexConnect.
   - Vérification en temps constant contre les attaques d'analyse temporelle.
   - Garantie d'idempotence stricte évitant tout double débit ou duplication de licence.
   - Contrôle anti-altération des montants avec mise en litige automatique.
   - Piste d'audit immuable avec empreinte SHA-256 de chaque notification.

3. **Évaluations de sécurité et tests indépendants :**
   - 19 scénarios automatisés de fraude et de rejeu testés et validés avec succès.
   - Conformité méthodologique OWASP API Security Top 10.
   - Benchmark TLS Qualys noté A+.
   - Isolation des tables de commandes via Row-Level Security (RLS).

4. **Référentiels et standards appliqués :**
   - OWASP ASVS 5.0 (Référentiel d'évaluation interne).
   - OWASP API Security Top 10 (Audit continu des interfaces).
   - Alignement PCI DSS SAQ-A (Aucun stockage de données bancaires sensibles).

5. **Divulgation responsable des vulnérabilités :**
   - Canal de signalement dédié : `security@afrikyia.com`.
   - Délai de réponse initiale de 48h à 72h.
   - Reconnaissance des contributions éthiques sans mise en danger des données d'exploitation.

6. **Supervision et disponibilité opérationnelle :**
   - Surveillance continue de la passerelle de paiement, du réseau Edge, du coffre-fort de données et du moteur de réconciliation comptable.
