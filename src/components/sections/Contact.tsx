"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { Send, Mail, Phone, CheckCircle2, AlertCircle, Facebook } from 'lucide-react';
import { TiktokIcon } from '@/components/icons/TiktokIcon';

const Contact = () => {
    const { t, isRTL } = useLanguage();
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState<string>("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        setStatus("loading");
        setErrorMessage("");
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
            const url = process.env.NEXT_PUBLIC_FORMSPREE_URL || "https://formspree.io/f/YOUR_FORM_ID";
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                setStatus("success");
                form.reset();
            } else {
                const errData = await response.text();
                setStatus("error");
                setErrorMessage(`Status: ${response.status}. Details: ${errData}`);
            }
        } catch (error: any) {
            setStatus("error");
            setErrorMessage(error.message || String(error));
        }
    };

    return (
        <section id="contact" className="py-16 md:py-24 bg-[#F8FAFC] relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
            <div className="absolute top-[20%] right-[10%] w-[30rem] h-[30rem] bg-brand-red/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-6xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-10 md:gap-12 items-center">
                        
                        {/* Text and Info */}
                        <div className={`space-y-6 ${isRTL ? 'text-right' : 'text-left'}`}>
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                            >
                                <h2 className="text-brand-red text-sm font-bold uppercase tracking-[0.4em] mb-4">
                                    {t.contact.tag}
                                </h2>
                                <h3 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-[1.1] mb-6">
                                    {t.contact.title}
                                </h3>
                                <p className="text-slate-600 text-base md:text-lg font-light leading-relaxed max-w-lg">
                                    {t.contact.desc}
                                </p>
                            </motion.div>

                            <motion.div 
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="flex flex-col gap-4 pt-6"
                            >
                                <a href="mailto:contact@afrikyia.com" className="flex items-center gap-4 text-slate-700 bg-white border border-slate-200 px-6 py-3 rounded-full hover:border-brand-red hover:text-brand-red transition-all w-fit shadow-sm group">
                                    <div className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center group-hover:border-brand-red/20 transition-colors">
                                        <Mail className="w-4 h-4 text-slate-500 group-hover:text-brand-red" />
                                    </div>
                                    <span className="text-sm md:text-base font-medium" dir="ltr">contact@afrikyia.com</span>
                                </a>
                                <a href="tel:+22224232202" className="flex items-center gap-4 text-slate-700 bg-white border border-slate-200 px-6 py-3 rounded-full hover:border-brand-red hover:text-brand-red transition-all w-fit shadow-sm group">
                                    <div className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center group-hover:border-brand-red/20 transition-colors">
                                        <Phone className="w-4 h-4 text-slate-500 group-hover:text-brand-red" />
                                    </div>
                                    <span className="text-sm md:text-base font-medium" dir="ltr">+222 24 23 22 02</span>
                                </a>
                                <a href="https://www.facebook.com/profile.php?id=61594179056891" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 text-slate-700 bg-white border border-slate-200 px-6 py-3 rounded-full hover:border-brand-red hover:text-brand-red transition-all w-fit shadow-sm group">
                                    <div className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center group-hover:border-brand-red/20 transition-colors">
                                        <Facebook className="w-4 h-4 text-slate-500 group-hover:text-brand-red" />
                                    </div>
                                    <span className="text-sm md:text-base font-medium" dir="ltr">Afrikyia Facebook</span>
                                </a>
                                <a href="https://www.tiktok.com/@afrikyiadeveloper" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 text-slate-700 bg-white border border-slate-200 px-6 py-3 rounded-full hover:border-brand-red hover:text-brand-red transition-all w-fit shadow-sm group">
                                    <div className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center group-hover:border-brand-red/20 transition-colors">
                                        <TiktokIcon className="w-4 h-4 text-slate-500 group-hover:text-brand-red" />
                                    </div>
                                    <span className="text-sm md:text-base font-medium" dir="ltr">Afrikyia TikTok</span>
                                </a>
                            </motion.div>
                        </div>

                        {/* Contact Form */}
                        <motion.div
                            initial={{ opacity: 0, x: isRTL ? -30 : 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                        >
                            <form 
                                onSubmit={handleSubmit}
                                className="bg-white border border-slate-200 rounded-3xl p-6 md:p-10 space-y-5 shadow-xl shadow-slate-200/50 relative"
                            >
                                <div className="space-y-1.5">
                                    <label className={`block text-xs font-medium text-slate-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                                        {t.contact.name}
                                    </label>
                                    <input 
                                        type="text" 
                                        name="name" 
                                        required
                                        className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-all ${isRTL ? 'text-right' : 'text-left'}`}
                                        placeholder="Mohamed Mahmoud"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className={`block text-xs font-medium text-slate-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                                        {t.contact.email}
                                    </label>
                                    <input 
                                        type="email" 
                                        name="email" 
                                        required
                                        className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-all ${isRTL ? 'text-right' : 'text-left'}`}
                                        placeholder="contact@example.com"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className={`block text-xs font-medium text-slate-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                                        {t.contact.message}
                                    </label>
                                    <textarea 
                                        name="message" 
                                        rows={4}
                                        required
                                        className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-all resize-none ${isRTL ? 'text-right' : 'text-left'}`}
                                        placeholder="..."
                                    ></textarea>
                                </div>
                                <button 
                                    type="submit"
                                    disabled={status === "loading"}
                                    className="w-full bg-brand-red hover:bg-[#EB2F36] disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold text-base py-4 rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-brand-red/20 group mt-2"
                                >
                                    <span>{status === "loading" ? "..." : t.contact.submit}</span>
                                    {status !== "loading" && (
                                        <Send className={`w-4 h-4 transition-transform ${isRTL ? 'group-hover:-translate-x-1 rotate-180' : 'group-hover:translate-x-1'}`} />
                                    )}
                                </button>
                                
                                {status === "success" && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-center gap-3 text-emerald-600 bg-emerald-50 p-4 rounded-xl border border-emerald-200"
                                    >
                                        <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                                        <p className="text-sm font-medium">Your message has been sent successfully. We will get back to you soon.</p>
                                    </motion.div>
                                )}

                                {status === "error" && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex flex-col gap-2 text-red-600 bg-red-50 p-4 rounded-xl border border-red-200"
                                    >
                                        <div className="flex items-center gap-3">
                                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                            <p className="text-sm font-medium">Something went wrong. Please try again later.</p>
                                        </div>
                                        <p className="text-xs opacity-80 mt-1 break-all">{errorMessage}</p>
                                    </motion.div>
                                )}
                            </form>
                        </motion.div>
                        
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Contact;
