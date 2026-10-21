import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { supabaseAdmin } from '@/lib/supabase';

const mockOrder = {
    id: 'AFR-SANAD-TEST1234',
    product_id: 'sanad',
    variant_key: 'lifetime',
    amount: 1000,
    currency: 'MRU',
    customer_phone: '36305215',
    customer_email: 'test@afrikyia.com',
    status: 'pending',
    numero_recu: null as string | null,
    metadata: {},
};

let mockOrderData: any = mockOrder;

const mockUpdate = vi.fn().mockReturnThis();
const mockEq = vi.fn().mockResolvedValue({ data: null, error: null });
const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null });

vi.mock('@/lib/supabase', () => ({
    supabaseAdmin: {
        from: vi.fn((table: string) => {
            if (table === 'store_orders') {
                return {
                    select: vi.fn(() => ({
                        eq: vi.fn(() => ({
                            single: vi.fn(() =>
                                Promise.resolve({
                                    data: mockOrderData ? { ...mockOrderData } : null,
                                    error: mockOrderData ? null : new Error('Order not found'),
                                })
                            ),
                        })),
                    })),
                    update: mockUpdate.mockReturnValue({ eq: mockEq }),
                };
            }
            if (table === 'store_licenses' || table === 'store_payment_audit_logs') {
                return {
                    insert: mockInsert,
                };
            }
            return {
                select: vi.fn().mockReturnThis(),
                insert: mockInsert,
            };
        }),
    },
}));

describe('Payment Webhook Security & Fraud Prevention', () => {
    const validKey = 'amkEsKSS.ILbUR5XFS54kmAtaFpy5F8sZU2miACQc';
    const authHeader = `Api-Key ${validKey}`;

    beforeEach(() => {
        vi.clearAllMocks();
        mockOrder.status = 'pending';
        mockOrder.amount = 1000;
        mockOrder.numero_recu = null;
        mockOrderData = mockOrder;
    });

    it('Scenario 1: Valid webhook with exact amount records payment and provisions single license', async () => {
        const req = new Request('http://localhost:3000/api/webhooks/nexconnect/confirmation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader,
            },
            body: JSON.stringify({
                id_facture: 'AFR-SANAD-TEST1234',
                id_transaction: 'TX-1001',
                montant: 1000,
                numero_recu: 'REC-998877',
            }),
        });

        const res = await POST(req);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.code).toBe(200);
        expect(data.numero_recu).toBe('REC-998877');
        expect(mockUpdate).toHaveBeenCalled();
    });

    it('Scenario 2: Reject forged webhook with invalid Api-Key', async () => {
        const req = new Request('http://localhost:3000/api/webhooks/nexconnect/confirmation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Api-Key FORGED_SECRET_KEY_12345',
            },
            body: JSON.stringify({
                id_facture: 'AFR-SANAD-TEST1234',
                montant: 1000,
                numero_recu: 'REC-998877',
            }),
        });

        const res = await POST(req);
        expect([401, 403]).toContain(res.status);
        expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('Scenario 3: Reject webhook without Authorization header', async () => {
        const req = new Request('http://localhost:3000/api/webhooks/nexconnect/confirmation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id_facture: 'AFR-SANAD-TEST1234',
                montant: 1000,
                numero_recu: 'REC-998877',
            }),
        });

        const res = await POST(req);
        expect([401, 403]).toContain(res.status);
        expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('Scenario 4: Idempotent replay of previously confirmed webhook does not re-issue license', async () => {
        mockOrder.status = 'paid';
        mockOrder.numero_recu = 'REC-998877';

        const req = new Request('http://localhost:3000/api/webhooks/nexconnect/confirmation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader,
            },
            body: JSON.stringify({
                id_facture: 'AFR-SANAD-TEST1234',
                id_transaction: 'TX-1001',
                montant: 1000,
                numero_recu: 'REC-998877',
            }),
        });

        const res = await POST(req);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.code).toBe(200);
        expect(data.numero_recu).toBe('REC-998877');
        // Must NOT update store_orders or insert into store_licenses
        expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('Scenario 5: Reject webhook when paid amount does not match expected invoice amount (Tamper Attack)', async () => {
        mockOrder.amount = 16500; // Customer owes 16,500 MRU

        const req = new Request('http://localhost:3000/api/webhooks/nexconnect/confirmation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader,
            },
            body: JSON.stringify({
                id_facture: 'AFR-SANAD-TEST1234',
                id_transaction: 'TX-FRAUD',
                montant: 10, // Attacker paid 10 MRU
                numero_recu: 'REC-FRAUD-123',
            }),
        });

        const res = await POST(req);
        expect(res.status).toBe(400);
        // Order must not be marked paid
        expect(mockUpdate).not.toHaveBeenCalledWith(expect.objectContaining({ status: 'paid' }));
    });

    it('Scenario 6: Reject webhook for non-existent invoice ID', async () => {
        mockOrderData = null;

        const req = new Request('http://localhost:3000/api/webhooks/nexconnect/confirmation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader,
            },
            body: JSON.stringify({
                id_facture: 'AFR-NONEXISTENT-9999',
                montant: 1000,
                numero_recu: 'REC-000',
            }),
        });

        const res = await POST(req);
        expect(res.status).toBe(404);
    });

    it('Scenario 7: Prevent status rollback from paid to failed on late arriving notification', async () => {
        mockOrder.status = 'paid';

        const req = new Request('http://localhost:3000/api/webhooks/nexconnect/confirmation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader,
            },
            body: JSON.stringify({
                id_facture: 'AFR-SANAD-TEST1234',
                statut: 'failed',
                montant: 1000,
                numero_recu: 'REC-998877',
            }),
        });

        const res = await POST(req);
        expect(res.status).toBe(200);
        // Status rollback to failed MUST NOT occur
        expect(mockUpdate).not.toHaveBeenCalledWith(expect.objectContaining({ status: 'failed' }));
    });
});
