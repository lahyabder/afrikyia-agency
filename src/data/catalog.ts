export type ProductType = 
    | 'app_subscription' 
    | 'app_license' 
    | 'free_platform' 
    | 'digital_book' 
    | 'media_film' 
    | 'media_music' 
    | 'service';

export type ProductCategory = 
    | 'apps' 
    | 'books' 
    | 'films' 
    | 'music' 
    | 'services';

export type FulfillmentType = 
    | 'license_code' 
    | 'account_activation' 
    | 'download_link' 
    | 'stream_access' 
    | 'service_ticket' 
    | 'direct_open';

export type PricePeriod = 
    | 'monthly' 
    | 'yearly' 
    | 'lifetime' 
    | 'one_time' 
    | 'free';

export interface ProductVariant {
    key: string;
    nameAr: string;
    nameEn: string;
    nameFr: string;
    amount: number;
    currency: string;
    period: PricePeriod;
    maxDevices: number;
    savingBadgeAr?: string;
    savingBadgeFr?: string;
    labelAr: string;
}

export interface ProductItem {
    id: string;
    type: ProductType;
    category: ProductCategory;
    nameAr: string;
    nameEn: string;
    nameFr: string;
    taglineAr?: string;
    taglineFr?: string;
    descriptionAr?: string;
    descriptionFr?: string;
    basePrice: number;
    currency: string;
    fulfillmentType: FulfillmentType;
    url: string;
    logo?: string;
    accentColor?: string;
    variants?: ProductVariant[];
}

export const DIGITAL_CATALOG: ProductItem[] = [
    {
        id: 'diftar',
        type: 'app_subscription',
        category: 'apps',
        nameAr: 'دفتر',
        nameEn: 'DIFTAR',
        nameFr: 'Diftar',
        taglineAr: 'المنصة الدفترية الرقمية لإدارة العمليات اليومية وضبط سيولة الصناديق',
        taglineFr: 'Solution de comptabilité journalière et gestion de trésorerie',
        basePrice: 1000,
        currency: 'MRU',
        fulfillmentType: 'license_code',
        url: 'https://diftar.online/',
        logo: '/apps/diftar-logo.png',
        accentColor: '#00A69D',
        variants: [
            // 1 Device
            {
                key: 'monthly_1dev',
                nameAr: 'جهاز واحد — شهري',
                nameEn: '1 Device — Monthly',
                nameFr: '1 Appareil — Mensuel',
                amount: 1000,
                currency: 'MRU',
                period: 'monthly',
                maxDevices: 1,
                labelAr: 'جهاز واحد — شهري',
            },
            {
                key: 'yearly_1dev',
                nameAr: 'جهاز واحد — سنوي',
                nameEn: '1 Device — Yearly',
                nameFr: '1 Appareil — Annuel',
                amount: 11000,
                currency: 'MRU',
                period: 'yearly',
                maxDevices: 1,
                savingBadgeAr: 'وفّر 1,000 MRU',
                savingBadgeFr: 'Économisez 1,000 MRU',
                labelAr: 'جهاز واحد — سنوي (توفير 1,000 MRU)',
            },
            // 2 Devices
            {
                key: 'monthly_2dev',
                nameAr: 'جهازين — شهري',
                nameEn: '2 Devices — Monthly',
                nameFr: '2 Appareils — Mensuel',
                amount: 1500,
                currency: 'MRU',
                period: 'monthly',
                maxDevices: 2,
                labelAr: 'جهازين — شهري',
            },
            {
                key: 'yearly_2dev',
                nameAr: 'جهازين — سنوي',
                nameEn: '2 Devices — Yearly',
                nameFr: '2 Appareils — Annuel',
                amount: 16500,
                currency: 'MRU',
                period: 'yearly',
                maxDevices: 2,
                savingBadgeAr: 'وفّر 1,500 MRU',
                savingBadgeFr: 'Économisez 1,500 MRU',
                labelAr: 'جهازين — سنوي (توفير 1,500 MRU)',
            },
            // 3 Devices
            {
                key: 'monthly_3dev',
                nameAr: '3 أجهزة — شهري',
                nameEn: '3 Devices — Monthly',
                nameFr: '3 Appareils — Mensuel',
                amount: 2000,
                currency: 'MRU',
                period: 'monthly',
                maxDevices: 3,
                labelAr: '3 أجهزة — شهري',
            },
            {
                key: 'yearly_3dev',
                nameAr: '3 أجهزة — سنوي',
                nameEn: '3 Devices — Yearly',
                nameFr: '3 Appareils — Annuel',
                amount: 22000,
                currency: 'MRU',
                period: 'yearly',
                maxDevices: 3,
                savingBadgeAr: 'وفّر 2,000 MRU',
                savingBadgeFr: 'Économisez 2,000 MRU',
                labelAr: '3 أجهزة — سنوي (توفير 2,000 MRU)',
            },
            // 4 Devices
            {
                key: 'monthly_4dev',
                nameAr: '4 أجهزة — شهري',
                nameEn: '4 Devices — Monthly',
                nameFr: '4 Appareils — Mensuel',
                amount: 2500,
                currency: 'MRU',
                period: 'monthly',
                maxDevices: 4,
                labelAr: '4 أجهزة — شهري',
            },
            {
                key: 'yearly_4dev',
                nameAr: '4 أجهزة — سنوي',
                nameEn: '4 Devices — Yearly',
                nameFr: '4 Appareils — Annuel',
                amount: 27500,
                currency: 'MRU',
                period: 'yearly',
                maxDevices: 4,
                savingBadgeAr: 'وفّر 2,500 MRU',
                savingBadgeFr: 'Économisez 2,500 MRU',
                labelAr: '4 أجهزة — سنوي (توفير 2,500 MRU)',
            },
        ],
    },
    {
        id: 'sanad',
        type: 'app_license',
        category: 'apps',
        nameAr: 'سند',
        nameEn: 'SANAD',
        nameFr: 'Sanad',
        taglineAr: 'أداة تنظيم كشوفات تحويل المحافظ البنكية واستخراج ملفات Excel وPDF',
        taglineFr: 'Outil intelligent pour relevés bancaires Excel et PDF',
        basePrice: 1000,
        currency: 'MRU',
        fulfillmentType: 'license_code',
        url: 'https://sanadrim.com/',
        logo: '/apps/sanad-mark.png',
        accentColor: '#0E7A63',
    },
    {
        id: 'elbet',
        type: 'free_platform',
        category: 'apps',
        nameAr: 'البت',
        nameEn: 'ELBET',
        nameFr: 'Elbet',
        taglineAr: 'لغن وشعر حساني وفصيح مخصص لمناسباتكم من نخبة الشعراء',
        taglineFr: 'Poésie et culture sur mesure pour vos événements',
        basePrice: 0,
        currency: 'MRU',
        fulfillmentType: 'direct_open',
        url: 'https://www.elbet.art/',
        logo: '/apps/elbet-logo.png',
        accentColor: '#B45309',
    },
    {
        id: 'badila',
        type: 'free_platform',
        category: 'apps',
        nameAr: 'بديلة',
        nameEn: 'BADILA',
        nameFr: 'Badila',
        taglineAr: 'منصة التبادل المباشر الأولى في موريتانيا — خُذ وأعطِ',
        taglineFr: 'Première plateforme d’échange direct en Mauritanie',
        basePrice: 0,
        currency: 'MRU',
        fulfillmentType: 'direct_open',
        url: 'https://www.badila.online/',
        logo: '/apps/badila-logo.png',
        accentColor: '#D4903A',
    },
];

export function getProduct(id: string): ProductItem | undefined {
    return DIGITAL_CATALOG.find((p) => p.id === id);
}

export interface PriceCalculationResult {
    amount: number;
    currency: string;
    period: PricePeriod;
    maxDevices: number;
    labelAr: string;
    variantKey?: string;
}

export function calculateProductPrice(
    productId: string,
    variantKey?: string
): PriceCalculationResult {
    const product = getProduct(productId);
    if (!product) {
        throw new Error(`Product not found: ${productId}`);
    }

    if (product.type === 'free_platform') {
        return {
            amount: 0,
            currency: product.currency || 'MRU',
            period: 'free',
            maxDevices: 0,
            labelAr: productId === 'elbet' 
                ? 'تطبيق مجاني — الخدمات مدفوعة داخله' 
                : 'تطبيق مجاني بالكامل',
        };
    }

    if (product.variants && product.variants.length > 0) {
        if (!variantKey) {
            // Default to first variant
            const defaultVariant = product.variants[0];
            return {
                amount: defaultVariant.amount,
                currency: defaultVariant.currency,
                period: defaultVariant.period,
                maxDevices: defaultVariant.maxDevices,
                labelAr: defaultVariant.labelAr,
            };
        }

        const variant = product.variants.find((v) => v.key === variantKey);
        if (!variant) {
            throw new Error(`Variant not found: ${variantKey} for product ${productId}`);
        }

        return {
            amount: variant.amount,
            currency: variant.currency,
            period: variant.period,
            maxDevices: variant.maxDevices,
            labelAr: variant.labelAr,
        };
    }

    // Single price product (e.g. SANAD lifetime)
    return {
        amount: product.basePrice,
        currency: product.currency,
        period: product.type === 'app_license' ? 'lifetime' : 'one_time',
        maxDevices: 1,
        labelAr: product.type === 'app_license' ? 'ترخيص دائم مدى الحياة' : 'شراء لمرة واحدة',
    };
}
