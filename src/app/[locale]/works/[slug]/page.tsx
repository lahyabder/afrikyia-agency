import { notFound } from 'next/navigation';
import Link from 'next/link';
import initialAchievements from '@/data/achievements.json';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { getTranslations } from 'next-intl/server';
import { ExternalLink, Calendar, User, LayoutTemplate, ArrowLeft, ArrowRight } from 'lucide-react';

export async function generateMetadata({ params }: any) {
    const { locale, slug } = await params;
    
    const item = initialAchievements.find(i => i.id === slug);
    if (!item) {
        return {
            title: 'Project Not Found | AFRIKYia'
        };
    }
    const localized = (item as any)[locale] || item.en;
    
    return {
        title: `${localized.title} | AFRIKYia`,
        description: localized.desc,
        openGraph: {
            title: localized.title,
            description: localized.desc,
            type: 'article',
        }
    };
}

export async function generateStaticParams() {
    const locales = ['en', 'fr', 'ar'];
    const params = [];
    
    for (const locale of locales) {
        for (const item of initialAchievements) {
            params.push({ locale, slug: item.id });
        }
    }
    return params;
}

export default async function ProjectPage({ params }: any) {
    const { locale, slug } = await params;
    
    const item = initialAchievements.find(i => i.id === slug);
    
    if (!item) {
        notFound();
    }

    const localized = (item as any)[locale] || item.en;
    const isRTL = locale === 'ar';

    return (
        <main className={`min-h-screen bg-[#080808] text-white ${isRTL ? 'arabic-font' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
            <Header />
            
            <section className="pt-32 pb-20 md:pt-48 md:pb-32 px-6">
                <div className="container mx-auto max-w-5xl">
                    <div className="flex flex-col gap-12">
                        {/* Header Section */}
                        <div className={`flex flex-col gap-6 ${isRTL ? 'text-right' : 'text-left'}`}>
                            <Link 
                                href={`/${locale}`}
                                className="w-fit flex items-center gap-2 text-white/60 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/5"
                            >
                                {isRTL ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
                                <span className="font-medium">{isRTL ? 'العودة' : locale === 'fr' ? 'Retour' : 'Back'}</span>
                            </Link>

                            <div className={`flex items-center gap-3 ${isRTL ? 'justify-start flex-row-reverse' : ''}`}>
                                <span className="text-brand-red bg-brand-red/10 px-4 py-2 rounded-lg text-xs md:text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                                    <LayoutTemplate className="w-4 h-4" />
                                    {item.projectType}
                                </span>
                            </div>
                            
                            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
                                {localized.title}
                            </h1>
                        </div>

                        {/* Image Section */}
                        {(item as any).image && (
                            <div className="w-full aspect-[16/9] md:aspect-[21/9] rounded-3xl overflow-hidden border border-white/10 relative shadow-2xl shadow-brand-red/5">
                                <img 
                                    src={(item as any).image} 
                                    alt={localized.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                            </div>
                        )}

                        {/* Content Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-8">
                            {/* Main Description & Case Study */}
                            <div className="md:col-span-2 space-y-12">
                                <div className="space-y-4">
                                    <h3 className="text-2xl font-bold border-b border-white/10 pb-4">
                                        {isRTL ? 'عن المشروع' : locale === 'fr' ? 'À propos du projet' : 'About the Project'}
                                    </h3>
                                    <p className="text-white/70 text-lg md:text-xl leading-relaxed font-light">
                                        {localized.desc}
                                    </p>
                                </div>

                                {localized.challenge && (
                                    <div className="space-y-4">
                                        <h3 className="text-2xl font-bold border-b border-white/10 pb-4 text-brand-red">
                                            {isRTL ? 'التحدي' : locale === 'fr' ? 'Le Défi' : 'The Challenge'}
                                        </h3>
                                        <p className="text-white/70 text-lg md:text-xl leading-relaxed font-light">
                                            {localized.challenge}
                                        </p>
                                    </div>
                                )}

                                {localized.solution && (
                                    <div className="space-y-4">
                                        <h3 className="text-2xl font-bold border-b border-white/10 pb-4 text-brand-red">
                                            {isRTL ? 'الحل' : locale === 'fr' ? 'La Solution' : 'The Solution'}
                                        </h3>
                                        <p className="text-white/70 text-lg md:text-xl leading-relaxed font-light">
                                            {localized.solution}
                                        </p>
                                    </div>
                                )}

                                {localized.result && (
                                    <div className="space-y-4">
                                        <h3 className="text-2xl font-bold border-b border-white/10 pb-4 text-brand-red">
                                            {isRTL ? 'النتيجة' : locale === 'fr' ? 'Le Résultat' : 'The Result'}
                                        </h3>
                                        <p className="text-white/70 text-lg md:text-xl leading-relaxed font-light">
                                            {localized.result}
                                        </p>
                                    </div>
                                )}

                                {localized.stats && (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-8 border-t border-white/10">
                                        {localized.stats.map((stat: any, idx: number) => (
                                            <div key={idx} className="flex flex-col gap-2">
                                                <span className="text-3xl md:text-4xl font-bold text-white">{stat.value}</span>
                                                <span className="text-white/60 text-xs md:text-sm font-medium uppercase tracking-wider">{stat.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {localized.quote && (
                                    <blockquote className="mt-8 p-8 bg-white/5 rounded-2xl border border-white/10 relative">
                                        <span className={`text-brand-red text-6xl absolute top-4 ${isRTL ? 'right-6' : 'left-6'} opacity-50 font-serif leading-none`}>"</span>
                                        <p className="text-white/90 text-xl md:text-2xl italic leading-relaxed relative z-10 font-light mb-6">
                                            {localized.quote.text}
                                        </p>
                                        <footer className="text-brand-red font-bold text-sm uppercase tracking-wider flex items-center gap-2 relative z-10">
                                            <div className="w-6 h-[1px] bg-brand-red"></div>
                                            {localized.quote.author}
                                        </footer>
                                    </blockquote>
                                )}
                            </div>

                            {/* Meta Info Sidebar */}
                            <div className="space-y-8 bg-white/5 p-8 rounded-3xl border border-white/10 h-fit">
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-white/60 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                                            <Calendar className="w-4 h-4" /> 
                                            {isRTL ? 'سنة الإنجاز' : locale === 'fr' ? 'Année' : 'Year'}
                                        </p>
                                        <p className="text-xl font-medium">{item.year}</p>
                                    </div>
                                    
                                    <div>
                                        <p className="text-white/60 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                                            <User className="w-4 h-4" /> 
                                            {isRTL ? 'العميل' : locale === 'fr' ? 'Client' : 'Client'}
                                        </p>
                                        <p className="text-xl font-medium">{item.client}</p>
                                    </div>
                                </div>

                                {item.link && item.link !== '#' && (
                                    <div className="pt-8 border-t border-white/10">
                                        <a 
                                            href={item.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full bg-brand-red hover:bg-red-700 text-white font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-brand-red/20"
                                        >
                                            {isRTL ? 'زيارة الموقع' : locale === 'fr' ? 'Visiter le Projet' : 'Visit Project'}
                                            <ExternalLink className="w-5 h-5" />
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
