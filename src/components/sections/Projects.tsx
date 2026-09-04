"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Play, X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

type ProjectItem = {
    id: string;
    link: string;
    image?: string;
    video?: string;
    en: { title: string; desc: string };
    fr: { title: string; desc: string };
    ar: { title: string; desc: string };
};

export default function Projects() {
    const { t, isRTL, language } = useLanguage();
    const [projects, setProjects] = useState<ProjectItem[]>([]);
    const [activeVideo, setActiveVideo] = useState<string | null>(null);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await fetch('/api/projects');
                if (res.ok) {
                    const data = await res.json();
                    setProjects(data);
                }
            } catch (err) {
                console.error("Failed to fetch projects", err);
            }
        };

        fetchProjects();

        // Listen for updates from the dashboard
        const handleUpdate = () => {
            fetchProjects();
        };

        window.addEventListener('afrikyia-projects-updated', handleUpdate);
        return () => window.removeEventListener('afrikyia-projects-updated', handleUpdate);
    }, []);

    // Get YouTube embed URL from standard watch URL
    const getEmbedUrl = (url: string) => {
        if (!url) return '';
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11)
          ? `https://www.youtube.com/embed/${match[2]}?autoplay=1`
          : url;
    };

    if (projects.length === 0) return null;

    return (
        <section className="py-24 md:py-32 bg-black relative overflow-hidden" id="projects" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none mix-blend-overlay"></div>
            
            {/* Top Right gradient orb */}
            <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-yellow-500/5 rounded-full blur-[100px] pointer-events-none transform translate-x-1/2 -translate-y-1/2"></div>
            
            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                <div className={`mb-16 md:mb-24 flex flex-col md:flex-row gap-8 items-start justify-between`}>
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        className="max-w-3xl"
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-[1px] w-12 bg-yellow-400"></div>
                            <span className="text-yellow-400 text-sm font-mono tracking-[0.2em] uppercase font-bold">
                                {t.projects?.tag || 'Our Projects'}
                            </span>
                        </div>
                        <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight text-white mb-6">
                            {t.projects?.title || 'Projects'}
                        </h2>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {projects.map((project, index) => {
                        const displayItem = language === 'en' ? project.en : language === 'fr' ? project.fr : project.ar;
                        
                        return (
                            <motion.div
                                key={project.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ delay: index * 0.1, duration: 0.5 }}
                                className="group relative bg-[#0a0a0a] rounded-3xl overflow-hidden border border-white/5 hover:border-yellow-400/30 transition-colors duration-500 flex flex-col h-full"
                            >
                                {/* Media Container */}
                                <div className="relative aspect-[4/3] w-full overflow-hidden bg-white/5">
                                    {project.image ? (
                                        <img 
                                            src={project.image} 
                                            alt={displayItem.title}
                                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-white/20">
                                            No Image
                                        </div>
                                    )}
                                    
                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                                        {project.video && (
                                            <button 
                                                onClick={() => setActiveVideo(project.video!)}
                                                className="w-16 h-16 rounded-full bg-yellow-400 text-black flex items-center justify-center transform scale-50 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-500 hover:bg-yellow-300"
                                                title={t.projects?.watchVideo || 'Watch Video'}
                                            >
                                                <Play className="w-6 h-6 ml-1" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-8 flex flex-col flex-1 relative z-10 bg-gradient-to-t from-black via-[#0a0a0a] to-[#0a0a0a]">
                                    <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-yellow-400 transition-colors">
                                        {displayItem.title}
                                    </h3>
                                    <p className="text-white/60 text-sm leading-relaxed mb-8 flex-1">
                                        {displayItem.desc}
                                    </p>
                                    
                                    <div className="mt-auto pt-6 border-t border-white/5">
                                        {project.link !== '#' && (
                                            <a 
                                                href={project.link} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 text-sm font-bold text-white hover:text-yellow-400 transition-colors"
                                            >
                                                <span>{t.projects?.viewProject || 'View Project'}</span>
                                                <ExternalLink className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Video Modal */}
            <AnimatePresence>
                {activeVideo && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 bg-black/90 backdrop-blur-md"
                    >
                        <div className="absolute inset-0 cursor-pointer" onClick={() => setActiveVideo(null)} />
                        <button 
                            onClick={() => setActiveVideo(null)}
                            className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-10"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        
                        <div className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                            <iframe 
                                src={getEmbedUrl(activeVideo)} 
                                className="w-full h-full border-0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowFullScreen
                            ></iframe>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
