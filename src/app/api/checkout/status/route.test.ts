import { describe, it, expect, vi } from 'vitest';
import { GET } from './route';

const mockOrder: any = {
    id: 'AFR-DIF-998877',
    product_id: 'diftar',
    variant_key: 'monthly_1dev',
    status: 'pending',
    amount: 1000,
    currency: 'MRU',
    license_key: null,
    paid_at: null,
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

describe('GET /api/checkout/status Route', () => {
    it('returns 400 when invoiceId is missing', async () => {
        const req = new Request('http://localhost:3000/api/checkout/status');
        const res = await GET(req);
        expect(res.status).toBe(400);
    });

    it('returns pending status while waiting for bank confirmation', async () => {
        mockOrder.status = 'pending';
        const req = new Request('http://localhost:3000/api/checkout/status?invoiceId=AFR-DIF-998877');
        const res = await GET(req);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.status).toBe('pending');
        expect(data.isPaid).toBe(false);
    });

    it('returns paid status and license details when bank has confirmed', async () => {
        mockOrder.status = 'paid';
        mockOrder.license_key = 'AFR-DIF-AAAA-BBBB-CCCC';
        mockOrder.paid_at = '2026-10-20T23:50:00Z';

        const req = new Request('http://localhost:3000/api/checkout/status?invoiceId=AFR-DIF-998877');
        const res = await GET(req);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.status).toBe('paid');
        expect(data.isPaid).toBe(true);
        expect(data.licenseKey).toBe('AFR-DIF-AAAA-BBBB-CCCC');
    });
});
