"use client";

import { useEffect, useState, type ReactNode } from 'react';
import Image from 'next/image';
import { DEFAULT_COMPANY, type CompanyInfo } from '@/lib/company';
import { api } from '@/components/admin/biz/ui';

// The company letterhead and signature block shared by printed documents (invoices, quotes, letters)

export type PaperLang = 'fr' | 'ar' | 'en';
export type Seals = { stamp: string | null; signature: string | null };

const HEAD: Record<PaperLang, { rc: string; nif: string; tel: string }> = {
    fr: { rc: 'RC', nif: 'NIF', tel: 'Tél' },
    ar: { rc: 'السجل التجاري', nif: 'الرقم الضريبي', tel: 'الهاتف' },
    en: { rc: 'RC', nif: 'Tax ID', tel: 'Tel' },
};

export const paperLocale = (lang: PaperLang) => (lang === 'ar' ? 'ar-u-nu-latn' : lang === 'fr' ? 'fr-FR' : 'en-GB');

// Company details and the stamp/signature images, loaded once per page
export function useCompanySeals() {
    const [company, setCompany] = useState<CompanyInfo>(DEFAULT_COMPANY);
    const [seals, setSeals] = useState<Seals>({ stamp: null, signature: null });
    useEffect(() => {
        api<{ company: CompanyInfo }>('/api/biz/company').then(r => setCompany(r.company)).catch(() => {});
        api<Seals>('/api/biz/company/seals').then(setSeals).catch(() => {});
    }, []);
    return { company, seals, hasSeals: !!(seals.stamp || seals.signature) };
}

export function LetterheadHeader({ company, lang, children }: { company: CompanyInfo; lang: PaperLang; children?: ReactNode }) {
    const L = HEAD[lang];
    return (
        <header className="flex justify-between items-start gap-6 pb-6 border-b-2 border-[#E11D48]">
            <div>
                <Image src="/logo.png" alt={company.tradeName} width={160} height={48} className="h-10 w-auto" />
                {company.tagline && <p className={`text-[10px] text-[#4B515A] mt-0.5 ${lang === 'ar' ? 'text-right' : 'text-left'}`} dir="ltr">{company.tagline}</p>}
                <p className="mt-3 text-[#14161A] text-xs font-bold">{company.legalName}</p>
                <p className="text-[#4B515A] text-xs">{lang === 'ar' ? company.addressAr : company.addressFr} – {company.city}</p>
                <p className="text-[#4B515A] text-xs">{L.rc} {company.rc} · {L.nif} {company.nif}</p>
                <p className="text-[#4B515A] text-xs"><span dir="ltr">{L.tel} {company.phones} · {company.email} · {company.website}</span></p>
            </div>
            {children && <div className="text-end shrink-0">{children}</div>}
        </header>
    );
}

// Name and title, with the stamp and signature drawn over the space left for them when printing "signed"
export function SignatureBlock({ name, title, seals, withSeal }: { name: string; title: string; seals: Seals; withSeal: boolean }) {
    return (
        <div className="relative text-center text-xs w-64">
            <div className="font-bold text-[#14161A]">{name}</div>
            <div className="text-[#4B515A]">{title}</div>
            <div className="relative h-36">
                {withSeal && seals.stamp && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={seals.stamp} alt="" className="absolute left-1/2 top-1 -translate-x-[70%] w-36 h-36 object-contain opacity-90 -rotate-6 pointer-events-none" />
                )}
                {withSeal && seals.signature && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={seals.signature} alt="" className="absolute left-1/2 top-8 -translate-x-[35%] w-44 object-contain pointer-events-none" />
                )}
            </div>
        </div>
    );
}
