"use client";

import React, { useState, useEffect } from 'react';
import {
    Facebook,
    Linkedin,
    Instagram,
    Youtube,
    Radio,
    Github,
    AtSign,
    Globe,
    Plus,
    Trash2,
    Edit3,
    ExternalLink,
    Check,
    X,
    AlertCircle,
    CheckCircle2,
    Eye,
    EyeOff,
    Share2,
    Loader2,
} from 'lucide-react';
import { TiktokIcon } from '@/components/icons/TiktokIcon';
import {
    SUPPORTED_PLATFORMS,
    PLATFORM_METADATA,
    type SocialAccount,
    type SocialPlatform,
    isValidUrl,
    cleanAndFormatSocialUrl,
} from '@/lib/socials';

// Custom X / Twitter icon
const XIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

export function getPlatformIcon(platform: SocialPlatform, className = 'w-4 h-4') {
    switch (platform) {
        case 'facebook':
            return <Facebook className={className} />;
        case 'tiktok':
            return <TiktokIcon className={className} />;
        case 'linkedin':
            return <Linkedin className={className} />;
        case 'x':
            return <XIcon className={className} />;
        case 'instagram':
            return <Instagram className={className} />;
        case 'youtube':
            return <Youtube className={className} />;
        case 'whatsapp':
            return <Radio className={className} />;
        case 'github':
            return <Github className={className} />;
        case 'threads':
            return <AtSign className={className} />;
        case 'other':
        default:
            return <Globe className={className} />;
    }
}

interface Props {
    title?: string;
    subtitle?: string;
    isRTL?: boolean;
}

export default function SocialAccountsManager({
    title = 'الحسابات الاجتماعية للشركة',
    subtitle = 'إدارة وإضافة وتعديل وحذف روابط منصات التواصل الاجتماعي الرسمية للمؤسسة',
    isRTL = true,
}: Props) {
    const [accounts, setAccounts] = useState<SocialAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState<SocialAccount | null>(null);
    const [formPlatform, setFormPlatform] = useState<SocialPlatform>('facebook');
    const [formUrl, setFormUrl] = useState('');
    const [formHandle, setFormHandle] = useState('');
    const [formLabel, setFormLabel] = useState('');
    const [formIsActive, setFormIsActive] = useState(true);
    const [formError, setFormError] = useState('');

    const fetchAccounts = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/admin/socials', { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                setAccounts(data.accounts || []);
            } else {
                setError('تعذر تحميل الحسابات الاجتماعية');
            }
        } catch {
            setError('خطأ في الاتصال بالخادم');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, []);

    const openAddModal = () => {
        setEditingAccount(null);
        setFormPlatform('facebook');
        setFormUrl('');
        setFormHandle('');
        setFormLabel('');
        setFormIsActive(true);
        setFormError('');
        setModalOpen(true);
    };

    const openEditModal = (account: SocialAccount) => {
        setEditingAccount(account);
        setFormPlatform(account.platform);
        setFormUrl(account.url);
        setFormHandle(account.handle || '');
        setFormLabel(account.label || '');
        setFormIsActive(account.isActive);
        setFormError('');
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingAccount(null);
        setFormError('');
    };

    const handlePlatformChange = (platform: SocialPlatform) => {
        setFormPlatform(platform);
        // Pre-fill suggested placeholder/prefix if URL is empty
        if (!formUrl) {
            setFormUrl(PLATFORM_METADATA[platform]?.prefix || 'https://');
        }
        if (!formLabel || formLabel === PLATFORM_METADATA[formPlatform]?.name) {
            setFormLabel(PLATFORM_METADATA[platform]?.name || platform);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setFormError('');

        const formattedUrl = cleanAndFormatSocialUrl(formUrl, formPlatform);
        if (!isValidUrl(formattedUrl)) {
            setFormError('يرجى إدخال رابط صحيح (مثال: tiktok.com/@username أو https://...)');
            return;
        }

        setSaving(true);
        try {
            if (editingAccount) {
                // Update
                const res = await fetch('/api/admin/socials', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: editingAccount.id,
                        platform: formPlatform,
                        url: formattedUrl,
                        handle: formHandle.trim() || undefined,
                        label: formLabel.trim() || PLATFORM_METADATA[formPlatform]?.name,
                        isActive: formIsActive,
                    }),
                });

                if (res.ok) {
                    const data = await res.json();
                    setAccounts(data.accounts || []);
                    closeModal();
                    setSuccess('تم تعديل الحساب بنجاح');
                    if (typeof window !== 'undefined') {
                        window.dispatchEvent(new CustomEvent('afrikyia-socials-updated', { detail: data.accounts }));
                    }
                    setTimeout(() => setSuccess(''), 4000);
                } else {
                    const data = await res.json().catch(() => ({}));
                    setFormError(data.error || 'تعذر تعديل الحساب');
                }
            } else {
                // Create
                const res = await fetch('/api/admin/socials', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        platform: formPlatform,
                        url: formattedUrl,
                        handle: formHandle.trim() || undefined,
                        label: formLabel.trim() || PLATFORM_METADATA[formPlatform]?.name,
                        isActive: formIsActive,
                        order: accounts.length + 1,
                    }),
                });

                if (res.ok) {
                    const data = await res.json();
                    setAccounts(data.accounts || []);
                    closeModal();
                    setSuccess('تمت إضافة الحساب بنجاح');
                    if (typeof window !== 'undefined') {
                        window.dispatchEvent(new CustomEvent('afrikyia-socials-updated', { detail: data.accounts }));
                    }
                    setTimeout(() => setSuccess(''), 4000);
                } else {
                    const data = await res.json().catch(() => ({}));
                    setFormError(data.error || 'تعذر إضافة الحساب');
                }
            }
        } catch {
            setFormError('خطأ أثناء حفظ البيانات');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string, platformName: string) => {
        if (!window.confirm(`هل أنت متأكد من حذف حساب (${platformName}) نهائياً؟`)) {
            return;
        }

        try {
            const res = await fetch(`/api/admin/socials?id=${encodeURIComponent(id)}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                const data = await res.json();
                setAccounts(data.accounts || []);
                setSuccess('تم حذف الحساب بنجاح');
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('afrikyia-socials-updated', { detail: data.accounts }));
                }
                setTimeout(() => setSuccess(''), 4000);
            } else {
                setError('تعذر حذف الحساب');
            }
        } catch {
            setError('خطأ أثناء حذف الحساب');
        }
    };

    const handleToggleActive = async (account: SocialAccount) => {
        try {
            const res = await fetch('/api/admin/socials', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: account.id,
                    isActive: !account.isActive,
                }),
            });
            if (res.ok) {
                const data = await res.json();
                setAccounts(data.accounts || []);
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('afrikyia-socials-updated', { detail: data.accounts }));
                }
            }
        } catch {
            setError('تعذر تحديث حالة الحساب');
        }
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6 text-white" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 flex items-center justify-center shrink-0">
                        <Share2 className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            {title}
                            <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-yellow-400 font-mono">
                                {accounts.length}
                            </span>
                        </h2>
                        <p className="text-xs text-white/60 mt-0.5">{subtitle}</p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={openAddModal}
                    className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-yellow-400/20 active:scale-95 cursor-pointer"
                >
                    <Plus className="w-4 h-4" />
                    <span>إضافة حساب</span>
                </button>
            </div>

            {/* Notifications */}
            {error && (
                <div className="flex items-center gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-300">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                </div>
            )}
            {success && (
                <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{success}</span>
                </div>
            )}

            {/* Content List */}
            {loading ? (
                <div className="flex items-center justify-center py-12 text-white/50 gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm">جارٍ تحميل الحسابات الاجتماعية...</span>
                </div>
            ) : accounts.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-white/10 rounded-xl bg-black/20">
                    <Share2 className="w-8 h-8 text-white/30 mx-auto mb-2" />
                    <p className="text-sm text-white/60 font-medium">لم يتم إضافة أي حسابات اجتماعية بعد.</p>
                    <button
                        type="button"
                        onClick={openAddModal}
                        className="mt-3 text-xs text-yellow-400 hover:underline inline-block"
                    >
                        + اضغط هنا لإضافة أول حساب
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {accounts.map(acc => {
                        const meta = PLATFORM_METADATA[acc.platform] || PLATFORM_METADATA.other;
                        return (
                            <div
                                key={acc.id}
                                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                                    acc.isActive
                                        ? 'bg-black/30 border-white/10 hover:border-white/20'
                                        : 'bg-black/10 border-white/5 opacity-60'
                                }`}
                            >
                                <div className="flex items-center gap-3.5 min-w-0">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white shrink-0">
                                        {getPlatformIcon(acc.platform, 'w-5 h-5')}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-white truncate">
                                                {acc.label || meta.name}
                                            </span>
                                            {acc.handle && (
                                                <span className="text-xs text-yellow-400/90 font-mono" dir="ltr">
                                                    {acc.handle}
                                                </span>
                                            )}
                                        </div>
                                        <a
                                            href={acc.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-white/50 hover:text-white flex items-center gap-1 truncate mt-0.5"
                                            dir="ltr"
                                        >
                                            <span className="truncate">{acc.url}</span>
                                            <ExternalLink className="w-3 h-3 shrink-0" />
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0 ms-2">
                                    {/* Toggle Active */}
                                    <button
                                        type="button"
                                        onClick={() => handleToggleActive(acc)}
                                        title={acc.isActive ? 'تعطيل الحساب' : 'تفعيل الحساب'}
                                        aria-label={acc.isActive ? 'تعطيل' : 'تفعيل'}
                                        className={`p-2 rounded-lg border transition-all cursor-pointer ${
                                            acc.isActive
                                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                                                : 'bg-white/5 border-white/10 text-white/40 hover:text-white'
                                        }`}
                                    >
                                        {acc.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                    </button>

                                    {/* Edit */}
                                    <button
                                        type="button"
                                        onClick={() => openEditModal(acc)}
                                        title="تعديل الحساب"
                                        aria-label="تعديل"
                                        className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-yellow-400 hover:border-yellow-400/30 transition-all cursor-pointer"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                    </button>

                                    {/* Delete */}
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(acc.id, acc.label || meta.name)}
                                        title="حذف الحساب"
                                        aria-label="حذف"
                                        className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-red-400 hover:border-red-400/30 transition-all cursor-pointer"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal Dialog for Add / Edit */}
            {modalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
                    dir={isRTL ? 'rtl' : 'ltr'}
                >
                    <div className="bg-[#141414] border border-white/15 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl shadow-black/80 relative">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                {editingAccount ? (
                                    <>
                                        <Edit3 className="w-4 h-4 text-yellow-400" />
                                        <span>تعديل حساب اجتماعي</span>
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-4 h-4 text-yellow-400" />
                                        <span>إضافة حساب اجتماعي جديد</span>
                                    </>
                                )}
                            </h3>
                            <button
                                type="button"
                                onClick={closeModal}
                                aria-label="إغلاق"
                                className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/5"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {formError && (
                            <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>{formError}</span>
                            </div>
                        )}

                        <form onSubmit={handleSave} className="space-y-4">
                            {/* Platform selector */}
                            <div>
                                <label className="block text-xs font-bold text-white/80 mb-2">
                                    المنصة (Platform)
                                </label>
                                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                                    {SUPPORTED_PLATFORMS.map(p => {
                                        const isSelected = formPlatform === p;
                                        return (
                                            <button
                                                key={p}
                                                type="button"
                                                onClick={() => handlePlatformChange(p)}
                                                className={`flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                                                    isSelected
                                                        ? 'bg-yellow-400 text-black border-yellow-400 font-bold shadow-md shadow-yellow-400/20'
                                                        : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                                                }`}
                                            >
                                                {getPlatformIcon(p, 'w-4 h-4')}
                                                <span className="capitalize">{p}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* URL input */}
                            <div>
                                <label className="block text-xs font-bold text-white/80 mb-1.5">
                                    رابط الحساب (URL) <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="url"
                                    required
                                    value={formUrl}
                                    onChange={e => setFormUrl(e.target.value)}
                                    placeholder={PLATFORM_METADATA[formPlatform]?.placeholder || 'https://...'}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-400 transition-all"
                                    dir="ltr"
                                />
                                <span className="text-[11px] text-white/40 mt-1 block">
                                    يجب أن يبدأ بـ https:// أو http://
                                </span>
                            </div>

                            {/* Handle input */}
                            <div className="grid sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-white/80 mb-1.5">
                                        المعرّف / اسم المستخدم (Handle)
                                    </label>
                                    <input
                                        type="text"
                                        data-testid="social-handle-input"
                                        value={formHandle}
                                        onChange={e => setFormHandle(e.target.value)}
                                        placeholder="@afrikyiadeveloper"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-400 transition-all"
                                        dir="ltr"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-white/80 mb-1.5">
                                        عنوان العرض (Label)
                                    </label>
                                    <input
                                        type="text"
                                        value={formLabel}
                                        onChange={e => setFormLabel(e.target.value)}
                                        placeholder={PLATFORM_METADATA[formPlatform]?.name}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-400 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Active toggle */}
                            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                                <input
                                    type="checkbox"
                                    id="social-is-active"
                                    checked={formIsActive}
                                    onChange={e => setFormIsActive(e.target.checked)}
                                    className="w-4 h-4 rounded text-yellow-400 focus:ring-yellow-400 accent-yellow-400 cursor-pointer"
                                />
                                <label htmlFor="social-is-active" className="text-xs font-bold text-white cursor-pointer select-none">
                                    تفعيل هذا الحساب وعرضه للجمهور على الموقع
                                </label>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-all cursor-pointer"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-black text-xs font-bold transition-all shadow-md shadow-yellow-400/20 cursor-pointer disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                    <span>{editingAccount ? 'حفظ التعديلات' : 'حفظ'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

