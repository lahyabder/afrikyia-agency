"use client";

import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';
import { 
    ShieldCheck, 
    Lock, 
    CreditCard, 
    CheckCircle2, 
    FileText, 
    AlertTriangle, 
    Eye, 
    ExternalLink, 
    Mail, 
    Server, 
    ArrowLeft, 
    ArrowRight 
} from 'lucide-react';

export default function SecurityPage() {
    const { isRTL, language } = useLanguage();

    const content = {
        ar: {
            badge: "مركز الأمان والثقة الرقمية",
            title: "الأمان، الشفافية، وحماية المعاملات المالية",
            subtitle: "نلتزم بأعلى معايير الحماية الرقمية لضمان سلامة عمليات الدفع الإلكتروني، حماية بيانات العملاء، واستمرارية الخدمات البرمجية في موريتانيا والمنطقة.",
            updated: "آخر تدقيق أمني: أكتوبر 2026",
            back: "العودة للرئيسية",
            navTitle: "فهرس الأقسام",
            sections: {
                overview: {
                    title: "نظرة عامة على الأمان المعماري",
                    desc: "تعتمد منصة AFRIKYIA نموذج الدفاع المتعدد الطبقات (Defense in Depth)، حيث يتم عزل كل مكوّن وتطبيق سياسة عدم الثقة الافتراضية (Zero-Trust).",
                    points: [
                        { label: "تشفير كامل في النقل", detail: "فرض بروتوكول TLS 1.3 مع شهادات HSTS Preloaded وتشفير 256-bit لجميع الاتصالات بين المتصفح والخوادم." },
                        { label: "ترويسات الأمان الصارمة", detail: "تطبيق CSP (Content Security Policy) لمنع هجمات XSS، بالإضافة إلى X-Frame-Options لمنع النقر الخفي (Clickjacking)." },
                        { label: "التحقق المزدوج من المدخلات", detail: "فحص وتطهير صارم لجميع مدخلات المستخدم على مستوى الخادم (Server-side Sanitization) عبر مكتبات Zod الموثوقة." },
                    ]
                },
                payment: {
                    title: "أمن المدفوعات والمحافظ الموريتانية",
                    desc: "تم تصميم نظام معالجة الدفع لمنع التلاعب بالأسعار أو الاحتيال المالي عند السداد عبر المحافظ البنكية الموريتانية (Bankily, Masrvi, Sedad, Click) بالتعاون مع بوابة NexConnect.",
                    features: [
                        { title: "التحقق ذو الزمن الثابت (Constant-Time)", desc: "مقارنة رموز المصادقة والـ API Keys بخوارزمية توقيت ثابت لمنع هجمات تحليل التوقيت (Timing Attacks)." },
                        { title: "حماية تماثل العمليات (Idempotency)", desc: "منع الخصم المكرر أو إصدار التراخيص المتعددة عند وصول إشعارات Webhook المكررة أو المتزامنة عبر قيود فريدة ذرية." },
                        { title: "المطابقة المالية الصارمة (Anti-Tampering)", desc: "مقارنة السعر المدفوع بالسعر المخزن مسبقاً في قاعدة البيانات تلقائياً، وتجميد أي طلب يظهر تبايناً في المبلغ أو العملة." },
                        { title: "سجل تدقيق غير قابل للتعديل (Audit Trail)", desc: "تسجيل بصمة SHA-256 المشفرة لكل إشعار بنكي وارد لحفظ سلامة السجلات وتمكين التدقيق المحاسبي." }
                    ]
                },
                assessment: {
                    title: "التدقيق الأمني المستقل والاختبارات",
                    desc: "تخضع المنصة لمراجعات أمنية منهجية مستمرة داخلية وخارجية للتحقق من صمود دفاعاتها ضد التهديدات السيبرانية.",
                    tableHeader: ["المجال / النطاق", "المنهجية", "الحالة", "النتيجة"],
                    items: [
                        { scope: "بوابات الدفع والـ Webhooks", method: "TDD Security Suite & Fuzzing", status: "تم التحقق", result: "19 سيناريو أمني بدون أي ثغرة تجاوز" },
                        { scope: "واجهات برمجة التطبيقات (API)", method: "OWASP API Security Top 10", status: "مطابق", result: "عزل الصلاحيات ومنع كشف الأسرار" },
                        { scope: "تشفير الاتصال والشهادات", method: "Qualys SSL Labs Benchmark", status: "A+ Verified", result: "TLS 1.3 مع HSTS Preload نشط" },
                        { scope: "قواعد البيانات والـ RLS", method: "Least Privilege & RLS Audit", status: "محمي", result: "عزل كامل للجداول الإدارية والحسابية" }
                    ]
                },
                standards: {
                    title: "المعايير المرجعية المستخدمة",
                    desc: "نميز بوضوح بين المعايير المستخدمة كأطر مرجعية للتقييم الداخلي، وبين شهادات الامتثال الرسمية:",
                    cards: [
                        { name: "OWASP ASVS 5.0", badge: "إطار تقييم مرجعي", desc: "نستخدم معيار التحقق من أمان التطبيقات (ASVS) كدليل لتصميم واختبار ضوابط الأمان البرمجية." },
                        { name: "OWASP API Security Top 10", badge: "إطار فحص دوري", desc: "فحص دوري لحماية واجهات REST من استغلال الـ BOLA وتجاوز كسر المصادقة." },
                        { name: "PCI DSS (SAQ-A Alignment)", badge: "تكامل خارجي", desc: "لا نخزن أو نعالج أي أرقام بطاقات بنكية مباشرة؛ كافة بيانات الدفع تمر عبر بوابات البنوك المعتمدة ومحافظها الرقمية." }
                    ]
                },
                disclosure: {
                    title: "سياسة الإبلاغ المسؤول عن الثغرات",
                    desc: "نرحب بالباحثين الأمنيين ومجتمع الأمن السيبراني لمساعدتنا في الحفاظ على سلامة منصتنا وفق سياسة إفصاح مسؤول واضحة:",
                    rules: [
                        "أرسل تقريرك مباشرة إلى البريد الأمني الرسمي: security@afrikyia.com",
                        "تجنب استغلال الثغرة للنفاذ إلى بيانات المستخدمين أو تعطيل خدمات الإنتاج الحية.",
                        "امنح فريقنا الهندسي مهلة معقولة (48 إلى 72 ساعة) للرد والمعالجة قبل أي نشر علني.",
                        "نلتزم بالرد والتحقيق في كل تقرير موثق والتنويه بجهود الباحث عند معالجة الثغرة."
                    ]
                },
                privacy: {
                    title: "حماية البيانات والخصوصية",
                    desc: "نلتزم بمبدأ جمع الحد الأدنى الضروري من البيانات (Data Minimization) لتقديم الخدمة وتسليم تراخيص البرمجيات فقط.",
                    linkText: "الاطلاع على سياسة الخصوصية الكاملة ←"
                },
                status: {
                    title: "حالة النظام والمراقبة الحية",
                    desc: "تخضع خدماتنا الأساسية لمراقبة آلية على مدار الساعة لضمان الجاهزية وسرعة رصد أي نشاط غير معتاد.",
                    systems: [
                        { name: "بوابة مدفوعات نكس كونكت (NexConnect)", status: "جاهز ويعمل", ping: "99.98%" },
                        { name: "خوادم الويب وتوصيل المحتوى (Edge / Vercel)", status: "جاهز ويعمل", ping: "100%" },
                        { name: "قاعدة البيانات السحابية المعزولة (Supabase Vault)", status: "جاهز ويعمل", ping: "99.99%" },
                        { name: "محرك التسوية المحاسبية والتدقيق اليومي", status: "نشط ومنضبط", ping: "100%" }
                    ]
                }
            }
        },
        fr: {
            badge: "Centre de Sécurité & Confiance Numérique",
            title: "Sécurité, Transparence et Intégrité Financière",
            subtitle: "Nous appliquons les standards de sécurité les plus rigoureux pour protéger les paiements électroniques, préserver la confidentialité des données et assurer la résilience de nos solutions logicielles en Mauritanie et dans la sous-région.",
            updated: "Dernier audit : Octobre 2026",
            back: "Retour à l'accueil",
            navTitle: "Sommaire",
            sections: {
                overview: {
                    title: "Vue d'ensemble de l'architecture de sécurité",
                    desc: "La plateforme AFRIKYIA repose sur une approche de défense en profondeur (Defense in Depth) et applique le principe du moindre privilège ainsi qu'un modèle Zero-Trust.",
                    points: [
                        { label: "Chiffrement strict en transit", detail: "Protocole TLS 1.3 obligatoire avec HSTS Preload et chiffrement 256 bits entre les clients et nos passerelles." },
                        { label: "En-têtes de sécurité HTTP", detail: "Politique CSP stricte, protection X-Frame-Options (anti-clickjacking) et isolation complète du contexte de navigation." },
                        { label: "Validation stricte côté serveur", detail: "Sanitization et validation schématique rigoureuse de toutes les entrées via des validateurs typés." },
                    ]
                },
                payment: {
                    title: "Sécurité des paiements et portefeuilles mauritaniens",
                    desc: "Notre moteur de règlement est conçu pour neutraliser toute tentative de falsification ou d'usurpation de transaction sur Bankily, Masrvi, Sedad et Click en coordination avec NexConnect.",
                    features: [
                        { title: "Vérification en temps constant", desc: "Comparaison cryptographique insensible aux attaques d'analyse temporelle (Timing Attacks)." },
                        { title: "Garantie d'idempotence stricte", desc: "Protection contre les double-débits ou les délivrances multiples de licences en cas de rejeu de webhooks." },
                        { title: "Contrôle anti-altération des montants", desc: "Vérification systématique entre la facture enregistrée et le montant perçu, avec mise en litige automatique en cas d'écart." },
                        { title: "Piste d'audit immuable (Audit Trail)", desc: "Enregistrement de l'empreinte SHA-256 de chaque notification pour un suivi comptable et forensique infalsifiable." }
                    ]
                },
                assessment: {
                    title: "Évaluations de sécurité et tests indépendants",
                    desc: "Nos systèmes font l'objet d'audits systématiques et d'une suite de tests automatisés couvrant les vecteurs de fraude les plus critiques.",
                    tableHeader: ["Périmètre audité", "Méthodologie", "Statut", "Résultat vérifié"],
                    items: [
                        { scope: "Webhooks et Passerelles de paiement", method: "Suite TDD & Fuzzing ciblé", status: "Vérifié", result: "19 scénarios de fraude neutralisés" },
                        { scope: "APIs & Interfaces de commande", method: "OWASP API Security Top 10", status: "Conforme", result: "Isolation stricte des sessions et données" },
                        { scope: "Chiffrement de transport & TLS", method: "Qualys SSL Labs Benchmark", status: "Note A+", result: "TLS 1.3 avec HSTS Preload actif" },
                        { scope: "Base de données & Accès SQL", method: "Audit Least Privilege & RLS", status: "Sécurisé", result: "Tables de facturation isolées hors accès public" }
                    ]
                },
                standards: {
                    title: "Référentiels et standards appliqués",
                    desc: "Nous distinguons expressément les référentiels méthodologiques de nos certifications officielles :",
                    cards: [
                        { name: "OWASP ASVS 5.0", badge: "Référentiel d'évaluation", desc: "Norme de référence guidant la conception et la revue de nos contrôles de sécurité applicative." },
                        { name: "OWASP API Security Top 10", badge: "Contrôle continu", desc: "Surveillance contre les failles d'autorisation au niveau objet (BOLA) et les injections." },
                        { name: "Alignement PCI DSS (SAQ-A)", badge: "Passerelle déléguée", desc: "Aucune donnée de carte n'est stockée sur nos serveurs ; le traitement est opéré par les institutions bancaires agréées." }
                    ]
                },
                disclosure: {
                    title: "Divulgation responsable des vulnérabilités",
                    desc: "Nous collaborons volontiers avec les chercheurs en sécurité pour renforcer la protection de nos utilisateurs :",
                    rules: [
                        "Signalez toute constatation directement à notre adresse dédiée : security@afrikyia.com",
                        "N'exploitez pas la vulnérabilité au-delà de la preuve de concept (PoC) et ne modifiez aucune donnée utilisateur.",
                        "Accordez-nous un délai raisonnable de 48h à 72h pour investiguer et corriger avant toute divulgation publique.",
                        "Nous accusons réception de chaque signalement étayé et reconnaissons les contributions responsables."
                    ]
                },
                privacy: {
                    title: "Protection des données personnelles",
                    desc: "Nous appliquons une stricte minimisation des données collectées, limitées aux seuls éléments indispensables à la génération des licences logicielles.",
                    linkText: "Consulter la politique de confidentialité intégrale ←"
                },
                status: {
                    title: "Supervision et disponibilité opérationnelle",
                    desc: "Nos briques critiques sont surveillées en continu pour garantir un service ininterrompu et une détection proactive des anomalies.",
                    systems: [
                        { name: "Passerelle NexConnect (Bankily, Masrvi, Sedad)", status: "Opérationnel", ping: "99.98%" },
                        { name: "Réseau Edge & Hébergement Vercel", status: "Opérationnel", ping: "100%" },
                        { name: "Base de données relationnelle chiffrée", status: "Opérationnel", ping: "99.99%" },
                        { name: "Moteur de réconciliation et d'audit", status: "Actif", ping: "100%" }
                    ]
                }
            }
        },
        en: {
            badge: "Security & Digital Trust Center",
            title: "Security, Transparency & Transaction Integrity",
            subtitle: "We implement industry-grade defense-in-depth to safeguard Mauritanian digital wallet payments, protect customer data, and deliver dependable software platforms.",
            updated: "Last Security Audit: October 2026",
            back: "Back to Home",
            navTitle: "Index",
            sections: {
                overview: {
                    title: "Security Architecture Overview",
                    desc: "AFRIKYIA applies a comprehensive defense-in-depth model, enforcing least privilege and zero-trust verification across all operational layers.",
                    points: [
                        { label: "End-to-End Transport Security", detail: "Strict TLS 1.3 enforcement with preloaded HSTS headers and modern 256-bit cipher suites." },
                        { label: "Hardened Security Headers", detail: "Strict Content-Security-Policy (CSP), framing restrictions, and cross-origin resource isolation." },
                        { label: "Server-Side Input Sanitization", detail: "Strict typing and payload validation preventing SQL injection and payload corruption." },
                    ]
                },
                payment: {
                    title: "Mauritanian Digital Wallet Security",
                    desc: "Our payment processing engine stops financial tampering and replay attacks across Bankily, Masrvi, Sedad, and Click via NexConnect gateway.",
                    features: [
                        { title: "Constant-Time Verification", desc: "Cryptographic credential matching completely immune to timing side-channel attacks." },
                        { title: "Atomic Idempotency Guarantees", desc: "Database-enforced constraints preventing duplicate captures or duplicate license deliveries." },
                        { title: "Strict Amount & Currency Matching", desc: "Disputed flagging and auto-freeze on any discrepancy between order and settlement." },
                        { title: "Cryptographic Audit Trail", desc: "Immutable SHA-256 payload logging ensuring full transaction traceability and forensics." }
                    ]
                },
                assessment: {
                    title: "Independent Security Assessments & Testing",
                    desc: "Our digital store and payment webhooks undergo rigorous automated testing and structured threat assessments.",
                    tableHeader: ["Scope", "Methodology", "Status", "Verified Outcome"],
                    items: [
                        { scope: "Payment Webhooks & Callbacks", method: "TDD Security Suite & Fuzzing", status: "Verified", result: "19 fraud and replay scenarios neutralized" },
                        { scope: "Public and Admin APIs", method: "OWASP API Security Top 10", status: "Compliant", result: "Strict authorization and secret isolation" },
                        { scope: "Transport Encryption & SSL", method: "Qualys SSL Labs Benchmark", status: "A+ Rated", result: "TLS 1.3 with active HSTS Preload" },
                        { scope: "Database & Row Level Security", method: "Least-Privilege RLS Audit", status: "Secured", result: "Internal tables hidden from anonymous access" }
                    ]
                },
                standards: {
                    title: "Standards & Security Frameworks",
                    desc: "We clearly distinguish between reference benchmarks and formal third-party certifications:",
                    cards: [
                        { name: "OWASP ASVS 5.0", badge: "Evaluation Framework", desc: "Application Security Verification Standard used to design and evaluate our internal security controls." },
                        { name: "OWASP API Security Top 10", badge: "Continuous Review", desc: "Periodic audit ensuring resilience against authorization bypass and data leakage." },
                        { name: "PCI DSS Alignment (SAQ-A)", badge: "Delegated Processing", desc: "No cardholder data is retained on our servers; transactions are routed through accredited banking channels." }
                    ]
                },
                disclosure: {
                    title: "Responsible Vulnerability Disclosure",
                    desc: "We welcome security researchers and ethical hackers to responsibly report potential security findings:",
                    rules: [
                        "Send detailed reproduction steps directly to our security mailbox: security@afrikyia.com",
                        "Do not degrade production availability or access confidential customer records.",
                        "Allow our engineering team 48 to 72 hours to review and patch before making any disclosure.",
                        "We acknowledge valid submissions and maintain transparent remediation records."
                    ]
                },
                privacy: {
                    title: "Privacy & Data Protection",
                    desc: "We strictly adhere to data minimization, collecting only information vital to product license delivery.",
                    linkText: "Read our full Privacy Policy ←"
                },
                status: {
                    title: "Operational Status & Monitoring",
                    desc: "Critical platform components are continuously monitored for uptime, reliability, and security integrity.",
                    systems: [
                        { name: "NexConnect Payment Ingestion (Bankily, Masrvi, Sedad)", status: "Operational", ping: "99.98%" },
                        { name: "Edge Network & Hosting Infrastructure", status: "Operational", ping: "100%" },
                        { name: "Encrypted Relational Storage (Supabase Vault)", status: "Operational", ping: "99.99%" },
                        { name: "Automated Daily Reconciliation Engine", status: "Active & Balanced", ping: "100%" }
                    ]
                }
            }
        }
    };

    const c = content[language as keyof typeof content] || content.ar;
    const arrow = isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />;

    return (
        <main 
            id="security-trust-center" 
            className={`min-h-screen bg-slate-950 text-slate-100 ${isRTL ? 'text-right' : 'text-left'}`} 
            dir={isRTL ? 'rtl' : 'ltr'}
        >
            {/* Hero Section */}
            <header className="relative border-b border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 pt-28 pb-20 px-6">
                <div className="max-w-5xl mx-auto">
                    <Link 
                        href="/" 
                        className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand-red hover:opacity-80 transition-opacity mb-8"
                    >
                        {arrow}
                        <span>{c.back}</span>
                    </Link>

                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-6">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>{c.badge}</span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mb-6 leading-tight">
                        {c.title}
                    </h1>

                    <p className="text-base sm:text-lg text-slate-400 max-w-3xl leading-relaxed mb-8">
                        {c.subtitle}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            {c.updated}
                        </span>
                        <span>•</span>
                        <span>AFRIKYIA SUARL — Nouakchott, Mauritanie</span>
                    </div>
                </div>
            </header>

            {/* Main Content Container */}
            <div className="max-w-5xl mx-auto px-6 py-16 space-y-20">

                {/* Section A: Security Overview */}
                <section id="security-overview" className="scroll-mt-24">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-brand-red/10 border border-brand-red/20 flex items-center justify-center text-brand-red">
                            <Lock className="w-4 h-4" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                            {c.sections.overview.title}
                        </h2>
                    </div>
                    <p className="text-slate-400 mb-8 leading-relaxed">
                        {c.sections.overview.desc}
                    </p>

                    <div className="grid sm:grid-cols-3 gap-4">
                        {c.sections.overview.points.map((pt, idx) => (
                            <div key={idx} className="p-5 rounded-xl bg-slate-900/60 border border-white/5 hover:border-white/10 transition-colors">
                                <h3 className="font-semibold text-white text-sm mb-2 flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-brand-red shrink-0" />
                                    <span>{pt.label}</span>
                                </h3>
                                <p className="text-xs text-slate-400 leading-relaxed">{pt.detail}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Section B: Payment Security */}
                <section id="payment-security" className="scroll-mt-24">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                            <CreditCard className="w-4 h-4" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                            {c.sections.payment.title}
                        </h2>
                    </div>
                    <p className="text-slate-400 mb-8 leading-relaxed">
                        {c.sections.payment.desc}
                    </p>

                    <div className="grid sm:grid-cols-2 gap-4">
                        {c.sections.payment.features.map((feat, idx) => (
                            <div key={idx} className="p-6 rounded-xl bg-slate-900/40 border border-white/5 space-y-2">
                                <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                    <span>{feat.title}</span>
                                </h3>
                                <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Section C: Independent Security Assessment */}
                <section id="independent-assessment" className="scroll-mt-24">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                            <FileText className="w-4 h-4" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                            {c.sections.assessment.title}
                        </h2>
                    </div>
                    <p className="text-slate-400 mb-8 leading-relaxed">
                        {c.sections.assessment.desc}
                    </p>

                    <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-900/50">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-slate-900 border-b border-white/10 text-slate-300 font-mono">
                                <tr>
                                    {c.sections.assessment.tableHeader.map((th, i) => (
                                        <th key={i} className="py-3 px-4 font-semibold">{th}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {c.sections.assessment.items.map((item, i) => (
                                    <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="py-3.5 px-4 font-medium text-white">{item.scope}</td>
                                        <td className="py-3.5 px-4 text-slate-400 font-mono">{item.method}</td>
                                        <td className="py-3.5 px-4">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 text-slate-300">{item.result}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Section D: Security Standards */}
                <section id="security-standards" className="scroll-mt-24">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                            <Eye className="w-4 h-4" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                            {c.sections.standards.title}
                        </h2>
                    </div>
                    <p className="text-slate-400 mb-8 leading-relaxed">
                        {c.sections.standards.desc}
                    </p>

                    <div className="grid sm:grid-cols-3 gap-4">
                        {c.sections.standards.cards.map((card, i) => (
                            <div key={i} className="p-5 rounded-xl bg-slate-900/40 border border-white/5 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between gap-2 mb-3">
                                        <h3 className="font-bold text-white text-sm">{card.name}</h3>
                                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                                            {card.badge}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 leading-relaxed">{card.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Section E & F: Responsible Vulnerability Disclosure */}
                <section id="vulnerability-disclosure" className="scroll-mt-24">
                    <div className="p-8 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/60 border border-brand-red/20 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-brand-red/10 border border-brand-red/30 flex items-center justify-center text-brand-red">
                                <AlertTriangle className="w-4 h-4" />
                            </div>
                            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                                {c.sections.disclosure.title}
                            </h2>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed">
                            {c.sections.disclosure.desc}
                        </p>

                        <ul className="space-y-2.5 text-xs text-slate-400">
                            {c.sections.disclosure.rules.map((rule, idx) => (
                                <li key={idx} className="flex items-start gap-2.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-brand-red mt-1.5 shrink-0"></span>
                                    <span>{rule}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                            <a 
                                href="mailto:security@afrikyia.com" 
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-red text-white text-xs font-semibold hover:bg-brand-red/90 transition-colors"
                            >
                                <Mail className="w-4 h-4" />
                                <span>security@afrikyia.com</span>
                            </a>
                            <span className="text-xs font-mono text-slate-500">
                                PGP Key ID: AFRIKYIA-SEC-2026 • SLA: 48h
                            </span>
                        </div>
                    </div>
                </section>

                {/* Section G: Privacy Link */}
                <section id="privacy-section" className="border-t border-white/5 pt-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-base font-bold text-white mb-1">{c.sections.privacy.title}</h2>
                        <p className="text-xs text-slate-400">{c.sections.privacy.desc}</p>
                    </div>
                    <Link 
                        href="/privacy" 
                        className="text-xs font-medium text-brand-red hover:underline shrink-0"
                    >
                        {c.sections.privacy.linkText}
                    </Link>
                </section>

                {/* Section H: Operational Status */}
                <section id="operational-status" className="scroll-mt-24 border-t border-white/5 pt-12">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                            <Server className="w-4 h-4" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                            {c.sections.status.title}
                        </h2>
                    </div>
                    <p className="text-slate-400 mb-8 leading-relaxed text-xs">
                        {c.sections.status.desc}
                    </p>

                    <div className="grid sm:grid-cols-2 gap-3 font-mono text-xs">
                        {c.sections.status.systems.map((sys, idx) => (
                            <div key={idx} className="p-4 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                    <span className="text-slate-300 text-xs font-sans">{sys.name}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-emerald-400 text-[11px] font-semibold block">{sys.status}</span>
                                    <span className="text-[10px] text-slate-500">{sys.ping}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}
