import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import Contact from './Contact';

// Mock LanguageContext
vi.mock('@/context/LanguageContext', () => ({
    useLanguage: () => ({
        t: {
            contact: {
                tag: 'تواصل معنا',
                title: 'لديك مشروع رقمي؟',
                desc: 'تواصل مع فريقنا الهندسي',
                name: 'الاسم الكامل',
                email: 'البريد الإلكتروني',
                phone: 'رقم الهاتف',
                projectType: 'نوع المشروع',
                message: 'تفاصيل المشروع',
                submit: 'إرسال الرسالة',
                submitting: 'جارٍ الإرسال...',
                successTitle: 'تم استلام رسالتك',
                successDesc: 'شكراً لتواصلك معنا',
                projectTypes: {},
            },
            home: {
                contact: {
                    emailLabel: 'البريد',
                    phoneLabel: 'الهاتف',
                    whatsappLabel: 'واتساب',
                    follow: 'تابعنا',
                },
            },
        },
        isRTL: true,
        language: 'ar',
    }),
}));

describe('Contact Section Socials Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('loads and renders dynamic social media accounts', async () => {
        global.fetch = vi.fn().mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                socials: [
                    {
                        id: 'soc-li',
                        platform: 'linkedin',
                        url: 'https://linkedin.com/company/afrikyia-digital',
                        label: 'LinkedIn',
                        isActive: true,
                        order: 1,
                    },
                    {
                        id: 'soc-gh',
                        platform: 'github',
                        url: 'https://github.com/afrikyia',
                        label: 'GitHub',
                        isActive: true,
                        order: 2,
                    },
                ],
            }),
        });

        render(<Contact />);

        await waitFor(() => {
            const linkedinLink = screen.getByRole('link', { name: /LinkedIn/i });
            expect(linkedinLink).toHaveAttribute('href', 'https://linkedin.com/company/afrikyia-digital');
            const githubLink = screen.getByRole('link', { name: /GitHub/i });
            expect(githubLink).toHaveAttribute('href', 'https://github.com/afrikyia');
        });
    });

    it('falls back to default socials if fetch fails', async () => {
        global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));

        render(<Contact />);

        await waitFor(() => {
            const facebookLink = screen.getByRole('link', { name: /Facebook/i });
            expect(facebookLink).toBeInTheDocument();
            expect(facebookLink).toHaveAttribute('href', expect.stringContaining('facebook.com'));
        });
    });
});

