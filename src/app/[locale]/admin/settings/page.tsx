"use client";

import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

export default function SettingsPage() {
    const { t, isRTL } = useLanguage();

    return (
        <div className="space-y-6 animate-fade-in text-white" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Header */}
            <div className={`flex justify-between items-center border-b border-white/5 pb-4 ${isRTL ? 'flex-row' : 'flex-row'}`}>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    {t.admin.settings.title}
                </h1>
                <button className="bg-yellow-400 hover:bg-yellow-500 text-black px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-yellow-400/20">
                    {t.admin.settings.saveChanges}
                </button>
            </div>

            {/* Settings Form Placeholder */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-6 md:p-8 space-y-6"
                >
                    <h3 className="text-xl font-bold mb-4">{t.admin.settings.accountSettings}</h3>
                    
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-white/80">{t.admin.settings.username}</label>
                            <input 
                                type="text" 
                                defaultValue="Admin"
                                className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-400 transition-all ${isRTL ? 'text-right' : 'text-left'}`}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-white/80">{t.admin.settings.newPassword}</label>
                            <input 
                                type="password" 
                                placeholder={t.admin.settings.passwordHint}
                                className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-400 transition-all ${isRTL ? 'text-right' : 'text-left'}`}
                            />
                        </div>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-6 md:p-8 space-y-6"
                >
                    <h3 className="text-xl font-bold mb-4">{t.admin.settings.systemPrefs}</h3>
                    
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                            <div>
                                <h4 className="font-bold">{t.admin.settings.notifications}</h4>
                                <p className="text-xs text-white/50">{t.admin.settings.notificationsHint}</p>
                            </div>
                            <div className="w-12 h-6 bg-yellow-400 rounded-full relative cursor-pointer">
                                <div className={`absolute top-1 w-4 h-4 bg-black rounded-full transition-all ${isRTL ? 'right-1' : 'right-7'}`}></div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                            <div>
                                <h4 className="font-bold">{t.admin.settings.darkMode}</h4>
                                <p className="text-xs text-white/50">{t.admin.settings.darkModeHint}</p>
                            </div>
                            <div className="w-12 h-6 bg-yellow-400 rounded-full relative cursor-pointer">
                                <div className={`absolute top-1 w-4 h-4 bg-black rounded-full transition-all ${isRTL ? 'right-1' : 'right-7'}`}></div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
