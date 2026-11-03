import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { WhatsappIcon } from './WhatsappIcon';
import { getPlatformIcon } from '@/components/admin/SocialAccountsManager';

describe('WhatsappIcon Component', () => {
    it('renders SVG with WhatsApp icon path', () => {
        const { container } = render(<WhatsappIcon className="w-5 h-5 text-emerald-500" />);
        const svg = container.querySelector('svg');
        expect(svg).toBeInTheDocument();
        expect(svg).toHaveClass('w-5', 'h-5', 'text-emerald-500');
        const path = container.querySelector('path');
        expect(path).toBeInTheDocument();
        expect(path?.getAttribute('d')).toContain('17.472');
    });

    it('getPlatformIcon returns WhatsappIcon for whatsapp platform', () => {
        const icon = getPlatformIcon('whatsapp', 'w-6 h-6');
        const { container } = render(icon);
        const svg = container.querySelector('svg');
        expect(svg).toBeInTheDocument();
        expect(svg).toHaveClass('w-6', 'h-6');
    });
});

