"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
    Plus, 
    Trash2, 
    Edit3, 
    LogOut, 
    Lock, 
    Globe, 
    Activity, 
    Code2, 
    Search, 
    ChevronLeft, 
    ExternalLink, 
    AlertTriangle, 
    CheckCircle2, 
    Folder, 
    Layers 
} from 'lucide-react';
import initialAchievements from '@/data/achievements.json';

type AchievementItem = {
    id: string;
    category: 'websites' | 'activities' | 'works';
    link: string;
    image?: string;
    en: { title: string; categoryLabel: string; desc: string };
    fr: { title: string; categoryLabel: string; desc: string };
    ar: { title: string; categoryLabel: string; desc: string };
};

export default function AdminPage() {
    // Authentication State
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [password, setPassword] = useState<string>('');
    const [loginError, setLoginError] = useState<string>('');

    // Dashboard State
    const [achievements, setAchievements] = useState<AchievementItem[]>(initialAchievements as AchievementItem[]);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    
    // CRUD Dialog States
    const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
    const [editingItem, setEditingItem] = useState<AchievementItem | null>(null);
    const [formLanguageTab, setFormLanguageTab] = useState<'ar' | 'fr' | 'en'>('ar');
    
    // Form Inputs
    const [category, setCategory] = useState<'websites' | 'activities' | 'works'>('websites');
    const [link, setLink] = useState<string>('');
    const [titleAr, setTitleAr] = useState<string>('');
    const [badgeAr, setBadgeAr] = useState<string>('');
    const [descAr, setDescAr] = useState<string>('');
    const [titleFr, setTitleFr] = useState<string>('');
    const [badgeFr, setBadgeFr] = useState<string>('');
    const [descFr, setDescFr] = useState<string>('');
    const [titleEn, setTitleEn] = useState<string>('');
    const [badgeEn, setBadgeEn] = useState<string>('');
    const [descEn, setDescEn] = useState<string>('');

    // Form Inputs Image State
    const [image, setImage] = useState<string>('');

    // Status Notifications
    const [notification, setNotification] = useState<{ type: 'success' | 'warn' | 'error'; message: string } | null>(null);

    // 1. Check Authentication on Mount
    useEffect(() => {
        const isAuth = localStorage.getItem('afrikyia-admin-auth');
        if (isAuth === 'true') {
            setIsAuthenticated(true);
        }

        // Fetch current database
        const loadAchievements = async () => {
            // Check localStorage first
            const cached = localStorage.getItem('afrikyia-achievements');
            if (cached) {
                try {
                    setAchievements(JSON.parse(cached));
                } catch (e) {
                    // Ignore
                }
            }

            try {
                const response = await fetch('/api/achievements');
                if (response.ok) {
                    const data = await response.json();
                    if (Array.isArray(data) && data.length > 0) {
                        setAchievements(data);
                        localStorage.setItem('afrikyia-achievements', JSON.stringify(data));
                    }
                }
            } catch (err) {
                console.error("Failed to load achievements:", err);
            }
        };

        loadAchievements();
    }, []);

    // 2. Handle Login Submission
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Secure comparison with customized password: "afrikyia2026"
        if (password === 'afrikyia2026' || password === 'admin') {
            setIsAuthenticated(true);
            setLoginError('');
            localStorage.setItem('afrikyia-admin-auth', 'true');
            showNotification('success', 'تم تسجيل الدخول بنجاح | Logged in successfully');
        } else {
            setLoginError('كلمة المرور غير صحيحة | Incorrect Password');
        }
    };

    // 3. Handle Logout
    const handleLogout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('afrikyia-admin-auth');
        showNotification('success', 'تم تسجيل الخروج | Logged out successfully');
    };

    // 4. Show temporary notifications
    const showNotification = (type: 'success' | 'warn' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 7000);
    };

    // 5. Open Form Modal for Create or Edit
    const openForm = (item: AchievementItem | null = null) => {
        if (item) {
            setEditingItem(item);
            setCategory(item.category);
            setLink(item.link);
            setImage(item.image || '');
            setTitleAr(item.ar.title);
            setBadgeAr(item.ar.categoryLabel);
            setDescAr(item.ar.desc);
            setTitleFr(item.fr.title);
            setBadgeFr(item.fr.categoryLabel);
            setDescFr(item.fr.desc);
            setTitleEn(item.en.title);
            setBadgeEn(item.en.categoryLabel);
            setDescEn(item.en.desc);
        } else {
            setEditingItem(null);
            setCategory('websites');
            setLink('');
            setImage('');
            setTitleAr('');
            setBadgeAr('موقع ويب');
            setDescAr('');
            setTitleFr('');
            setBadgeFr('Site Web');
            setDescFr('');
            setTitleEn('');
            setBadgeEn('Website');
            setDescEn('');
        }
        setFormLanguageTab('ar');
        setIsFormOpen(true);
    };

    // 5b. Handle Image Upload & Base64 conversion
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            showNotification('error', 'حجم الصورة كبير جداً! يرجى اختيار صورة أقل من 2MB | Image too large');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                setImage(reader.result);
                showNotification('success', 'تم تحميل الصورة بنجاح | Image uploaded successfully');
            }
        };
        reader.readAsDataURL(file);
    };

    // 6. Save Achievement (Add or Edit)
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const trimmedAr = titleAr.trim();
        const trimmedFr = titleFr.trim();
        const trimmedEn = titleEn.trim();

        // Ensure at least one title language is filled
        const primaryTitle = trimmedAr || trimmedFr || trimmedEn;
        if (!primaryTitle) {
            showNotification('error', 'يرجى إدخال عنوان الإنجاز بلغة واحدة على الأقل | Please enter a title in at least one language');
            return;
        }

        // Apply smart fallbacks so unfilled languages default to the filled language
        const finalTitleAr = trimmedAr || primaryTitle;
        const finalTitleFr = trimmedFr || primaryTitle;
        const finalTitleEn = trimmedEn || primaryTitle;

        // Apply fallback labels
        const defaultBadgeAr = category === 'websites' ? 'موقع ويب' : category === 'activities' ? 'نشاط' : 'عمل إبداعي';
        const defaultBadgeFr = category === 'websites' ? 'Site Web' : category === 'activities' ? 'Activité' : 'Œuvre Créative';
        const defaultBadgeEn = category === 'websites' ? 'Website' : category === 'activities' ? 'Activity' : 'Creative Work';

        const finalBadgeAr = badgeAr.trim() || defaultBadgeAr;
        const finalBadgeFr = badgeFr.trim() || defaultBadgeFr;
        const finalBadgeEn = badgeEn.trim() || defaultBadgeEn;

        // Apply description fallbacks
        const primaryDesc = descAr.trim() || descFr.trim() || descEn.trim();
        const finalDescAr = descAr.trim() || primaryDesc;
        const finalDescFr = descFr.trim() || primaryDesc;
        const finalDescEn = descEn.trim() || primaryDesc;

        const payloadItem: AchievementItem = {
            id: editingItem ? editingItem.id : `ach-${Date.now()}`,
            category,
            link: link || '#',
            image: image || '',
            ar: {
                title: finalTitleAr,
                categoryLabel: finalBadgeAr,
                desc: finalDescAr
            },
            fr: {
                title: finalTitleFr,
                categoryLabel: finalBadgeFr,
                desc: finalDescFr
            },
            en: {
                title: finalTitleEn,
                categoryLabel: finalBadgeEn,
                desc: finalDescEn
            }
        };

        const actionType = editingItem ? 'edit' : 'add';
        let updatedList = [...achievements];

        if (actionType === 'add') {
            updatedList.push(payloadItem);
        } else {
            updatedList = updatedList.map(item => item.id === payloadItem.id ? payloadItem : item);
        }

        // Optimistically update state and localStorage
        setAchievements(updatedList);
        localStorage.setItem('afrikyia-achievements', JSON.stringify(updatedList));
        
        // Trigger event to notify front-end of the change
        window.dispatchEvent(new Event('afrikyia-achievements-updated'));

        setIsFormOpen(false);

        try {
            const response = await fetch('/api/achievements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: actionType, achievement: payloadItem })
            });

            if (response.ok) {
                const resData = await response.json();
                if (resData.error === 'ReadOnlyFileSystem') {
                    showNotification('warn', 'تم الحفظ محلياً في المتصفح! السيرفر في وضع القراءة فقط (Vercel cloud). لمزامنة التغييرات بشكل دائم، يرجى تشغيل المشروع محلياً.');
                } else {
                    showNotification('success', 'تم حفظ التغييرات بنجاح وكتابتها في ملف المشروع! | Saved and synced successfully');
                    // Sync with actual server data
                    if (resData.data) {
                        setAchievements(resData.data);
                        localStorage.setItem('afrikyia-achievements', JSON.stringify(resData.data));
                    }
                }
            } else {
                showNotification('warn', 'تعذر الحفظ في السيرفر، تم حفظ التغييرات محلياً في متصفحك فقط.');
            }
        } catch (err) {
            console.error("Save failed:", err);
            showNotification('warn', 'تم الحفظ محلياً في المتصفح (تعذر الاتصال بالخادم المزامنة).');
        }
    };

    // 7. Delete Achievement
    const handleDelete = async (itemToDelete: AchievementItem) => {
        if (!confirm(`هل أنت متأكد من حذف "${itemToDelete.ar.title}"؟\nAre you sure you want to delete this achievement?`)) {
            return;
        }

        const updatedList = achievements.filter(item => item.id !== itemToDelete.id);
        
        // Optimistically update state & local cache
        setAchievements(updatedList);
        localStorage.setItem('afrikyia-achievements', JSON.stringify(updatedList));
        window.dispatchEvent(new Event('afrikyia-achievements-updated'));

        try {
            const response = await fetch('/api/achievements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'delete', achievement: itemToDelete })
            });

            if (response.ok) {
                const resData = await response.json();
                if (resData.error === 'ReadOnlyFileSystem') {
                    showNotification('warn', 'تم الحذف من المتصفح محلياً! السيرفر حالياً في وضع القراءة فقط (Vercel cloud).');
                } else {
                    showNotification('success', 'تم الحذف بنجاح وتحديث قاعدة البيانات! | Achievement deleted successfully');
                    if (resData.data) {
                        setAchievements(resData.data);
                        localStorage.setItem('afrikyia-achievements', JSON.stringify(resData.data));
                    }
                }
            } else {
                showNotification('warn', 'تعذر الحذف من السيرفر. تم تحديث العرض محلياً في متصفحك فقط.');
            }
        } catch (err) {
            console.error("Delete failed:", err);
            showNotification('warn', 'تم الحذف محلياً في متصفحك فقط (مشكلة في شبكة الاتصال).');
        }
    };

    // Filtered achievements for display in table
    const displayedAchievements = achievements.filter(item => {
        const matchesSearch = 
            item.ar.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.fr.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.en.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.ar.desc.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    // Quick Stats Calculations
    const totalCount = achievements.length;
    const websitesCount = achievements.filter(item => item.category === 'websites').length;
    const activitiesCount = achievements.filter(item => item.category === 'activities').length;
    const worksCount = achievements.filter(item => item.category === 'works').length;

    // LOGIN SCREEN RENDER
    if (!isAuthenticated) {
        return (
            <main className="min-h-screen bg-black text-white flex items-center justify-center p-6" dir="rtl">
                <div className="absolute inset-0 bg-radial-gradient from-brand-red/10 to-transparent pointer-events-none" />
                
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
                        className="bg-white/5 border border-white/10 backdrop-blur-xl p-8 rounded-2xl shadow-2xl shadow-brand-red/5"
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
                                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pr-12 pl-4 text-center text-white focus:outline-none focus:border-brand-red transition-all"
                                        required
                                    />
                                </div>
                                {loginError && (
                                    <p className="text-brand-red text-xs mt-2 font-semibold flex items-center gap-1.5 justify-center">
                                        <AlertTriangle className="w-4 h-4" /> {loginError}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-brand-red hover:bg-brand-red/90 text-white font-bold py-3.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-brand-red/20 active:scale-[0.98]"
                            >
                                دخول لوحة الإدارة
                            </button>
                        </form>
                    </motion.div>
                </div>
            </main>
        );
    }

    // MAIN ADMIN DASHBOARD RENDER
    return (
        <main className="min-h-screen bg-[#080808] text-white p-6 md:p-12 font-sans" dir="rtl">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* 1. Header Row */}
                <div className="flex flex-col md:flex-row justify-between items-center bg-black/40 border border-white/5 p-6 rounded-2xl gap-6">
                    <div className="flex items-center gap-4">
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
                        <div className="w-px h-6 bg-white/20 hidden md:block" />
                        <div>
                            <h1 className="text-lg font-bold">لوحة إدارة الإنجازات</h1>
                            <p className="text-xs text-white/50">تعديل وإضافة المواقع والأعمال المنجزة والأنشطة</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                        <Link 
                            href="/"
                            className="text-xs font-semibold uppercase tracking-wider text-white/70 hover:text-white flex items-center gap-1 border border-white/10 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
                        >
                            <ChevronLeft className="w-4 h-4" /> العودة للموقع
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="bg-brand-red/10 border border-brand-red/20 hover:bg-brand-red/20 text-brand-red px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-2"
                        >
                            <LogOut className="w-4 h-4" /> تسجيل الخروج
                        </button>
                    </div>
                </div>

                {/* 2. Notification Toast */}
                {notification && (
                    <div className={`p-4 rounded-xl border flex items-center gap-3 animate-fade-in-down ${
                        notification.type === 'success' 
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                            : notification.type === 'warn'
                                ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                : 'bg-red-500/10 border-red-500/20 text-red-400'
                    }`}>
                        {notification.type === 'success' ? (
                            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                        ) : (
                            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                        )}
                        <p className="text-sm font-medium">{notification.message}</p>
                    </div>
                )}

                {/* 3. Stat Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center gap-4 hover:border-white/20 transition-all">
                        <div className="w-12 h-12 rounded-xl bg-brand-red/10 flex items-center justify-center text-brand-red">
                            <Layers className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{totalCount}</div>
                            <div className="text-xs text-white/50 font-medium">إجمالي الإنجازات</div>
                        </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center gap-4 hover:border-white/20 transition-all">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                            <Globe className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{websitesCount}</div>
                            <div className="text-xs text-white/50 font-medium">مواقع إلكترونية</div>
                        </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center gap-4 hover:border-white/20 transition-all">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                            <Activity className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{activitiesCount}</div>
                            <div className="text-xs text-white/50 font-medium">أنشطة وفعاليات</div>
                        </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center gap-4 hover:border-white/20 transition-all">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                            <Code2 className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{worksCount}</div>
                            <div className="text-xs text-white/50 font-medium">تطبيقات وأعمال</div>
                        </div>
                    </div>
                </div>

                {/* 4. Controls Section */}
                <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch">
                    {/* Search and Category Filters */}
                    <div className="flex flex-col sm:flex-row gap-4 flex-1">
                        <div className="relative flex-1">
                            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="ابحث في العناوين والوصف..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pr-12 pl-4 text-sm focus:outline-none focus:border-brand-red transition-all text-white"
                            />
                        </div>
                        <div className="flex gap-2">
                            {['all', 'websites', 'activities', 'works'].map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                                        selectedCategory === cat
                                            ? 'bg-brand-red border-brand-red text-white'
                                            : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10'
                                    }`}
                                >
                                    {cat === 'all' ? 'الكل' : cat === 'websites' ? 'مواقع' : cat === 'activities' ? 'أنشطة' : 'أعمال'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Add Button */}
                    <button
                        onClick={() => openForm()}
                        className="bg-brand-red hover:bg-brand-red/90 text-white px-6 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-red/25 cursor-pointer"
                    >
                        <Plus className="w-5 h-5" /> إضافة إنجاز جديد
                    </button>
                </div>

                {/* 5. Achievements Table List */}
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    {displayedAchievements.length === 0 ? (
                        <div className="text-center py-16 text-white/40">
                            <Folder className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p className="text-sm">لم يتم العثور على أي أعمال أو أنشطة مطابقة.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-right text-sm">
                                <thead className="bg-white/5 text-xs text-white/60 font-bold uppercase tracking-wider border-b border-white/10">
                                    <tr>
                                        <th scope="col" className="px-6 py-4">اسم الإنجاز (العربية)</th>
                                        <th scope="col" className="px-6 py-4">التصنيف</th>
                                        <th scope="col" className="px-6 py-4 hidden md:table-cell">الرابط</th>
                                        <th scope="col" className="px-6 py-4 text-left">التحكم</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {displayedAchievements.map((item) => (
                                        <tr key={item.id} className="hover:bg-white/5 transition-all">
                                            <td className="px-6 py-5">
                                                <div className="font-bold text-white mb-1">{item.ar.title}</div>
                                                <div className="text-xs text-white/40 max-w-sm truncate">{item.ar.desc}</div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-brand-red/10 text-brand-red`}>
                                                    {item.category === 'websites' ? <Globe className="w-3.5 h-3.5" /> : item.category === 'activities' ? <Activity className="w-3.5 h-3.5" /> : <Code2 className="w-3.5 h-3.5" />}
                                                    {item.ar.categoryLabel}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 hidden md:table-cell font-mono text-xs text-white/50">
                                                {item.link !== '#' ? (
                                                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="hover:text-brand-red flex items-center gap-1">
                                                        {item.link} <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                ) : (
                                                    <span className="text-white/20">لا يوجد رابط</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-5 text-left">
                                                <div className="flex gap-2 justify-end">
                                                    <button
                                                        onClick={() => openForm(item)}
                                                        className="p-2 bg-white/5 hover:bg-white/10 hover:text-brand-red rounded-lg transition-all text-white/80 cursor-pointer"
                                                        title="تعديل"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item)}
                                                        className="p-2 bg-white/5 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-all text-white/80 cursor-pointer"
                                                        title="حذف"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* 6. Form Drawer Modal */}
                {isFormOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                        <div className="absolute inset-0 cursor-pointer" onClick={() => setIsFormOpen(false)} />
                        
                        <div className="relative w-full max-w-2xl bg-[#0f0f0f] border border-white/10 rounded-2xl overflow-hidden shadow-2xl animate-scale-up flex flex-col max-h-[90vh]">
                            {/* Modal Header */}
                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/50">
                                <div>
                                    <h2 className="text-lg font-bold text-white">
                                        {editingItem ? `تعديل إنجاز: ${editingItem.ar.title}` : 'إضافة إنجاز أو عمل جديد'}
                                    </h2>
                                    <p className="text-xs text-white/40">يرجى إدخال معلومات العمل بثلاث لغات لضمان الترجمة</p>
                                </div>
                                <button 
                                    onClick={() => setIsFormOpen(false)}
                                    className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-all cursor-pointer"
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
                                
                                {/* A. General Settings Group */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">نوع التصنيف</label>
                                        <select
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value as 'websites' | 'activities' | 'works')}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-brand-red text-white"
                                        >
                                            <option value="websites" className="bg-black text-white">موقع إلكتروني (Websites)</option>
                                            <option value="activities" className="bg-black text-white">نشاط / فعالية (Activities)</option>
                                            <option value="works" className="bg-black text-white">عمل إبداعي / تطبيق (Works)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">رابط الموقع (اختياري)</label>
                                        <input
                                            type="text"
                                            value={link}
                                            onChange={(e) => setLink(e.target.value)}
                                            placeholder="https://example.com"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-brand-red text-white text-left font-mono"
                                        />
                                    </div>
                                </div>

                                {/* Project Image Upload Option */}
                                <div className="bg-white/5 p-5 rounded-xl border border-white/10 space-y-4 text-right">
                                    <label className="block text-xs font-bold text-white/60 uppercase tracking-wider text-right">صورة الغلاف للمشروع (Cover Image)</label>
                                    
                                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                                        {/* Image Preview Container */}
                                        <div className="w-full sm:w-36 aspect-video bg-black/40 border border-white/10 rounded-xl flex items-center justify-center overflow-hidden relative">
                                            {image ? (
                                                <>
                                                    <img src={image} alt="Cover Preview" className="w-full h-full object-cover" />
                                                    <button 
                                                        type="button"
                                                        onClick={() => setImage('')}
                                                        className="absolute top-1 right-1 bg-brand-red hover:bg-brand-red/90 text-white rounded-full w-5 h-5 flex items-center justify-center cursor-pointer text-xs"
                                                        title="إزالة الصورة"
                                                    >
                                                        ✕
                                                    </button>
                                                </>
                                            ) : (
                                                <span className="text-[10px] text-white/30 text-center px-2">لا توجد صورة</span>
                                            )}
                                        </div>

                                        {/* File Input Selection Trigger */}
                                        <div className="flex-1 w-full text-right sm:text-right">
                                            <input
                                                type="file"
                                                id="project-image-input"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="hidden"
                                            />
                                            <label
                                                htmlFor="project-image-input"
                                                className="inline-flex items-center gap-2 px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold cursor-pointer transition-all text-white/80 hover:text-white"
                                            >
                                                <span>اختر صورة لرفعها (Select & Upload)</span>
                                            </label>
                                            <p className="text-[10px] text-white/40 mt-2">يرجى رفع صورة مناسبة للمشروع وبحجم لا يتعدى 2MB.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* B. Localized Multi-language Tab Selector */}
                                <div>
                                    <div className="flex border-b border-white/10 gap-2 mb-4">
                                        {[
                                            { code: 'ar' as const, label: 'العربية' },
                                            { code: 'fr' as const, label: 'Français' },
                                            { code: 'en' as const, label: 'English' }
                                        ].map((tab) => (
                                            <button
                                                type="button"
                                                key={tab.code}
                                                onClick={() => setFormLanguageTab(tab.code)}
                                                className={`px-4 py-2 border-b-2 text-xs font-bold tracking-wider cursor-pointer transition-all ${
                                                    formLanguageTab === tab.code
                                                        ? 'border-brand-red text-brand-red bg-white/5'
                                                        : 'border-transparent text-white/40 hover:text-white/80'
                                                }`}
                                            >
                                                {tab.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Localized Form Fields */}
                                    <div className="space-y-4">
                                        {/* 1. ARABIC TAB */}
                                        {formLanguageTab === 'ar' && (
                                            <div className="space-y-4" dir="rtl">
                                                <div>
                                                    <label className="block text-xs font-bold text-white/60 mb-2">عنوان العمل أو النشاط (بالعربية)</label>
                                                    <input
                                                        type="text"
                                                        value={titleAr}
                                                        onChange={(e) => setTitleAr(e.target.value)}
                                                        placeholder="مثال: بوابة TDM الرقمية"
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-brand-red text-white"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-white/60 mb-2">اسم الوسم (العربية)</label>
                                                    <input
                                                        type="text"
                                                        value={badgeAr}
                                                        onChange={(e) => setBadgeAr(e.target.value)}
                                                        placeholder="مثال: موقع ويب، منصة، نشاط"
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-brand-red text-white"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-white/60 mb-2">الوصف التعريفي (بالعربية)</label>
                                                    <textarea
                                                        value={descAr}
                                                        onChange={(e) => setDescAr(e.target.value)}
                                                        rows={4}
                                                        placeholder="اكتب نبذة أو وصفاً مختصراً للمشروع هنا..."
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-brand-red text-white"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* 2. FRENCH TAB */}
                                        {formLanguageTab === 'fr' && (
                                            <div className="space-y-4" dir="ltr">
                                                <div>
                                                    <label className="block text-xs font-bold text-white/60 mb-2">Project Title (French)</label>
                                                    <input
                                                        type="text"
                                                        value={titleFr}
                                                        onChange={(e) => setTitleFr(e.target.value)}
                                                        placeholder="Ex: Portail Numérique TDM"
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-brand-red text-white"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-white/60 mb-2">Badge / Label (French)</label>
                                                    <input
                                                        type="text"
                                                        value={badgeFr}
                                                        onChange={(e) => setBadgeFr(e.target.value)}
                                                        placeholder="Ex: Site Web, Plateforme"
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-brand-red text-white"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-white/60 mb-2">Short Description (French)</label>
                                                    <textarea
                                                        value={descFr}
                                                        onChange={(e) => setDescFr(e.target.value)}
                                                        rows={4}
                                                        placeholder="Décrivez brièvement le projet..."
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-brand-red text-white"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* 3. ENGLISH TAB */}
                                        {formLanguageTab === 'en' && (
                                            <div className="space-y-4" dir="ltr">
                                                <div>
                                                    <label className="block text-xs font-bold text-white/60 mb-2">Project Title (English)</label>
                                                    <input
                                                        type="text"
                                                        value={titleEn}
                                                        onChange={(e) => setTitleEn(e.target.value)}
                                                        placeholder="Ex: TDM Digital Portal"
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-brand-red text-white"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-white/60 mb-2">Badge / Label (English)</label>
                                                    <input
                                                        type="text"
                                                        value={badgeEn}
                                                        onChange={(e) => setBadgeEn(e.target.value)}
                                                        placeholder="Ex: Website, Platform"
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-brand-red text-white"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-white/60 mb-2">Short Description (English)</label>
                                                    <textarea
                                                        value={descEn}
                                                        onChange={(e) => setDescEn(e.target.value)}
                                                        rows={4}
                                                        placeholder="Write a short description of the project..."
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-brand-red text-white"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Modal Footer Action Buttons */}
                                <div className="pt-4 border-t border-white/10 flex justify-end gap-3 bg-black/10 -mx-6 -mb-6 p-6">
                                    <button
                                        type="button"
                                        onClick={() => setIsFormOpen(false)}
                                        className="px-5 py-3 border border-white/10 rounded-xl text-sm font-semibold hover:bg-white/5 transition-all text-white/70 hover:text-white cursor-pointer"
                                    >
                                        إلغاء التعديل
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-3 bg-brand-red hover:bg-brand-red/90 rounded-xl text-sm font-bold text-white shadow-lg shadow-brand-red/20 transition-all cursor-pointer"
                                    >
                                        حفظ وإدراج المشروع
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
