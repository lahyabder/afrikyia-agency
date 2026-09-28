// Editable website sections, stored in the `site_content` table.
// Public components read them; the admin pages save or reset them.

export const SITE_CONTENT_KEYS = ['about', 'vision', 'services', 'contact', 'trusted'] as const;
export type SiteContentKey = (typeof SITE_CONTENT_KEYS)[number];

export function isSiteContentKey(key: string): key is SiteContentKey {
    return (SITE_CONTENT_KEYS as readonly string[]).includes(key);
}

// Returns the saved content, or null when the section still uses its default texts.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchSiteContent(key: SiteContentKey): Promise<any | null> {
    try {
        const res = await fetch(`/api/content/${key}`, { cache: 'no-store' });
        if (!res.ok) return null;
        const json = await res.json();
        return json.data ?? null;
    } catch {
        return null;
    }
}

// Content edited before sections were stored on the server lived only in this browser.
// Admin pages fall back to it once, so those edits are not lost; saving moves them to the server.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function readLegacyLocalContent(key: SiteContentKey): any | null {
    try {
        const cached = localStorage.getItem(`afrikyia-${key}`);
        return cached ? JSON.parse(cached) : null;
    } catch {
        return null;
    }
}

export async function saveSiteContent(key: SiteContentKey, data: unknown): Promise<boolean> {
    try {
        const res = await fetch(`/api/content/${key}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (res.ok) localStorage.removeItem(`afrikyia-${key}`);
        return res.ok;
    } catch {
        return false;
    }
}

export async function resetSiteContent(key: SiteContentKey): Promise<boolean> {
    try {
        const res = await fetch(`/api/content/${key}`, { method: 'DELETE' });
        if (res.ok) localStorage.removeItem(`afrikyia-${key}`);
        return res.ok;
    } catch {
        return false;
    }
}
