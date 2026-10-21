import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const idFacture = searchParams.get('id_facture');

        if (!idFacture) {
            return NextResponse.json(
                { code: 400, message: 'Missing required query parameter: id_facture' },
                { status: 400 }
            );
        }

        const { data: order } = await supabaseAdmin
            .from('store_orders')
            .select('status')
            .eq('id', idFacture)
            .single();

        if (order && order.status === 'paid') {
            return NextResponse.json({ statut: 'paye' });
        }

        return NextResponse.json({ statut: 'non_paye' });

    } catch (err: unknown) {
        console.error('[webhook/verification] Error:', err);
        return NextResponse.json(
            { code: 500, message: 'Erreur interne' },
            { status: 500 }
        );
    }
}
