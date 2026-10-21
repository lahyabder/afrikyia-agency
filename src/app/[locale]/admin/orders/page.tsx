"use client";

import { Suspense, useEffect, useState, useMemo } from 'react';
import { 
    ShoppingBag, 
    Search, 
    RefreshCw, 
    Download, 
    CheckCircle2, 
    Clock, 
    Wallet, 
    ArrowUpRight,
    Smartphone,
    ExternalLink
} from 'lucide-react';
import { PageHeader, ErrorBox, inputClass, ghostBtn, primaryBtn, useBiz } from '@/components/admin/biz/ui';

type StoreOrder = {
    id: string;
    invoice_id: string;
    product_id: string;
    plan_id?: string | null;
    devices_count?: number | null;
    period?: string | null;
    amount_mru: number;
    customer_phone: string;
    customer_name?: string | null;
    customer_email?: string | null;
    payment_method?: string | null;
    status: 'pending' | 'paid' | 'failed' | 'cancelled';
    numero_recu?: string | null;
    payment_meta?: any;
    created_at: string;
};

type OrderStats = {
    totalRevenue: number;
    paidOrdersCount: number;
    pendingOrdersCount: number;
    productStats: Record<string, { count: number; revenue: number }>;
};

export default function StoreOrdersPage() {
    return (
        <Suspense fallback={<div className="p-8 text-white/50">جاري التحميل...</div>}>
            <OrdersMonitor />
        </Suspense>
    );
}

function OrdersMonitor() {
    const { isRTL, formatMoney, formatDate } = useBiz();
    const [orders, setOrders] = useState<StoreOrder[]>([]);
    const [stats, setStats] = useState<OrderStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [search, setSearch] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<'all' | 'paid' | 'pending'>('all');
    const [selectedProduct, setSelectedProduct] = useState<'all' | 'sanad' | 'diftar'>('all');

    const loadData = async () => {
        setLoading(true);
        setError('');
        setNotice('');
        try {
            const res = await fetch('/api/admin/store/orders', { cache: 'no-store' });
            if (!res.ok) throw new Error('فشل تحميل بيانات الطلبات');
            const data = await res.json();
            setOrders(data.orders || []);
            setStats(data.stats || null);
            if (data.notice) setNotice(data.notice);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'حدث خطأ أثناء الاتصال بالخادم';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Filtered orders
    const filteredOrders = useMemo(() => {
        return orders.filter(o => {
            const matchesStatus = selectedStatus === 'all' || o.status === selectedStatus;
            const matchesProduct = selectedProduct === 'all' || o.product_id === selectedProduct;
            const q = search.trim().toLowerCase();
            const matchesSearch = !q || [
                o.invoice_id,
                o.customer_name,
                o.customer_phone,
                o.numero_recu,
                o.product_id
            ].some(v => v?.toLowerCase().includes(q));

            return matchesStatus && matchesProduct && matchesSearch;
        });
    }, [orders, selectedStatus, selectedProduct, search]);

    // Export CSV
    const exportCSV = () => {
        const headers = ['رقم الفاتورة', 'التاريخ', 'العميل', 'الهاتف', 'المنتج', 'المبلغ (أوقية)', 'الحالة', 'وسيلة الدفع', 'رقم الإشعار'];
        const rows = filteredOrders.map(o => [
            o.invoice_id,
            new Date(o.created_at).toLocaleDateString(),
            o.customer_name || '—',
            o.customer_phone,
            o.product_id,
            o.amount_mru,
            o.status,
            o.payment_method || '—',
            o.numero_recu || '—'
        ]);

        const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].map(e => e.join(',')).join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `afrikyia-store-orders-${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getProductName = (order: StoreOrder) => {
        if (order.product_id === 'sanad') {
            return isRTL ? 'تطبيق سند (ترخيص دائم)' : 'Sanad (Licence à vie)';
        }
        if (order.product_id === 'diftar') {
            const devs = order.devices_count ? `${order.devices_count} أجهزة` : '';
            const periodStr = order.period === 'yearly' ? (isRTL ? 'سنوي' : 'Annuel') : (isRTL ? 'شهري' : 'Mensuel');
            return `${isRTL ? 'تطبيق دفتر' : 'Diftar'} (${devs} - ${periodStr})`;
        }
        return order.product_id;
    };

    return (
        <div className="space-y-6">
            <PageHeader 
                title={isRTL ? 'مبيعات المتجر الرقمي' : 'Ventes Boutique Digitale'} 
                subtitle={isRTL ? 'لوحة مراقبة المداخيل، التراخيص المباعة، وعمليات الدفع عبر NexConnect' : 'Suivi des revenus, licences vendues et paiements NexConnect'}
            >
                <button 
                    onClick={loadData} 
                    disabled={loading}
                    className={ghostBtn}
                    title="تحديث"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    <span>{isRTL ? 'تحديث' : 'Actualiser'}</span>
                </button>
                <button 
                    onClick={exportCSV} 
                    disabled={filteredOrders.length === 0}
                    className={primaryBtn}
                >
                    <Download className="w-4 h-4" />
                    <span>{isRTL ? 'تصدير كشف Excel' : 'Exporter CSV'}</span>
                </button>
            </PageHeader>

            <ErrorBox message={error} />

            {notice && (
                <div className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-300">
                    <Clock className="w-5 h-5 shrink-0 text-amber-400" />
                    <span>{notice}</span>
                </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Revenue */}
                <div className="bg-[#121212] border border-white/10 rounded-2xl p-5 relative overflow-hidden">
                    <div className="flex items-center justify-between text-white/60 mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider">
                            {isRTL ? 'إجمالي المداخيل المحققة' : 'Revenu Total Encaissé'}
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                            <Wallet className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-2xl lg:text-3xl font-black text-white">
                        {stats ? formatMoney(stats.totalRevenue) : '0 MRU'}
                    </div>
                    <div className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        <span>{isRTL ? 'مؤكد في الحساب البنكي' : 'Confirmé en banque'}</span>
                    </div>
                </div>

                {/* Paid Orders */}
                <div className="bg-[#121212] border border-white/10 rounded-2xl p-5 relative overflow-hidden">
                    <div className="flex items-center justify-between text-white/60 mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider">
                            {isRTL ? 'طلبات مدفوعة ومكتملة' : 'Commandes Payées'}
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-2xl lg:text-3xl font-black text-white">
                        {stats?.paidOrdersCount ?? 0}
                    </div>
                    <div className="text-xs text-slate-400 mt-2">
                        {isRTL ? 'تم إصدار رخصها وإرسالها' : 'Licences délivrées'}
                    </div>
                </div>

                {/* Pending Invoices */}
                <div className="bg-[#121212] border border-white/10 rounded-2xl p-5 relative overflow-hidden">
                    <div className="flex items-center justify-between text-white/60 mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider">
                            {isRTL ? 'فواتير قيد الدفع' : 'En attente de paiement'}
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                            <Clock className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-2xl lg:text-3xl font-black text-white">
                        {stats?.pendingOrdersCount ?? 0}
                    </div>
                    <div className="text-xs text-amber-400/80 mt-2">
                        {isRTL ? 'بانتظار إتمام العميل للدفع' : 'En attente validation'}
                    </div>
                </div>

                {/* Product Distribution */}
                <div className="bg-[#121212] border border-white/10 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
                    <div className="text-xs font-bold uppercase tracking-wider text-white/60 mb-2">
                        {isRTL ? 'توزيع المبيعات' : 'Par Produit'}
                    </div>
                    <div className="space-y-1.5 text-xs text-white">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400">سند (SANAD):</span>
                            <span className="font-bold font-mono">
                                {stats?.productStats?.sanad?.count ?? 0} ({formatMoney(stats?.productStats?.sanad?.revenue ?? 0)})
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400">دفتر (DIFTAR):</span>
                            <span className="font-bold font-mono">
                                {stats?.productStats?.diftar?.count ?? 0} ({formatMoney(stats?.productStats?.diftar?.revenue ?? 0)})
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter and Search Controls */}
            <div className="bg-[#121212] border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-80">
                    <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 ${isRTL ? 'right-3' : 'left-3'}`} />
                    <input 
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={isRTL ? 'بحث برقم الفاتورة، الهاتف، أو الوصل...' : 'Recherche par facture, tél...'}
                        className={`${inputClass} ${isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'}`}
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
                    {/* Status Tabs */}
                    <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 shrink-0">
                        <button
                            onClick={() => setSelectedStatus('all')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${selectedStatus === 'all' ? 'bg-white/15 text-white' : 'text-white/50 hover:text-white'}`}
                        >
                            {isRTL ? 'الكل' : 'Tous'}
                        </button>
                        <button
                            onClick={() => setSelectedStatus('paid')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${selectedStatus === 'paid' ? 'bg-emerald-500/20 text-emerald-400' : 'text-white/50 hover:text-white'}`}
                        >
                            {isRTL ? 'المدفوعة' : 'Payées'}
                        </button>
                        <button
                            onClick={() => setSelectedStatus('pending')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${selectedStatus === 'pending' ? 'bg-amber-500/20 text-amber-400' : 'text-white/50 hover:text-white'}`}
                        >
                            {isRTL ? 'المعلقة' : 'En attente'}
                        </button>
                    </div>

                    {/* Product Tabs */}
                    <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 shrink-0">
                        <button
                            onClick={() => setSelectedProduct('all')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${selectedProduct === 'all' ? 'bg-white/15 text-white' : 'text-white/50 hover:text-white'}`}
                        >
                            {isRTL ? 'كافة المنتجات' : 'Tous produits'}
                        </button>
                        <button
                            onClick={() => setSelectedProduct('sanad')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${selectedProduct === 'sanad' ? 'bg-emerald-500/20 text-emerald-300' : 'text-white/50 hover:text-white'}`}
                        >
                            سند
                        </button>
                        <button
                            onClick={() => setSelectedProduct('diftar')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${selectedProduct === 'diftar' ? 'bg-blue-500/20 text-blue-300' : 'text-white/50 hover:text-white'}`}
                        >
                            دفتر
                        </button>
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-[#121212] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-right text-sm">
                        <thead className="bg-white/5 text-white/60 text-xs font-bold uppercase tracking-wider border-b border-white/10">
                            <tr>
                                <th className="p-4">{isRTL ? 'رقم الفاتورة' : 'N° Facture'}</th>
                                <th className="p-4">{isRTL ? 'العميل' : 'Client'}</th>
                                <th className="p-4">{isRTL ? 'المنتج' : 'Produit'}</th>
                                <th className="p-4">{isRTL ? 'المبلغ' : 'Montant'}</th>
                                <th className="p-4">{isRTL ? 'وسيلة الدفع' : 'Moyen'}</th>
                                <th className="p-4">{isRTL ? 'إشعار البنك' : 'Récépissé'}</th>
                                <th className="p-4">{isRTL ? 'الحالة' : 'Statut'}</th>
                                <th className="p-4">{isRTL ? 'التاريخ' : 'Date'}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="p-8 text-center text-white/50">
                                        جاري تحميل المبيعات...
                                    </td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="p-12 text-center text-white/40">
                                        {isRTL ? 'لا توجد طلبات مطابقة لمعايير البحث' : 'Aucune commande trouvée'}
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map(order => (
                                    <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="p-4 font-mono font-bold text-xs text-white">
                                            {order.invoice_id}
                                        </td>
                                        <td className="p-4">
                                            <div className="font-semibold text-white">
                                                {order.customer_name || 'عميل مباشر'}
                                            </div>
                                            <div className="text-xs text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                                                <Smartphone className="w-3 h-3 text-slate-500" />
                                                <span>{order.customer_phone}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-xs font-medium text-slate-300">
                                            {getProductName(order)}
                                        </td>
                                        <td className="p-4 font-mono font-bold text-white text-base">
                                            {formatMoney(order.amount_mru)}
                                        </td>
                                        <td className="p-4 text-xs font-medium">
                                            {order.payment_method ? (
                                                <span className="uppercase px-2 py-0.5 rounded bg-white/10 text-white/90 font-mono text-[11px]">
                                                    {order.payment_method}
                                                </span>
                                            ) : (
                                                <span className="text-white/40">—</span>
                                            )}
                                        </td>
                                        <td className="p-4 font-mono text-xs text-slate-400">
                                            {order.numero_recu ? (
                                                <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                                                    {order.numero_recu}
                                                </span>
                                            ) : (
                                                '—'
                                            )}
                                        </td>
                                        <td className="p-4">
                                            {order.status === 'paid' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    <span>{isRTL ? 'مدفوع' : 'Payé'}</span>
                                                </span>
                                            ) : order.status === 'pending' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    <span>{isRTL ? 'قيد الانتظار' : 'En attente'}</span>
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/30">
                                                    <span>{order.status}</span>
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-xs text-slate-400 whitespace-nowrap">
                                            {formatDate(order.created_at)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
