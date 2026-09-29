"use client";

import { useState, useEffect, useCallback } from 'react';
import { Inbox, Mail, CheckCircle2, Archive, ArchiveRestore, RotateCcw, Trash2, Search, RefreshCw, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { MESSAGES_UPDATED_EVENT } from '@/lib/adminEvents';

type MessageStatus = 'new' | 'handled' | 'archived';
type ContactMessage = {
    id: string;
    name: string;
    email: string;
    message: string;
    status: MessageStatus;
    locale: string | null;
    created_at: string;
};
type Filter = MessageStatus | 'all';

export default function AdminMessagesPage() {
    const { t, language } = useLanguage();
    const m = t.admin.messages;

    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [filter, setFilter] = useState<Filter>('new');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/messages', { cache: 'no-store' });
            if (!res.ok) throw new Error(String(res.status));
            setMessages(await res.json());
            setError('');
        } catch {
            setError(m.loadError);
        } finally {
            setLoading(false);
        }
    }, [m.loadError]);

    useEffect(() => {
        load();
    }, [load]);

    const setStatus = async (id: string, status: MessageStatus) => {
        const res = await fetch('/api/messages', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status }),
        }).catch(() => null);
        if (!res?.ok) {
            setError(m.actionError);
            return;
        }
        setMessages(prev => prev.map(msg => (msg.id === id ? { ...msg, status } : msg)));
        window.dispatchEvent(new Event(MESSAGES_UPDATED_EVENT));
    };

    const remove = async (id: string) => {
        if (!confirm(m.confirmDelete)) return;
        const res = await fetch(`/api/messages?id=${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(() => null);
        if (!res?.ok) {
            setError(m.actionError);
            return;
        }
        setMessages(prev => prev.filter(msg => msg.id !== id));
        window.dispatchEvent(new Event(MESSAGES_UPDATED_EVENT));
    };

    const counts: Record<Filter, number> = {
        all: messages.length,
        new: messages.filter(msg => msg.status === 'new').length,
        handled: messages.filter(msg => msg.status === 'handled').length,
        archived: messages.filter(msg => msg.status === 'archived').length,
    };

    const q = search.trim().toLowerCase();
    const visible = messages.filter(
        msg =>
            (filter === 'all' || msg.status === filter) &&
            (!q || [msg.name, msg.email, msg.message].some(v => v.toLowerCase().includes(q)))
    );

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleString(language === 'ar' ? 'ar-u-nu-latn' : language, { dateStyle: 'medium', timeStyle: 'short' });

    const statusBadge: Record<MessageStatus, string> = {
        new: 'bg-yellow-400/15 text-yellow-400',
        handled: 'bg-emerald-500/15 text-emerald-400',
        archived: 'bg-white/10 text-white/60',
    };

    const actionBtn = 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 transition-all cursor-pointer';

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Inbox className="w-7 h-7 text-yellow-400" />
                        {m.title}
                    </h1>
                    <p className="text-sm text-white/70 mt-1">{m.subtitle}</p>
                </div>
                <button onClick={load} className={`${actionBtn} py-2 text-sm`}>
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    {m.refresh}
                </button>
            </div>

            {error && (
                <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    {error}
                </div>
            )}

            <div className="flex flex-col lg:flex-row gap-3">
                <div className="flex gap-2 overflow-x-auto">
                    {(['new', 'handled', 'archived', 'all'] as Filter[]).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                                filter === f ? 'bg-yellow-400 text-black' : 'bg-white/5 text-white/70 hover:bg-white/10'
                            }`}
                        >
                            {m[f]} <span className="opacity-70">({counts[f]})</span>
                        </button>
                    ))}
                </div>
                <div className="relative flex-1">
                    <Search className="w-4 h-4 text-white/40 absolute top-1/2 -translate-y-1/2 start-4" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder={m.search}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 ps-11 pe-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-yellow-400/50"
                    />
                </div>
            </div>

            {!loading && visible.length === 0 ? (
                <div className="bg-white/5 border border-white/10 rounded-2xl py-16 text-center text-white/60 text-sm">{m.empty}</div>
            ) : (
                <ul className="space-y-3">
                    {visible.map(msg => (
                        <li
                            key={msg.id}
                            className={`bg-white/5 border rounded-2xl p-5 transition-all ${msg.status === 'new' ? 'border-yellow-400/30' : 'border-white/10'}`}
                        >
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                                <div className="min-w-0">
                                    <div className="font-bold text-white flex items-center gap-2 flex-wrap">
                                        {msg.name}
                                        <span className={`text-[11px] px-2 py-0.5 rounded-md font-bold ${statusBadge[msg.status]}`}>{m[msg.status]}</span>
                                    </div>
                                    <a href={`mailto:${msg.email}`} className="text-sm text-white/60 hover:text-yellow-400 break-all" dir="ltr">
                                        {msg.email}
                                    </a>
                                </div>
                                <span className="text-xs text-white/50 shrink-0" dir="auto">{formatDate(msg.created_at)}</span>
                            </div>
                            <p className="text-sm text-white/85 whitespace-pre-wrap leading-relaxed mb-4">{msg.message}</p>
                            <div className="flex flex-wrap gap-2">
                                <a href={`mailto:${msg.email}`} className={`${actionBtn} text-yellow-400`}>
                                    <Mail className="w-4 h-4" /> {m.reply}
                                </a>
                                {msg.status === 'new' && (
                                    <button onClick={() => setStatus(msg.id, 'handled')} className={`${actionBtn} text-emerald-400`}>
                                        <CheckCircle2 className="w-4 h-4" /> {m.markHandled}
                                    </button>
                                )}
                                {msg.status === 'handled' && (
                                    <button onClick={() => setStatus(msg.id, 'new')} className={`${actionBtn} text-white/70`}>
                                        <RotateCcw className="w-4 h-4" /> {m.markNew}
                                    </button>
                                )}
                                {msg.status !== 'archived' ? (
                                    <button onClick={() => setStatus(msg.id, 'archived')} className={`${actionBtn} text-white/70`}>
                                        <Archive className="w-4 h-4" /> {m.archive}
                                    </button>
                                ) : (
                                    <button onClick={() => setStatus(msg.id, 'handled')} className={`${actionBtn} text-white/70`}>
                                        <ArchiveRestore className="w-4 h-4" /> {m.unarchive}
                                    </button>
                                )}
                                <button onClick={() => remove(msg.id)} className={`${actionBtn} text-red-400 hover:bg-red-500/10`}>
                                    <Trash2 className="w-4 h-4" /> {m.delete}
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
