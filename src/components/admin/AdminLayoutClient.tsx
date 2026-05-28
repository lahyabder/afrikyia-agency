"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
    LayoutDashboard, 
    Users, 
    FileText, 
    Receipt, 
    FileBox, 
    Files, 
    Settings, 
    Globe, 
    LogOut,
    Lock,
    AlertTriangle
} from 'lucide-react';

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [password, setPassword] = useState<string>('');
    const [loginError, setLoginError] = useState<string>('');
    const [isMounted, setIsMounted] = useState(false);
    
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        setTimeout(() => {
            setIsMounted(true);
            const isAuth = localStorage.getItem('afrikyia-admin-auth');
            if (isAuth === 'true') {
                setIsAuthenticated(true);
            }
        }, 0);
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === 'afrikyia2026' || password === 'admin') {
            setIsAuthenticated(true);
            setLoginError('');
            localStorage.setItem('afrikyia-admin-auth', 'true');
        } else {
            setLoginError('كلمة المرور غير صحيحة | Incorrect Password');
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('afrikyia-admin-auth');
        router.push('/admin');
    };

    if (!isMounted) return <div className="min-h-screen bg-[#080808]"></div>;

    if (!isAuthenticated) {
        return (
            <main className="min-h-screen bg-black text-white flex items-center justify-center p-6" dir="rtl">
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
                        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">لوحة التحكم في الإنجازات</h1>
                        <p className="text-sm text-white/50 uppercase tracking-widest font-mono">Admin Portal</p>
                    </div>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/5 border border-white/10 backdrop-blur-xl p-8 rounded-2xl shadow-2xl shadow-yellow-500/5"
                    >
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-2">
                                    أدخل رمز التحقق (رمز الإدارة)
                                </label>
                                <div className="relative">
                                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="رمز التحقق (مثال: afrikyia2026)"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pr-12 pl-4 text-center text-white focus:outline-none focus:border-yellow-400 transition-all"
                                        required
                                    />
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
                                دخول لوحة الإدارة
                            </button>
                        </form>
                    </motion.div>
                </div>
            </main>
        );
    }

    const menuItems = [
        { name: 'لوحة التحكم', icon: LayoutDashboard, path: '/admin/dashboard' },
        { name: 'العملاء', icon: Users, path: '/admin/clients' },
        { name: 'العروض', icon: FileText, path: '/admin/offers' },
        { name: 'الفواتير', icon: Receipt, path: '/admin/invoices' },
        { name: 'سندات التسليم', icon: FileBox, path: '/admin/delivery-notes' },
        { name: 'الملفات', icon: Files, path: '/admin/files' },
        { name: 'إدارة الموقع', icon: Globe, path: '/admin/achievements' },
        { name: 'المستخدمون', icon: Users, path: '/admin/users' },
        { name: 'الإعدادات', icon: Settings, path: '/admin/settings' },
    ];

    return (
        <div className="flex h-screen bg-[#111111] text-white font-sans arabic-font" dir="rtl">
            {/* Sidebar */}
            <aside className="w-64 bg-[#0a0a0a] border-l border-white/5 flex flex-col hidden md:flex">
                <div className="p-6 border-b border-white/5">
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
                </div>
                
                <nav className="flex-1 overflow-y-auto py-4">
                    <ul className="space-y-1 px-3">
                        {menuItems.map((item) => {
                            const isActive = pathname.startsWith(item.path);
                            return (
                                <li key={item.path}>
                                    <Link 
                                        href={item.path}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-semibold ${
                                            isActive 
                                                ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/10' 
                                                : 'text-white/60 hover:bg-white/5 hover:text-white'
                                        }`}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        {item.name}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div className="p-4 border-t border-white/5">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                    >
                        <LogOut className="w-5 h-5" />
                        تسجيل الخروج
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                <div className="flex-1 overflow-y-auto p-6 md:p-10">
                    {children}
                </div>
            </main>
        </div>
    );
}
