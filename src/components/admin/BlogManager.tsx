"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
    BookOpen,
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
    Search,
    Sparkles,
    Calendar,
    Clock,
    Tag,
    Loader2,
    FileText,
} from 'lucide-react';
import {
    BLOG_CATEGORIES,
    type BlogPost,
    type BlogCategory,
    type Locale,
    CATEGORY_DEFINITIONS,
} from '@/data/blog';

interface Props {
    title?: string;
    subtitle?: string;
    isRTL?: boolean;
}

export default function BlogManager({
    title = 'إدارة مقالات ومحتويات المدونة',
    subtitle = 'نشر وتعديل وتحديث وحذف مقالات التكنولوجيا، الأخبار، الدراسات، الاكتشافات والمعارف',
    isRTL = true,
}: Props) {
    const [articles, setArticles] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<'all' | 'published' | 'drafts'>('all');
    const [selectedCategory, setSelectedCategory] = useState<BlogCategory | 'all'>('all');

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [editingArticle, setEditingArticle] = useState<BlogPost | null>(null);
    const [langTab, setLangTab] = useState<Locale>('ar');

    // Form inputs
    const [formSlug, setFormSlug] = useState('');
    const [formCategory, setFormCategory] = useState<BlogCategory>('technology');
    const [formTitleAr, setFormTitleAr] = useState('');
    const [formTitleEn, setFormTitleEn] = useState('');
    const [formTitleFr, setFormTitleFr] = useState('');
    const [formExcerptAr, setFormExcerptAr] = useState('');
    const [formExcerptEn, setFormExcerptEn] = useState('');
    const [formExcerptFr, setFormExcerptFr] = useState('');
    const [formBodyAr, setFormBodyAr] = useState('');
    const [formBodyEn, setFormBodyEn] = useState('');
    const [formBodyFr, setFormBodyFr] = useState('');
    const [formAuthorName, setFormAuthorName] = useState('فريق الهندسة في AFRIKYIA');
    const [formAuthorRole, setFormAuthorRole] = useState('Software Engineering');
    const [formTags, setFormTags] = useState('');
    const [formReadTimeAr, setFormReadTimeAr] = useState('5 دقائق قراءة');
    const [formIsPublished, setFormIsPublished] = useState(true);
    const [formFeatured, setFormFeatured] = useState(false);
    const [formError, setFormError] = useState('');

    const fetchArticles = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/admin/blog', { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                setArticles(data.articles || []);
            } else {
                setError('تعذر تحميل مقالات المدونة');
            }
        } catch {
            setError('خطأ في الاتصال بالخادم');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArticles();
    }, []);

    // Statistics
    const stats = useMemo(() => {
        const total = articles.length;
        const published = articles.filter(a => a.isPublished !== false).length;
        const drafts = articles.filter(a => a.isPublished === false).length;
        const categories = new Set(articles.map(a => a.category)).size;
        return { total, published, drafts, categories };
    }, [articles]);

    // Filtered articles
    const filteredArticles = useMemo(() => {
        let result = articles;

        if (selectedStatus === 'published') {
            result = result.filter(a => a.isPublished !== false);
        } else if (selectedStatus === 'drafts') {
            result = result.filter(a => a.isPublished === false);
        }

        if (selectedCategory !== 'all') {
            result = result.filter(a => a.category === selectedCategory);
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            result = result.filter(a => {
                const title = (a.title.ar + ' ' + a.title.en + ' ' + a.title.fr).toLowerCase();
                const excerpt = (a.excerpt.ar + ' ' + a.excerpt.en + ' ' + a.excerpt.fr).toLowerCase();
                const tags = a.tags.join(' ').toLowerCase();
                const author = a.author.name.toLowerCase();
                return title.includes(q) || excerpt.includes(q) || tags.includes(q) || author.includes(q) || a.slug.includes(q);
            });
        }

        return result;
    }, [articles, selectedStatus, selectedCategory, searchQuery]);

    const openAddModal = () => {
        setEditingArticle(null);
        setFormSlug('');
        setFormCategory('technology');
        setFormTitleAr('');
        setFormTitleEn('');
        setFormTitleFr('');
        setFormExcerptAr('');
        setFormExcerptEn('');
        setFormExcerptFr('');
        setFormBodyAr('');
        setFormBodyEn('');
        setFormBodyFr('');
        setFormAuthorName('فريق الهندسة في AFRIKYIA');
        setFormAuthorRole('Software Engineering');
        setFormTags('Technology, AI, Cloud');
        setFormReadTimeAr('5 دقائق قراءة');
        setFormIsPublished(true);
        setFormFeatured(false);
        setFormError('');
        setLangTab('ar');
        setModalOpen(true);
    };

    const openEditModal = (article: BlogPost) => {
        setEditingArticle(article);
        setFormSlug(article.slug);
        setFormCategory(article.category);
        setFormTitleAr(article.title.ar || '');
        setFormTitleEn(article.title.en || '');
        setFormTitleFr(article.title.fr || '');
        setFormExcerptAr(article.excerpt.ar || '');
        setFormExcerptEn(article.excerpt.en || '');
        setFormExcerptFr(article.excerpt.fr || '');

        const arBody = article.content.ar?.flatMap(s => s.body).join('\n\n') || '';
        const enBody = article.content.en?.flatMap(s => s.body).join('\n\n') || '';
        const frBody = article.content.fr?.flatMap(s => s.body).join('\n\n') || '';
        setFormBodyAr(arBody);
        setFormBodyEn(enBody);
        setFormBodyFr(frBody);

        setFormAuthorName(article.author.name || 'فريق الهندسة في AFRIKYIA');
        setFormAuthorRole(article.author.role || 'Software Engineering');
        setFormTags(article.tags?.join(', ') || '');
        setFormReadTimeAr(article.readTime?.ar || '5 دقائق قراءة');
        setFormIsPublished(article.isPublished !== false);
        setFormFeatured(Boolean(article.featured));
        setFormError('');
        setLangTab('ar');
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingArticle(null);
        setFormError('');
    };

    const handleTogglePublish = async (article: BlogPost) => {
        try {
            const res = await fetch('/api/admin/blog', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    slug: article.slug,
                    action: 'togglePublish',
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setArticles(data.articles || []);
                const newState = article.isPublished === false ? 'تم نشر المقال' : 'تم تحويل المقال إلى مسودة';
                setSuccess(newState);
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError('تعذر تبديل حالة النشر');
            }
        } catch {
            setError('خطأ في الاتصال');
        }
    };

    const handleDelete = async (slug: string, titleName: string) => {
        const confirmed = window.confirm(`هل أنت متأكد من حذف مقال "${titleName}" نهائياً من المدونة؟`);
        if (!confirmed) return;

        try {
            const res = await fetch(`/api/admin/blog?slug=${encodeURIComponent(slug)}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                const data = await res.json();
                setArticles(data.articles || []);
                setSuccess('تم حذف المقال بنجاح');
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError('تعذر حذف المقال');
            }
        } catch {
            setError('خطأ في الاتصال');
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');

        if (!formTitleAr.trim() && !formTitleEn.trim()) {
            setFormError('يرجى إدخال عنوان المقال بالعربية أو بالإنجليزية على الأقل.');
            return;
        }

        if (!formExcerptAr.trim() && !formExcerptEn.trim()) {
            setFormError('يرجى إدخال ملخص المقال.');
            return;
        }

        // Generate or clean slug
        let finalSlug = formSlug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, '');
        if (!finalSlug) {
            const englishBasis = formTitleEn.trim() || 'post';
            finalSlug = englishBasis.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `post-${Date.now()}`;
        }

        // Format tags
        const parsedTags = formTags
            .split(',')
            .map(t => t.trim())
            .filter(t => t.length > 0);

        // Format structured content
        const formatSection = (bodyText: string) => {
            const paragraphs = bodyText
                .split('\n\n')
                .map(p => p.trim())
                .filter(p => p.length > 0);
            return paragraphs.length > 0 ? [{ body: paragraphs }] : [{ body: ['...'] }];
        };

        const payload: Partial<BlogPost> = {
            slug: finalSlug,
            category: formCategory,
            title: {
                ar: formTitleAr.trim() || formTitleEn.trim(),
                en: formTitleEn.trim() || formTitleAr.trim(),
                fr: formTitleFr.trim() || formTitleEn.trim() || formTitleAr.trim(),
            },
            excerpt: {
                ar: formExcerptAr.trim() || formExcerptEn.trim(),
                en: formExcerptEn.trim() || formExcerptAr.trim(),
                fr: formExcerptFr.trim() || formExcerptEn.trim() || formExcerptAr.trim(),
            },
            content: {
                ar: formatSection(formBodyAr || formBodyEn),
                en: formatSection(formBodyEn || formBodyAr),
                fr: formatSection(formBodyFr || formBodyEn || formBodyAr),
            },
            author: {
                name: formAuthorName.trim() || 'AFRIKYIA Engineering',
                role: formAuthorRole.trim() || 'Software Team',
            },
            readTime: {
                ar: formReadTimeAr.trim() || '5 دقائق قراءة',
                en: '5 min read',
                fr: '5 min de lecture',
            },
            tags: parsedTags.length > 0 ? parsedTags : ['Tech'],
            isPublished: formIsPublished,
            featured: formFeatured,
        };

        setSaving(true);
        try {
            if (editingArticle) {
                // Update
                const res = await fetch('/api/admin/blog', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        slug: editingArticle.slug,
                        ...payload,
                    }),
                });

                if (res.ok) {
                    const data = await res.json();
                    setArticles(data.articles || []);
                    closeModal();
                    setSuccess('تم تحديث المقال بنجاح');
                    setTimeout(() => setSuccess(''), 3000);
                } else {
                    const data = await res.json().catch(() => ({}));
                    setFormError(data.error || 'تعذر تحديث المقال');
                }
            } else {
                // Create
                const res = await fetch('/api/admin/blog', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });

                if (res.ok) {
                    const data = await res.json();
                    setArticles(data.articles || []);
                    closeModal();
                    setSuccess('تم إنشاء ونشر المقال بنجاح');
                    setTimeout(() => setSuccess(''), 3000);
                } else {
                    const data = await res.json().catch(() => ({}));
                    setFormError(data.error || 'تعذر إنشاء المقال');
                }
            }
        } catch {
            setFormError('خطأ في الاتصال بالخادم أثناء الحفظ');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Header and Add Action */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-6">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                        <BookOpen className="w-5 h-5 text-yellow-400" />
                        <span>{title}</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-white/60 mt-1">{subtitle}</p>
                </div>

                <button
                    type="button"
                    onClick={openAddModal}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-xs sm:text-sm transition-all shadow-md shadow-yellow-400/20 cursor-pointer shrink-0"
                >
                    <Plus className="w-4 h-4" />
                    <span>كتابة مقال جديد</span>
                </button>
            </div>

            {/* Notifications */}
            {success && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs sm:text-sm text-emerald-300 animate-fade-in">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{success}</span>
                </div>
            )}
            {error && (
                <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs sm:text-sm text-red-300 animate-fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <span className="block text-xs text-white/60">إجمالي المقالات</span>
                    <span className="text-2xl font-bold text-white mt-1 block">{stats.total}</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <span className="block text-xs text-emerald-400">المقالات المنشورة</span>
                    <span className="text-2xl font-bold text-emerald-300 mt-1 block">{stats.published}</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <span className="block text-xs text-amber-400">المسودات / غير المنشورة</span>
                    <span className="text-2xl font-bold text-amber-300 mt-1 block">{stats.drafts}</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <span className="block text-xs text-blue-400">الفئات المفعلة</span>
                    <span className="text-2xl font-bold text-blue-300 mt-1 block">{stats.categories}</span>
                </div>
            </div>

            {/* Search and Filters Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="بحث بالعنوان، الكاتب، أو الوسم..."
                        className="w-full bg-black/40 border border-white/10 rounded-xl ps-10 pe-4 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-yellow-400"
                    />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                    {/* Status filter */}
                    <div className="flex items-center bg-white/5 rounded-xl border border-white/10 p-0.5 text-xs">
                        <button
                            type="button"
                            onClick={() => setSelectedStatus('all')}
                            className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-all ${
                                selectedStatus === 'all' ? 'bg-yellow-400 text-black' : 'text-white/60 hover:text-white'
                            }`}
                        >
                            الكل
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedStatus('published')}
                            className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-all ${
                                selectedStatus === 'published' ? 'bg-yellow-400 text-black' : 'text-white/60 hover:text-white'
                            }`}
                        >
                            منشور
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedStatus('drafts')}
                            className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-all ${
                                selectedStatus === 'drafts' ? 'bg-yellow-400 text-black' : 'text-white/60 hover:text-white'
                            }`}
                        >
                            مسودات
                        </button>
                    </div>

                    {/* Category filter */}
                    <select
                        value={selectedCategory}
                        onChange={e => setSelectedCategory(e.target.value as any)}
                        aria-label="تصفية حسب التصنيف"
                        className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-yellow-400 cursor-pointer"
                    >
                        <option value="all" className="bg-[#141414] text-white">جميع التصنيفات</option>
                        {BLOG_CATEGORIES.map(c => (
                            <option key={c} value={c} className="bg-[#141414] text-white">
                                {CATEGORY_DEFINITIONS[c].names.ar}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Articles Table/List */}
            {loading ? (
                <div className="text-center py-12 border border-white/10 rounded-2xl bg-black/20">
                    <Loader2 className="w-8 h-8 text-yellow-400 animate-spin mx-auto mb-2" />
                    <p className="text-xs sm:text-sm text-white/60">جارٍ تحميل المقالات...</p>
                </div>
            ) : filteredArticles.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl bg-black/20">
                    <FileText className="w-8 h-8 text-white/30 mx-auto mb-2" />
                    <p className="text-sm text-white/60 font-medium">لم يتم العثور على أي مقالات تطابق التصفية.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredArticles.map(article => {
                        const catDef = CATEGORY_DEFINITIONS[article.category];
                        const isPub = article.isPublished !== false;

                        return (
                            <div
                                key={article.slug}
                                className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border transition-all ${
                                    isPub
                                        ? 'bg-black/30 border-white/10 hover:border-white/20'
                                        : 'bg-black/15 border-white/5 opacity-80'
                                }`}
                            >
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${catDef.bgColor} ${catDef.color} border ${catDef.borderColor}`}>
                                            {catDef.names.ar}
                                        </span>

                                        {isPub ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                                منشور للجمهور
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                                مسودة / غير منشور
                                            </span>
                                        )}

                                        {article.featured && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-yellow-400/10 text-yellow-300 border border-yellow-400/20">
                                                <Sparkles className="w-2.5 h-2.5" />
                                                مميز
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                                        {article.title.ar || article.title.en}
                                    </h3>

                                    <div className="flex items-center gap-3 text-xs text-white/50 mt-1 flex-wrap">
                                        <span>{article.author.name}</span>
                                        <span>•</span>
                                        <span>{article.publishedAt}</span>
                                        <span>•</span>
                                        <span className="font-mono text-white/40">/{article.slug}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end border-t sm:border-0 border-white/5 pt-2 sm:pt-0">
                                    {/* Toggle Publish button */}
                                    <button
                                        type="button"
                                        onClick={() => handleTogglePublish(article)}
                                        title={isPub ? 'إيقاف النشر وتحويل لمسودة' : 'نشر المقال للجمهور'}
                                        aria-label={isPub ? 'إيقاف النشر' : 'نشر المقال'}
                                        className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                            isPub
                                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                                                : 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20'
                                        }`}
                                    >
                                        {isPub ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                        <span>{isPub ? 'إيقاف النشر' : 'نشر'}</span>
                                    </button>

                                    {/* View Live */}
                                    <a
                                        href={`/ar/blog/${article.slug}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title="معاينة المقال في الموقع"
                                        aria-label="معاينة"
                                        className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </a>

                                    {/* Edit */}
                                    <button
                                        type="button"
                                        onClick={() => openEditModal(article)}
                                        title="تعديل المقال"
                                        aria-label="تعديل"
                                        className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-yellow-400 hover:border-yellow-400/30 transition-all cursor-pointer"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                    </button>

                                    {/* Delete */}
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(article.slug, article.title.ar || article.slug)}
                                        title="حذف المقال"
                                        aria-label="حذف المقال"
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

            {/* Modal Dialog for Add / Edit Article */}
            {modalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
                    dir={isRTL ? 'rtl' : 'ltr'}
                >
                    <div className="bg-[#141414] border border-white/15 rounded-2xl w-full max-w-2xl p-6 sm:p-8 space-y-5 shadow-2xl relative my-auto max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                                {editingArticle ? (
                                    <>
                                        <Edit3 className="w-5 h-5 text-yellow-400" />
                                        <span>تعديل مقال في المدونة</span>
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-5 h-5 text-yellow-400" />
                                        <span>كتابة مقال جديد للمدونة</span>
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
                            {/* Category Selector */}
                            <div>
                                <label className="block text-xs font-bold text-white/80 mb-2">
                                    التصنيف (Category) <span className="text-red-400">*</span>
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                                    {BLOG_CATEGORIES.map(cat => {
                                        const def = CATEGORY_DEFINITIONS[cat];
                                        const isSelected = formCategory === cat;
                                        return (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => setFormCategory(cat)}
                                                className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                                                    isSelected
                                                        ? 'bg-yellow-400 text-black border-yellow-400 font-bold shadow-md shadow-yellow-400/20'
                                                        : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                                                }`}
                                            >
                                                {def.names.ar}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Language Tabs for Title, Excerpt, Body */}
                            <div className="border border-white/10 rounded-xl p-3.5 bg-black/20 space-y-3">
                                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                    <span className="text-xs font-bold text-white/80">محتوى المقال بلغات متعددة</span>
                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => setLangTab('ar')}
                                            className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                                                langTab === 'ar' ? 'bg-yellow-400 text-black' : 'text-white/60 hover:text-white'
                                            }`}
                                        >
                                            العربية
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setLangTab('en')}
                                            className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                                                langTab === 'en' ? 'bg-yellow-400 text-black' : 'text-white/60 hover:text-white'
                                            }`}
                                        >
                                            English
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setLangTab('fr')}
                                            className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                                                langTab === 'fr' ? 'bg-yellow-400 text-black' : 'text-white/60 hover:text-white'
                                            }`}
                                        >
                                            Français
                                        </button>
                                    </div>
                                </div>

                                {langTab === 'ar' && (
                                    <div className="space-y-3 animate-fade-in">
                                        <div>
                                            <label className="block text-xs font-bold text-white/70 mb-1">
                                                عنوان المقال بالعربية <span className="text-red-400">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={formTitleAr}
                                                onChange={e => setFormTitleAr(e.target.value)}
                                                placeholder="عنوان المقال بالعربية..."
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-400"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-white/70 mb-1">
                                                ملخص المقال بالعربية <span className="text-red-400">*</span>
                                            </label>
                                            <textarea
                                                rows={2}
                                                value={formExcerptAr}
                                                onChange={e => setFormExcerptAr(e.target.value)}
                                                placeholder="ملخص موجز للمقال يظهر في بطاقات المعاينة..."
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-yellow-400 resize-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-white/70 mb-1">
                                                نص المقال (افصل بين الفقرات بسطر فارغ)
                                            </label>
                                            <textarea
                                                rows={4}
                                                value={formBodyAr}
                                                onChange={e => setFormBodyAr(e.target.value)}
                                                placeholder="اكتب نص المقال بالتفصيل هنا..."
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-yellow-400 resize-y"
                                            />
                                        </div>
                                    </div>
                                )}

                                {langTab === 'en' && (
                                    <div className="space-y-3 animate-fade-in" dir="ltr">
                                        <div>
                                            <label className="block text-xs font-bold text-white/70 mb-1">
                                                Article Title (English)
                                            </label>
                                            <input
                                                type="text"
                                                value={formTitleEn}
                                                onChange={e => setFormTitleEn(e.target.value)}
                                                placeholder="Article title in English..."
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-400"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-white/70 mb-1">
                                                Article Excerpt (English)
                                            </label>
                                            <textarea
                                                rows={2}
                                                value={formExcerptEn}
                                                onChange={e => setFormExcerptEn(e.target.value)}
                                                placeholder="Brief summary in English..."
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-yellow-400 resize-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-white/70 mb-1">
                                                Body Content (English)
                                            </label>
                                            <textarea
                                                rows={4}
                                                value={formBodyEn}
                                                onChange={e => setFormBodyEn(e.target.value)}
                                                placeholder="Full article content in English..."
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-yellow-400 resize-y"
                                            />
                                        </div>
                                    </div>
                                )}

                                {langTab === 'fr' && (
                                    <div className="space-y-3 animate-fade-in" dir="ltr">
                                        <div>
                                            <label className="block text-xs font-bold text-white/70 mb-1">
                                                Titre de l’article (Français)
                                            </label>
                                            <input
                                                type="text"
                                                value={formTitleFr}
                                                onChange={e => setFormTitleFr(e.target.value)}
                                                placeholder="Titre de l’article en français..."
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-400"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-white/70 mb-1">
                                                Résumé (Français)
                                            </label>
                                            <textarea
                                                rows={2}
                                                value={formExcerptFr}
                                                onChange={e => setFormExcerptFr(e.target.value)}
                                                placeholder="Court résumé en français..."
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-yellow-400 resize-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-white/70 mb-1">
                                                Contenu (Français)
                                            </label>
                                            <textarea
                                                rows={4}
                                                value={formBodyFr}
                                                onChange={e => setFormBodyFr(e.target.value)}
                                                placeholder="Contenu complet en français..."
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-yellow-400 resize-y"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Slug and Author */}
                            <div className="grid sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-white/80 mb-1">
                                        المعرّف الفريد للرابط (Slug)
                                    </label>
                                    <input
                                        type="text"
                                        value={formSlug}
                                        onChange={e => setFormSlug(e.target.value)}
                                        placeholder="ai-breakthrough-cloud"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-yellow-400"
                                        dir="ltr"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-white/80 mb-1">
                                        اسم الكاتب / المؤلف
                                    </label>
                                    <input
                                        type="text"
                                        value={formAuthorName}
                                        onChange={e => setFormAuthorName(e.target.value)}
                                        placeholder="فريق الهندسة في AFRIKYIA"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-400"
                                    />
                                </div>
                            </div>

                            {/* Tags and ReadTime */}
                            <div className="grid sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-white/80 mb-1">
                                        الوسوم (مفصولة بفواصل)
                                    </label>
                                    <input
                                        type="text"
                                        value={formTags}
                                        onChange={e => setFormTags(e.target.value)}
                                        placeholder="Cloud, AI, Architecture"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-400"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-white/80 mb-1">
                                        وقت القراءة
                                    </label>
                                    <input
                                        type="text"
                                        value={formReadTimeAr}
                                        onChange={e => setFormReadTimeAr(e.target.value)}
                                        placeholder="5 دقائق قراءة"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-400"
                                    />
                                </div>
                            </div>

                            {/* Publish & Featured Toggles */}
                            <div className="grid sm:grid-cols-2 gap-3">
                                <div
                                    onClick={() => setFormIsPublished(!formIsPublished)}
                                    className={`p-3 rounded-xl border cursor-pointer select-none transition-all flex items-center justify-between ${
                                        formIsPublished
                                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                                            : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <input
                                            type="checkbox"
                                            checked={formIsPublished}
                                            onChange={e => setFormIsPublished(e.target.checked)}
                                            className="w-4 h-4 rounded text-emerald-500 accent-emerald-500 cursor-pointer"
                                            onClick={e => e.stopPropagation()}
                                        />
                                        <div>
                                            <span className="text-xs font-bold block">
                                                {formIsPublished ? 'نشر المقال للجمهور' : 'حفظ كمسودة (مخفي)'}
                                            </span>
                                            <span className="text-[11px] opacity-70 block">
                                                {formIsPublished ? 'يظهر مباشرة في المدونة' : 'مخفي عن الزوار'}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold px-2 py-0.5 rounded-md border bg-black/20">
                                        {formIsPublished ? 'منشور' : 'مسودة'}
                                    </span>
                                </div>

                                <div
                                    onClick={() => setFormFeatured(!formFeatured)}
                                    className={`p-3 rounded-xl border cursor-pointer select-none transition-all flex items-center justify-between ${
                                        formFeatured
                                            ? 'bg-yellow-400/10 border-yellow-400/30 text-yellow-300'
                                            : 'bg-white/5 border-white/10 text-white/60'
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <input
                                            type="checkbox"
                                            checked={formFeatured}
                                            onChange={e => setFormFeatured(e.target.checked)}
                                            className="w-4 h-4 rounded text-yellow-400 accent-yellow-400 cursor-pointer"
                                            onClick={e => e.stopPropagation()}
                                        />
                                        <div>
                                            <span className="text-xs font-bold block">
                                                مقال مميز في الواجهة
                                            </span>
                                            <span className="text-[11px] opacity-70 block">
                                                عرض في واجهة المدونة
                                            </span>
                                        </div>
                                    </div>
                                    <Sparkles className="w-4 h-4 text-yellow-400 shrink-0" />
                                </div>
                            </div>

                            {/* Modal Actions */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
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
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-black text-xs font-bold transition-all shadow-md shadow-yellow-400/20 cursor-pointer disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                    <span>{editingArticle ? 'حفظ التعديلات' : 'حفظ المقال ونشره'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

