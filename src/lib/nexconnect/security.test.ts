import { describe, it, expect } from 'vitest';
import { 
    timingSafeSecretMatch, 
    verifyTimingSafeWebhookAuth, 
    calculatePayloadHash, 
    validateAmountMatch 
} from './security';

describe('Payment Webhook Security Utilities (Constant-Time & Hardening)', () => {
    const validSecret = 'amkEsKSS.ILbUR5XFS54kmAtaFpy5F8sZU2miACQc';

    describe('timingSafeSecretMatch', () => {
        it('returns true for exact matching secrets', () => {
            expect(timingSafeSecretMatch(validSecret, validSecret)).toBe(true);
        });

        it('returns false for mismatched secrets of equal length', () => {
            const tampered = validSecret.slice(0, -1) + 'X';
            expect(timingSafeSecretMatch(tampered, validSecret)).toBe(false);
        });

        it('returns false for mismatched secrets of different lengths without throwing', () => {
            expect(timingSafeSecretMatch('short', validSecret)).toBe(false);
            expect(timingSafeSecretMatch(validSecret + 'extra', validSecret)).toBe(false);
        });

        it('returns false when either secret is empty', () => {
            expect(timingSafeSecretMatch('', validSecret)).toBe(false);
            expect(timingSafeSecretMatch(validSecret, '')).toBe(false);
        });
    });

    describe('verifyTimingSafeWebhookAuth', () => {
        it('accepts valid Api-Key header in standard format', () => {
            const header = `Api-Key ${validSecret}`;
            expect(verifyTimingSafeWebhookAuth(header, validSecret)).toBe(true);
        });

        it('accepts valid Api-Key header case-insensitively', () => {
            const header = `api-key ${validSecret}`;
            expect(verifyTimingSafeWebhookAuth(header, validSecret)).toBe(true);
        });

        it('rejects tampered or forged Api-Key header', () => {
            const forgedHeader = 'Api-Key forged.token.here';
            expect(verifyTimingSafeWebhookAuth(forgedHeader, validSecret)).toBe(false);
        });

        it('rejects missing or malformed header formats', () => {
            expect(verifyTimingSafeWebhookAuth(null, validSecret)).toBe(false);
            expect(verifyTimingSafeWebhookAuth(undefined, validSecret)).toBe(false);
            expect(verifyTimingSafeWebhookAuth('Bearer invalid', validSecret)).toBe(false);
            expect(verifyTimingSafeWebhookAuth('Api-Key', validSecret)).toBe(false);
        });
    });

    describe('calculatePayloadHash', () => {
        it('generates deterministic SHA-256 hash of payload', () => {
            const payload = { id: 123, amount: 1000 };
            const hash1 = calculatePayloadHash(payload);
            const hash2 = calculatePayloadHash(payload);
            expect(hash1).toHaveLength(64);
            expect(hash1).toBe(hash2);
        });
    });

    describe('validateAmountMatch', () => {
        it('returns true when expected and received amounts match exactly', () => {
            expect(validateAmountMatch(1000, 1000)).toBe(true);
            expect(validateAmountMatch(16500, 16500)).toBe(true);
        });

        it('returns false when received amount differs from expected order amount', () => {
            expect(validateAmountMatch(1000, 100)).toBe(false);
            expect(validateAmountMatch(1000, 1001)).toBe(false);
            expect(validateAmountMatch(1000, -1000)).toBe(false);
        });

        it('handles floating point tolerances safely', () => {
            expect(validateAmountMatch(1000.00, 1000)).toBe(true);
            expect(validateAmountMatch(1000.001, 1000)).toBe(true);
            expect(validateAmountMatch(1000.05, 1000)).toBe(false);
        });
    });
});
