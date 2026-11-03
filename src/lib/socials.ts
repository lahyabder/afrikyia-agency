// Company Social Accounts: Models, Platforms, and Validation

export const SUPPORTED_PLATFORMS = [
    'facebook',
    'tiktok',
    'linkedin',
    'x',
    'instagram',
    'youtube',
    'whatsapp',
    'github',
    'threads',
    'other',
] as const;

export type SocialPlatform = (typeof SUPPORTED_PLATFORMS)[number];

export type SocialAccount = {
    id: string;
    platform: SocialPlatform;
    url: string;
    handle?: string;
    label?: string;
    isActive: boolean;
    order: number;
    createdAt?: string;
    updatedAt?: string;
};

export type PlatformMeta = {
    name: string;
    color: string;
    bgColor: string;
    borderColor: string;
    placeholder: string;
    prefix: string;
};

export const PLATFORM_METADATA: Record<SocialPlatform, PlatformMeta> = {
    facebook: {
        name: 'Facebook',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        placeholder: 'https://facebook.com/afrikyia',
        prefix: 'https://facebook.com/',
    },
    tiktok: {
        name: 'TikTok',
        color: 'text-slate-900',
        bgColor: 'bg-slate-100',
        borderColor: 'border-slate-300',
        placeholder: 'https://tiktok.com/@afrikyai',
        prefix: 'https://tiktok.com/@',
    },
    linkedin: {
        name: 'LinkedIn',
        color: 'text-sky-700',
        bgColor: 'bg-sky-50',
        borderColor: 'border-sky-200',
        placeholder: 'https://linkedin.com/company/afrikyia',
        prefix: 'https://linkedin.com/company/',
    },
    x: {
        name: 'X (Twitter)',
        color: 'text-zinc-900',
        bgColor: 'bg-zinc-100',
        borderColor: 'border-zinc-300',
        placeholder: 'https://x.com/afrikyia',
        prefix: 'https://x.com/',
    },
    instagram: {
        name: 'Instagram',
        color: 'text-pink-600',
        bgColor: 'bg-pink-50',
        borderColor: 'border-pink-200',
        placeholder: 'https://instagram.com/afrikyia',
        prefix: 'https://instagram.com/',
    },
    youtube: {
        name: 'YouTube',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        placeholder: 'https://youtube.com/@afrikyia',
        prefix: 'https://youtube.com/@',
    },
    whatsapp: {
        name: 'WhatsApp',
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
        placeholder: 'https://whatsapp.com/channel/...',
        prefix: 'https://whatsapp.com/',
    },
    github: {
        name: 'GitHub',
        color: 'text-slate-800',
        bgColor: 'bg-slate-100',
        borderColor: 'border-slate-300',
        placeholder: 'https://github.com/afrikyia',
        prefix: 'https://github.com/',
    },
    threads: {
        name: 'Threads',
        color: 'text-zinc-800',
        bgColor: 'bg-zinc-100',
        borderColor: 'border-zinc-300',
        placeholder: 'https://threads.net/@afrikyia',
        prefix: 'https://threads.net/@',
    },
    other: {
        name: 'Other',
        color: 'text-slate-600',
        bgColor: 'bg-slate-50',
        borderColor: 'border-slate-200',
        placeholder: 'https://...',
        prefix: 'https://',
    },
};

export const DEFAULT_SOCIAL_ACCOUNTS: SocialAccount[] = [
    {
        id: 'soc-facebook-default',
        platform: 'facebook',
        url: 'https://www.facebook.com/profile.php?id=61594179056891',
        handle: 'AFRIKYIA',
        label: 'Facebook',
        isActive: true,
        order: 1,
    },
    {
        id: 'soc-tiktok-default',
        platform: 'tiktok',
        url: 'https://www.tiktok.com/@afrikyai',
        handle: '@afrikyai',
        label: 'TikTok',
        isActive: true,
        order: 2,
    },
    {
        id: 'soc-whatsapp-default',
        platform: 'whatsapp',
        url: 'https://whatsapp.com/channel/0029VbDnuKB5Ui2eXs8BZn1O',
        handle: 'AFRIKYIA Channel',
        label: 'WhatsApp',
        isActive: true,
        order: 3,
    },
];

export function isSupportedPlatform(val: unknown): val is SocialPlatform {
    return typeof val === 'string' && (SUPPORTED_PLATFORMS as readonly string[]).includes(val);
}

export function cleanAndFormatSocialUrl(rawUrl: string, platform?: SocialPlatform): string {
    let trimmed = (rawUrl || '').trim();
    if (!trimmed) return '';

    if (trimmed.startsWith('@') && platform) {
        const username = trimmed.replace(/^@+/, '');
        switch (platform) {
            case 'tiktok': return `https://www.tiktok.com/@${username}`;
            case 'instagram': return `https://www.instagram.com/${username}`;
            case 'x': return `https://x.com/${username}`;
            case 'threads': return `https://www.threads.net/@${username}`;
            case 'github': return `https://github.com/${username}`;
            case 'youtube': return `https://www.youtube.com/@${username}`;
            default: break;
        }
    }

    if (!/^https?:\/\//i.test(trimmed)) {
        trimmed = `https://${trimmed}`;
    }
    return trimmed;
}

export function isValidUrl(url: string): boolean {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim();
    if (trimmed.startsWith('javascript:') || trimmed.startsWith('data:') || trimmed.startsWith('vbscript:')) {
        return false;
    }
    const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    try {
        const parsed = new URL(candidate);
        if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return false;
        return parsed.hostname.includes('.') || parsed.hostname === 'localhost';
    } catch {
        return false;
    }
}

export function validateSocialAccount(account: Partial<SocialAccount>): {
    valid: boolean;
    errors: Record<string, string>;
} {
    const errors: Record<string, string> = {};

    if (!account.platform || !isSupportedPlatform(account.platform)) {
        errors.platform = 'Invalid or missing social platform';
    }

    const formattedUrl = cleanAndFormatSocialUrl(account.url || '', account.platform);
    if (!formattedUrl || !isValidUrl(formattedUrl)) {
        errors.url = 'Valid HTTP/HTTPS URL is required';
    }

    return {
        valid: Object.keys(errors).length === 0,
        errors,
    };
}

export function normalizeSocialAccount(raw: unknown): SocialAccount | null {
    if (!raw || typeof raw !== 'object') return null;
    const r = raw as Record<string, unknown>;

    if (!isSupportedPlatform(r.platform)) return null;
    const platform = r.platform;

    const rawUrl = typeof r.url === 'string' ? r.url.trim() : '';
    const url = cleanAndFormatSocialUrl(rawUrl, platform);
    if (!isValidUrl(url)) return null;

    const id = typeof r.id === 'string' && r.id.trim().length > 0
        ? r.id.trim()
        : `soc-${platform}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const handle = typeof r.handle === 'string' ? r.handle.trim().slice(0, 100) : undefined;
    const label = typeof r.label === 'string' && r.label.trim().length > 0
        ? r.label.trim().slice(0, 100)
        : PLATFORM_METADATA[platform]?.name ?? platform;

    const isActive = typeof r.isActive === 'boolean' ? r.isActive : true;
    const order = typeof r.order === 'number' && !Number.isNaN(r.order) ? r.order : 99;

    return {
        id,
        platform,
        url,
        handle,
        label,
        isActive,
        order,
        createdAt: typeof r.createdAt === 'string' ? r.createdAt : undefined,
        updatedAt: typeof r.updatedAt === 'string' ? r.updatedAt : undefined,
    };
}

export function normalizeSocialAccountsList(raw: unknown): SocialAccount[] {
    if (!Array.isArray(raw) || raw.length === 0) {
        return DEFAULT_SOCIAL_ACCOUNTS;
    }

    const cleaned: SocialAccount[] = [];
    for (const item of raw) {
        const normalized = normalizeSocialAccount(item);
        if (normalized) cleaned.push(normalized);
    }

    if (cleaned.length === 0) {
        return DEFAULT_SOCIAL_ACCOUNTS;
    }

    return cleaned.sort((a, b) => a.order - b.order);
}

