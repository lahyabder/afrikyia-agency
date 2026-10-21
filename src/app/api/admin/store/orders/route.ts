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
        console.warn('[admin/store/orders] Supabase table notice:', error.message);
        return NextResponse.json({
            orders: [],
            stats: {
                totalRevenue: 0,
                paidOrdersCount: 0,
                pendingOrdersCount: 0,
                productStats: {},
            },
            notice: 'لم يتم إنشاء جدول الطلبات store_orders في قاعدة البيانات بعد. يرجى تنفيذ سكربت scripts/create-tables.sql في Supabase.',
        });
    }

    type OrderRow = {
        id?: string;
        invoice_id?: string;
        status?: string | null;
        amount?: number | null;
        amount_mru?: number | null;
        product_id?: string | null;
        customer_name?: string | null;
        customer_phone?: string | null;
        customer_email?: string | null;
        payment_method?: string | null;
        numero_recu?: string | null;
        created_at?: string | null;
    };

    const rawList = (orders || []) as OrderRow[];
    const orderList = rawList.map(o => ({
        ...o,
        id: o.id || o.invoice_id || '',
        invoice_id: o.invoice_id || o.id || '',
        amount_mru: Number(o.amount_mru ?? o.amount ?? 0),
    }));
    
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
