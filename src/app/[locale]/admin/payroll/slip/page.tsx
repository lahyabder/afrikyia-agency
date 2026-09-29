"use client";

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, Printer } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { ErrorBox, primaryBtn, api, useBiz } from '@/components/admin/biz/ui';
import { DEFAULT_COMPANY, type CompanyInfo } from '@/lib/company';

type Slip = {
    period_year: number;
    period_month: number;
    salary_brut: number;
    bonus: number;
    deductions: number;
    cnss_sal: number;
    cnss_pat: number;
    cnam_sal: number;
    cnam_pat: number;
    taxable_base: number | null;
    its: number;
    net_paye: number;
    is_paid: boolean;
    paid_at: string | null;
    notes: string | null;
    rates: { cnssEmployee: number; cnssEmployer: number; cnssCeiling: number; cnamEmployee: number; cnamEmployer: number } | null;
    employee: {
        matricule: string; full_name: string; full_name_ar: string | null; position: string; department: string | null; hire_date: string | null;
        contract_type: string | null; cnss_number: string | null; national_id: string | null; bank_name: string | null; bank_rib: string | null;
    } | null;
};

type Lang = 'fr' | 'ar' | 'en';
const T: Record<Lang, Record<string, string>> = {
    fr: { title: 'BULLETIN DE PAIE', period: 'Période', employee: 'Salarié', matricule: 'Matricule', position: 'Poste', hire: "Date d'embauche", contract: 'Contrat', cnss: 'N° CNSS', nni: 'NNI', item: 'Rubrique', base: 'Base', rate: 'Taux', employeePart: 'Part salariale', employerPart: 'Part patronale', salary: 'Salaire de base', bonus: 'Primes et indemnités', gross: 'Salaire brut', its: 'ITS (impôt sur salaire)', taxable: 'Base imposable', other: 'Autres retenues', net: 'NET À PAYER', paidOn: 'Payé le', bank: 'Virement', signEmployer: "L'employeur", signEmployee: 'Le salarié', employerCnss: 'N° CNSS employeur', currency: 'MRU' },
    ar: { title: 'كشف الراتب', period: 'الفترة', employee: 'الموظف', matricule: 'الرقم الوظيفي', position: 'الوظيفة', hire: 'تاريخ التوظيف', contract: 'العقد', cnss: 'رقم CNSS', nni: 'الرقم الوطني', item: 'البند', base: 'الأساس', rate: 'النسبة', employeePart: 'حصة الأجير', employerPart: 'حصة المشغّل', salary: 'الراتب الأساسي', bonus: 'المكافآت والعلاوات', gross: 'الراتب الإجمالي', its: 'ضريبة الدخل ITS', taxable: 'الأساس الخاضع للضريبة', other: 'اقتطاعات أخرى', net: 'الصافي المستحق', paidOn: 'دُفع بتاريخ', bank: 'تحويل إلى', signEmployer: 'المشغّل', signEmployee: 'الموظف', employerCnss: 'رقم انتساب المشغّل CNSS', currency: 'أوقية' },
    en: { title: 'PAYSLIP', period: 'Period', employee: 'Employee', matricule: 'Staff no.', position: 'Position', hire: 'Hire date', contract: 'Contract', cnss: 'CNSS no.', nni: 'National ID', item: 'Item', base: 'Base', rate: 'Rate', employeePart: 'Employee', employerPart: 'Employer', salary: 'Base salary', bonus: 'Bonuses & allowances', gross: 'Gross salary', its: 'Income tax (ITS)', taxable: 'Taxable base', other: 'Other deductions', net: 'NET PAY', paidOn: 'Paid on', bank: 'Transfer to', signEmployer: 'Employer', signEmployee: 'Employee', employerCnss: 'Employer CNSS no.', currency: 'MRU' },
};

export default function PayslipPage() {
    return (
        <Suspense fallback={null}>
            <Payslip />
        </Suspense>
    );
}

function Payslip() {
    const { b, isRTL } = useBiz();
    const id = useSearchParams().get('id');
    const [slip, setSlip] = useState<Slip | null>(null);
    const [error, setError] = useState('');
    const [lang, setLang] = useState<Lang>('fr');
    const [company, setCompany] = useState<CompanyInfo>(DEFAULT_COMPANY);

    useEffect(() => {
        api<{ company: CompanyInfo }>('/api/biz/company').then(r => setCompany(r.company)).catch(() => {});
    }, []);

    useEffect(() => {
        if (id) api<Slip>(`/api/biz/payroll/${id}`).then(setSlip).catch(() => setError(b.common.loadError));
    }, [id, b.common.loadError]);

    const Back = isRTL ? ArrowRight : ArrowLeft;
    if (!slip) return <div className="space-y-4"><ErrorBox message={error} />{!error && <div className="text-white/60 text-sm py-10 text-center">{b.common.loading}</div>}</div>;

    const L = T[lang];
    const loc = lang === 'ar' ? 'ar-u-nu-latn' : lang === 'fr' ? 'fr-FR' : 'en-GB';
    const m = (v: number | null | undefined) => Number(v || 0).toLocaleString(loc, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const d = (iso?: string | null) => (iso ? new Date(`${iso}T00:00:00`).toLocaleDateString(loc, { dateStyle: 'long' }) : '—');
    const period = new Date(slip.period_year, slip.period_month - 1, 1).toLocaleDateString(loc, { month: 'long', year: 'numeric' });
    const gross = Number(slip.salary_brut) + Number(slip.bonus || 0);
    const e = slip.employee;
    const name = lang === 'ar' ? e?.full_name_ar || e?.full_name : e?.full_name;
    const pct = (v?: number) => (v === undefined ? '' : `${v}%`);

    const row = (label: string, base: string, rate: string, emp: string, empr: string, strong = false) => (
        <tr className={`border-b border-[#E4E2DD] ${strong ? 'font-bold bg-[#F6F5F2]' : ''}`}>
            <td className="py-2 px-3">{label}</td>
            <td className="py-2 px-3 text-end whitespace-nowrap">{base}</td>
            <td className="py-2 px-3 text-center">{rate}</td>
            <td className="py-2 px-3 text-end whitespace-nowrap">{emp}</td>
            <td className="py-2 px-3 text-end whitespace-nowrap">{empr}</td>
        </tr>
    );

    return (
        <div className="space-y-6">
            <div className="print:hidden flex flex-wrap items-center gap-2">
                <Link href="/admin/payroll" className="p-2 rounded-lg hover:bg-white/10" aria-label={b.common.back}><Back className="w-5 h-5" /></Link>
                <button onClick={() => window.print()} className={primaryBtn}><Printer className="w-4 h-4" />{b.common.print}</button>
                <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1">
                    {(['fr', 'ar', 'en'] as const).map(l => (
                        <button key={l} onClick={() => setLang(l)} className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${lang === l ? 'bg-white text-black' : 'text-white/60'}`}>{l.toUpperCase()}</button>
                    ))}
                </div>
            </div>

            <article dir={lang === 'ar' ? 'rtl' : 'ltr'} lang={lang} className={`bg-white text-[#14161A] rounded-2xl print:rounded-none shadow-xl print:shadow-none max-w-[820px] mx-auto p-8 sm:p-12 print:p-0 text-[13px] ${lang === 'ar' ? 'arabic-font' : 'font-sans'}`}>
                <header className="flex justify-between items-start gap-6 pb-5 border-b-2 border-[#E11D48]">
                    <div>
                        <Image src="/logo.png" alt="Afrikyia" width={150} height={45} className="h-9 w-auto" />
                        <p className="mt-2 text-xs font-bold">{company.legalName}</p>
                        <p className="text-xs text-[#4B515A]">{lang === 'ar' ? company.addressAr : company.addressFr} – {company.city}</p>
                        <p className="text-xs text-[#4B515A]">RC {company.rc} · NIF {company.nif}{company.cnss ? ` · ${L.employerCnss} ${company.cnss}` : ''}</p>
                    </div>
                    <div className="text-end">
                        <div className="text-xl font-bold text-[#E11D48]">{L.title}</div>
                        <div className="text-xs text-[#4B515A] mt-1">{L.period}: <b className="text-[#14161A]">{period}</b></div>
                    </div>
                </header>

                <section className="mt-5 grid grid-cols-2 gap-x-8 gap-y-1 text-xs bg-[#F6F5F2] rounded-lg p-4">
                    <div><span className="text-[#4B515A]">{L.employee}: </span><b>{name}</b></div>
                    <div><span className="text-[#4B515A]">{L.matricule}: </span><b dir="ltr">{e?.matricule}</b></div>
                    <div><span className="text-[#4B515A]">{L.position}: </span>{e?.position}</div>
                    <div><span className="text-[#4B515A]">{L.contract}: </span>{e?.contract_type || '—'}</div>
                    <div><span className="text-[#4B515A]">{L.hire}: </span>{d(e?.hire_date)}</div>
                    <div><span className="text-[#4B515A]">{L.cnss}: </span><span dir="ltr">{e?.cnss_number || '—'}</span></div>
                    {e?.national_id && <div><span className="text-[#4B515A]">{L.nni}: </span><span dir="ltr">{e.national_id}</span></div>}
                </section>

                <table className="w-full mt-6 border-collapse">
                    <thead>
                        <tr className="bg-[#14161A] text-white text-xs">
                            <th className="text-start py-2 px-3">{L.item}</th>
                            <th className="text-end py-2 px-3">{L.base}</th>
                            <th className="text-center py-2 px-3">{L.rate}</th>
                            <th className="text-end py-2 px-3">{L.employeePart}</th>
                            <th className="text-end py-2 px-3">{L.employerPart}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {row(L.salary, m(slip.salary_brut), '', m(slip.salary_brut), '')}
                        {Number(slip.bonus) > 0 && row(L.bonus, '', '', m(slip.bonus), '')}
                        {row(L.gross, '', '', m(gross), '', true)}
                        {row('CNSS', slip.rates ? m(slip.rates.cnssCeiling > 0 ? Math.min(gross, slip.rates.cnssCeiling) : gross) : '', pct(slip.rates?.cnssEmployee), `− ${m(slip.cnss_sal)}`, m(slip.cnss_pat))}
                        {Number(slip.cnam_sal) + Number(slip.cnam_pat) > 0 && row('CNAM', m(gross), pct(slip.rates?.cnamEmployee), `− ${m(slip.cnam_sal)}`, m(slip.cnam_pat))}
                        {slip.taxable_base !== null && row(L.taxable, m(slip.taxable_base), '', '', '')}
                        {row(L.its, '', '', `− ${m(slip.its)}`, '')}
                        {Number(slip.deductions) > 0 && row(L.other, '', '', `− ${m(slip.deductions)}`, '')}
                    </tbody>
                </table>

                <div className="mt-5 flex justify-end">
                    <div className="bg-[#14161A] text-white rounded-md px-5 py-3 flex items-center gap-8 text-base font-bold">
                        <span>{L.net}</span>
                        <span className="whitespace-nowrap">{m(slip.net_paye)} {L.currency}</span>
                    </div>
                </div>

                <div className="mt-4 text-xs text-[#4B515A] space-y-1">
                    {slip.is_paid && <p>{L.paidOn}: {d(slip.paid_at)}</p>}
                    {e?.bank_rib && <p>{L.bank}: {e.bank_name} — <span dir="ltr">{e.bank_rib}</span></p>}
                    {slip.notes && <p>{slip.notes}</p>}
                </div>

                <footer className="mt-14 grid grid-cols-2 gap-10 text-xs text-[#4B515A]">
                    <div className="border-t border-[#E4E2DD] pt-2">{L.signEmployer}</div>
                    <div className="border-t border-[#E4E2DD] pt-2">{L.signEmployee}</div>
                </footer>
            </article>
        </div>
    );
}
