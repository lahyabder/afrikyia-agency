"use client";

import { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Link, useRouter } from '@/i18n/routing';
import { PageHeader, ErrorBox, StatusBadge, inputClass, primaryBtn, api, useBiz } from '@/components/admin/biz/ui';

type Row = { id: string; letter_number: string; date: string; language: string; recipient: string | null; subject: string; status: string; party: { id: string; name: string } | null };

// The letters register: every letter keeps its number, cancelled ones included
export default function LettersPage() {
    const { b, formatDate } = useBiz();
    const l = b.letters;
    const router = useRouter();
    const [rows, setRows] = useState<Row[] | null>(null);
    const [search, setSearch] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        api<Row[]>('/api/biz/letters').then(setRows).catch(() => setError(b.common.loadError));
    }, [b.common.loadError]);

    const q = search.trim().toLowerCase();
    const visible = (rows ?? []).filter(r => !q || [r.letter_number, r.subject, r.recipient, r.party?.name].some(v => v?.toLowerCase().includes(q)));
    const firstLine = (r: Row) => r.party?.name ?? r.recipient?.split('\n')[0] ?? '—';

    return (
        <div className="space-y-6">
            <PageHeader title={l.title} subtitle={l.subtitle}>
                <Link href="/admin/letters/edit" className={primaryBtn}><Plus className="w-4 h-4" />{l.new}</Link>
            </PageHeader>

            <ErrorBox message={error} />

            <div className="relative">
                <Search className="w-4 h-4 text-white/40 absolute top-1/2 -translate-y-1/2 start-4" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder={b.common.search} className={`${inputClass} ps-11`} />
            </div>

            {rows === null && !error ? (
                <div className="text-white/60 text-sm py-10 text-center">{b.common.loading}</div>
            ) : visible.length === 0 ? (
                <div className="bg-white/5 border border-white/10 rounded-2xl py-14 text-center text-white/60 text-sm">{q ? b.common.empty : l.empty}</div>
            ) : (
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="text-white/50 text-xs border-b border-white/10">
                            <tr>
                                <th className="text-start font-semibold px-4 py-3">{l.number}</th>
                                <th className="text-start font-semibold px-4 py-3">{l.subject}</th>
                                <th className="text-start font-semibold px-4 py-3 hidden md:table-cell">{l.recipient}</th>
                                <th className="text-start font-semibold px-4 py-3 hidden sm:table-cell">{l.date}</th>
                                <th className="text-start font-semibold px-4 py-3">{b.docs.status}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {visible.map(r => (
                                <tr key={r.id} onClick={() => router.push(`/admin/letters/view?id=${r.id}`)} className="hover:bg-white/5 cursor-pointer">
                                    <td className="px-4 py-3 font-mono text-xs whitespace-nowrap"><span dir="ltr">{r.letter_number}</span></td>
                                    <td className="px-4 py-3 font-semibold"><span dir="auto">{r.subject}</span></td>
                                    <td className="px-4 py-3 hidden md:table-cell text-white/70"><span dir="auto">{firstLine(r)}</span></td>
                                    <td className="px-4 py-3 hidden sm:table-cell text-white/60 whitespace-nowrap">{formatDate(r.date)}</td>
                                    <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
