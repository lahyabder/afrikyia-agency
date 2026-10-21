import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import SecurityPage from './page';

let mockLanguage = 'ar';
let mockIsRTL = true;

vi.mock('@/context/LanguageContext', () => ({
    useLanguage: () => ({
        language: mockLanguage,
        isRTL: mockIsRTL,
        t: {
            footer: {
                security: 'الأمان والثقة',
            },
        },
    }),
}));

describe('Security & Trust Center Page', () => {
    beforeEach(() => {
        mockLanguage = 'ar';
        mockIsRTL = true;
    });

    it('renders the Arabic Security and Trust Center with required sections', () => {
        render(<SecurityPage />);

        // Badge & Title
        expect(screen.getByText('مركز الأمان والثقة الرقمية')).toBeDefined();
        expect(screen.getByText('الأمان، الشفافية، وحماية المعاملات المالية')).toBeDefined();

        // Sections
        expect(screen.getByText('نظرة عامة على الأمان المعماري')).toBeDefined();
        expect(screen.getByText('أمن المدفوعات والمحافظ الموريتانية')).toBeDefined();
        expect(screen.getByText('التدقيق الأمني المستقل والاختبارات')).toBeDefined();
        expect(screen.getByText('المعايير المرجعية المستخدمة')).toBeDefined();
        expect(screen.getByText('سياسة الإبلاغ المسؤول عن الثغرات')).toBeDefined();
        expect(screen.getByText('حالة النظام والمراقبة الحية')).toBeDefined();

        // Security Contact Email
        expect(screen.getByText('security@afrikyia.com')).toBeDefined();

        // Payment Security Features
        expect(screen.getByText(/التحقق ذو الزمن الثابت/)).toBeDefined();
        expect(screen.getByText(/حماية تماثل العمليات/)).toBeDefined();
    });

    it('renders the French version when language is fr', () => {
        mockLanguage = 'fr';
        mockIsRTL = false;

        render(<SecurityPage />);

        expect(screen.getByText('Centre de Sécurité & Confiance Numérique')).toBeDefined();
        expect(screen.getByText('Sécurité, Transparence et Intégrité Financière')).toBeDefined();
        expect(screen.getByText("Vue d'ensemble de l'architecture de sécurité")).toBeDefined();
        expect(screen.getByText('Sécurité des paiements et portefeuilles mauritaniens')).toBeDefined();
        expect(screen.getByText('security@afrikyia.com')).toBeDefined();
    });
});
