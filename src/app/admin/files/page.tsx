"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function FilesPage() {
    const [files] = useState([]); // Empty for now

    return (
        <div className="space-y-6 animate-fade-in text-white" dir="rtl">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    الملفات
                </h1>
                <Link 
                    href="/admin/files/new"
                    className="bg-yellow-400 hover:bg-yellow-500 text-black px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-yellow-400/20"
                >
                    رفع ملف جديد
                </Link>
            </div>

            {/* List */}
            <div className="space-y-4">
                {files.length === 0 ? (
                    <div className="text-center py-20 bg-[#1a1a1a] border border-white/5 rounded-2xl">
                        <div className="text-white/40 mb-2">لا يوجد ملفات مرفوعة حالياً.</div>
                        <p className="text-white/20 text-sm">سيتم عرض جميع المستندات والملفات المرفوعة هنا.</p>
                    </div>
                ) : (
                    // Future mapping
                    null
                )}
            </div>
        </div>
    );
}
