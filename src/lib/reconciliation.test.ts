import { describe, it, expect } from 'vitest';
import { reconcileTransactions, OrderRecord, ProviderTransactionRecord } from './reconciliation';

describe('Daily Payment Reconciliation Engine', () => {
    const orders: OrderRecord[] = [
        {
            id: 'AFR-ORDER-001',
            amount: 1000,
            status: 'paid',
            numero_recu: 'REC-001',
            paid_at: '2026-10-21T00:00:00Z',
        },
        {
            id: 'AFR-ORDER-002',
            amount: 500,
            status: 'pending',
            numero_recu: null,
            paid_at: null,
        },
        {
            id: 'AFR-ORDER-003',
            amount: 1200,
            status: 'paid',
            numero_recu: 'REC-003',
            paid_at: '2026-10-21T01:00:00Z',
        },
    ];

    it('successfully matches synchronized settled transactions', () => {
        const providerTxs: ProviderTransactionRecord[] = [
            {
                id_facture: 'AFR-ORDER-001',
                montant: 1000,
                numero_recu: 'REC-001',
                id_transaction: 'TX-1',
                statut: 'success',
            },
            {
                id_facture: 'AFR-ORDER-003',
                montant: 1200,
                numero_recu: 'REC-003',
                id_transaction: 'TX-3',
                statut: 'success',
            },
        ];

        const report = reconcileTransactions(orders, providerTxs);
        expect(report.matchedCount).toBe(2);
        expect(report.matched.map((m) => m.orderId)).toContain('AFR-ORDER-001');
        expect(report.matched.map((m) => m.orderId)).toContain('AFR-ORDER-003');
        expect(report.discrepancies.length).toBe(0);
        expect(report.isBalanced).toBe(true);
    });

    it('detects amount discrepancy between order and provider settlement', () => {
        const singleOrderList: OrderRecord[] = [orders[0]];
        const providerTxs: ProviderTransactionRecord[] = [
            {
                id_facture: 'AFR-ORDER-001',
                montant: 900, // Discrepancy! Expected 1000
                numero_recu: 'REC-001',
                id_transaction: 'TX-1',
                statut: 'success',
            },
        ];

        const report = reconcileTransactions(singleOrderList, providerTxs);
        expect(report.discrepancies).toHaveLength(1);
        expect(report.discrepancies[0].type).toBe('AMOUNT_MISMATCH');
        expect(report.discrepancies[0].orderId).toBe('AFR-ORDER-001');
        expect(report.discrepancies[0].expectedAmount).toBe(1000);
        expect(report.discrepancies[0].actualAmount).toBe(900);
    });

    it('detects paid internal orders with missing bank confirmation (Ghost Orders)', () => {
        const providerTxs: ProviderTransactionRecord[] = []; // No provider record for order 001 or 003

        const report = reconcileTransactions(orders, providerTxs);
        const ghostOrders = report.discrepancies.filter((d) => d.type === 'MISSING_PROVIDER_RECORD');
        expect(ghostOrders.length).toBe(2); // Order 001 and 003
    });

    it('detects unfulfilled orders where bank captured payment but order remains pending', () => {
        const providerTxs: ProviderTransactionRecord[] = [
            {
                id_facture: 'AFR-ORDER-002', // internal status is 'pending'
                montant: 500,
                numero_recu: 'REC-002',
                id_transaction: 'TX-2',
                statut: 'success',
            },
        ];

        const report = reconcileTransactions(orders, providerTxs);
        const unfulfilled = report.discrepancies.filter((d) => d.type === 'UNFULFILLED_CAPTURED_PAYMENT');
        expect(unfulfilled).toHaveLength(1);
        expect(unfulfilled[0].orderId).toBe('AFR-ORDER-002');
    });

    it('detects duplicate receipt numbers across multiple provider transactions', () => {
        const providerTxs: ProviderTransactionRecord[] = [
            {
                id_facture: 'AFR-ORDER-001',
                montant: 1000,
                numero_recu: 'REC-DUPLICATE-999',
                id_transaction: 'TX-1',
                statut: 'success',
            },
            {
                id_facture: 'AFR-ORDER-999',
                montant: 1000,
                numero_recu: 'REC-DUPLICATE-999',
                id_transaction: 'TX-2',
                statut: 'success',
            },
        ];

        const report = reconcileTransactions(orders, providerTxs);
        const duplicateReceipts = report.discrepancies.filter((d) => d.type === 'DUPLICATE_RECEIPT_COLLISION');
        expect(duplicateReceipts.length).toBeGreaterThanOrEqual(1);
    });
});
