// Company identity printed on invoices, quotes and payslips. Editable in the admin panel (Company).
// Defaults come from the registration documents (RC extract, tax and CNSS registrations, RIB).

export type CompanyInfo = {
    legalName: string;
    tradeName: string;
    tagline: string;
    legalForm: string;
    capital: string;
    addressFr: string;
    addressAr: string;
    city: string;
    cityAr: string;
    rc: string;
    nif: string;
    cnss: string;
    phones: string;
    email: string;
    website: string;
    manager: string;
    signatory: string;
    signatoryTitle: string;
    signatoryAr: string;
    signatoryTitleAr: string;
};

export type BankInfo = {
    id?: string;
    bank_name: string;
    account_number: string;
    rib: string;
    iban: string;
    swift: string;
    holder: string;
    agency: string;
};

export const DEFAULT_COMPANY: CompanyInfo = {
    legalName: 'AFRIKYIA-SUARL',
    tradeName: 'AFRIKYia',
    tagline: 'Solutions Intelligentes',
    legalForm: 'Société unipersonnelle à responsabilité limitée (SUARL)',
    capital: '100 000 MRU',
    addressFr: 'Tevragh Zeina – îlot Z, lot N° 0003 P',
    addressAr: 'تفرغ زينة – المقطع Z، القطعة رقم 0003P',
    city: 'Nouakchott – Mauritanie',
    cityAr: 'نواكشوط – موريتانيا',
    rc: '136293/1270',
    nif: '01697101',
    cnss: '1309212026',
    phones: '30609040 – 36305215 – 20797924',
    email: 'contact@afrikyia.com',
    website: 'afrikyia.com',
    manager: 'Ghalia Abderrahmane LAHY',
    signatory: 'Abderrahmane LAHY',
    signatoryTitle: 'Directeur Général',
    // Used on documents printed in Arabic; empty = the French name above
    signatoryAr: '',
    signatoryTitleAr: 'المدير العام',
};

const MAX = 200;

export function normalizeCompany(value: unknown): CompanyInfo {
    const v = (value && typeof value === 'object' ? value : {}) as Record<string, unknown>;
    const out = { ...DEFAULT_COMPANY };
    for (const key of Object.keys(DEFAULT_COMPANY) as (keyof CompanyInfo)[]) {
        if (typeof v[key] === 'string') out[key] = (v[key] as string).trim().slice(0, MAX);
    }
    return out;
}
