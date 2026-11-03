import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';

vi.mock('@/i18n/routing', () => ({
    Link: ({ href, children, ...props }: any) => <a href={href} {...props}>{children}</a>,
    useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
    usePathname: () => '/admin/dashboard',
}));

import DashboardPage from './page';

vi.mock('@/context/LanguageContext', () => ({
    useLanguage: () => ({
        t: {
            admin: {
                dashboard: {
                    title: 'لوحة التحكم',
                    subtitle: 'نظرة عامة',
                    viewSite: 'عرض الموقع',
                    loadError: 'خطأ',
                    statFiles: 'الملفات',
                    statNewMessages: 'رسائل جديدة',
                    publishingTitle: 'النشر السريع',
                    publishingDesc: 'كل تعديل يظهر مباشرة',
                    latestMessages: 'أحدث الرسائل',
                    viewAll: 'عرض الكل',
                    lastUpdates: 'آخر التحديثات',
                    noMessages: 'لا توجد رسائل',
                    noUpdates: 'لا توجد تحديثات',
                },
                menu: {
                    achievements: 'أعمالنا',
                    about: 'من نحن',
                    vision: 'فلسفتنا',
                    services: 'خدماتنا',
                    trusted: 'شركاء النجاح',
                    contact: 'تواصل معنا',
                    files: 'الملفات',
                },
                biz: {
                    finance: {
                        title: 'المالية',
                        income: 'المقبوضات',
                        expenses: 'المصاريف',
                        receivable: 'المستحقات',
                    },
                    currency: 'MRU',
                    menu: {
                        finance: 'المالية',
                    },
                },
            },
        },
        language: 'ar',
        isRTL: true,
    }),
}));

vi.mock('@/components/admin/AdminSession', () => ({
    useAdminSession: () => ({
        user: { id: 'admin-1', role: 'admin', email: 'admin@afrikyia.com' },
        areas: ['dashboard', 'publishing', 'messages', 'finance', 'users'],
    }),
}));

describe('Admin Dashboard Page with Social Accounts Option', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch = vi.fn().mockImplementation((url: string) => {
            if (url.includes('/api/admin/overview')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({
                        counts: { achievements: 5, projects: 3, files: 10, newMessages: 2 },
                        sectionUpdates: [],
                        latestMessages: [],
                    }),
                });
            }
            if (url.includes('/api/biz/summary')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({ income: 50000, expenses: 20000, receivable: 10000 }),
                });
            }
            if (url.includes('/api/admin/socials')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({
                        accounts: [
                            {
                                id: 'soc-fb',
                                platform: 'facebook',
                                url: 'https://facebook.com/afrikyia',
                                handle: 'AFRIKYIA',
                                label: 'Facebook',
                                isActive: true,
                                order: 1,
                            },
                        ],
                    }),
                });
            }
            return Promise.resolve({ ok: true, json: async () => ({}) });
        });
    });

    it('renders the dashboard with quick links including social accounts', async () => {
        render(<DashboardPage />);
        expect(await screen.findByText('لوحة التحكم')).toBeInTheDocument();
        expect(screen.getByText('الحسابات الاجتماعية')).toBeInTheDocument();
    });

    it('renders the social accounts manager section with add/edit/delete options on the dashboard', async () => {
        render(<DashboardPage />);
        // The social accounts manager should load and display accounts
        expect(await screen.findByText('الحسابات الاجتماعية للشركة')).toBeInTheDocument();
        expect(await screen.findByText('إضافة حساب')).toBeInTheDocument();
        expect(await screen.findByText('AFRIKYIA')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /حذف/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /تعديل/i })).toBeInTheDocument();
    });
});
