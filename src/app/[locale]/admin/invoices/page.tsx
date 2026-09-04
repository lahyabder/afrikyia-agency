"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

type Invoice = {
    id: string;
    ref: string;
    clientName: string;
    clientAddress: string;
    date: string;
    netAmount: number;
    vatAmount: number;
    totalAmount: number;
    status: 'paid' | 'unpaid' | 'overdue';
    description: string;
};

export default function InvoicesPage() {
    const { t, isRTL } = useLanguage();
    const [invoices, setInvoices] = useState<Invoice[]>([]);

    useEffect(() => {
        // Load from local storage for now
        const load = () => {
            try {
                const data = localStorage.getItem('afrikyia-invoices');
                if (data) {
                    setInvoices(JSON.parse(data));
                } else {
                    // Mock data
                    const mockData: Invoice[] = [];
                    setInvoices(mockData);
                }
            } catch(e) {}
        };
        load();
    }, []);

    const handleDelete = (id: string) => {
        if (confirm('Are you sure? / هل أنت متأكد؟ / Êtes-vous sûr ?')) {
            const updated = invoices.filter(i => i.id !== id);
            setInvoices(updated);
            localStorage.setItem('afrikyia-invoices', JSON.stringify(updated));
        }
    };

    const getStatusBadge = (status: string) => {
        switch(status) {
            case 'paid': return <span className="bg-emerald-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">{t.admin.common.paid}</span>;
            case 'unpaid': return <span className="bg-white/10 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">{t.admin.common.unpaid}</span>;
            case 'overdue': return <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">{t.admin.common.overdue}</span>;
            default: return null;
        }
    };

    return (
        <div className="space-y-6 animate-fade-in text-white" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Header */}
            <div className={`flex justify-between items-center border-b border-white/5 pb-4 ${isRTL ? 'flex-row' : 'flex-row'}`}>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    {t.admin.invoices.title || 'النظام المحاسبي (الفواتير)'}
                </h1>
                <Link 
                    href="/admin/invoices/new"
                    className="bg-brand-red hover:bg-brand-red/90 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-brand-red/20"
                >
                    {t.admin.invoices.addInvoice || 'إضافة فاتورة جديدة'}
                </Link>
            </div>

            {/* List */}
            <div className="space-y-4">
                {invoices.length === 0 ? (
                    <div className="text-center py-12 text-white/60 bg-[#1a1a1a] rounded-2xl border border-white/5">لا توجد فواتير مسجلة بعد.</div>
                ) : (
                    invoices.map((invoice, i) => (
                        <motion.div 
                            key={invoice.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-white/10 transition-all"
                        >
                            <div className={`flex flex-col gap-3 w-full md:w-auto ${isRTL ? 'text-right' : 'text-left'}`}>
                                <div className={`flex items-center gap-3 mb-1 ${isRTL ? 'justify-start' : 'justify-start'}`}>
                                    <span className="font-bold text-lg text-brand-red">{invoice.ref}</span>
                                    {getStatusBadge(invoice.status)}
                                    <span className="text-white/40 text-xs px-2 border-r border-white/10">{invoice.date}</span>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mt-2">
                                    <div>
                                        <div className="text-white/40 text-[10px] uppercase tracking-wider mb-1">اسم العميل</div>
                                        <div className="text-white/90 text-sm font-semibold">{invoice.clientName}</div>
                                    </div>
                                    {invoice.clientAddress && (
                                        <div>
                                            <div className="text-white/40 text-[10px] uppercase tracking-wider mb-1">عنوان العميل</div>
                                            <div className="text-white/70 text-sm truncate max-w-[200px]">{invoice.clientAddress}</div>
                                        </div>
                                    )}
                                    {invoice.description && (
                                        <div className="md:col-span-2">
                                            <div className="text-white/40 text-[10px] uppercase tracking-wider mb-1">طبيعة الخدمة</div>
                                            <div className="text-white/70 text-sm line-clamp-1">{invoice.description}</div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Actions & Amount side */}
                            <div className={`flex flex-col gap-4 w-full md:w-auto ${isRTL ? 'items-start md:items-end' : 'items-start md:items-end'} bg-black/30 p-4 rounded-xl border border-white/5`}>
                                <div className="w-full space-y-1">
                                    <div className="flex justify-between items-center gap-8 text-sm">
                                        <span className="text-white/50">المبلغ الصافي:</span>
                                        <span className="font-mono">{invoice.netAmount?.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center gap-8 text-sm">
                                        <span className="text-white/50">الضريبة (16%):</span>
                                        <span className="font-mono text-amber-400/80">{invoice.vatAmount?.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center gap-8 text-base font-bold pt-2 border-t border-white/10 mt-2">
                                        <span className="text-white/80">الإجمالي:</span>
                                        <span className="font-mono text-emerald-400">{invoice.totalAmount?.toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className={`flex gap-2 w-full mt-2 ${isRTL ? 'justify-end' : 'justify-end'}`}>
                                    <button onClick={() => handleDelete(invoice.id)} className="bg-red-500/10 hover:bg-red-500/20 text-red-500 px-4 py-2 rounded-lg text-xs font-bold transition-all w-full md:w-auto text-center">
                                        {t.admin.common.delete}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
