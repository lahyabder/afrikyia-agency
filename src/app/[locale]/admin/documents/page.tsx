"use client";

import { useCallback, useEffect, useState } from 'react';
import { Upload, Download, Pencil, Trash2, FileText, Search } from 'lucide-react';
import { Modal, Field, PageHeader, ErrorBox, inputClass, primaryBtn, ghostBtn, api, useBiz } from '@/components/admin/biz/ui';
import { useAdminSession } from '@/components/admin/AdminSession';
import { supabase } from '@/lib/supabase';

type Doc = {
    id: string;
    title: string;
    category: string;
    file_name: string;
    mime_type: string | null;
    size_bytes: number | null;
    issued_on: string | null;
    expires_on: string | null;
    notes: string | null;
    created_at: string;
};
type FormState = { id?: string; title: string; category: string; issued_on: string; expires_on: string; notes: string; file: File | null };

const CATEGORIES = ['legal', 'tax', 'social', 'bank', 'templates', 'contracts', 'other'];
const MAX_BYTES = 25 * 1024 * 1024;
const blank = (): FormState => ({ title: '', category: 'legal', issued_on: '', expires_on: '', notes: '', file: null });

export default function CompanyDocumentsPage() {
    const { b, formatDate } = useBiz();
    const v = b.vault;
    const cats = v.categories as Record<string, string>;
    const { areas } = useAdminSession();
    const [docs, setDocs] = useState<Doc[] | null>(null);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [form, setForm] = useState<FormState | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [formError, setFormError] = useState('');

    const load = useCallback(() => {
        api<Doc[]>('/api/biz/company-docs').then(setDocs).catch(() => setError(b.common.loadError));
    }, [b.common.loadError]);
    useEffect(load, [load]);

    const save = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form) return;
        setSaving(true);
        setFormError('');
        try {
            if (form.id) {
                await api('/api/biz/company-docs', 'PATCH', form);
            } else {
                const file = form.file;
                if (!file) throw new Error('file');
                if (file.size > MAX_BYTES) {
                    setFormError(v.tooLarge);
                    return;
                }
                // 1. one-time upload link, 2. upload straight to private storage, 3. record it
                const up = await api<{ path: string; token: string }>('/api/biz/company-docs', 'POST', { action: 'upload-url', file_name: file.name, size: file.size });
                const { error: upError } = await supabase.storage.from('accounting').uploadToSignedUrl(up.path, up.token, file, { contentType: file.type || 'application/octet-stream' });
                if (upError) throw upError;
                await api('/api/biz/company-docs', 'POST', {
                    action: 'create',
                    file_path: up.path,
                    file_name: file.name,
                    mime_type: file.type,
                    size_bytes: file.size,
                    title: form.title,
                    category: form.category,
                    issued_on: form.issued_on || null,
                    expires_on: form.expires_on || null,
                    notes: form.notes,
                });
            }
            setForm(null);
            load();
        } catch (err) {
            setFormError((err as { code?: string }).code === 'TooLarge' ? v.tooLarge : b.common.saveError);
        } finally {
            setSaving(false);
        }
    };

    const download = async (doc: Doc) => {
        try {
            const { url } = await api<{ url: string }>(`/api/biz/company-docs?download=${doc.id}`);
            window.location.href = url;
        } catch {
            setError(b.common.loadError);
        }
    };

    const remove = async (doc: Doc) => {
        if (!confirm(`${b.common.confirmDelete}\n${doc.title}`)) return;
        try {
            await api(`/api/biz/company-docs?id=${doc.id}`, 'DELETE');
            setDocs(list => (list ?? []).filter(d => d.id !== doc.id));
        } catch {
            setError(b.common.saveError);
        }
    };

    const today = new Date().toISOString().slice(0, 10);
    const soon = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
    const size = (n: number | null) => (n ? (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`) : '');
    const q = search.trim().toLowerCase();
    const visible = (docs ?? []).filter(d => (filter === 'all' || d.category === filter) && (!q || [d.title, d.file_name, d.notes].some(x => x?.toLowerCase().includes(q))));
    const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm(f => (f ? { ...f, [k]: e.target.value } : f));

    return (
        <div className="space-y-6">
            <PageHeader title={v.title} subtitle={v.subtitle}>
                <button onClick={() => { setFormError(''); setForm(blank()); }} className={primaryBtn}><Upload className="w-4 h-4" />{v.upload}</button>
            </PageHeader>
            <p className="text-xs text-white/50 -mt-3">{v.private}</p>
            <ErrorBox message={error} />

            <div className="flex flex-col lg:flex-row gap-3">
                <div className="flex gap-2 overflow-x-auto">
                    {['all', ...CATEGORIES].map(c => (
                        <button key={c} onClick={() => setFilter(c)} className={`px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap cursor-pointer ${filter === c ? 'bg-yellow-400 text-black' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}>
                            {c === 'all' ? v.all : cats[c].split(' (')[0]}
                        </button>
                    ))}
                </div>
                <div className="relative flex-1">
                    <Search className="w-4 h-4 text-white/40 absolute top-1/2 -translate-y-1/2 start-4" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder={b.common.search} className={`${inputClass} ps-11`} />
                </div>
            </div>

            {docs === null && !error ? (
                <div className="text-white/60 text-sm py-10 text-center">{b.common.loading}</div>
            ) : visible.length === 0 ? (
                <div className="bg-white/5 border border-white/10 rounded-2xl py-14 text-center text-white/60 text-sm">{v.empty}</div>
            ) : (
                <ul className="bg-white/5 border border-white/10 rounded-2xl divide-y divide-white/5">
                    {visible.map(d => {
                        const expired = !!d.expires_on && d.expires_on < today;
                        const expiring = !expired && !!d.expires_on && d.expires_on <= soon;
                        return (
                            <li key={d.id} className="flex items-center gap-3 p-4">
                                <span className="w-11 h-11 rounded-xl bg-white/5 text-yellow-400 flex items-center justify-center shrink-0"><FileText className="w-5 h-5" /></span>
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold truncate flex items-center gap-2 flex-wrap">
                                        {d.title}
                                        {expired && <span className="text-[11px] px-2 py-0.5 rounded-md font-bold bg-red-500/15 text-red-400">{v.expired}</span>}
                                        {expiring && <span className="text-[11px] px-2 py-0.5 rounded-md font-bold bg-amber-500/15 text-amber-300">{v.expiresSoon}</span>}
                                    </div>
                                    <div className="text-xs text-white/50 flex flex-wrap gap-x-3">
                                        <span>{cats[d.category]?.split(' (')[0] ?? d.category}</span>
                                        {d.issued_on && <span>{v.issued}: {formatDate(d.issued_on)}</span>}
                                        {d.expires_on && <span>{v.expires}: {formatDate(d.expires_on)}</span>}
                                        <span dir="ltr">{d.file_name}</span>
                                        <span>{size(d.size_bytes)}</span>
                                    </div>
                                    {d.notes && <div className="text-xs text-white/45 mt-0.5 truncate">{d.notes}</div>}
                                </div>
                                <button onClick={() => download(d)} className={`${ghostBtn} py-2`}><Download className="w-4 h-4" /><span className="hidden sm:inline">{v.download}</span></button>
                                <button onClick={() => { setFormError(''); setForm({ id: d.id, title: d.title, category: d.category, issued_on: d.issued_on ?? '', expires_on: d.expires_on ?? '', notes: d.notes ?? '', file: null }); }} className="p-2 rounded-lg hover:bg-white/10 cursor-pointer" aria-label={b.common.edit}>
                                    <Pencil className="w-4 h-4" />
                                </button>
                                {areas.includes('users') && (
                                    <button onClick={() => remove(d)} className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 cursor-pointer" aria-label={b.common.delete}>
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}

            {form && (
                <Modal title={form.id ? b.common.edit : v.upload} onClose={() => setForm(null)}>
                    <form onSubmit={save} className="space-y-4">
                        {!form.id && (
                            <Field label={v.file}>
                                <input
                                    type="file"
                                    required
                                    onChange={e => {
                                        const file = e.target.files?.[0] ?? null;
                                        setForm(f => (f ? { ...f, file, title: f.title || (file ? file.name.replace(/\.[^.]+$/, '') : '') } : f));
                                    }}
                                    className="block w-full text-sm text-white/70 file:me-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-white"
                                />
                            </Field>
                        )}
                        <Field label={v.titleField}><input required value={form.title} onChange={set('title')} className={inputClass} /></Field>
                        <Field label={v.category}>
                            <select value={form.category} onChange={set('category')} className={inputClass}>
                                {CATEGORIES.map(c => <option key={c} value={c}>{cats[c]}</option>)}
                            </select>
                        </Field>
                        <div className="grid grid-cols-2 gap-3">
                            <Field label={v.issued}><input type="date" value={form.issued_on} onChange={set('issued_on')} className={inputClass} /></Field>
                            <Field label={v.expires}><input type="date" value={form.expires_on} onChange={set('expires_on')} className={inputClass} /></Field>
                        </div>
                        <Field label={v.notes}><textarea rows={2} value={form.notes} onChange={set('notes')} className={`${inputClass} resize-y`} /></Field>
                        <ErrorBox message={formError} />
                        <div className="flex gap-2 pt-2">
                            <button type="submit" disabled={saving} className={`${primaryBtn} flex-1`}>{saving ? v.uploading : b.common.save}</button>
                            <button type="button" onClick={() => setForm(null)} className={ghostBtn}>{b.common.cancel}</button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}
