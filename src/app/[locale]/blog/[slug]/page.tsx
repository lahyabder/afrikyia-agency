import React from 'react';
import { notFound } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ArticleCard from '@/components/blog/ArticleCard';
import { Link } from '@/i18n/routing';
import {
    getAllArticles,
    getArticleBySlug,
    getRelatedArticles,
    CATEGORY_DEFINITIONS,
    type Locale,
} from '@/data/blog';
import { loadBlogArticles } from '@/lib/blogStore';
import {
    Clock,
    Calendar,
    ChevronLeft,
    ChevronRight,
    ArrowLeft,
    ArrowRight,
    Tag,
    Share2,
    BookOpen,
} from 'lucide-react';

interface Props {
    params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
    const locales = ['ar', 'en', 'fr'];
    const articles = await loadBlogArticles(false);
    const params: { locale: string; slug: string }[] = [];

    for (const locale of locales) {
        for (const article of articles) {
            params.push({
                locale,
                slug: article.slug,
            });
        }
    }

    return params;
}

export async function generateMetadata({ params }: Props) {
    const { locale, slug } = await params;
    const articles = await loadBlogArticles(false);
    const article = articles.find(a => a.slug === slug);

    if (!article) {
        return {
            title: 'Article Not Found | AFRIKYIA',
        };
    }

    const currentLocale = (locale as Locale) || 'ar';
    const title = article.title[currentLocale] || article.title.ar;
    const description = article.excerpt[currentLocale] || article.excerpt.ar;

    return {
        title: `${title} | AFRIKYIA Blog`,
        description,
        openGraph: {
            title: `${title} | AFRIKYIA`,
            description,
            type: 'article',
            publishedTime: article.publishedAt,
            authors: [article.author.name],
            tags: article.tags,
        },
    };
}

export default async function BlogPostPage({ params }: Props) {
    const { locale, slug } = await params;
    const currentLocale = (locale as Locale) || 'ar';
    const isRTL = currentLocale === 'ar';

    const articles = await loadBlogArticles(false);
    const article = articles.find(a => a.slug === slug);
    if (!article) {
        notFound();
    }

    const title = article.title[currentLocale] || article.title.ar;
    const excerpt = article.excerpt[currentLocale] || article.excerpt.ar;
    const readTime = article.readTime[currentLocale] || article.readTime.ar;
    const contentSections = article.content[currentLocale] || article.content.ar;
    const catDef = CATEGORY_DEFINITIONS[article.category];
    const catName = catDef.names[currentLocale] || catDef.names.ar;
    const relatedArticles = getRelatedArticles(slug, 3);

    const labels = {
        home: isRTL ? 'الرئيسية' : currentLocale === 'fr' ? 'Accueil' : 'Home',
        blog: isRTL ? 'المدونة' : 'Blog',
        backToBlog: isRTL ? 'العودة إلى المدونة' : currentLocale === 'fr' ? 'Retour au blog' : 'Back to Blog',
        relatedTitle: isRTL ? 'مقالات وتحليلات ذات صلة' : currentLocale === 'fr' ? 'Articles connexes' : 'Related Articles',
        relatedDesc: isRTL ? 'استكشف المزيد من الأبحاث والدراسات المعرفية في نفس المجال' : currentLocale === 'fr' ? 'Découvrez plus d’analyses dans ce domaine' : 'Explore more research and insights in this topic',
    };

    return (
        <main className={`min-h-screen bg-[#F8FAFC] text-slate-900 ${isRTL ? 'arabic-font' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
            <Header />

            {/* Header Hero Area */}
            <article className="pt-28 sm:pt-36 lg:pt-40 pb-12 sm:pb-16 bg-white border-b border-slate-200/80">
                <div className="site-container max-w-4xl mx-auto">
                    {/* Breadcrumbs */}
                    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 mb-6 flex-wrap">
                        <Link href="/" className="hover:text-brand-red transition-colors">
                            {labels.home}
                        </Link>
                        {isRTL ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        <Link href="/blog" className="hover:text-brand-red transition-colors">
                            {labels.blog}
                        </Link>
                        {isRTL ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        <span className="text-slate-400 truncate max-w-[200px]">
                            {catName}
                        </span>
                    </nav>

                    {/* Category & Read Time Row */}
                    <div className="flex items-center gap-3 flex-wrap mb-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${catDef.bgColor} ${catDef.color} border ${catDef.borderColor}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
                            <span>{catName}</span>
                        </span>

                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{readTime}</span>
                        </span>

                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                            <Calendar className="w-3.5 h-3.5" />
                            <time dateTime={article.publishedAt}>{article.publishedAt}</time>
                        </span>
                    </div>

                    {/* Main Title */}
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-slate-900 leading-tight mb-6">
                        {title}
                    </h1>

                    {/* Excerpt / Lead Paragraph */}
                    <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal mb-8 pb-8 border-b border-slate-100">
                        {excerpt}
                    </p>

                    {/* Author Byline */}
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-3.5">
                            <div className="w-11 h-11 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                                AF
                            </div>
                            <div>
                                <span className="block text-sm font-bold text-slate-900">
                                    {article.author.name}
                                </span>
                                <span className="block text-xs text-slate-400">
                                    {article.author.role}
                                </span>
                            </div>
                        </div>

                        <Link
                            href="/blog"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-brand-red transition-colors"
                        >
                            {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                            <span>{labels.backToBlog}</span>
                        </Link>
                    </div>
                </div>
            </article>

            {/* Article Content Body */}
            <div className="py-12 sm:py-16">
                <div className="site-container max-w-3xl mx-auto">
                    <div className="bg-white rounded-3xl border border-slate-200/80 p-7 sm:p-10 lg:p-12 shadow-xs space-y-8">
                        {contentSections.map((section, idx) => (
                            <section key={idx} className="space-y-4">
                                {section.heading && (
                                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                                        {section.heading}
                                    </h2>
                                )}

                                {section.body.map((para, pIdx) => (
                                    <p key={pIdx} className="text-slate-700 text-base sm:text-lg leading-relaxed font-normal">
                                        {para}
                                    </p>
                                ))}

                                {section.highlight && (
                                    <div className="my-6 p-5 sm:p-6 rounded-2xl bg-slate-50 border-s-4 border-brand-red text-slate-900 font-semibold text-base sm:text-lg leading-relaxed">
                                        <p>« {section.highlight} »</p>
                                    </div>
                                )}
                            </section>
                        ))}

                        {/* Article Tags */}
                        {article.tags.length > 0 && (
                            <div className="pt-8 border-t border-slate-100">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs font-bold text-slate-500">
                                        {isRTL ? 'الوسوم:' : 'Tags:'}
                                    </span>
                                    {article.tags.map(tag => (
                                        <span
                                            key={tag}
                                            className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-lg bg-slate-100 text-slate-700"
                                        >
                                            <Tag className="w-3 h-3 text-slate-400" />
                                            <span>{tag}</span>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Back button */}
                    <div className="mt-8 text-center">
                        <Link
                            href="/blog"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-brand-red text-white text-sm font-bold transition-all shadow-sm cursor-pointer"
                        >
                            {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                            <span>{labels.backToBlog}</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Related Articles Section */}
            {relatedArticles.length > 0 && (
                <section className="py-14 sm:py-20 bg-white border-t border-slate-200/80">
                    <div className="site-container">
                        <div className="max-w-2xl mb-10">
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
                                {labels.relatedTitle}
                            </h2>
                            <p className="text-sm sm:text-base text-slate-600 font-normal">
                                {labels.relatedDesc}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
                            {relatedArticles.map(rel => (
                                <ArticleCard key={rel.slug} article={rel} locale={currentLocale} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            <Footer />
        </main>
    );
}

