import { NextResponse } from 'next/server';
import { loadSocialAccounts } from '@/lib/socialsStore';

export const dynamic = 'force-dynamic';

// Public GET: Return active social links for Afrikyia
export async function GET() {
    try {
        const all = await loadSocialAccounts();
        const active = (all || [])
            .filter(a => a.isActive)
            .sort((a, b) => a.order - b.order);

        return NextResponse.json(
            { socials: active },
            {
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
                    'CDN-Cache-Control': 'no-store',
                    'Vercel-CDN-Cache-Control': 'no-store',
                },
            }
        );
    } catch (e) {
        console.error('Error fetching public socials:', e);
        return NextResponse.json({ socials: [] }, { status: 200 });
    }
}

