import { describe, it, expect } from 'vitest';
import { SECURITY_HEADERS } from './securityHeaders';

describe('Security Headers Baseline', () => {
    it('defines Content-Security-Policy with strict origins', () => {
        const csp = SECURITY_HEADERS.find((h) => h.key === 'Content-Security-Policy');
        expect(csp).toBeDefined();
        expect(csp?.value).toContain("default-src 'self'");
        expect(csp?.value).toContain("frame-ancestors 'none'");
    });

    it('defines Strict-Transport-Security with HSTS preload', () => {
        const hsts = SECURITY_HEADERS.find((h) => h.key === 'Strict-Transport-Security');
        expect(hsts).toBeDefined();
        expect(hsts?.value).toContain('max-age=63072000');
        expect(hsts?.value).toContain('preload');
    });

    it('defines X-Content-Type-Options: nosniff', () => {
        const xcto = SECURITY_HEADERS.find((h) => h.key === 'X-Content-Type-Options');
        expect(xcto?.value).toBe('nosniff');
    });

    it('defines X-Frame-Options: DENY', () => {
        const xfo = SECURITY_HEADERS.find((h) => h.key === 'X-Frame-Options');
        expect(xfo?.value).toBe('DENY');
    });

    it('defines Referrer-Policy: strict-origin-when-cross-origin', () => {
        const rp = SECURITY_HEADERS.find((h) => h.key === 'Referrer-Policy');
        expect(rp?.value).toBe('strict-origin-when-cross-origin');
    });

    it('restricts camera and microphone in Permissions-Policy', () => {
        const pp = SECURITY_HEADERS.find((h) => h.key === 'Permissions-Policy');
        expect(pp?.value).toContain('camera=()');
        expect(pp?.value).toContain('microphone=()');
    });
});
