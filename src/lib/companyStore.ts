import { supabaseAdmin } from '@/lib/supabase';
import { DEFAULT_COMPANY, normalizeCompany, type BankInfo, type CompanyInfo } from '@/lib/company';

// Kept in site_content under a key the public content API never serves.
const KEY = 'company_info';
const BANK_FIELDS = 'id, bank_name, account_number, rib, iban, swift, holder, agency';

export async function loadCompany(): Promise<{ company: CompanyInfo; bank: BankInfo | null }> {
    const [{ data: row }, { data: banks }] = await Promise.all([
        supabaseAdmin.from('site_content').select('data').eq('key', KEY).maybeSingle(),
        supabaseAdmin.from('bank_accounts').select(BANK_FIELDS).eq('is_active', true).order('created_at').limit(1),
    ]);
    return { company: row?.data ? normalizeCompany(row.data) : DEFAULT_COMPANY, bank: (banks?.[0] as BankInfo) ?? null };
}

export async function saveCompany(company: unknown, bank: Partial<BankInfo> | null): Promise<{ company: CompanyInfo; bank: BankInfo | null }> {
    const info = normalizeCompany(company);
    const { error } = await supabaseAdmin
        .from('site_content')
        .upsert({ key: KEY, data: info, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    if (error) throw new Error(error.message);
    if (bank) {
        const clean = (v: unknown) => (typeof v === 'string' ? v.trim().slice(0, 80) : '');
        const fields = {
            bank_name: clean(bank.bank_name),
            account_number: clean(bank.account_number),
            rib: clean(bank.rib),
            iban: clean(bank.iban),
            swift: clean(bank.swift),
            holder: clean(bank.holder),
            agency: clean(bank.agency),
            currency: 'MRU',
            is_active: true,
        };
        const result = bank.id
            ? await supabaseAdmin.from('bank_accounts').update(fields).eq('id', bank.id)
            : await supabaseAdmin.from('bank_accounts').insert(fields);
        if (result.error) throw new Error(result.error.message);
    }
    return loadCompany();
}
