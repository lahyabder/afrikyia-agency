import { supabaseAdmin } from '@/lib/supabase';
import { DEFAULT_RATES, normalizeRates, type PayrollRates } from '@/lib/payroll';

// Payroll rates live in site_content under a key the public content API never serves.
const KEY = 'payroll_rates';

export async function loadRates(): Promise<PayrollRates> {
    const { data } = await supabaseAdmin.from('site_content').select('data').eq('key', KEY).maybeSingle();
    return data?.data ? normalizeRates(data.data) : DEFAULT_RATES;
}

export async function saveRates(value: unknown): Promise<PayrollRates> {
    const rates = normalizeRates(value);
    const { error } = await supabaseAdmin
        .from('site_content')
        .upsert({ key: KEY, data: rates, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    if (error) throw new Error(error.message);
    return rates;
}
