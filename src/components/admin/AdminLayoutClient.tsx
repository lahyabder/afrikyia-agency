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
    Mails,
    Files, 
    Globe, 
    LogOut,
    Lock,
    Mail,
    AlertTriangle,
    Briefcase,
    Menu,
    X,
    Inbox,
    Wallet,
    ArrowUpRight,
    ShieldCheck,
    History,
    KeyRound,
    Landmark,
    FolderLock,
    Building2,
    UserRound,
    Banknote
} from 'lucide-react';
import { MESSAGES_UPDATED_EVENT } from '@/lib/adminEvents';
import { AdminSessionContext, type AdminSession } from '@/components/admin/AdminSession';
import AssistantPanel from '@/components/admin/AssistantPanel';

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [session, setSession] = useState<AdminSession>({ user: null, areas: [] });
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [loginError, setLoginError] = useState<string>('');
    const [isMounted, setIsMounted] = useState(false);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const [newMessages, setNewMessages] = useState(0);
    
    const pathname = usePathname();
    const router = useRouter();
    const { t, language, setLanguage, isRTL } = useLanguage();

    const loadSession = () =>
        fetch('/api/admin/session', { cache: 'no-store' })
            .then(res => res.json())
            .then(data => {
                setIsAuthenticated(data.authenticated === true);
                setSession({ user: data.user ?? null, areas: Array.isArray(data.areas) ? data.areas : [] });
            })
            .catch(() => setIsAuthenticated(false));

    useEffect(() => {
        // Legacy client-side flag is no longer trusted
        localStorage.removeItem('afrikyia-admin-auth');
        loadSession().finally(() => setIsMounted(true));
    }, []);


    // Number of unread contact messages, shown as a badge in the sidebar
    useEffect(() => {
        if (!isAuthenticated) return;
        const loadCount = () => {
            fetch('/api/admin/overview', { cache: 'no-store' })
                .then(res => (res.ok ? res.json() : null))
                .then(data => setNewMessages(data?.counts?.newMessages ?? 0))
                .catch(() => {});
        };
        loadCount();
        window.addEventListener(MESSAGES_UPDATED_EVENT, loadCount);
        return () => window.removeEventListener(MESSAGES_UPDATED_EVENT, loadCount);
    }, [isAuthenticated]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/admin/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            if (res.ok) {
                await loadSession();
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

    if (!isMounted) return <div className="admin-light min-h-screen bg-[#080808]"></div>;

    if (!isAuthenticated) {
        return (
            <main className="admin-light min-h-screen bg-black text-white flex items-center justify-center p-6" dir={isRTL ? 'rtl' : 'ltr'}>
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

    type MenuItem = { name: string; icon: typeof LayoutDashboard; path: string; area: string; badge?: number };
    const menuGroups: { title?: string; items: MenuItem[] }[] = [
        {
            items: [
                { name: t.admin.menu.dashboard, icon: LayoutDashboard, path: '/admin/dashboard', area: 'dashboard' },
                { name: t.admin.menu.messages, icon: Inbox, path: '/admin/messages', area: 'messages', badge: newMessages },
            ],
        },
        {
            title: t.admin.menu.groupPublishing,
            items: [
                { name: t.admin.menu.achievements, icon: Globe, path: '/admin/achievements', area: 'publishing' },
                { name: t.admin.menu.about, icon: FileText, path: '/admin/about', area: 'publishing' },
                { name: t.admin.menu.vision, icon: LayoutDashboard, path: '/admin/vision', area: 'publishing' },
                { name: t.admin.menu.services, icon: Briefcase, path: '/admin/services', area: 'publishing' },
                { name: t.admin.menu.trusted, icon: Users, path: '/admin/trusted', area: 'publishing' },
                { name: t.admin.menu.contact, icon: Mail, path: '/admin/contact', area: 'publishing' },
                { name: t.admin.menu.files, icon: Files, path: '/admin/files', area: 'publishing' },
            ],
        },
        {
            title: t.admin.menu.groupManagement,
            items: [
                { name: t.admin.biz.menu.finance, icon: Wallet, path: '/admin/finance', area: 'finance' },
                { name: t.admin.biz.menu.documents, icon: Receipt, path: '/admin/invoices', area: 'finance' },
                { name: t.admin.biz.letters.menu, icon: Mails, path: '/admin/letters', area: 'finance' },
                { name: t.admin.biz.menu.expenses, icon: ArrowUpRight, path: '/admin/expenses', area: 'finance' },
                { name: t.admin.biz.menu.bank, icon: Landmark, path: '/admin/bank', area: 'finance' },
                { name: t.admin.biz.menu.clients, icon: Users, path: '/admin/clients', area: 'finance' },
                { name: t.admin.biz.menu.documentsVault, icon: FolderLock, path: '/admin/documents', area: 'finance' },
                { name: t.admin.biz.hr.menu.employees, icon: UserRound, path: '/admin/employees', area: 'hr' },
                { name: t.admin.biz.hr.menu.payroll, icon: Banknote, path: '/admin/payroll', area: 'hr' },
            ],
        },
        {
            title: t.admin.access.menu.team,
            items: [
                { name: t.admin.biz.menu.company, icon: Building2, path: '/admin/company', area: 'users' },
                { name: t.admin.access.menu.users, icon: ShieldCheck, path: '/admin/users', area: 'users' },
                { name: t.admin.access.menu.activity, icon: History, path: '/admin/activity', area: 'users' },
                { name: t.admin.access.menu.account, icon: KeyRound, path: '/admin/account', area: 'dashboard' },
            ],
        },
    ];
    // Only the sections this user's role allows
    const visibleGroups = menuGroups
        .map(g => ({ ...g, items: g.items.filter(i => session.areas.includes(i.area)) }))
        .filter(g => g.items.length > 0);
    const currentItem = menuGroups.flatMap(g => g.items).find(i => pathname.startsWith(i.path));
    const forbidden = !!currentItem && !session.areas.includes(currentItem.area);

    const navContent = (
        <>
            <nav className="flex-1 overflow-y-auto py-4">
                {visibleGroups.map((group, gi) => (
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
                                            {!!item.badge && (
                                                <span className={`min-w-5 h-5 px-1.5 rounded-full text-[11px] font-bold flex items-center justify-center ${isActive ? 'bg-black text-yellow-400' : 'bg-yellow-400 text-black'}`}>
                                                    {item.badge}
                                                </span>
                                            )}
                                        </Link>
                                    </li>
                                );
                            })}
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
                {session.user && (
                    <Link href="/admin/account" onClick={() => setMobileNavOpen(false)} className="block px-4 py-2 rounded-xl hover:bg-white/5">
                        <div className="text-sm font-semibold truncate">{session.user.owner ? t.admin.access.users.owner : session.user.name}</div>
                        <div className="text-[11px] text-white/45 truncate">{t.admin.access.roles[session.user.role]}</div>
                    </Link>
                )}
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
        <div className={`admin-light flex h-screen print:h-auto print:block print:bg-white bg-[#111111] text-white font-sans ${isRTL ? 'arabic-font' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Sidebar (desktop) */}
            <aside className={`w-64 bg-[#0a0a0a] border-white/5 flex-col hidden md:flex print:!hidden ${isRTL ? 'border-l' : 'border-r'}`}>
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
            <main className="flex-1 flex flex-col h-screen overflow-hidden min-w-0 print:h-auto print:overflow-visible print:block">
                {/* Top bar (mobile) */}
                <div className="md:hidden print:hidden flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#0a0a0a]">
                    {logo}
                    <button onClick={() => setMobileNavOpen(true)} aria-label={t.admin.menu.openMenu} className="p-2 rounded-lg hover:bg-white/10 cursor-pointer">
                        <Menu className="w-6 h-6" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 pb-24 sm:p-6 sm:pb-24 md:p-10 md:pb-24 print:p-0 print:overflow-visible">
                    <AdminSessionContext.Provider value={session}>
                        {forbidden ? (
                            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-300">{t.admin.access.forbidden}</div>
                        ) : (
                            children
                        )}
                    </AdminSessionContext.Provider>
                </div>
            </main>
            <AssistantPanel />
        </div>
    );
}
