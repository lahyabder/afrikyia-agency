"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

export default function UsersPage() {
    const { t, isRTL } = useLanguage();
    const [users] = useState([
        { id: 1, name: t.admin.users.adminRole, email: 'admin@afrikyia.mr', role: 'Admin', status: 'active' }
    ]);

    return (
        <div className="space-y-6 animate-fade-in text-white" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Header */}
            <div className={`flex justify-between items-center border-b border-white/5 pb-4 ${isRTL ? 'flex-row' : 'flex-row'}`}>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    {t.admin.users.title}
                </h1>
                <button 
                    onClick={() => alert(`${t.admin.users.addUser}: ${t.admin.common.soon}`)}
                    className="bg-yellow-400 hover:bg-yellow-500 text-black px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-yellow-400/20"
                >
                    {t.admin.users.addUser}
                </button>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map((user, i) => (
                    <motion.div 
                        key={user.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all flex flex-col justify-between"
                    >
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg">{user.name}</h3>
                                    <div className="text-white/60 text-sm mt-1" dir="ltr">{user.email}</div>
                                </div>
                                <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-500/20">
                                    {user.status === 'active' ? t.admin.common.active : t.admin.common.inactive}
                                </span>
                            </div>
                            
                            <div className="inline-block bg-white/10 text-white/80 px-3 py-1 rounded-lg text-xs font-semibold">
                                {user.role}
                            </div>
                        </div>

                        <div className={`mt-6 pt-4 border-t border-white/5 flex gap-2 ${isRTL ? 'justify-end' : 'justify-start'}`}>
                            <button className="bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all">
                                {t.admin.users.editPermissions}
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
