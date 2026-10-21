import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';

const mockOrder = {
    id: 'AFR-SANAD-TEST1234',
    product_id: 'sanad',
    variant_key: null,
    customer_phone: '22244112233',
    customer_email: 'test@afrikyia.com',
    amount: 1000,
    status: 'pending',
};

// Mock Supabase admin
vi.mock('@/lib/supabase', () => ({
    supabaseAdmin: {
        from: vi.fn((table: string) => {
            if (table === 'store_orders') {
                return {
                    select: vi.fn(() => ({
                        eq: vi.fn(() => ({
                            single: vi.fn(() => Promise.resolve({ data: mockOrder, error: null })),
                        })),
                    })),
                    update: vi.fn(() => ({
                        eq: vi.fn(() => Promise.resolve({ data: {}, error: null })),
                    })),
                };
            }
            if (table === 'store_licenses') {
                return {
                    insert: vi.fn(() => Promise.resolve({ data: {}, error: null })),
                };
            }
            return {};
        }),
    },
}));

describe('NexConnect Confirmation Webhook Route', () => {
    const validSecret = 'amkEsKSS.ILbUR5XFS54kmAtaFpy5F8sZU2miACQc';

    beforeEach(() => {
        process.env.NEXCONNECT_API_KEY = validSecret;
        process.env.NEXCONNECT_WEBHOOK_SECRET = validSecret;
        mockOrder.status = 'pending';
    });

    it('rejects webhooks with missing or invalid Authorization header', async () => {
        const req = new Request('http://localhost:3000/api/webhooks/nexconnect/confirmation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Api-Key wrong-key',
            },
            body: JSON.stringify({
                id_facture: 'AFR-SANAD-TEST1234',
                id_transaction: 'TX-99',
                date_paiement: '2026-10-20',
                montant: '1000',
                telephone_commercant: '22224222302',
                numero_recu: 'REC-001',
            }),
        });

        const res = await POST(req);
        expect(res.status).toBe(401);
    });

    it('successfully processes valid payment confirmation and returns HTTP 200', async () => {
        const req = new Request('http://localhost:3000/api/webhooks/nexconnect/confirmation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Api-Key ${validSecret}`,
            },
            body: JSON.stringify({
                id_facture: 'AFR-SANAD-TEST1234',
                id_transaction: 'TX-99',
                date_paiement: '2026-10-20',
                montant: '1000',
                telephone_commercant: '22224222302',
                numero_recu: 'REC-001',
            }),
        });

        const res = await POST(req);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.code).toBe(200);
        expect(data.Message).toBe('OK');
        expect(data.numero_recu).toBe('REC-001');
    });

    it('handles duplicate confirmations idempotently', async () => {
        mockOrder.status = 'paid';

        const req = new Request('http://localhost:3000/api/webhooks/nexconnect/confirmation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Api-Key ${validSecret}`,
            },
            body: JSON.stringify({
                id_facture: 'AFR-SANAD-TEST1234',
                id_transaction: 'TX-99',
                date_paiement: '2026-10-20',
                montant: '1000',
                telephone_commercant: '22224222302',
                numero_recu: 'REC-001',
            }),
        });

        const res = await POST(req);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.code).toBe(200);
        expect(data.numero_recu).toBe('REC-001');
    });

    it('rejects confirmations with mismatched amounts', async () => {
        const req = new Request('http://localhost:3000/api/webhooks/nexconnect/confirmation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Api-Key ${validSecret}`,
            },
            body: JSON.stringify({
                id_facture: 'AFR-SANAD-TEST1234',
                id_transaction: 'TX-99',
                date_paiement: '2026-10-20',
                montant: '500', // Mismatch with order amount (1000)
                telephone_commercant: '22224222302',
                numero_recu: 'REC-001',
            }),
        });

        const res = await POST(req);
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.message).toContain('Montant invalide');
    });
});
