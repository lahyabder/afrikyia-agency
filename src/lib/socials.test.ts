import { describe, it, expect } from 'vitest';
import {
    DEFAULT_SOCIAL_ACCOUNTS,
    PLATFORM_METADATA,
    normalizeSocialAccount,
    normalizeSocialAccountsList,
    validateSocialAccount,
    type SocialAccount,
} from './socials';

describe('Company Social Accounts Model & Validation', () => {
    it('has sensible default social accounts for Afrikyia', () => {
        expect(DEFAULT_SOCIAL_ACCOUNTS.length).toBeGreaterThanOrEqual(2);
        const facebook = DEFAULT_SOCIAL_ACCOUNTS.find(a => a.platform === 'facebook');
        expect(facebook).toBeDefined();
        expect(facebook?.url).toContain('facebook.com');
        expect(facebook?.isActive).toBe(true);
    });

    it('provides metadata for supported platforms', () => {
        expect(PLATFORM_METADATA.facebook).toBeDefined();
        expect(PLATFORM_METADATA.tiktok).toBeDefined();
        expect(PLATFORM_METADATA.linkedin).toBeDefined();
        expect(PLATFORM_METADATA.x).toBeDefined();
        expect(PLATFORM_METADATA.instagram).toBeDefined();
        expect(PLATFORM_METADATA.youtube).toBeDefined();
        expect(PLATFORM_METADATA.whatsapp).toBeDefined();
        expect(PLATFORM_METADATA.github).toBeDefined();
    });

    describe('validateSocialAccount', () => {
        it('validates a correct social account', () => {
            const valid: Partial<SocialAccount> = {
                platform: 'facebook',
                url: 'https://facebook.com/afrikyia',
                handle: 'afrikyia',
            };
            const result = validateSocialAccount(valid);
            expect(result.valid).toBe(true);
            expect(Object.keys(result.errors).length).toBe(0);
        });

        it('accepts handle or domain without https:// and auto-formats it', () => {
            const resultTiktok = validateSocialAccount({
                platform: 'tiktok',
                url: 'tiktok.com/@myuser',
            });
            expect(resultTiktok.valid).toBe(true);

            const resultWwwTiktok = validateSocialAccount({
                platform: 'tiktok',
                url: 'www.tiktok.com/@afrikyai',
            });
            expect(resultWwwTiktok.valid).toBe(true);

            const resultHandle = validateSocialAccount({
                platform: 'tiktok',
                url: '@myuser',
            });
            expect(resultHandle.valid).toBe(true);
        });

        it('rejects missing or invalid platform', () => {
            const invalidPlatform = {
                platform: 'invalid-platform' as unknown as SocialPlatform,
                url: 'https://example.com',
            };
            const result = validateSocialAccount(invalidPlatform);
            expect(result.valid).toBe(false);
            expect(result.errors.platform).toBeDefined();
        });

        it('rejects missing or invalid url', () => {
            const invalidUrl = {
                platform: 'linkedin' as const,
                url: 'not-a-url',
            };
            const result = validateSocialAccount(invalidUrl);
            expect(result.valid).toBe(false);
            expect(result.errors.url).toBeDefined();
        });

        it('rejects javascript: or insecure pseudo-protocols in url', () => {
            const malicious = {
                platform: 'facebook' as const,
                url: 'javascript:alert(1)',
            };
            const result = validateSocialAccount(malicious);
            expect(result.valid).toBe(false);
            expect(result.errors.url).toBeDefined();
        });
    });

    describe('normalizeSocialAccount', () => {
        it('normalizes valid raw account data with defaults', () => {
            const raw = {
                id: 'custom-1',
                platform: 'tiktok',
                url: 'https://www.tiktok.com/@afrikyia',
                handle: '@afrikyia',
                isActive: true,
                order: 3,
            };
            const normalized = normalizeSocialAccount(raw);
            expect(normalized).toEqual({
                id: 'custom-1',
                platform: 'tiktok',
                url: 'https://www.tiktok.com/@afrikyia',
                handle: '@afrikyia',
                label: 'TikTok',
                isActive: true,
                order: 3,
            });
        });

        it('generates an id if missing', () => {
            const raw = {
                platform: 'github',
                url: 'https://github.com/afrikyia',
            };
            const normalized = normalizeSocialAccount(raw);
            expect(normalized?.id).toBeDefined();
            expect(normalized?.id.length).toBeGreaterThan(0);
            expect(normalized?.isActive).toBe(true);
            expect(normalized?.platform).toBe('github');
        });

        it('returns null for non-object or invalid input', () => {
            expect(normalizeSocialAccount(null)).toBeNull();
            expect(normalizeSocialAccount('not an object')).toBeNull();
            expect(normalizeSocialAccount({ platform: 'fake' })).toBeNull();
        });
    });

    describe('normalizeSocialAccountsList', () => {
        it('returns default accounts when input is not an array or empty', () => {
            expect(normalizeSocialAccountsList(null)).toEqual(DEFAULT_SOCIAL_ACCOUNTS);
            expect(normalizeSocialAccountsList([])).toEqual(DEFAULT_SOCIAL_ACCOUNTS);
            expect(normalizeSocialAccountsList('string')).toEqual(DEFAULT_SOCIAL_ACCOUNTS);
        });

        it('normalizes and sorts an array of accounts by order', () => {
            const raw = [
                { id: '2', platform: 'tiktok', url: 'https://tiktok.com/@af', order: 2 },
                { id: '1', platform: 'facebook', url: 'https://facebook.com/af', order: 1 },
                { id: 'invalid', platform: 'unknown', url: 'bad' },
            ];
            const list = normalizeSocialAccountsList(raw);
            expect(list.length).toBe(2);
            expect(list[0].id).toBe('1');
            expect(list[1].id).toBe('2');
        });
    });
});

