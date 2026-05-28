"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export default function FilesPage() {
    const { t, isRTL } = useLanguage();
    const [files] = useState([]); // Empty for now

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
                {files.length === 0 ? (
                    <div className="text-center py-20 bg-[#1a1a1a] border border-white/5 rounded-2xl">
                        <div className="text-white/40 mb-2">{t.admin.files.noFiles}</div>
                        <p className="text-white/20 text-sm">{t.admin.files.noFilesSub}</p>
                    </div>
                ) : (
                    // Future mapping
                    null
                )}
            </div>
        </div>
    );
}
