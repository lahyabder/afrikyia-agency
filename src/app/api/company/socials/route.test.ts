import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';

vi.mock('@/lib/socialsStore', () => ({
    loadSocialAccounts: vi.fn(),
}));

import { loadSocialAccounts } from '@/lib/socialsStore';

describe('Public Company Socials API (/api/company/socials)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns only active accounts, ordered by order', async () => {
        vi.mocked(loadSocialAccounts).mockResolvedValueOnce([
            { id: '1', platform: 'facebook', url: 'https://facebook.com/af', isActive: true, order: 2 },
            { id: '2', platform: 'tiktok', url: 'https://tiktok.com/@af', isActive: false, order: 1 },
            { id: '3', platform: 'linkedin', url: 'https://linkedin.com/in/af', isActive: true, order: 1 },
        ]);

        const res = await GET();
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.socials.length).toBe(2);
        expect(json.socials[0].platform).toBe('linkedin');
        expect(json.socials[1].platform).toBe('facebook');
    });

    it('handles unexpected errors gracefully with empty array', async () => {
        vi.mocked(loadSocialAccounts).mockRejectedValueOnce(new Error('DB connection fail'));

        const res = await GET();
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.socials).toBeDefined();
        expect(Array.isArray(json.socials)).toBe(true);
    });
});

