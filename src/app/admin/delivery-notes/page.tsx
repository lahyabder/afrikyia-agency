"use client";

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function DeliveryNotesPage() {
    const [notes] = useState([]); // Empty for now

    return (
        <div className="space-y-6 animate-fade-in text-white" dir="rtl">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    سندات التسليم
                </h1>
                <Link 
                    href="/admin/delivery-notes/new"
                    className="bg-yellow-400 hover:bg-yellow-500 text-black px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-yellow-400/20"
                >
                    سند تسليم جديد
                </Link>
            </div>

            {/* List */}
            <div className="space-y-4">
                {notes.length === 0 ? (
                    <div className="text-center py-20 bg-[#1a1a1a] border border-white/5 rounded-2xl">
                        <div className="text-white/40 mb-2">لا توجد سندات تسليم حالياً.</div>
                        <p className="text-white/20 text-sm">سيتم عرض جميع سندات التسليم هنا فور إضافتها.</p>
                    </div>
                ) : (
                    // Future mapping
                    null
                )}
            </div>
        </div>
    );
}
