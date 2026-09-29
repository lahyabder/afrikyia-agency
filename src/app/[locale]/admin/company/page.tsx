"use client";

import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { Field, PageHeader, ErrorBox, inputClass, primaryBtn, api, useBiz } from '@/components/admin/biz/ui';
import type { BankInfo, CompanyInfo } from '@/lib/company';
import { useAccessTexts } from '@/components/admin/AdminSession';

const SECTIONS: { key: 'identity' | 'contact' | 'signature'; fields: (keyof CompanyInfo)[] }[] = [
    { key: 'identity', fields: ['legalName', 'tradeName', 'tagline', 'legalForm', 'capital', 'rc', 'nif', 'cnss', 'manager'] },
    { key: 'contact', fields: ['addressFr', 'addressAr', 'city', 'phones', 'email', 'website'] },
    { key: 'signature', fields: ['signatory', 'signatoryTitle'] },
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
                                    dir={LTR.has(key) ? 'ltr' : key === 'addressAr' ? 'rtl' : undefined}
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
        </form>
    );
}
