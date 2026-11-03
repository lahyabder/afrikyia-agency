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
                    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
                },
            }
        );
    } catch (e) {
        console.error('Error fetching public socials:', e);
        return NextResponse.json({ socials: [] }, { status: 200 });
    }
}

