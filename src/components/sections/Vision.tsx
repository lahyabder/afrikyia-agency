"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

const Vision = () => {
    const { t, isRTL, language } = useLanguage();

    const [content, setContent] = useState({
        tag: t.vision.tag,
        title: t.vision.title,
        desc1: t.vision.desc1,
        desc2: t.vision.desc2,
        whatWeBuild: t.vision.whatWeBuild,
        whatWeBuildDesc: t.vision.whatWeBuildDesc,
        forWhom: t.vision.forWhom,
        forWhomDesc: t.vision.forWhomDesc
    });

    useEffect(() => {
        const loadContent = () => {
            const cached = localStorage.getItem('afrikyia-vision');
            if (cached) {
                try {
                    const parsed = JSON.parse(cached);
                    if (parsed[language]) {
                        setContent(parsed[language]);
                    }
                } catch (e) {
                    console.error(e);
                }
            } else {
                setContent({
                    tag: t.vision.tag,
                    title: t.vision.title,
                    desc1: t.vision.desc1,
                    desc2: t.vision.desc2,
                    whatWeBuild: t.vision.whatWeBuild,
                    whatWeBuildDesc: t.vision.whatWeBuildDesc,
                    forWhom: t.vision.forWhom,
                    forWhomDesc: t.vision.forWhomDesc
                });
            }
        };

        loadContent();

        window.addEventListener('afrikyia-vision-updated', loadContent);
        return () => window.removeEventListener('afrikyia-vision-updated', loadContent);
    }, [language, t]);

    return (
        <section id="vision" className="py-12 md:py-24 bg-white selection:bg-brand-red selection:text-white">
            <div className="container mx-auto px-6">
                <div className={`max-w-5xl ${isRTL ? 'text-right' : 'text-left'}`}>
                    <motion.div
                        initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "0px 0px -50px 0px", amount: 0.1 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-brand-red text-sm md:text-base font-bold uppercase tracking-[0.4em] mb-8">
                            {content.tag}
                        </h2>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "0px 0px -50px 0px", amount: 0.1 }}
                        transition={{ delay: 0.2, duration: 1 }}
                    >
                        <h3 className="text-slate-900 text-4xl md:text-7xl font-bold leading-[1.1] mb-12">
                            {content.title.split(':').map((part: string, i: number) => (
                                <span key={i}>
                                    {i === 0 ? (
                                        <>{part}: <br /></>
                                    ) : (
                                        <span className="text-brand-red font-medium">{part}</span>
                                    )}
                                </span>
                            ))}
                        </h3>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-6 md:gap-24 mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "0px 0px -50px 0px", amount: 0.1 }}
                            transition={{ delay: 0.4, duration: 0.8 }}
                        >
                            <p className="text-slate-700 text-xl md:text-2xl font-normal leading-relaxed">
                                {content.desc1}
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "0px 0px -50px 0px", amount: 0.1 }}
                            transition={{ delay: 0.6, duration: 0.8 }}
                        >
                            <p className="text-slate-700 text-xl md:text-2xl font-normal leading-relaxed">
                                {content.desc2}
                            </p>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "0px 0px -50px 0px", amount: 0.1 }}
                        transition={{ delay: 0.8, duration: 0.8 }}
                        className="grid md:grid-cols-2 gap-12 pt-16 border-t border-slate-200"
                    >
                        <div>
                            <h4 className="text-brand-red text-xl font-bold mb-4">{content.whatWeBuild}</h4>
                            <p className="text-slate-600 text-lg leading-relaxed">{content.whatWeBuildDesc}</p>
                        </div>
                        <div>
                            <h4 className="text-brand-red text-xl font-bold mb-4">{content.forWhom}</h4>
                            <p className="text-slate-600 text-lg leading-relaxed">{content.forWhomDesc}</p>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
};

export default Vision;
