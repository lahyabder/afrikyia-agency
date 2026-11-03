import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST, PUT, DELETE } from './route';
import { NextResponse } from 'next/server';

vi.mock('@/lib/adminAuth', () => ({
    getSessionUser: vi.fn(),
    requireAccess: vi.fn(),
}));

vi.mock('@/lib/socialsStore', () => ({
    loadSocialAccounts: vi.fn(),
    saveSocialAccounts: vi.fn(),
    addSocialAccount: vi.fn(),
    updateSocialAccount: vi.fn(),
    deleteSocialAccount: vi.fn(),
}));

vi.mock('@/lib/activity', () => ({
    logActivity: vi.fn(),
}));

import { getSessionUser, requireAccess } from '@/lib/adminAuth';
import {
    loadSocialAccounts,
    saveSocialAccounts,
    addSocialAccount,
    updateSocialAccount,
    deleteSocialAccount,
} from '@/lib/socialsStore';

describe('Admin Social Accounts API Route (/api/admin/socials)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('GET', () => {
        it('denies access if unauthenticated', async () => {
            vi.mocked(getSessionUser).mockResolvedValueOnce(null);
            const req = new Request('http://localhost:3000/api/admin/socials');
            const res = await GET(req);
            expect(res.status).toBe(401);
        });

        it('returns social accounts when authenticated', async () => {
            vi.mocked(getSessionUser).mockResolvedValueOnce({
                id: 'admin-1',
                email: 'admin@afrikyia.com',
                name: 'Admin',
                role: 'admin',
                owner: true,
            });
            const mockAccounts = [
                { id: '1', platform: 'facebook' as const, url: 'https://facebook.com/af', isActive: true, order: 1 },
            ];
            vi.mocked(loadSocialAccounts).mockResolvedValueOnce(mockAccounts);

            const req = new Request('http://localhost:3000/api/admin/socials');
            const res = await GET(req);
            expect(res.status).toBe(200);
            const json = await res.json();
            expect(json.accounts).toEqual(mockAccounts);
        });
    });

    describe('POST', () => {
        it('denies access if user lacks publishing or admin permission', async () => {
            vi.mocked(requireAccess).mockResolvedValueOnce({
                denied: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
            });
            const req = new Request('http://localhost:3000/api/admin/socials', {
                method: 'POST',
                body: JSON.stringify({ platform: 'facebook', url: 'https://facebook.com/af' }),
            });
            const res = await POST(req);
            expect(res.status).toBe(403);
        });

        it('adds a new account and returns updated list', async () => {
            vi.mocked(requireAccess).mockResolvedValueOnce({
                user: { id: 'admin-1', email: 'admin@afrikyia.com', name: 'Admin', role: 'admin', owner: true },
            });
            const mockUpdated = [
                { id: 'soc-new', platform: 'linkedin' as const, url: 'https://linkedin.com/in/af', isActive: true, order: 1 },
            ];
            vi.mocked(addSocialAccount).mockResolvedValueOnce(mockUpdated);

            const req = new Request('http://localhost:3000/api/admin/socials', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    platform: 'linkedin',
                    url: 'https://linkedin.com/in/af',
                    handle: 'afrikyia',
                }),
            });
            const res = await POST(req);
            expect(res.status).toBe(201);
            const json = await res.json();
            expect(json.accounts).toEqual(mockUpdated);
        });
    });

    describe('PUT', () => {
        it('updates an account by id or saves whole list', async () => {
            vi.mocked(requireAccess).mockResolvedValueOnce({
                user: { id: 'admin-1', email: 'admin@afrikyia.com', name: 'Admin', role: 'admin', owner: true },
            });
            const mockUpdated = [
                { id: 'soc-1', platform: 'tiktok' as const, url: 'https://tiktok.com/@new', isActive: false, order: 1 },
            ];
            vi.mocked(updateSocialAccount).mockResolvedValueOnce(mockUpdated);

            const req = new Request('http://localhost:3000/api/admin/socials', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: 'soc-1',
                    url: 'https://tiktok.com/@new',
                    isActive: false,
                }),
            });
            const res = await PUT(req);
            expect(res.status).toBe(200);
            const json = await res.json();
            expect(json.accounts).toEqual(mockUpdated);
        });
    });

    describe('DELETE', () => {
        it('deletes an account by id', async () => {
            vi.mocked(requireAccess).mockResolvedValueOnce({
                user: { id: 'admin-1', email: 'admin@afrikyia.com', name: 'Admin', role: 'admin', owner: true },
            });
            const remaining = [
                { id: 'soc-2', platform: 'tiktok' as const, url: 'https://tiktok.com/@af', isActive: true, order: 1 },
            ];
            vi.mocked(deleteSocialAccount).mockResolvedValueOnce(remaining);

            const req = new Request('http://localhost:3000/api/admin/socials?id=soc-1', {
                method: 'DELETE',
            });
            const res = await DELETE(req);
            expect(res.status).toBe(200);
            const json = await res.json();
            expect(json.accounts).toEqual(remaining);
        });
    });
});

