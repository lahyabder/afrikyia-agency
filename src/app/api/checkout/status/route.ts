import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const invoiceId = searchParams.get('invoiceId');

        if (!invoiceId) {
            return NextResponse.json(
                { error: 'invoiceId query parameter is required' },
                { status: 400 }
            );
        }

        const { data: order, error } = await supabaseAdmin
            .from('store_orders')
            .select('*')
            .eq('id', invoiceId)
            .single();

        if (error || !order) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        const isPaid = order.status === 'paid';

        return NextResponse.json({
            status: order.status,
            isPaid,
            invoiceId: order.id,
            productId: order.product_id,
            variantKey: order.variant_key,
            amount: order.amount,
            currency: order.currency,
            licenseKey: order.license_key,
            paidAt: order.paid_at,
        });

    } catch (err: unknown) {
        console.error('[checkout/status] Error:', err);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
