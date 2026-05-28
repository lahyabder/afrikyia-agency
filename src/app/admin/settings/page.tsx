"use client";

import { motion } from 'framer-motion';

export default function SettingsPage() {
    return (
        <div className="space-y-6 animate-fade-in text-white" dir="rtl">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    الإعدادات
                </h1>
                <button className="bg-yellow-400 hover:bg-yellow-500 text-black px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-yellow-400/20">
                    حفظ التغييرات
                </button>
            </div>

            {/* Settings Form Placeholder */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-6 md:p-8 space-y-6"
                >
                    <h3 className="text-xl font-bold mb-4">إعدادات الحساب</h3>
                    
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-white/80">اسم المستخدم</label>
                            <input 
                                type="text" 
                                defaultValue="مدير النظام"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-400 transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-white/80">كلمة المرور الجديدة</label>
                            <input 
                                type="password" 
                                placeholder="ترك الحقل فارغاً للاحتفاظ بكلمة المرور الحالية"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-400 transition-all"
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
                    <h3 className="text-xl font-bold mb-4">تفضيلات النظام</h3>
                    
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                            <div>
                                <h4 className="font-bold">الإشعارات</h4>
                                <p className="text-xs text-white/50">تلقي إشعارات عند إضافة عروض جديدة</p>
                            </div>
                            <div className="w-12 h-6 bg-yellow-400 rounded-full relative cursor-pointer">
                                <div className="absolute right-1 top-1 w-4 h-4 bg-black rounded-full transition-all"></div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                            <div>
                                <h4 className="font-bold">الوضع الليلي</h4>
                                <p className="text-xs text-white/50">تفعيل الوضع الليلي بشكل دائم</p>
                            </div>
                            <div className="w-12 h-6 bg-yellow-400 rounded-full relative cursor-pointer">
                                <div className="absolute right-1 top-1 w-4 h-4 bg-black rounded-full transition-all"></div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
