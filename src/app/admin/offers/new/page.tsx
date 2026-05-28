"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function NewOfferPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState({
        clientName: '',
        ref: '',
        date: '',
        amount: '',
        status: 'draft',
        description: ''
    });

    useEffect(() => {
        setTimeout(() => {
            setFormData(prev => ({
                ...prev,
                ref: `Q-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(4, '0')}`,
                date: new Date().toISOString().split('T')[0]
            }));
        }, 0);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulation of API call / Saving to LocalStorage
        try {
            const currentData = localStorage.getItem('afrikyia-offers');
            const offers = currentData ? JSON.parse(currentData) : [];
            
            const newOffer = {
                id: Date.now().toString(),
                ref: formData.ref,
                clientName: formData.clientName,
                date: formData.date.split('-').reverse().join('/'), // Convert YYYY-MM-DD to DD/MM/YYYY
                amount: Number(formData.amount),
                status: formData.status,
                description: formData.description
            };
            
            offers.unshift(newOffer);
            localStorage.setItem('afrikyia-offers', JSON.stringify(offers));
            
            // Redirect back to offers
            setTimeout(() => {
                router.push('/admin/offers');
            }, 500);
        } catch (error) {
            console.error('Error saving offer:', error);
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in text-white" dir="rtl">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        إضافة عرض جديد
                    </h1>
                    <p className="text-white/40 text-sm mt-1">قم بتعبئة بيانات العرض لإضافته للنظام.</p>
                </div>
                <Link 
                    href="/admin/offers"
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
                    {/* Client Name */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-white/80">اسم العميل</label>
                        <input 
                            type="text" 
                            name="clientName"
                            required
                            value={formData.clientName}
                            onChange={handleChange}
                            placeholder="مثال: شركة النور"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-yellow-400 transition-all"
                        />
                    </div>

                    {/* Reference */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-white/80">المرجع</label>
                        <input 
                            type="text" 
                            name="ref"
                            required
                            value={formData.ref}
                            onChange={handleChange}
                            dir="ltr"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-yellow-400 transition-all text-left"
                        />
                    </div>

                    {/* Amount */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-white/80">المبلغ (MRU)</label>
                        <input 
                            type="number" 
                            name="amount"
                            required
                            min="0"
                            value={formData.amount}
                            onChange={handleChange}
                            placeholder="مثال: 50000"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-yellow-400 transition-all"
                        />
                    </div>

                    {/* Date */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-white/80">التاريخ</label>
                        <input 
                            type="date" 
                            name="date"
                            required
                            value={formData.date}
                            onChange={handleChange}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-400 transition-all"
                        />
                    </div>

                    {/* Status */}
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-bold text-white/80">الحالة</label>
                        <select 
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-400 transition-all"
                        >
                            <option value="draft">مسودة</option>
                            <option value="sent">مرسل</option>
                            <option value="accepted">مقبول</option>
                            <option value="rejected">مرفوض</option>
                        </select>
                    </div>

                    {/* Description */}
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-bold text-white/80">الوصف التفصيلي</label>
                        <textarea 
                            name="description"
                            rows={4}
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="تفاصيل العرض والمشروع..."
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
                        {isLoading ? 'جاري الحفظ...' : 'حفظ العرض'}
                    </button>
                </div>
            </motion.form>
        </div>
    );
}
