import { supabaseAdmin } from '@/lib/supabase';
import {
    DEFAULT_SOCIAL_ACCOUNTS,
    normalizeSocialAccount,
    normalizeSocialAccountsList,
    validateSocialAccount,
    type SocialAccount,
} from '@/lib/socials';

export const SOCIALS_CONTENT_KEY = 'company_socials';

export async function loadSocialAccounts(): Promise<SocialAccount[]> {
    try {
        const { data, error } = await supabaseAdmin
            .from('site_content')
            .select('data')
            .eq('key', SOCIALS_CONTENT_KEY)
            .maybeSingle();

        if (error || !data || !data.data) {
            return DEFAULT_SOCIAL_ACCOUNTS;
        }

        return normalizeSocialAccountsList(data.data);
    } catch (e) {
        console.error('Failed to load company social accounts:', e);
        return DEFAULT_SOCIAL_ACCOUNTS;
    }
}

export async function saveSocialAccounts(accounts: unknown[]): Promise<SocialAccount[]> {
    const normalized = normalizeSocialAccountsList(accounts);
    const now = new Date().toISOString();

    const { error } = await supabaseAdmin
        .from('site_content')
        .upsert(
            {
                key: SOCIALS_CONTENT_KEY,
                data: normalized,
                updated_at: now,
            },
            { onConflict: 'key' }
        );

    if (error) {
        throw new Error(`Failed to save social accounts: ${error.message}`);
    }

    return normalized;
}

export async function addSocialAccount(
    input: Omit<SocialAccount, 'id' | 'createdAt' | 'updatedAt'>
): Promise<SocialAccount[]> {
    const validation = validateSocialAccount(input);
    if (!validation.valid) {
        throw new Error(`Validation failed: ${Object.values(validation.errors).join(', ')}`);
    }

    const current = await loadSocialAccounts();
    const now = new Date().toISOString();
    const newId = `soc-${input.platform}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const newAccount: SocialAccount = {
        ...input,
        id: newId,
        isActive: input.isActive ?? true,
        order: input.order ?? (current.length + 1),
        createdAt: now,
        updatedAt: now,
    };

    const updated = [...current, newAccount];
    return saveSocialAccounts(updated);
}

export async function updateSocialAccount(
    id: string,
    updates: Partial<SocialAccount>
): Promise<SocialAccount[]> {
    const current = await loadSocialAccounts();
    const idx = current.findIndex(a => a.id === id);
    if (idx === -1) {
        throw new Error(`Social account with ID "${id}" not found`);
    }

    const merged = {
        ...current[idx],
        ...updates,
        id, // ensure ID is preserved
        updatedAt: new Date().toISOString(),
    };

    const validation = validateSocialAccount(merged);
    if (!validation.valid) {
        throw new Error(`Validation failed: ${Object.values(validation.errors).join(', ')}`);
    }

    const updated = [...current];
    const normalized = normalizeSocialAccount(merged);
    if (!normalized) {
        throw new Error('Failed to normalize updated social account');
    }

    updated[idx] = normalized;
    return saveSocialAccounts(updated);
}

export async function deleteSocialAccount(id: string): Promise<SocialAccount[]> {
    const current = await loadSocialAccounts();
    const filtered = current.filter(a => a.id !== id);
    return saveSocialAccounts(filtered);
}

