import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase', () => ({
    supabaseAdmin: {
        from: vi.fn(),
    },
}));

import { supabaseAdmin } from '@/lib/supabase';
import {
    loadSocialAccounts,
    saveSocialAccounts,
    addSocialAccount,
    updateSocialAccount,
    deleteSocialAccount,
} from './socialsStore';
import { DEFAULT_SOCIAL_ACCOUNTS } from './socials';

describe('Social Accounts Store (site_content)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns default accounts if nothing stored in site_content', async () => {
        const mockMaybeSingle = vi.fn().mockResolvedValueOnce({ data: null, error: null });
        const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
        const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
        vi.mocked(supabaseAdmin.from).mockReturnValue({ select: mockSelect } as any);

        const accounts = await loadSocialAccounts();
        expect(accounts).toEqual(DEFAULT_SOCIAL_ACCOUNTS);
    });

    it('returns stored accounts when available', async () => {
        const stored = [
            { id: '1', platform: 'linkedin', url: 'https://linkedin.com/company/afrikyia', isActive: true, order: 1 },
        ];
        const mockMaybeSingle = vi.fn().mockResolvedValueOnce({ data: { data: stored }, error: null });
        const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
        const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
        vi.mocked(supabaseAdmin.from).mockReturnValue({ select: mockSelect } as any);

        const accounts = await loadSocialAccounts();
        expect(accounts.length).toBe(1);
        expect(accounts[0].platform).toBe('linkedin');
    });

    it('self-heals inactive or legacy TikTok accounts to active @afrikyai handle', async () => {
        const stored = [
            { id: 'tt-1', platform: 'tiktok', url: 'https://tiktok.com/@afrikyiadeveloper', isActive: false, order: 2 },
        ];
        const mockMaybeSingle = vi.fn().mockResolvedValueOnce({ data: { data: stored }, error: null });
        const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
        const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
        const mockUpsert = vi.fn().mockResolvedValue({ error: null });
        vi.mocked(supabaseAdmin.from).mockReturnValue({ select: mockSelect, upsert: mockUpsert } as any);

        const accounts = await loadSocialAccounts();
        expect(accounts.length).toBe(1);
        expect(accounts[0].platform).toBe('tiktok');
        expect(accounts[0].isActive).toBe(true);
        expect(accounts[0].url).toBe('https://www.tiktok.com/@afrikyai');
        expect(accounts[0].handle).toBe('@afrikyai');
    });

    it('saves accounts successfully into site_content', async () => {
        const mockUpsert = vi.fn().mockResolvedValueOnce({ error: null });
        vi.mocked(supabaseAdmin.from).mockReturnValue({ upsert: mockUpsert } as any);

        const toSave = [
            { id: 'soc-1', platform: 'facebook' as const, url: 'https://facebook.com/afrikyia', isActive: true, order: 1 },
        ];
        const saved = await saveSocialAccounts(toSave);
        expect(mockUpsert).toHaveBeenCalledWith(
            expect.objectContaining({
                key: 'company_socials',
                data: expect.any(Array),
            }),
            { onConflict: 'key' }
        );
        expect(saved.length).toBe(1);
    });

    it('adds a new account and assigns id and timestamp', async () => {
        // First mock load
        const mockMaybeSingle = vi.fn().mockResolvedValueOnce({ data: null, error: null });
        const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
        const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
        const mockUpsert = vi.fn().mockResolvedValueOnce({ error: null });
        vi.mocked(supabaseAdmin.from).mockReturnValue({ select: mockSelect, upsert: mockUpsert } as any);

        const updatedList = await addSocialAccount({
            platform: 'linkedin',
            url: 'https://linkedin.com/company/afrikyia',
            handle: 'afrikyia',
            isActive: true,
            order: 4,
        });

        expect(updatedList.length).toBe(DEFAULT_SOCIAL_ACCOUNTS.length + 1);
        const added = updatedList.find(a => a.platform === 'linkedin');
        expect(added).toBeDefined();
        expect(added?.url).toBe('https://linkedin.com/company/afrikyia');
    });

    it('updates an existing account', async () => {
        const existing = [
            { id: 'soc-fb', platform: 'facebook', url: 'https://facebook.com/old', isActive: true, order: 1 },
        ];
        const mockMaybeSingle = vi.fn().mockResolvedValueOnce({ data: { data: existing }, error: null });
        const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
        const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
        const mockUpsert = vi.fn().mockResolvedValueOnce({ error: null });
        vi.mocked(supabaseAdmin.from).mockReturnValue({ select: mockSelect, upsert: mockUpsert } as any);

        const updatedList = await updateSocialAccount('soc-fb', {
            url: 'https://facebook.com/new-afrikyia',
            handle: 'new_afrikyia',
        });

        const updated = updatedList.find(a => a.id === 'soc-fb');
        expect(updated?.url).toBe('https://facebook.com/new-afrikyia');
        expect(updated?.handle).toBe('new_afrikyia');
    });

    it('deletes an account by id', async () => {
        const existing = [
            { id: 'soc-fb', platform: 'facebook', url: 'https://facebook.com/fb', isActive: true, order: 1 },
            { id: 'soc-tt', platform: 'tiktok', url: 'https://tiktok.com/@tt', isActive: true, order: 2 },
        ];
        const mockMaybeSingle = vi.fn().mockResolvedValueOnce({ data: { data: existing }, error: null });
        const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
        const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
        const mockUpsert = vi.fn().mockResolvedValueOnce({ error: null });
        vi.mocked(supabaseAdmin.from).mockReturnValue({ select: mockSelect, upsert: mockUpsert } as any);

        const remaining = await deleteSocialAccount('soc-fb');
        expect(remaining.length).toBe(1);
        expect(remaining[0].id).toBe('soc-tt');
    });
});

