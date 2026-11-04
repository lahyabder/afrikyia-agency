import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BlogList from '@/components/blog/BlogList';
import { getAllArticles, type Locale } from '@/data/blog';
import { Sparkles, BookOpen } from 'lucide-react';

interface Props {
    params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props) {
    const { locale } = await params;
    const isAr = locale === 'ar';
    const isFr = locale === 'fr';

    const title = isAr
        ? 'مدونة أفريقيا | مقالات ودراسات التكنولوجيا والمعرفة'
        : isFr
        ? 'Blog AFRIKYIA | Technologies, Savoirs et Études Numériques'
        : 'AFRIKYIA Blog | Technology, Insights & Digital Studies';

    const description = isAr
        ? 'منصة فكرية وهندسية تنشر أحدث المقالات والأخبار والدراسات الميدانية والاكتشافات التقنية في مجال تطوير البرمجيات والحلول الرقمية في إفريقيا.'
        : isFr
        ? 'Plateforme éditoriale et technique publiant les dernières actualités, études de terrain et innovations logicielles en Afrique.'
        : 'Thought leadership and software engineering platform publishing deep insights, field studies, and technology discoveries across Africa.';

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: 'website',
        },
    };
}

export default async function BlogPage({ params }: Props) {
    const { locale } = await params;
    const currentLocale = (locale as Locale) || 'ar';
    const isRTL = currentLocale === 'ar';
    const articles = getAllArticles();

    const t = {
        badge: isRTL
            ? 'مدونة أفريقيا المؤسسية'
            : currentLocale === 'fr'
            ? 'Blog & Savoirs AFRIKYIA'
            : 'AFRIKYIA Insights & Blog',
        title: isRTL
            ? 'المعرفة، التكنولوجيا، وأحدث الدراسات الرقمية'
            : currentLocale === 'fr'
            ? 'Technologies, Études et Découvertes Numériques'
            : 'Technology, Research & Digital Discoveries',
        desc: isRTL
            ? 'مقالات متخصصة، قراءات تحليلية، وآخر المستجدات التقنية في هندسة البرمجيات والأنظمة المؤسسية وسلاسل الإمداد في إفريقيا والمنطقة.'
            : currentLocale === 'fr'
            ? 'Analyses approfondies, retours d’expérience et actualités technologiques sur l’ingénierie logicielle et les systèmes d’information en Afrique.'
            : 'In-depth engineering analyses, field studies, and breaking updates on software platforms, cloud infrastructure, and digital logistics.',
    };

    return (
        <main className={`min-h-screen bg-[#F8FAFC] text-slate-900 ${isRTL ? 'arabic-font' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
            <Header />

            {/* Hero Section */}
            <section className="pt-28 pb-12 sm:pt-36 sm:pb-16 lg:pt-40 lg:pb-20 bg-white border-b border-slate-200/80 relative overflow-hidden">
                <div className="site-container relative z-10 text-center max-w-4xl mx-auto">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 border border-rose-200/60 px-4 py-1.5 text-xs font-bold text-brand-red mb-5 shadow-2xs">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{t.badge}</span>
                    </div>

                    {/* Main Title */}
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight sm:leading-tight lg:leading-tight mb-5">
                        {t.title}
                    </h1>

                    {/* Description */}
                    <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto font-normal">
                        {t.desc}
                    </p>
                </div>
            </section>

            {/* Articles and Filter Section */}
            <section className="py-12 sm:py-16 lg:py-20">
                <div className="site-container">
                    <BlogList articles={articles} locale={currentLocale} />
                </div>
            </section>

            <Footer />
        </main>
    );
}

