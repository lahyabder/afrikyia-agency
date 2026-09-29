"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Globe, Briefcase, Files, PenLine, Activity, Wallet, ExternalLink, AlertTriangle, FileText, LayoutDashboard, Users, Mail, Inbox } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useLanguage } from '@/context/LanguageContext';

type Overview = {
    counts: { achievements: number | null; projects: number | null; files: number | null; newMessages: number | null };
    sectionUpdates: { key: string; updated_at: string }[];
    latestMessages: { id: string; name: string; message: string; created_at: string }[];
};

export default function DashboardPage() {
    const { t, language } = useLanguage();
    const [overview, setOverview] = useState<Overview | null>(null);
    const [loadError, setLoadError] = useState(false);
    const [finance, setFinance] = useState<{ income: number; expenses: number; receivable: number } | null>(null);

    useEffect(() => {
        fetch('/api/admin/overview', { cache: 'no-store' })
            .then(res => (res.ok ? res.json() : Promise.reject(res.status)))
            .then((data: Overview) => setOverview(data))
            .catch(() => setLoadError(true));
        fetch('/api/biz/summary', { cache: 'no-store' })
            .then(res => (res.ok ? res.json() : null))
            .then(data => data && setFinance(data))
            .catch(() => {});
    }, []);

    const d = t.admin.dashboard;
    const menu = t.admin.menu;
    const biz = t.admin.biz;

    const sectionNames: Record<string, string> = {
        about: menu.about,
        vision: menu.vision,
        services: menu.services,
        contact: menu.contact,
        trusted: menu.trusted,
    };

    const statCards = [
        { name: menu.achievements, value: overview?.counts.achievements, icon: Globe, color: 'text-brand-red', bg: 'bg-brand-red/10', href: '/admin/achievements' },
        { name: d.statProjects, value: overview?.counts.projects, icon: Briefcase, color: 'text-yellow-400', bg: 'bg-yellow-500/10', href: '/admin/projects' },
        { name: d.statFiles, value: overview?.counts.files, icon: Files, color: 'text-blue-400', bg: 'bg-blue-500/10', href: '/admin/files' },
        { name: d.statNewMessages, value: overview?.counts.newMessages, icon: Inbox, color: 'text-emerald-400', bg: 'bg-emerald-500/10', href: '/admin/messages' },
    ];

    const quickLinks = [
        { name: menu.achievements, icon: Globe, href: '/admin/achievements' },
        { name: menu.projects, icon: Briefcase, href: '/admin/projects' },
        { name: menu.about, icon: FileText, href: '/admin/about' },
        { name: menu.vision, icon: LayoutDashboard, href: '/admin/vision' },
        { name: menu.services, icon: Briefcase, href: '/admin/services' },
        { name: menu.trusted, icon: Users, href: '/admin/trusted' },
        { name: menu.contact, icon: Mail, href: '/admin/contact' },
        { name: menu.files, icon: Files, href: '/admin/files' },
    ];

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleString(language === 'ar' ? 'ar-u-nu-latn' : language, { dateStyle: 'medium', timeStyle: 'short' });

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">{d.title}</h1>
                    <p className="text-sm text-white/70 mt-1">{d.subtitle}</p>
                </div>
                <a
                    href={`/${language}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl text-sm transition-all flex items-center gap-2"
                >
                    {d.viewSite} <ExternalLink className="w-4 h-4" />
                </a>
            </div>

            {loadError && (
                <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    {d.loadError}
                </div>
            )}

            {/* Figures from the database */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, i) => (
                    <motion.div key={stat.href + i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                        <Link
                            href={stat.href}
                            className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center gap-4 hover:border-white/20 transition-all"
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">
                                    {stat.value === undefined
                                        ? (loadError ? '—' : <span className="inline-block w-8 h-6 rounded bg-white/10 animate-pulse" />)
                                        : stat.value ?? '—'}
                                </div>
                                <div className="text-xs text-white/70 font-medium">{stat.name}</div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quick publishing */}
                <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
                        <PenLine className="w-5 h-5 text-white/70" />
                        {d.publishingTitle}
                    </h2>
                    <p className="text-sm text-white/60 mb-5">{d.publishingDesc}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {quickLinks.map(link => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-black/20 p-4 text-center text-sm font-semibold text-white/80 hover:border-yellow-400/40 hover:text-white transition-all"
                            >
                                <link.icon className="w-5 h-5 text-yellow-400" />
                                {link.name}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Company money at a glance */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-white/70" />
                        {biz.finance.title} {new Date().getFullYear()}
                    </h2>
                    <dl className="space-y-3 text-sm flex-1">
                        {[
                            { label: biz.finance.income, value: finance?.income, color: 'text-emerald-400' },
                            { label: biz.finance.expenses, value: finance?.expenses, color: 'text-red-400' },
                            { label: biz.finance.receivable, value: finance?.receivable, color: 'text-blue-300' },
                        ].map(row => (
                            <div key={row.label} className="flex items-center justify-between gap-3">
                                <dt className="text-white/65">{row.label}</dt>
                                <dd className={`font-bold whitespace-nowrap ${row.color}`}>
                                    {row.value === undefined ? '…' : `${Number(row.value).toLocaleString(language === 'ar' ? 'ar-u-nu-latn' : language)} ${biz.currency}`}
                                </dd>
                            </div>
                        ))}
                    </dl>
                    <Link
                        href="/admin/finance"
                        className="mt-5 px-4 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-xl text-sm transition-all text-center"
                    >
                        {biz.menu.finance}
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Latest unread messages */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <Inbox className="w-5 h-5 text-white/70" />
                            {d.latestMessages}
                        </h2>
                        <Link href="/admin/messages" className="text-xs font-bold text-yellow-400 hover:underline">{d.viewAll}</Link>
                    </div>
                    {overview && overview.latestMessages.length > 0 ? (
                        <ul className="divide-y divide-white/5">
                            {overview.latestMessages.map(msg => (
                                <li key={msg.id} className="py-3 text-sm">
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="font-semibold truncate">{msg.name}</span>
                                        <span className="text-white/50 text-xs shrink-0" dir="auto">{formatDate(msg.created_at)}</span>
                                    </div>
                                    <p className="text-white/60 text-xs mt-1 truncate">{msg.message}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-8 text-white/60 text-sm">{overview ? d.noMessages : loadError ? '—' : '…'}</div>
                    )}
                </div>

                {/* Latest content updates */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-white/70" />
                        {d.lastUpdates}
                    </h2>
                    {overview && overview.sectionUpdates.length > 0 ? (
                        <ul className="divide-y divide-white/5">
                            {overview.sectionUpdates.map(u => (
                                <li key={u.key} className="flex items-center justify-between py-3 text-sm">
                                    <Link href={`/admin/${u.key}`} className="font-semibold hover:text-yellow-400 transition-all">
                                        {sectionNames[u.key] ?? u.key}
                                    </Link>
                                    <span className="text-white/50 text-xs" dir="auto">{formatDate(u.updated_at)}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-8 text-white/60 text-sm">{overview ? d.noUpdates : loadError ? '—' : '…'}</div>
                    )}
                </div>
            </div>
        </div>
    );
}
