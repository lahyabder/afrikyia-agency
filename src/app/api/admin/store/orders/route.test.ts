import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';

vi.mock('@/lib/adminAuth', () => ({
    requireAccess: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({
    supabaseAdmin: {
        from: vi.fn(),
    },
}));

import { requireAccess } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

describe('Admin Store Orders API Route', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('denies access if user lacks finance permission', async () => {
        vi.mocked(requireAccess).mockResolvedValueOnce({
            denied: NextResponse.json({ error: 'Unauthorized' }, { status: 403 }),
        });

        const req = new Request('http://localhost:3000/api/admin/store/orders');
        const res = await GET(req);
        expect(res.status).toBe(403);
    });

    it('returns orders and summary stats when authorized', async () => {
        vi.mocked(requireAccess).mockResolvedValueOnce({
            user: { id: 'admin-1', role: 'admin', email: 'admin@afrikyia.com' } as any,
        });

        const mockOrders = [
            {
                id: '1',
                invoice_id: 'AFR-SAN-12345678',
                product_id: 'sanad',
                amount_mru: 1000,
                status: 'paid',
                customer_phone: '46000000',
                customer_name: 'Ahmed',
                payment_method: 'bankily',
                numero_recu: 'REC-999',
                created_at: '2026-10-20T10:00:00Z',
            },
            {
                id: '2',
                invoice_id: 'AFR-DIF-87654321',
                product_id: 'diftar',
                amount_mru: 11000,
                status: 'paid',
                customer_phone: '22000000',
                customer_name: 'Fatima',
                payment_method: 'masrvi',
                numero_recu: 'REC-1000',
                created_at: '2026-10-20T11:00:00Z',
            },
            {
                id: '3',
                invoice_id: 'AFR-DIF-99999999',
                product_id: 'diftar',
                amount_mru: 1000,
                status: 'pending',
                customer_phone: '33000000',
                customer_name: 'Sidi',
                payment_method: null,
                numero_recu: null,
                created_at: '2026-10-20T12:00:00Z',
            },
        ];

        const mockSelect = vi.fn().mockReturnThis();
        const mockOrder = vi.fn().mockResolvedValueOnce({ data: mockOrders, error: null });

        vi.mocked(supabaseAdmin.from).mockReturnValueOnce({
            select: mockSelect,
            order: mockOrder,
        } as any);

        const req = new Request('http://localhost:3000/api/admin/store/orders');
        const res = await GET(req);
        expect(res.status).toBe(200);

        const json = await res.json();
        expect(json.orders).toHaveLength(3);
        expect(json.stats.totalRevenue).toBe(12000);
        expect(json.stats.paidOrdersCount).toBe(2);
        expect(json.stats.pendingOrdersCount).toBe(1);
    });
});
