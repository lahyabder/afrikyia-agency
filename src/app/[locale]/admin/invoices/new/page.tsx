"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export default function NewInvoicePage() {
    const router = useRouter();
    const { t, isRTL } = useLanguage();
    const [isLoading, setIsLoading] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState({
        clientName: '',
        clientAddress: '',
        ref: '',
        date: '',
        netAmount: '',
        status: 'unpaid',
        description: ''
    });

    const netAmountNum = Number(formData.netAmount) || 0;
    const vatAmount = netAmountNum * 0.16;
    const totalAmount = netAmountNum + vatAmount;

    useEffect(() => {
        setTimeout(() => {
            setFormData(prev => ({
                ...prev,
                ref: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(4, '0')}`,
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

        try {
            const currentData = localStorage.getItem('afrikyia-invoices');
            const invoices = currentData ? JSON.parse(currentData) : [];
            
            const newInvoice = {
                id: Date.now().toString(),
                ref: formData.ref,
                clientName: formData.clientName,
                clientAddress: formData.clientAddress,
                date: formData.date.split('-').reverse().join('/'), // Convert YYYY-MM-DD to DD/MM/YYYY
                netAmount: netAmountNum,
                vatAmount: vatAmount,
                totalAmount: totalAmount,
                status: formData.status,
                description: formData.description
            };
            
            invoices.unshift(newInvoice);
            localStorage.setItem('afrikyia-invoices', JSON.stringify(invoices));
            
            setTimeout(() => {
                router.push('/admin/invoices');
            }, 500);
        } catch (error) {
            console.error('Error saving invoice:', error);
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in text-white" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Header */}
            <div className={`flex justify-between items-center border-b border-white/5 pb-4 ${isRTL ? 'flex-row' : 'flex-row'}`}>
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        {t.admin.invoices.newTitle || 'إنشاء فاتورة جديدة'}
                    </h1>
                    <p className="text-white/60 text-sm mt-1">تسجيل فاتورة في النظام المحاسبي المبسط</p>
                </div>
                <Link 
                    href="/admin/invoices"
                    className="bg-white/5 hover:bg-white/10 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all"
                >
                    {t.admin.common.back}
                </Link>
            </div>

            {/* Form */}
            <motion.form 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleSubmit}
                className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-6 md:p-8 space-y-8"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Invoice Ref */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-white/80">رقم الفاتورة</label>
                        <input 
                            type="text" 
                            name="ref"
                            value={formData.ref}
                            onChange={handleChange}
                            dir="ltr"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-brand-red font-bold focus:outline-none focus:border-brand-red transition-all text-left"
                            required
                        />
                    </div>

                    {/* Date */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-white/80">تاريخ الفاتورة</label>
                        <input 
                            type="date" 
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-red transition-all ${isRTL ? 'text-right' : 'text-left'}`}
                            required
                        />
                    </div>

                    {/* Client Name */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-white/80">اسم العميل</label>
                        <input 
                            type="text" 
                            name="clientName"
                            value={formData.clientName}
                            onChange={handleChange}
                            placeholder="شركة ..."
                            className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-red transition-all ${isRTL ? 'text-right' : 'text-left'}`}
                            required
                        />
                    </div>

                    {/* Client Address */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-white/80">عنوان العميل</label>
                        <input 
                            type="text" 
                            name="clientAddress"
                            value={formData.clientAddress}
                            onChange={handleChange}
                            placeholder="العنوان التفصيلي"
                            className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-red transition-all ${isRTL ? 'text-right' : 'text-left'}`}
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-bold text-white/80">طبيعة الخدمة</label>
                        <input 
                            type="text" 
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="تفاصيل الخدمة المقدمة للعميل"
                            className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-red transition-all ${isRTL ? 'text-right' : 'text-left'}`}
                            required
                        />
                    </div>

                    {/* Amount Block */}
                    <div className="md:col-span-2 bg-black/30 border border-white/5 rounded-xl p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-white/80">المبلغ الصافي (MRU)</label>
                                <input 
                                    type="number" 
                                    name="netAmount"
                                    min="0"
                                    value={formData.netAmount}
                                    onChange={handleChange}
                                    placeholder="0"
                                    className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-red transition-all ${isRTL ? 'text-right' : 'text-left'}`}
                                    required
                                />
                            </div>

                            <div className="space-y-2 opacity-80 pointer-events-none">
                                <label className="text-sm font-bold text-amber-400">الضريبة المضافة (16%)</label>
                                <div className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-amber-400 font-mono ${isRTL ? 'text-right' : 'text-left'}`}>
                                    {vatAmount.toLocaleString()}
                                </div>
                            </div>

                            <div className="space-y-2 pointer-events-none">
                                <label className="text-sm font-bold text-emerald-400">الإجمالي النهائي</label>
                                <div className={`w-full bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 text-emerald-400 font-bold font-mono ${isRTL ? 'text-right' : 'text-left'}`}>
                                    {totalAmount.toLocaleString()}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Status */}
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-bold text-white/80">حالة الفاتورة</label>
                        <select 
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className={`w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-red transition-all ${isRTL ? 'text-right' : 'text-left'}`}
                        >
                            <option value="unpaid">غير مدفوعة</option>
                            <option value="paid">مدفوعة</option>
                            <option value="overdue">متأخرة السداد</option>
                        </select>
                    </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex justify-end">
                    <button 
                        type="submit"
                        disabled={isLoading}
                        className={`bg-brand-red hover:bg-brand-red/90 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-brand-red/20 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? 'جاري الحفظ...' : 'حفظ الفاتورة'}
                    </button>
                </div>
            </motion.form>
        </div>
    );
}
