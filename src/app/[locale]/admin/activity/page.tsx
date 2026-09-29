"use client";

import { useEffect, useState } from 'react';
import { PageHeader, ErrorBox, inputClass, api, useBiz } from '@/components/admin/biz/ui';
import { useAccessTexts } from '@/components/admin/AdminSession';

type Entry = { id: string; user_email: string | null; user_name: string | null; action: string; entity: string | null; summary: string | null; created_at: string };

export default function ActivityPage() {
    const { language } = useBiz();
    const a = useAccessTexts();
    const [entries, setEntries] = useState<Entry[] | null>(null);
    const [who, setWho] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        api<Entry[]>('/api/admin/activity?limit=300').then(setEntries).catch(() => setError(a.forbidden));
    }, [a.forbidden]);

    const people = Array.from(new Set((entries ?? []).map(e => e.user_email).filter(Boolean))) as string[];
    const visible = (entries ?? []).filter(e => !who || e.user_email === who);
    const actions = a.actions as Record<string, string>;
    const entities = a.entities as Record<string, string>;
    const actionLabel = (e: Entry) => {
        if (e.action.startsWith('status:')) return `${actions.status} → ${e.action.slice(7)}`;
        return actions[e.action] ?? e.action;
    };
    const formatDate = (iso: string) =>
        new Date(iso).toLocaleString(language === 'ar' ? 'ar-u-nu-latn' : language, { dateStyle: 'medium', timeStyle: 'short' });

    return (
        <div className="space-y-6">
            <PageHeader title={a.activity.title} subtitle={a.activity.subtitle}>
                <select value={who} onChange={e => setWho(e.target.value)} className={inputClass.replace('w-full', 'w-auto')}>
                    <option value="">{a.activity.allUsers}</option>
                    {people.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </PageHeader>

            <ErrorBox message={error} />

            {entries === null && !error ? (
                <div className="text-white/60 text-sm py-10 text-center">…</div>
            ) : visible.length === 0 ? (
                <div className="bg-white/5 border border-white/10 rounded-2xl py-14 text-center text-white/60 text-sm">{a.activity.empty}</div>
            ) : (
                <ul className="bg-white/5 border border-white/10 rounded-2xl divide-y divide-white/5">
                    {visible.map(e => (
                        <li key={e.id} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 px-4 py-3 text-sm">
                            <span className="text-xs text-white/45 sm:w-40 shrink-0" dir="auto">{formatDate(e.created_at)}</span>
                            <span className="font-semibold sm:w-48 shrink-0 truncate">{e.user_name || e.user_email || '—'}</span>
                            <span className="flex-1 min-w-0">
                                <span className="text-yellow-400 font-semibold">{actionLabel(e)}</span>
                                {e.entity && entities[e.entity] ? <span className="text-white/70"> · {entities[e.entity]}</span> : null}
                                {e.summary && <span className="text-white/55"> — <span dir="auto">{e.summary}</span></span>}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
