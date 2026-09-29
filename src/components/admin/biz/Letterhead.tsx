"use client";

import { useEffect, useState, type ReactNode } from 'react';
import Image from 'next/image';
import { DEFAULT_COMPANY, type BankInfo, type CompanyInfo } from '@/lib/company';
import { api } from '@/components/admin/biz/ui';

// The company letterhead and signature block shared by printed documents (invoices, quotes, letters)

export type PaperLang = 'fr' | 'ar' | 'en';
export type Seals = { stamp: string | null; signature: string | null };

const FOOT: Record<PaperLang, { rc: string; nif: string; tel: string; bank: string }> = {
    fr: { rc: 'RC', nif: 'NIF', tel: 'Tél', bank: 'Banque' },
    ar: { rc: 'السجل التجاري', nif: 'الرقم الضريبي', tel: 'الهاتف', bank: 'البنك' },
    en: { rc: 'RC', nif: 'Tax ID', tel: 'Tel', bank: 'Bank' },
};

export const paperLocale = (lang: PaperLang) => (lang === 'ar' ? 'ar-u-nu-latn' : lang === 'fr' ? 'fr-FR' : 'en-GB');

// Company details, bank account and the stamp/signature images, loaded once per page
export function useCompanySeals() {
    const [company, setCompany] = useState<CompanyInfo>(DEFAULT_COMPANY);
    const [bank, setBank] = useState<BankInfo | null>(null);
    const [seals, setSeals] = useState<Seals>({ stamp: null, signature: null });
    useEffect(() => {
        api<{ company: CompanyInfo; bank: BankInfo | null }>('/api/biz/company')
            .then(r => {
                setCompany(r.company);
                setBank(r.bank);
            })
            .catch(() => {});
        api<Seals>('/api/biz/company/seals').then(setSeals).catch(() => {});
    }, []);
    return { company, bank, seals, hasSeals: !!(seals.stamp || seals.signature) };
}

// Top of the first page: logo and tagline, with the document's own details (number, date) on the other side
export function LetterheadHeader({ company, lang, children }: { company: CompanyInfo; lang: PaperLang; children?: ReactNode }) {
    return (
        <header className="flex justify-between items-start gap-6 pb-5 border-b-2 border-[#E11D48]">
            <div>
                <Image src="/logo.png" alt={company.tradeName} width={160} height={48} className="h-10 w-auto" />
                {company.tagline && <p className={`text-[10px] text-[#4B515A] mt-0.5 ${lang === 'ar' ? 'text-right' : 'text-left'}`} dir="ltr">{company.tagline}</p>}
            </div>
            {children && <div className="text-end shrink-0">{children}</div>}
        </header>
    );
}

// Bottom of every printed page: legal identity, address, contacts and bank account.
// Numbers, e-mail and web address are isolated so they keep their order inside Arabic text.
export function LetterheadFooter({ company, bank, lang }: { company: CompanyInfo; bank: BankInfo | null; lang: PaperLang }) {
    const L = FOOT[lang];
    const ar = lang === 'ar';
    return (
        <footer className="paper-footer mt-10 pt-3 border-t border-[#E11D48] text-[9.5px] leading-[1.55] text-[#4B515A] text-center">
            <p>
                <b className="text-[#14161A]"><bdi dir="ltr">{company.legalName}</bdi></b>
                {' · '}{L.rc} <bdi dir="ltr">{company.rc}</bdi> · {L.nif} <bdi dir="ltr">{company.nif}</bdi>
            </p>
            <p>
                {ar ? `${company.addressAr} – ${company.cityAr || company.city}` : `${company.addressFr} – ${company.city}`}
                {' · '}{L.tel} <bdi dir="ltr">{company.phones}</bdi> · <bdi dir="ltr">{company.email}</bdi> · <bdi dir="ltr">{company.website}</bdi>
            </p>
            {bank && (bank.rib || bank.iban || bank.account_number) && (
                <p>
                    {L.bank} <bdi dir="ltr">{bank.bank_name}</bdi>
                    {/* Latin label and value isolated together, so Arabic pages keep "RIB 0002…" in one piece */}
                    {bank.rib && <> · <bdi dir="ltr">RIB {bank.rib}</bdi></>}
                    {bank.iban && <> · <bdi dir="ltr">IBAN {bank.iban}</bdi></>}
                    {bank.swift && <> · <bdi dir="ltr">SWIFT {bank.swift}</bdi></>}
                </p>
            )}
        </footer>
    );
}

// Wraps a document's content so that, when printed, every page keeps room above the footer
// (the empty table footer repeats on each page; the footer itself is pinned to the page bottom).
export function PaperBody({ children }: { children: ReactNode }) {
    return (
        <table className="paper-frame w-full border-collapse">
            <tbody><tr><td className="p-0 align-top">{children}</td></tr></tbody>
            <tfoot className="paper-footer-space"><tr><td className="p-0"><div /></td></tr></tfoot>
        </table>
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
