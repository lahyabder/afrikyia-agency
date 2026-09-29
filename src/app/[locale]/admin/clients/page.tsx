"use client";

import { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Phone, Mail, Search } from 'lucide-react';
import PartyForm from '@/components/admin/biz/PartyForm';
import { PageHeader, ErrorBox, inputClass, primaryBtn, api, useBiz, type Party } from '@/components/admin/biz/ui';

export default function ClientsPage() {
    const { b } = useBiz();
    const p = b.parties;
    const [parties, setParties] = useState<Party[] | null>(null);
    const [filter, setFilter] = useState<'all' | 'client' | 'supplier'>('all');
    const [search, setSearch] = useState('');
    const [editing, setEditing] = useState<Party | null | undefined>(undefined);
    const [error, setError] = useState('');

    const load = useCallback(() => {
        api<Party[]>('/api/biz/parties')
            .then(data => { setParties(data); setError(''); })
            .catch(() => setError(b.common.loadError));
    }, [b.common.loadError]);

    useEffect(load, [load]);

    const remove = async (party: Party) => {
        if (!confirm(`${b.common.confirmDelete}\n${party.name}`)) return;
        try {
            await api(`/api/biz/parties?id=${party.id}`, 'DELETE');
            setParties(list => (list ?? []).filter(x => x.id !== party.id));
        } catch (e) {
            setError((e as { code?: string }).code === 'InUse' ? p.inUse : b.common.saveError);
        }
    };

    const q = search.trim().toLowerCase();
    const visible = (parties ?? []).filter(
        x => (filter === 'all' || x.type === filter || x.type === 'both') && (!q || [x.name, x.email, x.phone].some(v => v?.toLowerCase().includes(q)))
    );
    const typeLabel: Record<string, string> = { client: p.client, supplier: p.supplier, both: p.both };

    return (
        <div className="space-y-6">
            <PageHeader title={p.title} subtitle={p.subtitle}>
                <button onClick={() => setEditing(null)} className={primaryBtn}><Plus className="w-4 h-4" />{p.new}</button>
            </PageHeader>

            <ErrorBox message={error} />

            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex gap-2">
                    {(['all', 'client', 'supplier'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap cursor-pointer ${filter === f ? 'bg-yellow-400 text-black' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
                        >
                            {f === 'all' ? p.all : typeLabel[f]}
                        </button>
                    ))}
                </div>
                <div className="relative flex-1">
                    <Search className="w-4 h-4 text-white/40 absolute top-1/2 -translate-y-1/2 start-4" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder={b.common.search} className={`${inputClass} ps-11`} />
                </div>
            </div>

            {parties === null && !error ? (
                <div className="text-white/60 text-sm py-10 text-center">{b.common.loading}</div>
            ) : visible.length === 0 ? (
                <div className="bg-white/5 border border-white/10 rounded-2xl py-14 text-center text-white/60 text-sm">{b.common.empty}</div>
            ) : (
                <ul className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    {visible.map(x => (
                        <li key={x.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-3">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="font-bold truncate">{x.name}</div>
                                    <span className="text-[11px] px-2 py-0.5 rounded-md font-bold bg-white/10 text-white/70">{typeLabel[x.type] ?? x.type}</span>
                                </div>
                                <div className="flex gap-1 shrink-0">
                                    <button onClick={() => setEditing(x)} className="p-2 rounded-lg hover:bg-white/10 cursor-pointer" aria-label={b.common.edit}><Pencil className="w-4 h-4" /></button>
                                    <button onClick={() => remove(x)} className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 cursor-pointer" aria-label={b.common.delete}><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                            <div className="text-sm text-white/65 space-y-1">
                                {x.phone && <a href={`tel:${x.phone}`} className="flex items-center gap-2 hover:text-yellow-400"><Phone className="w-3.5 h-3.5" /><span dir="ltr">{x.phone}</span></a>}
                                {x.email && <a href={`mailto:${x.email}`} className="flex items-center gap-2 hover:text-yellow-400 break-all"><Mail className="w-3.5 h-3.5 shrink-0" /><span dir="ltr">{x.email}</span></a>}
                                {x.nif && <div className="text-xs text-white/45">NIF <span dir="ltr">{x.nif}</span></div>}
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {editing !== undefined && (
                <PartyForm
                    party={editing}
                    onClose={() => setEditing(undefined)}
                    onSaved={saved => {
                        setParties(list => {
                            const rest = (list ?? []).filter(x => x.id !== saved.id);
                            return [...rest, saved].sort((a, c) => a.name.localeCompare(c.name));
                        });
                        setEditing(undefined);
                    }}
                />
            )}
        </div>
    );
}
