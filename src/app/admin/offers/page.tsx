"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FileText, Plus, Trash2, Edit3, Eye, FileOutput } from 'lucide-react';

type Offer = {
    id: string;
    ref: string;
    clientName: string;
    date: string;
    amount: number;
    status: 'draft' | 'sent' | 'accepted' | 'rejected';
    description: string;
};

export default function OffersPage() {
    const [offers, setOffers] = useState<Offer[]>([]);

    useEffect(() => {
        // Load from local storage for now (or API)
        const load = () => {
            try {
                const data = localStorage.getItem('afrikyia-offers');
                if (data) {
                    setOffers(JSON.parse(data));
                } else {
                    // Mock data to show the design if empty
                    const mockData: Offer[] = [
                        { id: '1', ref: 'Q-2026-0026', clientName: 'TDM', date: '15/04/2026', amount: 591600, status: 'sent', description: 'Conception, développement, et livraison complète des codes sources...' },
                        { id: '2', ref: 'Q-2026-0025', clientName: 'Port Autonome de Nouadhibou', date: '24/04/2026', amount: 50112, status: 'draft', description: '' },
                        { id: '3', ref: 'Q-2026-0024', clientName: 'BPM', date: '14/04/2026', amount: 2320, status: 'draft', description: '' }
                    ];
                    setOffers(mockData);
                    localStorage.setItem('afrikyia-offers', JSON.stringify(mockData));
                }
            } catch(e) {}
        };
        load();
    }, []);

    const handleDelete = (id: string) => {
        if (confirm('هل أنت متأكد من حذف هذا العرض؟')) {
            const updated = offers.filter(o => o.id !== id);
            setOffers(updated);
            localStorage.setItem('afrikyia-offers', JSON.stringify(updated));
        }
    };

    const getStatusBadge = (status: string) => {
        switch(status) {
            case 'sent': return <span className="bg-yellow-400 text-black px-2 py-0.5 rounded-full text-[10px] font-bold">مرسل</span>;
            case 'draft': return <span className="bg-white/10 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">مسودة</span>;
            case 'accepted': return <span className="bg-emerald-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">مقبول</span>;
            default: return null;
        }
    };

    return (
        <div className="space-y-6 animate-fade-in text-white" dir="rtl">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    العروض
                </h1>
                <Link 
                    href="/admin/offers/new"
                    className="bg-yellow-400 hover:bg-yellow-500 text-black px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-yellow-400/20"
                >
                    عرض جديد
                </Link>
            </div>

            {/* List */}
            <div className="space-y-4">
                {offers.length === 0 ? (
                    <div className="text-center py-12 text-white/40">لا توجد عروض حالياً.</div>
                ) : (
                    offers.map((offer, i) => (
                        <motion.div 
                            key={offer.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-white/10 transition-all"
                        >
                            {/* Actions & Amount (Left side in LTR, Right side in RTL -> wait, the screenshot has actions on the left, but text aligns to right. Let's replicate exact layout) */}
                            <div className="flex flex-col gap-3 w-full md:w-auto md:flex-row-reverse md:items-center justify-between">
                                {/* Details side */}
                                <div className="text-left w-full md:w-auto md:min-w-[250px]">
                                    <div className="flex items-center justify-end gap-3 mb-1">
                                        {getStatusBadge(offer.status)}
                                        <span className="font-bold text-lg">{offer.ref}</span>
                                    </div>
                                    <div className="text-white/60 text-sm font-semibold">{offer.clientName}</div>
                                    {offer.description && (
                                        <div className="text-white/40 text-xs mt-1 max-w-md line-clamp-1" dir="ltr">
                                            {offer.description}
                                        </div>
                                    )}
                                    <div className="text-white/30 text-[10px] mt-2">{offer.date}</div>
                                </div>

                                {/* Actions & Amount side */}
                                <div className="flex flex-col items-start gap-4">
                                    <div className="font-bold text-xl tracking-wider">
                                        MRU {offer.amount.toLocaleString()}
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleDelete(offer.id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all">
                                            حذف
                                        </button>
                                        <button className="bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1">
                                            معاينة
                                        </button>
                                        <button className="bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1">
                                            تعديل
                                        </button>
                                        <button className="bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1">
                                            تحويل إلى فاتورة
                                        </button>
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
