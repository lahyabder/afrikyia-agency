"use client";

import React, { Suspense } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import BlogManager from '@/components/admin/BlogManager';

export default function AdminBlogPage() {
    const { t, isRTL } = useLanguage();

    const title = (t.admin as any)?.blog?.title || (isRTL ? 'إدارة المدونة والمقالات' : 'Gestion du Blog & Articles');
    const subtitle = (t.admin as any)?.blog?.subtitle || (
        isRTL 
            ? 'إضافة وتعديل وحذف ونشر المقالات التقنية والمعرفية على موقع أفريقيا' 
            : 'Ajouter, modifier, supprimer et publier des articles sur Afrikyia'
    );

    return (
        <Suspense fallback={<div className="p-8 text-white/50">جاري التحميل...</div>}>
            <div className="space-y-8 animate-fade-in pb-12" dir={isRTL ? 'rtl' : 'ltr'}>
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
                    <p className="text-sm text-white/70 mt-1">{subtitle}</p>
                </div>

                <BlogManager />
            </div>
        </Suspense>
    );
}

