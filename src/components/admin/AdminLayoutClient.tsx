"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from '@/i18n/routing';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { 
    LayoutDashboard, 
    Users, 
    FileText, 
    Receipt, 
    FileBox, 
    Files, 
    Globe, 
    LogOut,
    Lock,
    Mail,
    AlertTriangle,
    Briefcase,
    Menu,
    X,
    ExternalLink,
    Boxes
} from 'lucide-react';

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [loginError, setLoginError] = useState<string>('');
    const [isMounted, setIsMounted] = useState(false);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    
    const pathname = usePathname();
    const router = useRouter();
    const { t, language, setLanguage, isRTL } = useLanguage();

    useEffect(() => {
        // Legacy client-side flag is no longer trusted
        localStorage.removeItem('afrikyia-admin-auth');
        fetch('/api/admin/session', { cache: 'no-store' })
            .then(res => res.json())
            .then(data => setIsAuthenticated(data.authenticated === true))
            .catch(() => setIsAuthenticated(false))
            .finally(() => setIsMounted(true));
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/admin/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            if (res.ok) {
                setIsAuthenticated(true);
                setLoginError('');
                setPassword('');
            } else {
                setLoginError(t.admin.auth.incorrectCredentials);
            }
        } catch {
            setLoginError(t.admin.auth.incorrectCredentials);
        }
    };

    const handleLogout = async () => {
        await fetch('/api/admin/session', { method: 'DELETE' }).catch(() => {});
        setIsAuthenticated(false);
        router.push('/admin');
    };

    if (!isMounted) return <div className="min-h-screen bg-[#080808]"></div>;

    if (!isAuthenticated) {
        return (
            <main className="min-h-screen bg-black text-white flex items-center justify-center p-6" dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="absolute inset-0 bg-radial-gradient from-yellow-500/10 to-transparent pointer-events-none" />
                
                <div className="w-full max-w-md relative z-10">
                    <div className="text-center mb-8">
                        <Link href="/">
                            <Image
                                src="/logo.png"
                                alt="Afrikyia Logo"
                                width={200}
                                height={60}
                                className="mx-auto h-12 w-auto mb-6 cursor-pointer"
                                style={{ filter: 'invert(1) hue-rotate(180deg) saturate(20)', mixBlendMode: 'screen' }}
                            />
                        </Link>
                        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">{t.admin.auth.loginTitle}</h1>
                        <p className="text-sm text-white/70 uppercase tracking-widest font-mono">{t.admin.auth.loginSub}</p>
                    </div>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/5 border border-white/10 backdrop-blur-xl p-8 rounded-2xl shadow-2xl shadow-yellow-500/5"
                    >
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className={`block text-xs font-bold uppercase tracking-wider text-white/70 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                                        {t.admin.auth.emailLabel}
                                    </label>
                                    <div className="relative">
                                        <Mail className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-white/60 ${isRTL ? 'right-4' : 'left-4'}`} />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder={t.admin.auth.emailPlaceholder}
                                            className={`w-full bg-black/40 border border-white/10 rounded-xl py-3.5 ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} text-white focus:outline-none focus:border-yellow-400 transition-all ${isRTL ? 'text-right' : 'text-left'}`}
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className={`block text-xs font-bold uppercase tracking-wider text-white/70 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                                        {t.admin.auth.passwordLabel}
                                    </label>
                                    <div className="relative">
                                        <Lock className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-white/60 ${isRTL ? 'right-4' : 'left-4'}`} />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder={t.admin.auth.passwordPlaceholder}
                                            className={`w-full bg-black/40 border border-white/10 rounded-xl py-3.5 ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} text-white focus:outline-none focus:border-yellow-400 transition-all ${isRTL ? 'text-right' : 'text-left'}`}
                                            required
                                        />
                                    </div>
                                </div>
                                {loginError && (
                                    <p className="text-yellow-500 text-xs mt-2 font-semibold flex items-center gap-1.5 justify-center">
                                        <AlertTriangle className="w-4 h-4" /> {loginError}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-yellow-400/20 active:scale-[0.98]"
                            >
                                {t.admin.auth.loginButton}
                            </button>
                        </form>
                    </motion.div>
                </div>
            </main>
        );
    }

    type MenuItem = { name: string; icon: typeof LayoutDashboard; path: string; localOnly?: boolean };
    const menuGroups: { title?: string; items: MenuItem[] }[] = [
        {
            items: [{ name: t.admin.menu.dashboard, icon: LayoutDashboard, path: '/admin/dashboard' }],
        },
        {
            title: t.admin.menu.groupPublishing,
            items: [
                { name: t.admin.menu.achievements, icon: Globe, path: '/admin/achievements' },
                { name: t.admin.menu.projects, icon: Briefcase, path: '/admin/projects' },
                { name: t.admin.menu.about, icon: FileText, path: '/admin/about' },
                { name: t.admin.menu.vision, icon: LayoutDashboard, path: '/admin/vision' },
                { name: t.admin.menu.services, icon: Briefcase, path: '/admin/services' },
                { name: t.admin.menu.trusted, icon: Users, path: '/admin/trusted' },
                { name: t.admin.menu.contact, icon: Mail, path: '/admin/contact' },
                { name: t.admin.menu.files, icon: Files, path: '/admin/files' },
            ],
        },
        {
            title: t.admin.menu.groupManagement,
            items: [
                { name: t.admin.menu.clients, icon: Users, path: '/admin/clients', localOnly: true },
                { name: t.admin.menu.offers, icon: FileText, path: '/admin/offers', localOnly: true },
                { name: t.admin.menu.invoices, icon: Receipt, path: '/admin/invoices', localOnly: true },
                { name: t.admin.menu.deliveryNotes, icon: FileBox, path: '/admin/delivery-notes', localOnly: true },
            ],
        },
    ];
    const erpUrl = process.env.NEXT_PUBLIC_ERP_URL;
    const isLocalOnlyPage = menuGroups.some(g => g.items.some(i => i.localOnly && pathname.startsWith(i.path)));

    const navContent = (
        <>
            <nav className="flex-1 overflow-y-auto py-4">
                {menuGroups.map((group, gi) => (
                    <div key={gi} className={gi > 0 ? 'mt-5' : ''}>
                        {group.title && (
                            <div className="px-7 mb-2 text-[11px] font-bold uppercase tracking-widest text-white/35">
                                {group.title}
                            </div>
                        )}
                        <ul className="space-y-1 px-3">
                            {group.items.map((item) => {
                                const isActive = pathname.startsWith(item.path);
                                return (
                                    <li key={item.path}>
                                        <Link
                                            href={item.path}
                                            onClick={() => setMobileNavOpen(false)}
                                            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm font-semibold ${
                                                isActive
                                                    ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/10'
                                                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                                            }`}
                                        >
                                            <item.icon className="w-5 h-5 shrink-0" />
                                            <span className="flex-1">{item.name}</span>
                                            {item.localOnly && (
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${isActive ? 'bg-black/15' : 'bg-amber-500/15 text-amber-400'}`}>
                                                    {t.admin.menu.localTag}
                                                </span>
                                            )}
                                        </Link>
                                    </li>
                                );
                            })}
                            {group.title === t.admin.menu.groupManagement && erpUrl && (
                                <li>
                                    <a
                                        href={erpUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm font-semibold text-white/60 hover:bg-white/5 hover:text-white"
                                    >
                                        <Boxes className="w-5 h-5 shrink-0" />
                                        <span className="flex-1">{t.admin.menu.erp}</span>
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                </li>
                            )}
                        </ul>
                    </div>
                ))}
            </nav>

            <div className="p-4 border-t border-white/5 space-y-2">
                <div className="flex items-center gap-2 mb-4 bg-white/5 p-1 rounded-xl">
                    {(['ar', 'fr', 'en'] as const).map((lang) => (
                        <button
                            key={lang}
                            onClick={() => router.replace(pathname, { locale: lang })}
                            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                language === lang
                                    ? 'bg-yellow-400 text-black shadow-md'
                                    : 'text-white/60 hover:text-white hover:bg-white/10'
                            }`}
                        >
                            {lang.toUpperCase()}
                        </button>
                    ))}
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                >
                    <LogOut className="w-5 h-5" />
                    {t.admin.menu.logout}
                </button>
            </div>
        </>
    );

    const logo = (
        <Link href="/">
            <Image
                src="/logo.png"
                alt="Afrikyia Logo"
                width={150}
                height={45}
                className="h-8 w-auto cursor-pointer"
                style={{ filter: 'invert(1) hue-rotate(180deg) saturate(20)', mixBlendMode: 'screen' }}
            />
        </Link>
    );

    return (
        <div className={`flex h-screen bg-[#111111] text-white font-sans ${isRTL ? 'arabic-font' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Sidebar (desktop) */}
            <aside className={`w-64 bg-[#0a0a0a] border-white/5 flex-col hidden md:flex ${isRTL ? 'border-l' : 'border-r'}`}>
                <div className="p-6 border-b border-white/5">{logo}</div>
                {navContent}
            </aside>

            {/* Sidebar (mobile drawer) */}
            {mobileNavOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div className="absolute inset-0 bg-black/70" onClick={() => setMobileNavOpen(false)} />
                    <aside className={`absolute top-0 bottom-0 ${isRTL ? 'right-0' : 'left-0'} w-72 max-w-[85%] bg-[#0a0a0a] flex flex-col`}>
                        <div className="p-5 border-b border-white/5 flex items-center justify-between">
                            {logo}
                            <button onClick={() => setMobileNavOpen(false)} aria-label={t.admin.menu.closeMenu} className="p-2 rounded-lg hover:bg-white/10 cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        {navContent}
                    </aside>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
                {/* Top bar (mobile) */}
                <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#0a0a0a]">
                    {logo}
                    <button onClick={() => setMobileNavOpen(true)} aria-label={t.admin.menu.openMenu} className="p-2 rounded-lg hover:bg-white/10 cursor-pointer">
                        <Menu className="w-6 h-6" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-10">
                    {isLocalOnlyPage && (
                        <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-300">
                            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                            <p>{t.admin.localNotice}</p>
                        </div>
                    )}
                    {children}
                </div>
            </main>
        </div>
    );
}
