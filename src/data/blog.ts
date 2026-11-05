// AFRIKYIA Blog Data & Models (Technology, News, Studies, Discoveries, Knowledge)

export const BLOG_CATEGORIES = [
    'technology',
    'news',
    'studies',
    'discoveries',
    'knowledge',
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

export type Locale = 'ar' | 'en' | 'fr';

export interface Author {
    name: string;
    role: string;
    avatar?: string;
}

export interface ArticleContentSection {
    heading?: string;
    body: string[];
    highlight?: string;
}

export interface BlogPost {
    slug: string;
    category: BlogCategory;
    title: Record<Locale, string>;
    excerpt: Record<Locale, string>;
    content: Record<Locale, ArticleContentSection[]>;
    author: Author;
    publishedAt: string; // ISO YYYY-MM-DD
    readTime: Record<Locale, string>;
    featured?: boolean;
    isPublished?: boolean; // Defaults to true if undefined
    tags: string[];
    coverGradient: string; // Tailwind gradient for modern visual header
    iconName?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CategoryMetadata {
    id: BlogCategory;
    name: string;
    description: string;
    color: string;
    bgColor: string;
    borderColor: string;
}

export const CATEGORY_DEFINITIONS: Record<BlogCategory, {
    names: Record<Locale, string>;
    descriptions: Record<Locale, string>;
    color: string;
    bgColor: string;
    borderColor: string;
}> = {
    technology: {
        names: {
            ar: 'تكنولوجيا',
            en: 'Technology',
            fr: 'Technologie',
        },
        descriptions: {
            ar: 'معمارية النظم السحابية، هندسة البرمجيات، والذكاء الاصطناعي',
            en: 'Cloud architectures, software engineering, and AI systems',
            fr: 'Architectures cloud, ingénierie logicielle et systèmes d’IA',
        },
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50',
        borderColor: 'border-indigo-200',
    },
    news: {
        names: {
            ar: 'أخبار',
            en: 'News',
            fr: 'Actualités',
        },
        descriptions: {
            ar: 'آخر مستجدات المشاريع التقنية والمنتجات والشراكات الإقليمية',
            en: 'Latest project updates, products, and regional tech partnerships',
            fr: 'Dernières actualités projets, produits et partenariats régionaux',
        },
        color: 'text-rose-600',
        bgColor: 'bg-rose-50',
        borderColor: 'border-rose-200',
    },
    studies: {
        names: {
            ar: 'دراسات',
            en: 'Studies',
            fr: 'Études',
        },
        descriptions: {
            ar: 'أبحاث معمقة في التحول الرقمي، كفاءة سلاسل الإمداد، واقتصاد البيانات',
            en: 'In-depth research on digital transformation, supply chains, and data economics',
            fr: 'Études approfondies sur la transformation numérique et la logistique',
        },
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
    },
    discoveries: {
        names: {
            ar: 'اكتشافات',
            en: 'Discoveries',
            fr: 'Découvertes',
        },
        descriptions: {
            ar: 'ابتكارات حديثة، معالجة اللغات، وحلول استخراج المعرفة الرقمية',
            en: 'Emerging innovations, language processing, and digital intelligence',
            fr: 'Innovations émergentes, traitement du langage et intelligence numérique',
        },
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
    },
    knowledge: {
        names: {
            ar: 'معارف',
            en: 'Knowledge',
            fr: 'Savoirs',
        },
        descriptions: {
            ar: 'أدلة إرشادية، أفضل الممارسات البرمجية، ومعايير الأمن السيبراني',
            en: 'Architectural guides, software best practices, and cybersecurity standards',
            fr: 'Guides architecturaux, bonnes pratiques logicielles et normes de sécurité',
        },
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
    },
};

export const BLOG_POSTS: BlogPost[] = [
    {
        slug: 'cloud-native-architecture-africa',
        category: 'technology',
        featured: true,
        title: {
            ar: 'هندسة النظم السحابية الموزعة: بناء بنية تحتية برمجية تصمد وتتوسع في إفريقيا',
            en: 'Distributed Cloud Architecture: Engineering Scalable Infrastructure in Africa',
            fr: 'Architecture Cloud Distribuée : Construire une infrastructure résiliente en Afrique',
        },
        excerpt: {
            ar: 'تحليل عملي للأساليب المعمارية لتصميم نظم برمجية عالية التوافر ومقاومة لانقطاعات الشبكة، مع تقليل تكاليف الاستضافة وزيادة سرعة الاستجابة للمستخدم المحلي.',
            en: 'A pragmatic architectural deep dive into designing highly-available systems resilient to intermittent connectivity while optimizing hosting costs.',
            fr: 'Une analyse architecturale pragmatique pour concevoir des systèmes hautement disponibles et résilients aux coupures de connectivité.',
        },
        author: {
            name: 'فريق الهندسة في AFRIKYIA',
            role: 'Software Architecture Team',
        },
        publishedAt: '2026-11-02',
        readTime: {
            ar: '6 دقائق قراءة',
            en: '6 min read',
            fr: '6 min de lecture',
        },
        tags: ['Cloud', 'Architecture', 'Next.js', 'Distributed Systems', 'DevOps'],
        coverGradient: 'from-indigo-600 via-blue-600 to-indigo-900',
        iconName: 'Server',
        content: {
            ar: [
                {
                    heading: 'تحدي البنية السحابية في البيئات النامية',
                    body: [
                        'تواجه التطبيقات البرمجية في منطقتنا تحديات بنيوية فريدة لا تواجهها المنصات التقليدية في أوروبا وأمريكا الشمالية: تذبذب زمن الاستجابة (Latency)، قيود الاتصال بالإنترنت الدولي، وارتفاع تكلفة استهلاك البيانات بالنسبة للمستخدم النهائي.',
                        'لذلك، لا تكفي الاستعانة بالحلول الجاهزة أو نقل التطبيقات كما هي إلى السحابة (Lift and Shift)، بل يتطلب الأمر تصميماً معمارياً يعتمد على مبدأ التوزيع الذكي والمخازن المؤقتة الموزعة على الحافة (Edge Caching).',
                    ],
                    highlight: 'المرونة المعمارية تبدأ من افتراض انقطاع الاتصال وليس من افتراض دوامه.',
                },
                {
                    heading: 'ركائز المنظومة السحابية المعتمدة في AFRIKYIA',
                    body: [
                        '1. العزل المعياري (Modular Isolation): فصل طبقات البيانات عن طبقات العرض لضمان استمرارية الخدمات الأساسية حتى في حالات الصيانة.',
                        '2. التخزين المؤقت متعدد المستويات: توظيف حلول التخزين المحلي (Local Storage & IndexedDB) في تطبيقات الويب التقدمية (PWA) لمزامنة البيانات عند عودة الاتصال.',
                        '3. البث المحسوب للبيانات: ضغط الحمولات البرمجية واستخدام بروتوكولات ثنائية خفيفة لتقليل استهلاك النطاق الترددي بنسبة تصل إلى 60%.',
                    ],
                },
                {
                    heading: 'خلاصة وتوصيات للمطورين',
                    body: [
                        'الريادة الرقمية لا تُقاس بعدد التقنيات المستخدمة، بل بمدى مواءمة النظام لواقع مستخدميه وقدرته على حل المشكلات الحقيقية بأقل تعقيد ممكن.',
                    ],
                },
            ],
            en: [
                {
                    heading: 'Cloud Infrastructure Challenges in Developing Markets',
                    body: [
                        'Software applications in Africa face unique constraints: network jitter, intermittent international bandwidth, and costly data usage for end users.',
                        'Simple lift-and-shift deployments to public clouds often fail economically and operationally. A resilient edge-first architecture is mandatory.',
                    ],
                },
            ],
            fr: [
                {
                    heading: 'Les défis des infrastructures cloud en Afrique',
                    body: [
                        'Les applications logicielles dans notre région font face à des défis d’infrastructure spécifiques : latence variable et contraintes de connectivité.',
                        'Une approche architecturale axée sur la résilience et le cache distribué en périphérie (Edge) s’avère indispensable.',
                    ],
                },
            ],
        },
    },
    {
        slug: 'fintech-revolution-nexconnect-mauritania',
        category: 'news',
        featured: false,
        title: {
            ar: 'تسريع الشمول المالي: كيف تربط منصة NexConnect بوابات الدفع والتجارة الرقمية',
            en: 'Accelerating Financial Inclusion: How NexConnect Unifies Digital Payments',
            fr: 'Accélérer l’inclusion financière : Comment NexConnect unifie les paiements numériques',
        },
        excerpt: {
            ar: 'تغطية إخبارية لإطلاق وتطوير منظومة الربط المالي الموحدة التي تتيح للشركات والمنصات قبول المحافظ الرقمية المحلية (Bankily، Masrvi، Sedad، Click) عبر واجهة برمجية واحدة.',
            en: 'News on the deployment of NexConnect: a unified financial integration gateway enabling enterprises to accept local mobile wallets through a single API.',
            fr: 'Point d’actualité sur le déploiement de NexConnect : une passerelle unifiée permettant d’accepter les portefeuilles mobiles locaux via une seule API.',
        },
        author: {
            name: 'قسم الابتكار والحلول المالية',
            role: 'FinTech Division',
        },
        publishedAt: '2026-11-01',
        readTime: {
            ar: '4 دقائق قراءة',
            en: '4 min read',
            fr: '4 min de lecture',
        },
        tags: ['FinTech', 'NexConnect', 'Payments', 'E-commerce', 'Mauritania'],
        coverGradient: 'from-rose-600 via-red-600 to-rose-950',
        iconName: 'CreditCard',
        content: {
            ar: [
                {
                    heading: 'توحيد المحافظ الرقمية في شريان برمجي واحد',
                    body: [
                        'أصبحت المحافظ الإلكترونية في موريتانيا والمنطقة هي الوسيلة الأساسية للمعاملات التجارية اليومية، إلا أن تعدد البوابات وغياب المعايير الموحدة كان يشكل عائقاً أمام أصحاب المنصات والمشاريع الرقمية.',
                        'جاءت منصة NexConnect لتقدم حلاً جذرياً: واجهة برمجية واحدة (Unified Webhook & Payment API) تؤمن تسوية فورية وتوليد تلقائي لتراخيص البرمجيات وإشعارات المعاملات مع حماية ضد هجمات الإعادة.',
                    ],
                },
                {
                    heading: 'نتائج أولية وتوسع مستمر',
                    body: [
                        'خلال الأسابيع الأولى من الإطلاق المؤسسي، مكّنت المنصة عملاء متجر AFRIKYIA الرقمي من إتمام عمليات الشراء الفوري بنسبة نجاح تجاوزت 99.4% دون الحاجة إلى تدخل يدوي.',
                    ],
                },
            ],
            en: [
                {
                    heading: 'Unifying Mobile Wallets Under a Single API',
                    body: [
                        'Mobile wallets are the heartbeat of everyday commerce in Mauritania and West Africa. NexConnect provides seamless multi-provider checkout.',
                    ],
                },
            ],
            fr: [
                {
                    heading: 'Unification des portefeuilles numériques',
                    body: [
                        'Les portefeuilles mobiles représentent l’épine dorsale des transactions quotidiennes. NexConnect permet une intégration rapide et sécurisée.',
                    ],
                },
            ],
        },
    },
    {
        slug: 'port-logistics-digital-transformation',
        category: 'studies',
        featured: false,
        title: {
            ar: 'دراسة تحليلية: أثر رقمنة موانئ الصيد وسلاسل الإمداد على تقليص الهدر وزمن التفريغ',
            en: 'Analytical Study: Impact of Port Digitization on Turnaround Times and Waste Reduction',
            fr: 'Étude Analytique : Impact de la digitalisation portuaire sur les délais et la chaîne logistique',
        },
        excerpt: {
            ar: 'دراسة ميدانية مستخلصة من تجربة تطوير نظام AcceSpan لميناء نواذيبو المستقل وبوابة PAN، توضح كيف تسهم الأنظمة الرقمية في مضاعفة كفاءة الرسو ومراقبة الحركة البحرية.',
            en: 'A field study based on our engineering of the AcceSpan port system for Nouadhibou Autonomous Port, demonstrating significant throughput improvements.',
            fr: 'Une étude de terrain basée sur le développement du système AcceSpan pour le Port Autonome de Nouadhibou et l’optimisation des flux maritimes.',
        },
        author: {
            name: 'وحدة الدراسات والأنظمة المؤسسية',
            role: 'Enterprise Research Unit',
        },
        publishedAt: '2026-10-28',
        readTime: {
            ar: '8 دقائق قراءة',
            en: '8 min read',
            fr: '8 min de lecture',
        },
        tags: ['Logistics', 'Maritime', 'AcceSpan', 'Supply Chain', 'Case Study'],
        coverGradient: 'from-blue-700 via-sky-600 to-slate-900',
        iconName: 'Anchor',
        content: {
            ar: [
                {
                    heading: 'خلفية الدراسة ومنهجية القياس',
                    body: [
                        'يمثل ميناء نواذيبو رئة الاقتصاد السمكي في موريتانيا، حيث يعبر منه آلاف السفن وقوارب الصيد التقليدي والصناعي سنوياً. كان التحدي الأكبر يكمن في تسجيل أذونات الدخول، احتساب الرسوم، وتتبع حمولات السفن بدقة وموثوقية.',
                        'من خلال دراسة مقارنة بين فترات العمل الورقي التقليدي وفترة تطبيق نظام AcceSpan ونظم المعلومات الجغرافية (SIG)، تم رصد تحولات جوهرية في مؤشرات الأداء اللوجستي.',
                    ],
                },
                {
                    heading: 'المؤشرات الرقمية المحققة',
                    body: [
                        '1. تقليص زمن إصدار تصاريح الرسو من 4 ساعات إلى أقل من 3 دقائق.',
                        '2. القضاء التام على الازدواجية في السجلات بفضل قاعدة البيانات المركزية الموحدة.',
                        '3. إتاحة لوحات مؤشرات حية (Real-time Dashboards) لفرق الإدارة والمراقبة البحرية.',
                    ],
                },
            ],
            en: [
                {
                    heading: 'Background and Methodology',
                    body: [
                        'Nouadhibou Port handles a critical share of Mauritania’s maritime exports. AcceSpan eliminated manual turnaround delays.',
                    ],
                },
            ],
            fr: [
                {
                    heading: 'Contexte et méthodologie',
                    body: [
                        'Le port de Nouadhibou est un levier économique majeur. La solution AcceSpan a transformé la gestion des flux maritimes.',
                    ],
                },
            ],
        },
    },
    {
        slug: 'arabic-ai-document-intelligence-ocr',
        category: 'discoveries',
        featured: false,
        title: {
            ar: 'اكتشافات في الذكاء الاصطناعي: رفع دقة استخراج النصوص العربية من المستندات الإدارية المعقدة',
            en: 'AI Discoveries: Enhancing Arabic OCR Accuracy in Complex Administrative Documents',
            fr: 'Découvertes en IA : Améliorer la précision de l’OCR arabe sur documents administratifs complexes',
        },
        excerpt: {
            ar: 'استعراض لنتائج أبحاث فريقنا في تطوير نماذج هجينة لمعالجة الصور والمستندات الورقية الممسوحة ضوئياً، وفك تشابك الخطوط العربية والحفاظ على الجداول والأختام الرسمية.',
            en: 'An overview of our research on hybrid deep learning models for Arabic Optical Character Recognition (OCR), handling complex typography and stamped archives.',
            fr: 'Aperçu de nos recherches sur les modèles hybrides d’OCR arabe pour le traitement intelligent des archives et formulaires administratifs.',
        },
        author: {
            name: 'مختبر أبحاث الذكاء الاصطناعي',
            role: 'AI & Vision Research Lab',
        },
        publishedAt: '2026-10-24',
        readTime: {
            ar: '5 دقائق قراءة',
            en: '5 min read',
            fr: '5 min de lecture',
        },
        tags: ['AI', 'Arabic OCR', 'Machine Learning', 'Computer Vision', 'Innovation'],
        coverGradient: 'from-emerald-600 via-teal-600 to-slate-900',
        iconName: 'Sparkles',
        content: {
            ar: [
                {
                    heading: 'معضلة النص العربي في خوارزميات الرؤية الحاسوبية',
                    body: [
                        'تتميز الأبجدية العربية باتصال الحروف وتغير شكل الحرف بحسب موقعه (بداية، وسط، نهاية، منفصل)، فضلاً عن التشكيل والخطوط اليدوية وتداخل الأختام والتوقيعات في المعاملات الإدارية الحكومية.',
                        'أغلب نماذج OCR العالمية تم تدريبها بشكل أساسي على الحروف اللاتينية المنفصلة، مما يجعل دقتها في العربية ضعيفة جداً عند التعاطي مع المستندات الأرشيفية المطبوعة قديماً.',
                    ],
                },
                {
                    heading: 'النموذج الهجين وتصحيح السياق لغوياً',
                    body: [
                        'طور فريقنا منهجية هجينة تجمع بين شبكات التلافيف البصرية (Vision Transformers) ونماذج لغوية عربية محلية تدرك سياق الكلمات وتصحح الأخطاء المطبعية تلقائياً، محققة دقة استخراج تجاوزت 96.8% على عينات حقيقية.',
                    ],
                },
            ],
            en: [
                {
                    heading: 'The Challenge of Arabic Typography in Computer Vision',
                    body: [
                        'Arabic cursive script and contextual shapes require dedicated hybrid architectures integrating vision transformers and language models.',
                    ],
                },
            ],
            fr: [
                {
                    heading: 'Les défis de la typographie arabe en vision par ordinateur',
                    body: [
                        'L’écriture cursive arabe et la variabilité des formes contextuelles exigent des modèles d’apprentissage profond spécifiquement entraînés.',
                    ],
                },
            ],
        },
    },
    {
        slug: 'cybersecurity-resilience-guide-startups',
        category: 'knowledge',
        featured: false,
        title: {
            ar: 'دليل المعارف الأمنية: كيف تبني دفاعاً سيبرانياً متقدماً لحماية منصتك وتطبيقاتك؟',
            en: 'Cybersecurity Knowledge Guide: Building Advanced Defense for Modern Web Apps',
            fr: 'Guide des Savoirs en Cybersécurité : Bâtir une défense avancée pour vos applications',
        },
        excerpt: {
            ar: 'دليل عملي موجه للمهندسين ومديري التقنية يشرح آليات تنفيذ سياسات الأمان الصارمة (CSP, Timing-safe Auth, Replay Prevention, Encryption) دون التأثير على سرعة التجربة.',
            en: 'A pragmatic knowledge guide for software engineers detailing the implementation of strict CSP, timing-safe authentication, and replay attack prevention.',
            fr: 'Un guide pratique pour les développeurs détaillant la mise en place de politiques de sécurité strictes et la protection contre les attaques par rejeu.',
        },
        author: {
            name: 'فريق هندسة الأمان والامتثال',
            role: 'Security Engineering Team',
        },
        publishedAt: '2026-10-20',
        readTime: {
            ar: '7 دقائق قراءة',
            en: '7 min read',
            fr: '7 min de lecture',
        },
        tags: ['Security', 'CSP', 'Encryption', 'DevSecOps', 'Best Practices'],
        coverGradient: 'from-amber-600 via-orange-600 to-zinc-950',
        iconName: 'Shield',
        content: {
            ar: [
                {
                    heading: 'الأمان كبنية تحتية وليست طبقة ملحقة',
                    body: [
                        'أكبر خطأ ترتكبه الفرق الهندسية هو تأجيل مراجعات الأمان إلى ما بعد اكتمال المشروع. الأمان الحقيقي هو قرار معماري يبدأ منذ كتابة السطر الأول في مسارات التوجيه ونقاط النهاية (API Endpoints).',
                    ],
                },
                {
                    heading: 'أهم القواعد الذهبية لحماية منصات الدفع والبيانات',
                    body: [
                        '1. المقارنة الزمنية الآمنة: استخدام crypto.timingSafeEqual دائماً عند مقارنة التوقيعات السرية والمفاتيح لمنع هجمات التوقيت الجانبية.',
                        '2. حماية الـ Webhooks من إعادة الإرسال: التحقق من التوقيت الزمني (Timestamp Validation) ورفض أي طلب يزيد فارق توقيته عن 5 دقائق.',
                        '3. سياسة أمن المحتوى الصارمة (Strict CSP): حظر تنفيذ السكربتات المضمنة غير المصرح بها ومنع هجمات حقن التعليمات البرمجية XSS.',
                    ],
                },
            ],
            en: [
                {
                    heading: 'Security as Architecture, Not an Afterthought',
                    body: [
                        'True security starts at the architectural foundation: strict headers, timing-safe cryptographic comparisons, and strict input sanitization.',
                    ],
                },
            ],
            fr: [
                {
                    heading: 'La sécurité comme fondement architectural',
                    body: [
                        'La sécurité logicielle doit être intégrée dès la conception : headers rigoureux, comparaisons cryptographiques sécurisées et assainissement des entrées.',
                    ],
                },
            ],
        },
    },
];

export function getAllArticles(): BlogPost[] {
    return [...BLOG_POSTS].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export function getArticleBySlug(slug: string): BlogPost | undefined {
    return BLOG_POSTS.find(article => article.slug === slug);
}

export function getArticlesByCategory(category: BlogCategory): BlogPost[] {
    return getAllArticles().filter(article => article.category === category);
}

export function searchArticles(query: string, locale: Locale = 'ar'): BlogPost[] {
    const q = (query || '').trim().toLowerCase();
    if (!q) return getAllArticles();

    return getAllArticles().filter(article => {
        const title = (article.title[locale] || article.title.ar || '').toLowerCase();
        const excerpt = (article.excerpt[locale] || article.excerpt.ar || '').toLowerCase();
        const tagMatch = article.tags.some(t => t.toLowerCase().includes(q));
        const authorMatch = article.author.name.toLowerCase().includes(q);

        const categoryDef = CATEGORY_DEFINITIONS[article.category];
        const categoryMatch = Boolean(
            categoryDef && (
                categoryDef.names.ar.toLowerCase().includes(q) ||
                categoryDef.names.en.toLowerCase().includes(q) ||
                categoryDef.names.fr.toLowerCase().includes(q) ||
                article.category.toLowerCase().includes(q)
            )
        );

        return title.includes(q) || excerpt.includes(q) || tagMatch || authorMatch || categoryMatch;
    });
}

export function getRelatedArticles(slug: string, limit = 3): BlogPost[] {
    const current = getArticleBySlug(slug);
    if (!current) return getAllArticles().slice(0, limit);

    const sameCategory = getAllArticles().filter(
        a => a.slug !== slug && a.category === current.category
    );

    if (sameCategory.length >= limit) {
        return sameCategory.slice(0, limit);
    }

    const others = getAllArticles().filter(
        a => a.slug !== slug && a.category !== current.category
    );

    return [...sameCategory, ...others].slice(0, limit);
}

export function getFeaturedArticles(): BlogPost[] {
    const featured = getAllArticles().filter(a => a.featured);
    return featured.length > 0 ? featured : getAllArticles().slice(0, 1);
}

export function getCategoryMetadata(category: BlogCategory, locale: Locale = 'ar'): CategoryMetadata {
    const def = CATEGORY_DEFINITIONS[category] || CATEGORY_DEFINITIONS.technology;
    return {
        id: category,
        name: def.names[locale] || def.names.ar,
        description: def.descriptions[locale] || def.descriptions.ar,
        color: def.color,
        bgColor: def.bgColor,
        borderColor: def.borderColor,
    };
}

export function validateBlogPost(post: Partial<BlogPost>): {
    valid: boolean;
    errors: Record<string, string>;
} {
    const errors: Record<string, string> = {};

    if (!post.slug || typeof post.slug !== 'string' || !/^[a-z0-9-]+$/.test(post.slug.trim())) {
        errors.slug = 'Valid slug is required (lowercase letters, numbers, and hyphens only)';
    }

    if (!post.category || !BLOG_CATEGORIES.includes(post.category as BlogCategory)) {
        errors.category = 'Valid category is required';
    }

    if (!post.title || typeof post.title !== 'object' || (!post.title.ar && !post.title.en && !post.title.fr)) {
        errors.title = 'Title is required in at least one language';
    }

    if (!post.excerpt || typeof post.excerpt !== 'object' || (!post.excerpt.ar && !post.excerpt.en && !post.excerpt.fr)) {
        errors.excerpt = 'Excerpt is required in at least one language';
    }

    return {
        valid: Object.keys(errors).length === 0,
        errors,
    };
}

