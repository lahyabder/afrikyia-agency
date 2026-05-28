"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

type Invoice = {
    id: string;
    ref: string;
    clientName: string;
    date: string;
    amount: number;
    status: 'paid' | 'unpaid' | 'overdue';
    description: string;
};

export default function InvoicesPage() {
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
                    const mockData: Invoice[] = [
                        { id: '1', ref: 'INV-2026-015', clientName: 'TDM', date: '20/04/2026', amount: 295800, status: 'paid', description: 'الدفعة الأولى من المشروع' },
                        { id: '2', ref: 'INV-2026-016', clientName: 'Port Autonome de Nouadhibou', date: '25/04/2026', amount: 50112, status: 'unpaid', description: 'استضافة وصيانة' },
                        { id: '3', ref: 'INV-2026-010', clientName: 'BPM', date: '01/04/2026', amount: 15000, status: 'overdue', description: 'دعم فني إضافي' }
                    ];
                    setInvoices(mockData);
                    localStorage.setItem('afrikyia-invoices', JSON.stringify(mockData));
                }
            } catch(e) {}
        };
        load();
    }, []);

    const handleDelete = (id: string) => {
        if (confirm('هل أنت متأكد من حذف هذه الفاتورة؟')) {
            const updated = invoices.filter(i => i.id !== id);
            setInvoices(updated);
            localStorage.setItem('afrikyia-invoices', JSON.stringify(updated));
        }
    };

    const getStatusBadge = (status: string) => {
        switch(status) {
            case 'paid': return <span className="bg-emerald-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">مدفوعة</span>;
            case 'unpaid': return <span className="bg-white/10 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">غير مدفوعة</span>;
            case 'overdue': return <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">متأخرة</span>;
            default: return null;
        }
    };

    return (
        <div className="space-y-6 animate-fade-in text-white" dir="rtl">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    الفواتير
                </h1>
                <Link 
                    href="/admin/invoices/new"
                    className="bg-yellow-400 hover:bg-yellow-500 text-black px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-yellow-400/20"
                >
                    فاتورة جديدة
                </Link>
            </div>

            {/* List */}
            <div className="space-y-4">
                {invoices.length === 0 ? (
                    <div className="text-center py-12 text-white/40">لا توجد فواتير حالياً.</div>
                ) : (
                    invoices.map((invoice, i) => (
                        <motion.div 
                            key={invoice.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-white/10 transition-all"
                        >
                            <div className="flex flex-col gap-3 w-full md:w-auto md:flex-row-reverse md:items-center justify-between">
                                {/* Details side */}
                                <div className="text-left w-full md:w-auto md:min-w-[250px]">
                                    <div className="flex items-center justify-end gap-3 mb-1">
                                        {getStatusBadge(invoice.status)}
                                        <span className="font-bold text-lg">{invoice.ref}</span>
                                    </div>
                                    <div className="text-white/60 text-sm font-semibold">{invoice.clientName}</div>
                                    {invoice.description && (
                                        <div className="text-white/40 text-xs mt-1 max-w-md line-clamp-1" dir="ltr">
                                            {invoice.description}
                                        </div>
                                    )}
                                    <div className="text-white/30 text-[10px] mt-2">{invoice.date}</div>
                                </div>

                                {/* Actions & Amount side */}
                                <div className="flex flex-col items-start gap-4">
                                    <div className="font-bold text-xl tracking-wider">
                                        MRU {invoice.amount.toLocaleString()}
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleDelete(invoice.id)} className="bg-red-500/10 hover:bg-red-500/20 text-red-500 px-3 py-1.5 rounded-lg text-xs font-bold transition-all">
                                            حذف
                                        </button>
                                        <button className="bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1">
                                            تحميل PDF
                                        </button>
                                        {invoice.status !== 'paid' && (
                                            <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1">
                                                تأكيد الدفع
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
