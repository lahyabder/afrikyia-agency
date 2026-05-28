"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FileText, Plus, Trash2, Edit3, Eye, FileOutput } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

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
    const { t, isRTL } = useLanguage();
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
        if (confirm('Are you sure? / هل أنت متأكد؟ / Êtes-vous sûr ?')) {
            const updated = offers.filter(o => o.id !== id);
            setOffers(updated);
            localStorage.setItem('afrikyia-offers', JSON.stringify(updated));
        }
    };

    const getStatusBadge = (status: string) => {
        switch(status) {
            case 'sent': return <span className="bg-yellow-400 text-black px-2 py-0.5 rounded-full text-[10px] font-bold">{t.admin.common.sent}</span>;
            case 'draft': return <span className="bg-white/10 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">{t.admin.common.draft}</span>;
            case 'accepted': return <span className="bg-emerald-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">{t.admin.common.accepted}</span>;
            default: return null;
        }
    };

    return (
        <div className="space-y-6 animate-fade-in text-white" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Header */}
            <div className={`flex justify-between items-center border-b border-white/5 pb-4 ${isRTL ? 'flex-row' : 'flex-row'}`}>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    {t.admin.offers.title}
                </h1>
                <Link 
                    href="/admin/offers/new"
                    className="bg-yellow-400 hover:bg-yellow-500 text-black px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-yellow-400/20"
                >
                    {t.admin.offers.addOffer}
                </Link>
            </div>

            {/* List */}
            <div className="space-y-4">
                {offers.length === 0 ? (
                    <div className="text-center py-12 text-white/40">{t.admin.offers.noOffers}</div>
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
                            <div className={`flex flex-col gap-3 w-full md:w-auto ${isRTL ? 'md:flex-row-reverse' : 'md:flex-row'} md:items-center justify-between`}>
                                {/* Details side */}
                                <div className={`w-full md:w-auto md:min-w-[250px] ${isRTL ? 'text-right' : 'text-left'}`}>
                                    <div className={`flex items-center gap-3 mb-1 ${isRTL ? 'justify-start' : 'justify-start'}`}>
                                        <span className="font-bold text-lg">{offer.ref}</span>
                                        {getStatusBadge(offer.status)}
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
                                <div className={`flex flex-col gap-4 ${isRTL ? 'items-end' : 'items-start'}`}>
                                    <div className="font-bold text-xl tracking-wider">
                                        MRU {offer.amount.toLocaleString()}
                                    </div>
                                    <div className={`flex gap-2 ${isRTL ? 'flex-row' : 'flex-row'}`}>
                                        <button onClick={() => handleDelete(offer.id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all">
                                            {t.admin.common.delete}
                                        </button>
                                        <button 
                                            onClick={() => setPreviewOffer(offer)}
                                            className="bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                                        >
                                            <Eye className="w-4 h-4" />
                                            {t.admin.common.preview}
                                        </button>
                                        <button className="bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1">
                                            {t.admin.common.edit}
                                        </button>
                                        <button className="bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1">
                                            {t.admin.common.convertToInvoice}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Preview Modal */}
            {previewOffer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" dir={isRTL ? 'rtl' : 'ltr'}>
                    <div className="absolute inset-0 cursor-pointer" onClick={() => setPreviewOffer(null)} />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative w-full max-w-2xl bg-[#0f0f0f] border border-white/10 rounded-2xl overflow-hidden shadow-2xl p-8"
                    >
                        <div className="flex justify-between items-start border-b border-white/10 pb-6 mb-6">
                            <div>
                                <h2 className="text-2xl font-bold mb-2">{t.admin.offers.title} - {previewOffer.ref}</h2>
                                <div className="text-white/50 text-sm flex items-center gap-2">
                                    {previewOffer.date} • {getStatusBadge(previewOffer.status)}
                                </div>
                            </div>
                            <button onClick={() => setPreviewOffer(null)} className="text-white/40 hover:text-white p-2">✕</button>
                        </div>
                        
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
                                <div>
                                    <div className="text-xs text-white/40 uppercase tracking-wider mb-1">{t.admin.offers.clientName}</div>
                                    <div className="font-bold">{previewOffer.clientName}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-white/40 uppercase tracking-wider mb-1">{t.admin.common.amount}</div>
                                    <div className="font-bold text-yellow-400 text-lg">MRU {previewOffer.amount.toLocaleString()}</div>
                                </div>
                            </div>

                            {previewOffer.description && (
                                <div>
                                    <div className="text-xs text-white/40 uppercase tracking-wider mb-2">{t.admin.offers.description}</div>
                                    <div className="bg-black/40 p-4 rounded-xl border border-white/5 text-sm leading-relaxed text-white/80" dir="ltr">
                                        {previewOffer.description}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/10 flex justify-end gap-3">
                            <button onClick={() => setPreviewOffer(null)} className="px-5 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-sm font-bold transition-all">
                                {t.admin.common.cancel}
                            </button>
                            <button className="px-5 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-black text-sm font-bold transition-all flex items-center gap-2">
                                <FileOutput className="w-4 h-4" /> {t.admin.common.convertToInvoice}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
