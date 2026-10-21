import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';

// Mock Supabase admin
vi.mock('@/lib/supabase', () => ({
    supabaseAdmin: {
        from: vi.fn(() => ({
            insert: vi.fn(() => ({
                select: vi.fn(() => ({
                    single: vi.fn(() => Promise.resolve({ data: {}, error: null })),
                })),
                error: null,
            })),
        })),
    },
}));

// Mock NexConnect client
vi.mock('@/lib/nexconnect/client', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@/lib/nexconnect/client')>();
    return {
        ...actual,
        NexConnectClient: class MockNexConnectClient {
            createPaymentRequest = vi.fn().mockResolvedValue({
                success: true,
                paymentCode: '778899',
                invoiceId: 'AFR-SANAD-TEST01',
                type: 'Wallet',
            });
        },
    };
});

describe('POST /api/checkout/initiate Route', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('rejects requests with missing required customer fields', async () => {
        const req = new Request('http://localhost:3000/api/checkout/initiate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                productId: 'sanad',
                // missing customerName and customerPhone
            }),
        });

        const res = await POST(req);
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toBeDefined();
    });

    it('handles free platform products immediately without calling bank payment', async () => {
        const req = new Request('http://localhost:3000/api/checkout/initiate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                productId: 'badila',
                customerName: 'Test User',
                customerPhone: '22244112233',
            }),
        });

        const res = await POST(req);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.success).toBe(true);
        expect(data.isFree).toBe(true);
        expect(data.redirectUrl).toBe('https://www.badila.online/');
    });

    it('successfully initiates paid checkout and returns payment code', async () => {
        const req = new Request('http://localhost:3000/api/checkout/initiate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                productId: 'sanad',
                customerName: 'Ahmed Salem',
                customerPhone: '22233445566',
                codeAbonnement: 'ba60ee21-2944-4f22-818e-de75470a7c4e',
            }),
        });

        const res = await POST(req);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.success).toBe(true);
        expect(data.paymentCode).toBe('778899');
        expect(data.amount).toBe(1000);
        expect(data.currency).toBe('MRU');
        expect(data.invoiceId).toBeDefined();
    });
});
