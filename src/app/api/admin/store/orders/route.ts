import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAccess } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const gate = await requireAccess(request, 'finance');
    if (gate.denied) return gate.denied;

    const { data: orders, error } = await supabaseAdmin
        .from('store_orders')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    type OrderRow = {
        status?: string | null;
        amount_mru?: number | null;
        product_id?: string | null;
    };

    const orderList = (orders || []) as OrderRow[];
    
    // Calculate aggregate summary metrics
    const paidOrders = orderList.filter(o => o.status === 'paid');
    const totalRevenue = paidOrders.reduce((sum: number, o) => sum + (Number(o.amount_mru) || 0), 0);
    const paidOrdersCount = paidOrders.length;
    const pendingOrdersCount = orderList.filter(o => o.status === 'pending').length;

    // Per-product revenue breakdown
    const productStats = orderList.reduce((acc: Record<string, { count: number; revenue: number }>, o) => {
        const prod = o.product_id || 'unknown';
        if (!acc[prod]) acc[prod] = { count: 0, revenue: 0 };
        if (o.status === 'paid') {
            acc[prod].count += 1;
            acc[prod].revenue += Number(o.amount_mru) || 0;
        }
        return acc;
    }, {});

    return NextResponse.json({
        orders: orderList,
        stats: {
            totalRevenue,
            paidOrdersCount,
            pendingOrdersCount,
            productStats,
        },
    });
}
