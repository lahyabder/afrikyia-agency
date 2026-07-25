"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, FileText, Receipt, Layers, Activity } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export default function DashboardPage() {
    const { t, isRTL } = useLanguage();
    const [stats, setStats] = useState({
        clients: 0,
        offers: 0,
        invoices: 0,
        achievements: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            // Read local files directly from local storage if API isn't setup yet,
            // or fetch them from API later. 
            // For now, mock data:
            const achievementsStr = localStorage.getItem('afrikyia-achievements');
            const achievements = achievementsStr ? JSON.parse(achievementsStr).length : 0;
            
            setStats({
                clients: 0,
                offers: 0,
                invoices: 0,
                achievements
            });
        };
        fetchStats();
    }, []);

    const statCards = [
        { name: t.admin.dashboard.statClients, value: stats.clients, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { name: t.admin.dashboard.statOffers, value: stats.offers, icon: FileText, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
        { name: t.admin.dashboard.statInvoices, value: stats.invoices, icon: Receipt, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        { name: t.admin.dashboard.statAchievements, value: stats.achievements, icon: Layers, color: 'text-brand-red', bg: 'bg-brand-red/10' },
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">{t.admin.dashboard.title}</h1>
                    <p className="text-sm text-white/70 mt-1">{t.admin.dashboard.subtitle}</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/admin/offers/new" className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-xl text-sm transition-all shadow-lg shadow-yellow-400/20">
                        {t.admin.dashboard.createOffer}
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center gap-4 hover:border-white/20 transition-all"
                    >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <div className="text-xs text-white/70 font-medium">{stat.name}</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Quick Actions / Activity (Placeholder) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h2 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isRTL ? 'flex-row' : 'flex-row'}`}>
                        <Activity className={`w-5 h-5 text-white/70 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        {t.admin.dashboard.recentActivity}
                    </h2>
                    <div className="text-center py-12 text-white/60 text-sm">
                        {t.admin.dashboard.noActivity}
                    </div>
                </div>
            </div>
        </div>
    );
}
