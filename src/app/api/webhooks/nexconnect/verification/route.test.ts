import { describe, it, expect, vi } from 'vitest';
import { GET } from './route';

const mockOrder = {
    id: 'AFR-SANAD-TEST1234',
    status: 'paid',
};

vi.mock('@/lib/supabase', () => ({
    supabaseAdmin: {
        from: vi.fn(() => ({
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    single: vi.fn(() => Promise.resolve({ data: mockOrder, error: null })),
                })),
            })),
        })),
    },
}));

describe('NexConnect Verification Webhook Route', () => {
    it('returns 400 if id_facture query parameter is missing', async () => {
        const req = new Request('http://localhost:3000/api/webhooks/nexconnect/verification');
        const res = await GET(req);
        expect(res.status).toBe(400);
    });

    it('returns { statut: "paye" } when invoice has been paid', async () => {
        mockOrder.status = 'paid';
        const req = new Request('http://localhost:3000/api/webhooks/nexconnect/verification?id_facture=AFR-SANAD-TEST1234');
        const res = await GET(req);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.statut).toBe('paye');
    });

    it('returns { statut: "non_paye" } when invoice is not paid', async () => {
        mockOrder.status = 'pending';
        const req = new Request('http://localhost:3000/api/webhooks/nexconnect/verification?id_facture=AFR-SANAD-TEST1234');
        const res = await GET(req);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.statut).toBe('non_paye');
    });
});
