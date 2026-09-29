"use client";

import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { Field, PageHeader, ErrorBox, inputClass, primaryBtn, api, useBiz } from '@/components/admin/biz/ui';
import type { BankInfo, CompanyInfo } from '@/lib/company';
import { useAccessTexts } from '@/components/admin/AdminSession';

const SECTIONS: { key: 'identity' | 'contact' | 'signature'; fields: (keyof CompanyInfo)[] }[] = [
    { key: 'identity', fields: ['legalName', 'tradeName', 'tagline', 'legalForm', 'capital', 'rc', 'nif', 'cnss', 'manager'] },
    { key: 'contact', fields: ['addressFr', 'addressAr', 'city', 'cityAr', 'phones', 'email', 'website'] },
    { key: 'signature', fields: ['signatory', 'signatoryTitle', 'signatoryAr', 'signatoryTitleAr'] },
];
const BANK_FIELDS: (keyof BankInfo)[] = ['bank_name', 'holder', 'agency', 'account_number', 'rib', 'iban', 'swift'];
const LTR = new Set(['rc', 'nif', 'cnss', 'phones', 'email', 'website', 'account_number', 'rib', 'iban', 'swift']);

export default function CompanyPage() {
    const { b } = useBiz();
    const access = useAccessTexts();
    const c = b.company;
    const f = c.fields as Record<string, string>;
    const [company, setCompany] = useState<CompanyInfo | null>(null);
    const [bank, setBank] = useState<Partial<BankInfo>>({});
    const [error, setError] = useState('');
    const [saved, setSaved] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        api<{ company: CompanyInfo; bank: BankInfo | null }>('/api/biz/company')
            .then(r => { setCompany(r.company); setBank(r.bank ?? {}); })
            .catch(() => setError(b.common.loadError));
    }, [b.common.loadError]);

    const save = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSaved(false);
        try {
            const r = await api<{ company: CompanyInfo; bank: BankInfo | null }>('/api/biz/company', 'PUT', { company, bank });
            setCompany(r.company);
            setBank(r.bank ?? {});
            setSaved(true);
        } catch (err) {
            setError((err as { status?: number }).status === 403 ? access.forbidden : b.common.saveError);
        } finally {
            setSaving(false);
        }
    };

    if (!company) return <div className="space-y-4"><PageHeader title={c.title} subtitle={c.subtitle} /><ErrorBox message={error} /></div>;

    return (
        <form onSubmit={save} className="space-y-6 max-w-4xl">
            <PageHeader title={c.title} subtitle={c.subtitle}>
                <button type="submit" disabled={saving} className={primaryBtn}><Save className="w-4 h-4" />{saving ? '…' : b.common.save}</button>
            </PageHeader>
            <ErrorBox message={error} />
            {saved && <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">{c.saved}</div>}

            {SECTIONS.map(section => (
                <fieldset key={section.key} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <legend className="px-2 text-sm font-bold text-yellow-400">{c[section.key]}</legend>
                    <div className="grid sm:grid-cols-2 gap-4">
                        {section.fields.map(key => (
                            <Field key={key} label={f[key]}>
                                <input
                                    value={company[key]}
                                    onChange={e => setCompany(v => v && { ...v, [key]: e.target.value })}
                                    dir={LTR.has(key) ? 'ltr' : key === 'addressAr' || key === 'cityAr' || key === 'signatoryAr' || key === 'signatoryTitleAr' ? 'rtl' : undefined}
                                    className={inputClass}
                                />
                            </Field>
                        ))}
                    </div>
                </fieldset>
            ))}

            <fieldset className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <legend className="px-2 text-sm font-bold text-yellow-400">{c.bankTitle}</legend>
                <div className="grid sm:grid-cols-2 gap-4">
                    {BANK_FIELDS.map(key => (
                        <Field key={key} label={f[key]}>
                            <input value={(bank[key] as string) ?? ''} onChange={e => setBank(v => ({ ...v, [key]: e.target.value }))} dir={LTR.has(key) ? 'ltr' : undefined} className={inputClass} />
                        </Field>
                    ))}
                </div>
            </fieldset>
            <SealsEditor />
        </form>
    );
}

// Stamp and signature images: shrunk in the browser, kept private on the server
function SealsEditor() {
    const { b } = useBiz();
    const c = b.company;
    const [seals, setSeals] = useState<{ stamp: string | null; signature: string | null } | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        api<{ stamp: string | null; signature: string | null }>('/api/biz/company/seals').then(setSeals).catch(() => setSeals({ stamp: null, signature: null }));
    }, []);

    const toDataUrl = async (file: File, maxSide: number): Promise<string> => {
        const url = URL.createObjectURL(file);
        try {
            const img = new Image();
            img.src = url;
            await img.decode();
            const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
            const canvas = document.createElement('canvas');
            canvas.width = Math.round(img.naturalWidth * scale);
            canvas.height = Math.round(img.naturalHeight * scale);
            canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height);
            const webp = canvas.toDataURL('image/webp', 0.9);
            return webp.startsWith('data:image/webp') ? webp : canvas.toDataURL('image/png');
        } finally {
            URL.revokeObjectURL(url);
        }
    };

    const upload = async (field: 'stamp' | 'signature', e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        setError('');
        try {
            const value = await toDataUrl(file, field === 'stamp' ? 480 : 600);
            setSeals(await api('/api/biz/company/seals', 'PUT', { [field]: value }));
        } catch {
            setError(b.common.saveError);
        }
    };

    const remove = async (field: 'stamp' | 'signature') => {
        if (!confirm(b.common.confirmDelete)) return;
        setSeals(await api('/api/biz/company/seals', 'PUT', { [field]: null }));
    };

    return (
        <fieldset className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <legend className="px-2 text-sm font-bold text-yellow-400">{c.sealsTitle}</legend>
            <p className="text-xs text-white/55 mb-4">{c.sealsHint}</p>
            <ErrorBox message={error} />
            <div className="grid sm:grid-cols-2 gap-4">
                {(['stamp', 'signature'] as const).map(field => (
                    <div key={field} className="rounded-xl border border-white/10 p-4">
                        <div className="text-sm font-semibold mb-3">{c[field]}</div>
                        <div className="h-36 rounded-lg bg-white flex items-center justify-center mb-3">
                            {seals?.[field] ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={seals[field] as string} alt={c[field]} className="max-h-32 max-w-full object-contain" />
                            ) : (
                                <span className="text-xs text-black/40">{c.noImage}</span>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <label className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-semibold cursor-pointer">
                                {c.choose}
                                <input type="file" accept="image/png,image/webp,image/jpeg" onChange={e => upload(field, e)} className="hidden" />
                            </label>
                            {seals?.[field] && (
                                <button type="button" onClick={() => remove(field)} className="px-3 py-2 rounded-xl text-sm font-semibold text-red-300 hover:bg-red-500/10 cursor-pointer">{b.common.delete}</button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </fieldset>
    );
}
