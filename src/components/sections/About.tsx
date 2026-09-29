"use client";

import { Layers, Users } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useSiteContent } from '@/lib/useSiteContent';

// "About" and "Vision" are edited separately in the admin panel and shown together here.
const About = () => {
    const { t } = useLanguage();
    const { content: about } = useSiteContent('about', {
        tag: t.about.tag,
        title: t.about.title,
        desc1: t.about.desc1,
        desc2: t.about.desc2,
    });
    const { content: vision } = useSiteContent('vision', {
        tag: t.vision.tag,
        title: t.vision.title,
        desc1: t.vision.desc1,
        desc2: t.vision.desc2,
        whatWeBuild: t.vision.whatWeBuild,
        whatWeBuildDesc: t.vision.whatWeBuildDesc,
        forWhom: t.vision.forWhom,
        forWhomDesc: t.vision.forWhomDesc,
    });

    return (
        <section id="about" className="site-section bg-white scroll-mt-16 lg:scroll-mt-[88px]">
            <span id="vision" className="sr-only" aria-hidden="true" />
            <div className="site-container grid lg:grid-cols-12 gap-10 lg:gap-16">
                <div className="lg:col-span-5">
                    <p className="text-brand-red text-sm font-bold">{about.tag}</p>
                    <h2 className="mt-4 text-ink text-3xl lg:text-5xl font-bold leading-tight">{about.title}</h2>
                    <p className="mt-6 text-muted text-base lg:text-lg leading-loose">{about.desc1}</p>
                    <p className="mt-4 text-muted text-base lg:text-lg leading-loose">{about.desc2}</p>
                </div>

                <div className="lg:col-span-7 grid sm:grid-cols-2 gap-4 lg:gap-5 content-start">
                    <div className="sm:col-span-2 rounded-2xl bg-night p-7 lg:p-10">
                        <p className="text-[#FB7185] text-sm font-bold">{vision.tag}</p>
                        <h3 className="mt-3 text-white text-2xl lg:text-3xl font-bold leading-snug">{vision.title}</h3>
                        <p className="mt-4 text-[#C9CED6] leading-loose">{vision.desc1}</p>
                        {vision.desc2 && <p className="mt-3 text-[#A3A9B3] text-sm leading-loose">{vision.desc2}</p>}
                    </div>
                    {[
                        { icon: Layers, title: vision.whatWeBuild, desc: vision.whatWeBuildDesc },
                        { icon: Users, title: vision.forWhom, desc: vision.forWhomDesc },
                    ].map(card => (
                        <div key={card.title} className="rounded-2xl border border-line bg-ground p-6 lg:p-7">
                            <div className="w-11 h-11 rounded-lg bg-red-tint text-brand-red flex items-center justify-center">
                                <card.icon className="w-5 h-5" />
                            </div>
                            <h4 className="mt-5 text-ink text-lg font-bold">{card.title}</h4>
                            <p className="mt-2 text-muted text-[15px] leading-relaxed">{card.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default About;
