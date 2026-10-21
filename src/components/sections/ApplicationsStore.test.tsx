import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import Applications from './Applications';
import { NextIntlClientProvider } from 'next-intl';

describe('Applications Section Store Integration', () => {
    it('renders purchase action buttons for SANAD and DIFTAR', () => {
        render(
            <NextIntlClientProvider locale="ar" messages={{}}>
                <Applications />
            </NextIntlClientProvider>
        );

        // Check for buy/subscription buttons
        expect(screen.getByRole('button', { name: /شراء ترخيص دائم/i })).toBeDefined();
        expect(screen.getByRole('button', { name: /اشتراك واختيار الباقة/i })).toBeDefined();

        // Check for preview/open links
        expect(screen.getByRole('link', { name: /فتح تطبيق البت/i })).toBeDefined();
        expect(screen.getByRole('link', { name: /فتح تطبيق بديلة/i })).toBeDefined();
    });
});
