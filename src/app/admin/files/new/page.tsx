"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function NewFilePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState({
        fileName: '',
        category: 'document',
        description: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulation
        try {
            setTimeout(() => {
                router.push('/admin/files');
            }, 500);
        } catch (error) {
            console.error('Error saving file:', error);
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in text-white" dir="rtl">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        رفع ملف جديد
                    </h1>
                    <p className="text-white/40 text-sm mt-1">قم بتحديد الملف وإدخال تفاصيله لرفعه.</p>
                </div>
                <Link 
                    href="/admin/files"
                    className="bg-white/5 hover:bg-white/10 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all"
                >
                    العودة
                </Link>
            </div>

            {/* Form */}
            <motion.form 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleSubmit}
                className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-6 md:p-8 space-y-6"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* File Upload Mock */}
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-bold text-white/80">اختر الملف</label>
                        <div className="w-full border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-yellow-400/50 transition-all cursor-pointer bg-white/5">
                            <input type="file" className="hidden" id="file-upload" />
                            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-3">
                                <span className="text-4xl">📄</span>
                                <span className="text-white/60 font-semibold">اضغط هنا لاختيار ملف أو اسحب الملف وأفلته هنا</span>
                                <span className="text-white/30 text-xs">يدعم PDF, DOCX, صور (الحد الأقصى 10MB)</span>
                            </label>
                        </div>
                    </div>

                    {/* File Name */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-white/80">اسم الملف</label>
                        <input 
                            type="text" 
                            name="fileName"
                            required
                            value={formData.fileName}
                            onChange={handleChange}
                            placeholder="مثال: عقد شراكة - TDM"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-yellow-400 transition-all"
                        />
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-white/80">التصنيف</label>
                        <select 
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-400 transition-all"
                        >
                            <option value="document">مستندات وعقود</option>
                            <option value="invoice">مرفقات فواتير</option>
                            <option value="design">تصاميم وملحقات</option>
                            <option value="other">أخرى</option>
                        </select>
                    </div>

                    {/* Description */}
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-bold text-white/80">الوصف (اختياري)</label>
                        <textarea 
                            name="description"
                            rows={3}
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="نبذة بسيطة عن الملف..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-yellow-400 transition-all resize-none"
                        />
                    </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex justify-end">
                    <button 
                        type="submit"
                        disabled={isLoading}
                        className={`bg-yellow-400 hover:bg-yellow-500 text-black px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-yellow-400/20 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? 'جاري الرفع...' : 'رفع الملف'}
                    </button>
                </div>
            </motion.form>
        </div>
    );
}
