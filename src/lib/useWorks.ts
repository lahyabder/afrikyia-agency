"use client";

import { useEffect, useState } from 'react';
import fallbackAchievements from '@/data/achievements.json';

// Achievements and projects are both shown on the home page as "works".
export type WorkCategory = 'websites' | 'works' | 'activities' | 'projects';

type Localized = { title: string; desc: string; categoryLabel?: string };

export type WorkItem = {
    id: string;
    category: WorkCategory;
    link: string;
    image?: string;
    video?: string;
    en: Localized;
    fr: Localized;
    ar: Localized;
};

// Links saved without a scheme ("site.art") would otherwise open as a relative path.
export function normalizeLink(link?: string): string {
    const value = (link || '').trim();
    if (!value || value === '#') return '';
    return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

// null when the request failed, so an empty list is not mistaken for an outage
async function getJson(url: string): Promise<unknown[] | null> {
    try {
        const res = await fetch(url);
        if (!res.ok) return null;
        const data = await res.json();
        return Array.isArray(data) ? data : null;
    } catch {
        return null;
    }
}

async function loadWorks(): Promise<WorkItem[]> {
    const [achievements, projects] = await Promise.all([getJson('/api/achievements'), getJson('/api/projects')]);
    const fromAchievements = (achievements ?? fallbackAchievements) as WorkItem[];
    const fromProjects = ((projects ?? []) as WorkItem[]).map(p => ({ ...p, category: 'projects' as const }));
    return [...fromAchievements, ...fromProjects].filter(item => item && item.id);
}

// One request per page load, shared by the hero tiles, the stats strip and the works grid.
let cache: Promise<WorkItem[]> | null = null;

export function useWorks() {
    const [works, setWorks] = useState<WorkItem[] | null>(null);

    useEffect(() => {
        let alive = true;
        if (!cache) cache = loadWorks();
        cache.then(items => {
            if (alive) setWorks(items);
        });
        return () => {
            alive = false;
        };
    }, []);

    return works;
}

export function localize(item: WorkItem, language: 'en' | 'fr' | 'ar'): Localized {
    return item[language] || item.en || { title: '', desc: '' };
}
