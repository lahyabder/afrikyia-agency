"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { useLanguage } from '@/context/LanguageContext';

export default function FilesPage() {
    const { t, isRTL } = useLanguage();
    const [files, setFiles] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchFiles = async () => {
            const hasLocalMod = localStorage.getItem('afrikyia-files-modified') === 'true';
            const cached = localStorage.getItem('afrikyia-files');
            
            if (cached) {
                try {
                    setFiles(JSON.parse(cached));
                    if (hasLocalMod) {
                        setIsLoading(false);
                        return;
                    }
                } catch(e) {
                    console.error("Failed to parse cached files");
                }
            }

            try {
                const res = await fetch('/api/files');
                if (res.ok) {
                    const data = await res.json();
                    if (!hasLocalMod || !cached) {
                        setFiles(data);
                        localStorage.setItem('afrikyia-files', JSON.stringify(data));
                    }
                }
            } catch (error) {
                console.error("Failed to fetch files", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchFiles();
    }, []);

    return (
        <div className="space-y-6 animate-fade-in text-white" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Header */}
            <div className={`flex justify-between items-center border-b border-white/5 pb-4 ${isRTL ? 'flex-row' : 'flex-row'}`}>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    {t.admin.files.title}
                </h1>
                <Link 
                    href="/admin/files/new"
                    className="bg-yellow-400 hover:bg-yellow-500 text-black px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-yellow-400/20"
                >
                    {t.admin.files.addFile}
                </Link>
            </div>

            {/* List */}
            <div className="space-y-4">
                {isLoading ? (
                    <div className="text-center py-20 text-white/50">
                        {isRTL ? "جاري التحميل..." : "Loading..."}
                    </div>
                ) : files.length === 0 ? (
                    <div className="text-center py-20 bg-[#1a1a1a] border border-white/5 rounded-2xl">
                        <div className="text-white/60 mb-2">{t.admin.files.noFiles}</div>
                        <p className="text-white/20 text-sm">{t.admin.files.noFilesSub}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {files.map((file) => (
                            <div key={file.id} className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-6 flex flex-col justify-between hover:border-yellow-400/30 transition-all">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="bg-white/5 p-3 rounded-xl text-2xl">
                                            {file.category === 'document' ? '📄' : file.category === 'design' ? '🎨' : file.category === 'invoice' ? '🧾' : '📁'}
                                        </div>
                                        <span className="text-xs font-medium text-white/40 bg-white/5 px-2 py-1 rounded">
                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-lg text-white mb-1 truncate">{file.name}</h3>
                                    <p className="text-sm text-white/50 mb-4">{new Date(file.date).toLocaleDateString()}</p>
                                    
                                    {file.description && (
                                        <p className="text-sm text-white/70 mb-6 line-clamp-2">{file.description}</p>
                                    )}
                                </div>
                                <a 
                                    href={file.url} 
                                    download={file.originalName}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full bg-white/5 hover:bg-yellow-400 hover:text-black text-white text-center py-2.5 rounded-xl text-sm font-bold transition-all"
                                >
                                    {isRTL ? "تحميل الملف" : "Download File"}
                                </a>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
