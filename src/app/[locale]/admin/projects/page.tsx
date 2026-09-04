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
    Search, 
    ChevronLeft, 
    ExternalLink, 
    AlertTriangle, 
    CheckCircle2, 
    Folder, 
    Layers,
    Download,
    Video
} from 'lucide-react';
import initialProjects from '@/data/projects.json';
import { useLanguage } from '@/context/LanguageContext';
import { useRouter } from '@/i18n/routing';

type ProjectItem = {
    id: string;
    link: string;
    image?: string;
    video?: string;
    en: { title: string; desc: string };
    fr: { title: string; desc: string };
    ar: { title: string; desc: string };
};

export default function ProjectsAdminPage() {
    const { t, isRTL, language } = useLanguage();
    const router = useRouter();

    // Authentication State
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    // Dashboard State
    const [projects, setProjects] = useState<ProjectItem[]>(initialProjects as ProjectItem[]);
    const [searchQuery, setSearchQuery] = useState<string>('');
    
    // CRUD Dialog States
    const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
    const [editingItem, setEditingItem] = useState<ProjectItem | null>(null);
    const [formLanguageTab, setFormLanguageTab] = useState<'ar' | 'fr' | 'en'>('ar');
    
    // Form Inputs
    const [link, setLink] = useState<string>('');
    const [video, setVideo] = useState<string>('');
    const [titleAr, setTitleAr] = useState<string>('');
    const [descAr, setDescAr] = useState<string>('');
    const [titleFr, setTitleFr] = useState<string>('');
    const [descFr, setDescFr] = useState<string>('');
    const [titleEn, setTitleEn] = useState<string>('');
    const [descEn, setDescEn] = useState<string>('');

    // Form Inputs Image State
    const [image, setImage] = useState<string>('');

    // Has local browser modifications flag
    const [hasLocalModifications, setHasLocalModifications] = useState<boolean>(false);

    // Status Notifications
    const [notification, setNotification] = useState<{ type: 'success' | 'warn' | 'error'; message: string } | null>(null);

    // Watch local modification flag state
    useEffect(() => {
        setHasLocalModifications(localStorage.getItem('afrikyia-projects-modified') === 'true');
    }, [projects]);

    // 1. Check Authentication on Mount
    useEffect(() => {
        const isAuth = localStorage.getItem('afrikyia-admin-auth');
        if (isAuth === 'true') {
            setIsAuthenticated(true);
        } else {
            router.push('/admin');
        }

        // Fetch current database
        const loadProjects = async () => {
            const hasLocalMod = localStorage.getItem('afrikyia-projects-modified') === 'true';

            // Check localStorage first
            const cached = localStorage.getItem('afrikyia-projects');
            if (cached) {
                try {
                    setProjects(JSON.parse(cached));
                    if (hasLocalMod) {
                        return;
                    }
                } catch (e) {
                    // Ignore
                }
            }

            try {
                const response = await fetch('/api/projects');
                if (response.ok) {
                    const data = await response.json();
                    if (Array.isArray(data)) {
                        setProjects(data);
                        localStorage.setItem('afrikyia-projects', JSON.stringify(data));
                    }
                }
            } catch (err) {
                console.error("Failed to load projects:", err);
            }
        };

        if (isAuth === 'true') {
            loadProjects();
        }
    }, [router]);

    // 3. Handle Logout
    const handleLogout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('afrikyia-admin-auth');
        router.push('/admin');
    };

    // 4. Show temporary notifications
    const showNotification = (type: 'success' | 'warn' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 7000);
    };

    // 5. Open Form Modal for Create or Edit
    const openForm = (item: ProjectItem | null = null) => {
        if (item) {
            setEditingItem(item);
            setLink(item.link || '');
            setVideo(item.video || '');
            setImage(item.image || '');
            setTitleAr(item.ar?.title || '');
            setDescAr(item.ar?.desc || '');
            setTitleFr(item.fr?.title || '');
            setDescFr(item.fr?.desc || '');
            setTitleEn(item.en?.title || '');
            setDescEn(item.en?.desc || '');
        } else {
            setEditingItem(null);
            setLink('');
            setVideo('');
            setImage('');
            setTitleAr('');
            setDescAr('');
            setTitleFr('');
            setDescFr('');
            setTitleEn('');
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

    // 6. Save (Add or Edit)
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const trimmedAr = titleAr.trim();
        const trimmedFr = titleFr.trim();
        const trimmedEn = titleEn.trim();

        // Ensure at least one title language is filled
        const primaryTitle = trimmedAr || trimmedFr || trimmedEn;
        if (!primaryTitle) {
            showNotification('error', 'يرجى إدخال عنوان المشروع بلغة واحدة على الأقل | Please enter a title in at least one language');
            return;
        }

        // Apply smart fallbacks
        const finalTitleAr = trimmedAr || primaryTitle;
        const finalTitleFr = trimmedFr || primaryTitle;
        const finalTitleEn = trimmedEn || primaryTitle;

        // Apply description fallbacks
        const primaryDesc = descAr.trim() || descFr.trim() || descEn.trim();
        const finalDescAr = descAr.trim() || primaryDesc;
        const finalDescFr = descFr.trim() || primaryDesc;
        const finalDescEn = descEn.trim() || primaryDesc;

        const payloadItem: ProjectItem = {
            id: editingItem ? editingItem.id : `proj-${Date.now()}`,
            link: link || '#',
            video: video || '',
            image: image || '',
            ar: { title: finalTitleAr, desc: finalDescAr },
            fr: { title: finalTitleFr, desc: finalDescFr },
            en: { title: finalTitleEn, desc: finalDescEn }
        };

        const actionType = editingItem ? 'edit' : 'add';
        let updatedList = [...projects];

        if (actionType === 'add') {
            updatedList.push(payloadItem);
        } else {
            updatedList = updatedList.map(item => item.id === payloadItem.id ? payloadItem : item);
        }

        // Optimistically update state and localStorage
        setProjects(updatedList);
        localStorage.setItem('afrikyia-projects', JSON.stringify(updatedList));
        
        window.dispatchEvent(new Event('afrikyia-projects-updated'));
        setIsFormOpen(false);

        try {
            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: actionType, project: payloadItem })
            });

            if (response.ok) {
                const resData = await response.json();
                if (resData.error === 'ReadOnlyFileSystem') {
                    localStorage.setItem('afrikyia-projects-modified', 'true');
                    setHasLocalModifications(true);
                    showNotification('warn', 'تم الحفظ محلياً في المتصفح! السيرفر في وضع القراءة فقط.');
                } else {
                    localStorage.setItem('afrikyia-projects-modified', 'false');
                    setHasLocalModifications(false);
                    showNotification('success', 'تم حفظ التغييرات بنجاح | Saved successfully');
                    if (resData.data) {
                        setProjects(resData.data);
                        localStorage.setItem('afrikyia-projects', JSON.stringify(resData.data));
                    }
                }
            } else {
                localStorage.setItem('afrikyia-projects-modified', 'true');
                setHasLocalModifications(true);
                showNotification('warn', 'تعذر الحفظ في السيرفر، تم حفظ التغييرات محلياً في متصفحك فقط.');
            }
        } catch (err) {
            console.error("Save failed:", err);
            localStorage.setItem('afrikyia-projects-modified', 'true');
            setHasLocalModifications(true);
            showNotification('warn', 'تم الحفظ محلياً في المتصفح (تعذر الاتصال بالخادم المزامنة).');
        }
    };

    // 7. Delete
    const handleDelete = async (itemToDelete: ProjectItem) => {
        if (!confirm(`هل أنت متأكد من حذف "${itemToDelete.ar.title}"؟\nAre you sure you want to delete this project?`)) {
            return;
        }

        const updatedList = projects.filter(item => item.id !== itemToDelete.id);
        
        // Optimistically update state & local cache
        setProjects(updatedList);
        localStorage.setItem('afrikyia-projects', JSON.stringify(updatedList));
        window.dispatchEvent(new Event('afrikyia-projects-updated'));

        try {
            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'delete', project: itemToDelete })
            });

            if (response.ok) {
                const resData = await response.json();
                if (resData.error === 'ReadOnlyFileSystem') {
                    localStorage.setItem('afrikyia-projects-modified', 'true');
                    setHasLocalModifications(true);
                    showNotification('warn', 'تم الحذف محلياً! السيرفر في وضع القراءة فقط.');
                } else {
                    localStorage.setItem('afrikyia-projects-modified', 'false');
                    setHasLocalModifications(false);
                    showNotification('success', 'تم الحذف بنجاح | Deleted successfully');
                    if (resData.data) {
                        setProjects(resData.data);
                        localStorage.setItem('afrikyia-projects', JSON.stringify(resData.data));
                    }
                }
            } else {
                localStorage.setItem('afrikyia-projects-modified', 'true');
                setHasLocalModifications(true);
                showNotification('warn', 'تعذر الحذف من السيرفر. تم التحديث محلياً فقط.');
            }
        } catch (err) {
            console.error("Delete failed:", err);
            localStorage.setItem('afrikyia-projects-modified', 'true');
            setHasLocalModifications(true);
            showNotification('warn', 'تم الحذف محلياً في متصفحك فقط.');
        }
    };

    // 7b. Export modified JSON
    const handleExportJSON = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(projects, null, 4));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", "projects.json");
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        showNotification('success', 'تم تحميل ملف projects.json بنجاح');
    };

    // 7c. Reset Local modifications
    const handleResetLocal = async () => {
        if (!confirm('هل أنت متأكد من استعادة النسخة الأصلية من السيرفر وإلغاء التغييرات المحلية؟')) {
            return;
        }
        try {
            const response = await fetch('/api/projects');
            if (response.ok) {
                const data = await response.json();
                setProjects(data);
                localStorage.setItem('afrikyia-projects', JSON.stringify(data));
                localStorage.setItem('afrikyia-projects-modified', 'false');
                setHasLocalModifications(false);
                window.dispatchEvent(new Event('afrikyia-projects-updated'));
                showNotification('success', 'تمت الاستعادة بنجاح');
            }
        } catch (err) {
            showNotification('error', 'تعذر الاتصال بالسيرفر لاسترجاع البيانات الأصلية.');
        }
    };

    // Filtered
    const displayedProjects = projects.filter(item => {
        return item.ar.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
               item.fr.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
               item.en.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
               item.ar.desc.toLowerCase().includes(searchQuery.toLowerCase());
    });

    if (!isAuthenticated) return null;

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className={`flex flex-col md:flex-row justify-between items-center bg-black/40 border border-white/5 p-6 rounded-2xl gap-6`}>
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-lg font-bold">{t.admin.projects?.title || 'Projects'}</h1>
                        <p className="text-xs text-white/70">{t.admin.projects?.subtitle || 'Manage projects'}</p>
                    </div>
                </div>
            </div>

            {/* Notification */}
            {notification && (
                <div className={`p-4 rounded-xl border flex items-center gap-3 animate-fade-in-down ${
                    notification.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                    : notification.type === 'warn' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}>
                    {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                    <p className="text-sm font-medium">{notification.message}</p>
                </div>
            )}

            {/* Local Modifications Warning Banner */}
            {hasLocalModifications && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-4 text-right" dir="rtl">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5" />
                        <div>
                            <h4 className="font-bold text-amber-400 text-sm">تنبيه: وضع التعديل والمعاينة الحية نشط (الخادم في وضع القراءة فقط)</h4>
                            <p className="text-xs text-white/70 mt-1">
                                التغييرات محفوظة محلياً. لتحديث السيرفر، قم بتنزيل الملف واستبداله في المشروع ثم عمل Push إلى GitHub.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleExportJSON} className="px-4 py-2 bg-amber-500 text-black text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-amber-500/25">
                            <Download className="w-4 h-4" /> تنزيل
                        </button>
                        <button onClick={handleResetLocal} className="px-4 py-2 bg-white/5 text-white/70 hover:text-white text-xs font-semibold rounded-xl border border-white/10">
                            استعادة
                        </button>
                    </div>
                </div>
            )}

            {/* Controls Section */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full max-w-md">
                    <Search className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-white/60 w-5 h-5`} />
                    <input
                        type="text"
                        placeholder={t.admin.projects?.searchPlaceholder || 'Search...'}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`w-full bg-white/5 border border-white/10 rounded-xl py-3 ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} text-sm focus:outline-none focus:border-yellow-400 transition-all`}
                    />
                </div>
                <button
                    onClick={() => openForm()}
                    className="w-full sm:w-auto bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-yellow-400/20"
                >
                    <Plus className="w-5 h-5" /> {t.admin.projects?.addNew || 'Add Project'}
                </button>
            </div>

            {/* Table */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                {displayedProjects.length === 0 ? (
                    <div className="text-center py-16 text-white/60">
                        <Folder className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-sm">{t.admin.projects?.noMatches || 'No projects found.'}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className={`w-full ${isRTL ? 'text-right' : 'text-left'} text-sm`}>
                            <thead className="bg-white/5 text-xs text-white/60 font-bold uppercase tracking-wider border-b border-white/10">
                                <tr>
                                    <th scope="col" className="px-6 py-4">{t.admin.projects?.nameCol || 'Name'}</th>
                                    <th scope="col" className="px-6 py-4">Media</th>
                                    <th scope="col" className="px-6 py-4">{t.admin.projects?.linkCol || 'Link'}</th>
                                    <th scope="col" className="px-6 py-4">{t.admin.projects?.actionsCol || 'Actions'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {displayedProjects.map((item) => {
                                    const displayItem = language === 'en' ? item.en : language === 'fr' ? item.fr : item.ar;
                                    return (
                                    <tr key={item.id} className="hover:bg-white/5 transition-all">
                                        <td className="px-6 py-5">
                                            <div className="font-bold text-white mb-1">{displayItem.title}</div>
                                            <div className="text-xs text-white/60 max-w-sm truncate">{displayItem.desc}</div>
                                        </td>
                                        <td className="px-6 py-5 flex items-center gap-2">
                                            {item.image && (
                                                <div className="w-12 h-8 relative rounded overflow-hidden">
                                                    <img src={item.image} alt="Preview" className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                            {item.video && <Video className="w-4 h-4 text-white/60" />}
                                        </td>
                                        <td className="px-6 py-5 font-mono text-xs text-white/70">
                                            {item.link !== '#' ? (
                                                <a href={item.link} target="_blank" rel="noopener noreferrer" className="hover:text-yellow-400 flex items-center gap-1">
                                                    {item.link} <ExternalLink className="w-3 h-3" />
                                                </a>
                                            ) : (
                                                <span className="text-white/20">{t.admin.projects?.noLink || 'No link'}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex gap-2">
                                                <button onClick={() => openForm(item)} className="p-2 bg-white/5 hover:bg-white/10 hover:text-yellow-400 rounded-lg transition-all text-white/80">
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(item)} className="p-2 bg-white/5 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-all text-white/80">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Form Drawer Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" dir={isRTL ? 'rtl' : 'ltr'}>
                    <div className="absolute inset-0 cursor-pointer" onClick={() => setIsFormOpen(false)} />
                    
                    <div className="relative w-full max-w-2xl bg-[#0f0f0f] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/50">
                            <div>
                                <h2 className="text-lg font-bold text-white">
                                    {editingItem ? 'تعديل مشروع' : 'إضافة مشروع جديد'}
                                </h2>
                            </div>
                            <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-white/5 rounded-lg text-white/60 hover:text-white transition-all">✕</button>
                        </div>

                        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">رابط المشروع</label>
                                    <input type="text" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-yellow-400 text-white font-mono text-left" dir="ltr" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">رابط فيديو (يوتيوب أو غيره)</label>
                                    <input type="text" value={video} onChange={(e) => setVideo(e.target.value)} placeholder="https://youtube.com/..." className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-yellow-400 text-white font-mono text-left" dir="ltr" />
                                </div>
                            </div>

                            {/* Image Upload */}
                            <div className="bg-white/5 p-5 rounded-xl border border-white/10 space-y-4">
                                <label className="block text-xs font-bold text-white/60 uppercase tracking-wider">صورة الغلاف (Image)</label>
                                <div className="flex flex-col sm:flex-row gap-4 items-center">
                                    <div className="w-full sm:w-36 aspect-video bg-black/40 border border-white/10 rounded-xl flex items-center justify-center overflow-hidden relative">
                                        {image ? (
                                            <>
                                                <img src={image} alt="Preview" className="w-full h-full object-cover" />
                                                <button type="button" onClick={() => setImage('')} className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">✕</button>
                                            </>
                                        ) : (
                                            <span className="text-[10px] text-white/70">لا توجد صورة</span>
                                        )}
                                    </div>
                                    <div className="flex-1 w-full">
                                        <div className="relative border-2 border-dashed border-white/20 hover:border-yellow-400/50 rounded-xl p-4 text-center cursor-pointer transition-all bg-black/20">
                                            <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                            <p className="text-xs text-white/70">اضغط لرفع صورة أو اسحبها هنا</p>
                                            <p className="text-[10px] text-white/40 mt-1">الحد الأقصى: 2MB (يفضل أبعاد 16:9)</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Translation Tabs */}
                            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                                <div className="flex border-b border-white/10 bg-black/30">
                                    <button type="button" onClick={() => setFormLanguageTab('ar')} className={`flex-1 py-3 text-sm font-bold transition-all ${formLanguageTab === 'ar' ? 'bg-yellow-400/10 text-yellow-400 border-b-2 border-yellow-400' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>العربية (AR)</button>
                                    <button type="button" onClick={() => setFormLanguageTab('en')} className={`flex-1 py-3 text-sm font-bold transition-all ${formLanguageTab === 'en' ? 'bg-yellow-400/10 text-yellow-400 border-b-2 border-yellow-400' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>English (EN)</button>
                                    <button type="button" onClick={() => setFormLanguageTab('fr')} className={`flex-1 py-3 text-sm font-bold transition-all ${formLanguageTab === 'fr' ? 'bg-yellow-400/10 text-yellow-400 border-b-2 border-yellow-400' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>Français (FR)</button>
                                </div>
                                <div className="p-5 space-y-4">
                                    {/* AR */}
                                    {formLanguageTab === 'ar' && (
                                        <div className="space-y-4 animate-fade-in" dir="rtl">
                                            <div>
                                                <label className="block text-xs font-bold text-white/60 mb-2">عنوان المشروع (عربي)</label>
                                                <input type="text" value={titleAr} onChange={(e) => setTitleAr(e.target.value)} required className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-yellow-400 text-white" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-white/60 mb-2">وصف قصير (عربي)</label>
                                                <textarea value={descAr} onChange={(e) => setDescAr(e.target.value)} rows={3} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-yellow-400 text-white resize-none" />
                                            </div>
                                        </div>
                                    )}
                                    {/* EN */}
                                    {formLanguageTab === 'en' && (
                                        <div className="space-y-4 animate-fade-in" dir="ltr">
                                            <div>
                                                <label className="block text-xs font-bold text-white/60 mb-2">Title (English)</label>
                                                <input type="text" value={titleEn} onChange={(e) => setTitleEn(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-yellow-400 text-white" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-white/60 mb-2">Short Description (English)</label>
                                                <textarea value={descEn} onChange={(e) => setDescEn(e.target.value)} rows={3} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-yellow-400 text-white resize-none" />
                                            </div>
                                        </div>
                                    )}
                                    {/* FR */}
                                    {formLanguageTab === 'fr' && (
                                        <div className="space-y-4 animate-fade-in" dir="ltr">
                                            <div>
                                                <label className="block text-xs font-bold text-white/60 mb-2">Titre (Français)</label>
                                                <input type="text" value={titleFr} onChange={(e) => setTitleFr(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-yellow-400 text-white" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-white/60 mb-2">Description courte (Français)</label>
                                                <textarea value={descFr} onChange={(e) => setDescFr(e.target.value)} rows={3} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-yellow-400 text-white resize-none" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Actions */}
                            <div className="pt-4 border-t border-white/10 flex gap-3">
                                <button type="submit" className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 rounded-xl transition-all shadow-lg shadow-yellow-400/20">
                                    حفظ المشروع
                                </button>
                                <button type="button" onClick={() => setIsFormOpen(false)} className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all font-semibold">
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
