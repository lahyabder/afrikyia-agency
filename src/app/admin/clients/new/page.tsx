"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export default function NewClientPage() {
    const router = useRouter();
    const { t, isRTL } = useLanguage();
    const [isLoading, setIsLoading] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState({
        name: '',
        company: '',
        email: '',
        phone: '',
        status: 'active'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const currentData = localStorage.getItem('afrikyia-clients');
            const clients = currentData ? JSON.parse(currentData) : [];
            
            const newClient = {
                id: Date.now().toString(),
                name: formData.name,
                company: formData.company,
                email: formData.email,
                phone: formData.phone,
                status: formData.status
            };
            
            clients.unshift(newClient);
            localStorage.setItem('afrikyia-clients', JSON.stringify(clients));
            
            // Redirect back to clients
            setTimeout(() => {
                router.push('/admin/clients');
            }, 500);
        } catch (error) {
            console.error('Error saving client:', error);
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in text-white" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Header */}
            <div className={`flex justify-between items-center border-b border-white/5 pb-4 ${isRTL ? 'flex-row' : 'flex-row'}`}>
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        {t.admin.clients.newTitle}
                    </h1>
                    <p className="text-white/40 text-sm mt-1">{t.admin.clients.newSub}</p>
                </div>
                <Link 
                    href="/admin/clients"
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
                className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-6 md:p-8 space-y-6"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-white/80">{t.admin.clients.clientName}</label>
                        <input 
                            type="text" 
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder={t.admin.clients.clientNamePlaceholder}
                            className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-yellow-400 transition-all ${isRTL ? 'text-right' : 'text-left'}`}
                        />
                    </div>

                    {/* Company */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-white/80">{t.admin.clients.companyName}</label>
                        <input 
                            type="text" 
                            name="company"

                            value={formData.company}
                            onChange={handleChange}
                            placeholder={t.admin.clients.companyNamePlaceholder}
                            className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-yellow-400 transition-all ${isRTL ? 'text-right' : 'text-left'}`}
                        />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-white/80">{t.admin.clients.email}</label>
                        <input 
                            type="email" 
                            name="email"

                            value={formData.email}
                            onChange={handleChange}
                            dir="ltr"
                            placeholder={t.admin.clients.emailPlaceholder}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-yellow-400 transition-all text-left"
                        />
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-white/80">{t.admin.clients.phone}</label>
                        <input 
                            type="tel" 
                            name="phone"

                            value={formData.phone}
                            onChange={handleChange}
                            dir="ltr"
                            placeholder={t.admin.clients.phonePlaceholder}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-yellow-400 transition-all text-left"
                        />
                    </div>

                    {/* Status */}
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-bold text-white/80">{t.admin.clients.clientStatus}</label>
                        <select 
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className={`w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-400 transition-all ${isRTL ? 'text-right' : 'text-left'}`}
                        >
                            <option value="active">{t.admin.common.active}</option>
                            <option value="inactive">{t.admin.common.inactive}</option>
                        </select>
                    </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex justify-end">
                    <button 
                        type="submit"
                        disabled={isLoading}
                        className={`bg-yellow-400 hover:bg-yellow-500 text-black px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-yellow-400/20 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? t.admin.clients.saving : t.admin.clients.saveClient}
                    </button>
                </div>
            </motion.form>
        </div>
    );
}
