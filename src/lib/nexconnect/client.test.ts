import { describe, it, expect } from 'vitest';
import { 
    buildPaymentRequestPayload, 
    getNexConnectHeaders, 
    verifyWebhookAuth, 
    parsePaymentResponse,
    generateInvoiceId,
    type PaymentRequestParams
} from './client';

describe('NexConnect Client & Request Builders', () => {
    const validParams: PaymentRequestParams = {
        invoiceId: 'AFR-2026-0001',
        amount: 1000,
        payerName: 'Ahmed Mahmoud',
        payerPhone: '22244112233',
        codeAbonnement: 'ba60ee21-2944-4f22-818e-de75470a7c4e',
        note: 'SANAD Lifetime License',
    };

    it('generates compliant invoice IDs with at least 8 characters', () => {
        const id1 = generateInvoiceId('diftar');
        const id2 = generateInvoiceId('sanad');

        expect(id1.length).toBeGreaterThanOrEqual(8);
        expect(id2.length).toBeGreaterThanOrEqual(8);
        expect(id1).toMatch(/^AFR-/);
        expect(id2).toMatch(/^AFR-/);
        expect(id1).not.toEqual(id2);
    });

    it('builds compliant /demande_paiement payload', () => {
        const payload = buildPaymentRequestPayload(validParams);

        expect(payload.id_facture).toBe('AFR-2026-0001');
        expect(payload.montant).toBe(1000);
        expect(payload.nom_payeur).toBe('Ahmed Mahmoud');
        expect(payload.telephone_payeur).toBe('22244112233');
        expect(payload.code_abonnement).toBe('ba60ee21-2944-4f22-818e-de75470a7c4e');
        expect(payload.remarque).toBe('SANAD Lifetime License');
        expect(payload.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('enforces that id_facture must be at least 8 characters long', () => {
        expect(() => {
            buildPaymentRequestPayload({
                ...validParams,
                invoiceId: 'SHORT',
            });
        }).toThrow('invoiceId must be at least 8 characters long');
    });

    it('enforces positive amounts and valid phone numbers', () => {
        expect(() => {
            buildPaymentRequestPayload({
                ...validParams,
                amount: 0,
            });
        }).toThrow('amount must be greater than zero');

        expect(() => {
            buildPaymentRequestPayload({
                ...validParams,
                payerPhone: '12',
            });
        }).toThrow('Invalid phone number format');
    });

    it('formats authorization headers with Api-Key prefix', () => {
        const headers = getNexConnectHeaders('amkEsKSS.ILbUR5XFS54kmAtaFpy5F8sZU2miACQc');

        expect(headers['Authorization']).toBe('Api-Key amkEsKSS.ILbUR5XFS54kmAtaFpy5F8sZU2miACQc');
        expect(headers['Content-Type']).toBe('application/json');
    });

    it('verifies incoming webhook authorization correctly', () => {
        const secret = 'amkEsKSS.ILbUR5XFS54kmAtaFpy5F8sZU2miACQc';

        // Valid headers
        expect(verifyWebhookAuth('Api-Key amkEsKSS.ILbUR5XFS54kmAtaFpy5F8sZU2miACQc', secret)).toBe(true);
        expect(verifyWebhookAuth('api-key amkEsKSS.ILbUR5XFS54kmAtaFpy5F8sZU2miACQc', secret)).toBe(true);

        // Invalid headers
        expect(verifyWebhookAuth('Api-Key wrong-key', secret)).toBe(false);
        expect(verifyWebhookAuth(null, secret)).toBe(false);
        expect(verifyWebhookAuth('', secret)).toBe(false);
        expect(verifyWebhookAuth('Bearer token', secret)).toBe(false);
    });

    it('parses successful payment initiation responses', () => {
        const mockResponse = {
            status: 200,
            Message: 'Facture enregistrée',
            data: {
                code_paiement: '849201',
                id_facture: 'AFR-2026-0001',
                type: 'Wallet',
            },
        };

        const result = parsePaymentResponse(mockResponse);
        expect(result.success).toBe(true);
        expect(result.paymentCode).toBe('849201');
        expect(result.invoiceId).toBe('AFR-2026-0001');
    });

    it('parses error responses properly', () => {
        const mockErrorResponse = {
            status: 400,
            Message: 'Abonnement invalide',
        };

        const result = parsePaymentResponse(mockErrorResponse);
        expect(result.success).toBe(false);
        expect(result.error).toBe('Abonnement invalide');
    });
});
