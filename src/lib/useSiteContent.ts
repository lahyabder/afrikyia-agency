"use client";

import { useEffect, useState } from 'react';
import { fetchSiteContent, type SiteContentKey } from '@/lib/siteContent';
import { useLanguage } from '@/context/LanguageContext';

// Text of an editable section in the current language: the saved version when there is one,
// otherwise the default texts. Also returns the raw saved record (e.g. `partners`).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useSiteContent<T extends Record<string, any>>(key: SiteContentKey, defaults: T) {
    const { language } = useLanguage();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [saved, setSaved] = useState<any | null>(null);

    useEffect(() => {
        let alive = true;
        const load = () =>
            fetchSiteContent(key).then(data => {
                if (alive) setSaved(data);
            });
        load();
        const event = `afrikyia-${key}-updated`;
        window.addEventListener(event, load);
        return () => {
            alive = false;
            window.removeEventListener(event, load);
        };
    }, [key]);

    const content: T = { ...defaults, ...(saved?.[language] ?? {}) };
    return { content, saved };
}
