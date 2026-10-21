import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import OrdersPage from './page';
import { NextIntlClientProvider } from 'next-intl';

// Mock fetch for API
const mockOrdersResponse = {
    orders: [
        {
            id: 'ord-1',
            invoice_id: 'AFR-SAN-12345678',
            product_id: 'sanad',
            amount_mru: 1000,
            status: 'paid',
            customer_phone: '46000000',
            customer_name: 'Ahmed Ould Babah',
            payment_method: 'bankily',
            numero_recu: 'REC-998877',
            created_at: '2026-10-20T14:30:00Z',
        },
        {
            id: 'ord-2',
            invoice_id: 'AFR-DIF-87654321',
            product_id: 'diftar',
            devices_count: 2,
            period: 'yearly',
            amount_mru: 16500,
            status: 'paid',
            customer_phone: '22113344',
            customer_name: 'Fatima Mint Mohamed',
            payment_method: 'masrvi',
            numero_recu: 'REC-554433',
            created_at: '2026-10-20T15:00:00Z',
        },
        {
            id: 'ord-3',
            invoice_id: 'AFR-DIF-00001111',
            product_id: 'diftar',
            amount_mru: 1000,
            status: 'pending',
            customer_phone: '33445566',
            customer_name: 'Sidi Ali',
            payment_method: null,
            numero_recu: null,
            created_at: '2026-10-20T16:00:00Z',
        }
    ],
    stats: {
        totalRevenue: 17500,
        paidOrdersCount: 2,
        pendingOrdersCount: 1,
        productStats: {
            sanad: { count: 1, revenue: 1000 },
            diftar: { count: 1, revenue: 16500 }
        }
    }
};

describe('Admin Orders Monitoring Page', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true,
            json: async () => mockOrdersResponse,
        }));
    });

    it('renders KPI summary cards and order list table', async () => {
        render(
            <NextIntlClientProvider 
                locale="ar" 
                messages={{ 
                    admin: { 
                        biz: { 
                            currency: 'أوقية' 
                        } 
                    } 
                }}
            >
                <OrdersPage />
            </NextIntlClientProvider>
        );

        // Check for loading state or content
        await waitFor(() => {
            expect(screen.getByText('AFR-SAN-12345678')).toBeDefined();
        });

        // Verify customer names and phones
        expect(screen.getByText('Ahmed Ould Babah')).toBeDefined();
        expect(screen.getByText('46000000')).toBeDefined();
        expect(screen.getByText('Fatima Mint Mohamed')).toBeDefined();

        // Verify receipt numbers
        expect(screen.getByText('REC-998877')).toBeDefined();

        // Verify revenue stat displayed
        expect(screen.getByText(/17,500|17500/)).toBeDefined();
    });
});
