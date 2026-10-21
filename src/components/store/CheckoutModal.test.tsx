import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import CheckoutModal from './CheckoutModal';
import { getProduct } from '@/data/catalog';

describe('CheckoutModal Component', () => {
    it('renders modal with product details when open', () => {
        const product = getProduct('sanad')!;
        render(
            <CheckoutModal
                isOpen={true}
                product={product}
                onClose={vi.fn()}
            />
        );

        expect(screen.getByText('سند')).toBeDefined();
        expect(screen.getByText(/1,000/)).toBeDefined();
        expect(screen.getByPlaceholderText(/الاسم الكامل/i)).toBeDefined();
        expect(screen.getByPlaceholderText(/رقم الهاتف/i)).toBeDefined();
    });

    it('renders device and period variant selectors for DIFTAR', () => {
        const product = getProduct('diftar')!;
        render(
            <CheckoutModal
                isOpen={true}
                product={product}
                onClose={vi.fn()}
            />
        );

        expect(screen.getByText('دفتر')).toBeDefined();
        expect(screen.getAllByText(/جهاز واحد/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/شهري/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/سنوي/i).length).toBeGreaterThan(0);
    });

    it('validates customer input before submitting payment', async () => {
        const product = getProduct('sanad')!;
        render(
            <CheckoutModal
                isOpen={true}
                product={product}
                onClose={vi.fn()}
            />
        );

        const submitBtn = screen.getByRole('button', { name: /تأكيد والطلب/i });
        fireEvent.click(submitBtn);

        // Validation messages appear
        await waitFor(() => {
            expect(screen.getByText(/يرجى إدخال الاسم/i)).toBeDefined();
        });
    });
});
