"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

type Client = {
    id: string;
    name: string;
    company: string;
    email: string;
    phone: string;
    status: 'active' | 'inactive';
};

export default function ClientsPage() {
    const { t, isRTL } = useLanguage();
    const [clients, setClients] = useState<Client[]>([]);

    useEffect(() => {
        // Load from local storage for now
        const load = () => {
            try {
                const data = localStorage.getItem('afrikyia-clients');
                if (data) {
                    setClients(JSON.parse(data));
                } else {
                    // Mock data
                    const mockData: Client[] = [
                        { id: '1', name: 'أحمد محمود', company: 'TDM', email: 'ahmed@tdm.mr', phone: '+222 40 00 00 00', status: 'active' },
                        { id: '2', name: 'فاطمة محمد', company: 'Port Autonome', email: 'fatima@pan.mr', phone: '+222 36 00 00 00', status: 'active' },
                        { id: '3', name: 'سيدي عالي', company: 'BPM', email: 'sidi@bpm.mr', phone: '+222 22 00 00 00', status: 'inactive' }
                    ];
                    setClients(mockData);
                    localStorage.setItem('afrikyia-clients', JSON.stringify(mockData));
                }
            } catch(e) {}
        };
        load();
    }, []);

    const handleDelete = (id: string) => {
        if (confirm('Are you sure? / هل أنت متأكد؟ / Êtes-vous sûr ?')) {
            const updated = clients.filter(c => c.id !== id);
            setClients(updated);
            localStorage.setItem('afrikyia-clients', JSON.stringify(updated));
        }
    };

    const getStatusBadge = (status: string) => {
        switch(status) {
            case 'active': return <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-500/20">{t.admin.common.active}</span>;
            case 'inactive': return <span className="bg-white/10 text-white/70 px-2 py-0.5 rounded-full text-[10px] font-bold border border-white/5">{t.admin.common.inactive}</span>;
            default: return null;
        }
    };

    return (
        <div className="space-y-6 animate-fade-in text-white" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Header */}
            <div className={`flex justify-between items-center border-b border-white/5 pb-4 ${isRTL ? 'flex-row' : 'flex-row'}`}>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    {t.admin.clients.title}
                </h1>
                <Link 
                    href="/admin/clients/new"
                    className="bg-yellow-400 hover:bg-yellow-500 text-black px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-yellow-400/20"
                >
                    {t.admin.clients.addClient}
                </Link>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {clients.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-white/60">{t.admin.clients.noClients}</div>
                ) : (
                    clients.map((client, i) => (
                        <motion.div 
                            key={client.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg">{client.company}</h3>
                                        <div className="text-white/60 text-sm mt-1">{client.name}</div>
                                    </div>
                                    {getStatusBadge(client.status)}
                                </div>
                                
                                <div className="space-y-2 text-sm text-white/70">
                                    <div className="flex items-center gap-2" dir="ltr">
                                        <span className="flex-1 text-right">{client.email}</span>
                                        <span className="text-white/20">@</span>
                                    </div>
                                    <div className="flex items-center gap-2" dir="ltr">
                                        <span className="flex-1 text-right">{client.phone}</span>
                                        <span className="text-white/20">📞</span>
                                    </div>
                                </div>
                            </div>

                            <div className={`mt-6 pt-4 border-t border-white/5 flex gap-2 ${isRTL ? 'justify-end' : 'justify-start'}`}>
                                <button onClick={() => handleDelete(client.id)} className="bg-red-500/10 hover:bg-red-500/20 text-red-500 px-3 py-1.5 rounded-lg text-xs font-bold transition-all">
                                    {t.admin.common.delete}
                                </button>
                                <button className="bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all">
                                    {t.admin.common.edit}
                                </button>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
