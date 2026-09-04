"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { Send, Mail, Phone, CheckCircle2, AlertCircle } from 'lucide-react';

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
        <section id="contact" className="py-24 md:py-32 bg-[#080808] relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="absolute top-[20%] right-[10%] w-[30rem] h-[30rem] bg-brand-red/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-6xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        
                        {/* Text and Info */}
                        <div className={`space-y-8 ${isRTL ? 'text-right' : 'text-left'}`}>
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                            >
                                <h2 className="text-brand-red text-sm md:text-base font-bold uppercase tracking-[0.4em] mb-4">
                                    {t.contact.tag}
                                </h2>
                                <h3 className="text-4xl md:text-6xl font-bold text-white leading-[1.1] mb-6">
                                    {t.contact.title}
                                </h3>
                                <p className="text-white/70 text-lg md:text-xl font-light leading-relaxed max-w-xl">
                                    {t.contact.desc}
                                </p>
                            </motion.div>

                            <motion.div 
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="space-y-6 pt-8"
                            >
                                <a href="mailto:contact@afrikyia.com" className="flex items-center gap-4 text-white/80 hover:text-brand-red transition-colors group">
                                    <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-brand-red/50 transition-colors">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <span className="text-lg font-medium">contact@afrikyia.com</span>
                                </a>
                                <a href="tel:+22224232202" className="flex items-center gap-4 text-white/80 hover:text-brand-red transition-colors group" dir="ltr">
                                    <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-brand-red/50 transition-colors">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <span className="text-lg font-medium">+222 24 23 22 02</span>
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
                                className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 space-y-6 backdrop-blur-sm relative"
                            >
                                <div className="space-y-2">
                                    <label className={`block text-sm font-medium text-white/70 ${isRTL ? 'text-right' : 'text-left'}`}>
                                        {t.contact.name}
                                    </label>
                                    <input 
                                        type="text" 
                                        name="name" 
                                        required
                                        className={`w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-white placeholder:text-white/30 focus:outline-none focus:border-brand-red transition-colors ${isRTL ? 'text-right' : 'text-left'}`}
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className={`block text-sm font-medium text-white/70 ${isRTL ? 'text-right' : 'text-left'}`}>
                                        {t.contact.email}
                                    </label>
                                    <input 
                                        type="email" 
                                        name="email" 
                                        required
                                        className={`w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-white placeholder:text-white/30 focus:outline-none focus:border-brand-red transition-colors ${isRTL ? 'text-right' : 'text-left'}`}
                                        placeholder="contact@example.com"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className={`block text-sm font-medium text-white/70 ${isRTL ? 'text-right' : 'text-left'}`}>
                                        {t.contact.message}
                                    </label>
                                    <textarea 
                                        name="message" 
                                        rows={4}
                                        required
                                        className={`w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-white placeholder:text-white/30 focus:outline-none focus:border-brand-red transition-colors resize-none ${isRTL ? 'text-right' : 'text-left'}`}
                                        placeholder="..."
                                    ></textarea>
                                </div>
                                <button 
                                    type="submit"
                                    disabled={status === "loading"}
                                    className="w-full bg-brand-red hover:bg-[#EB2F36] disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold text-lg py-5 rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-brand-red/20 group"
                                >
                                    <span>{status === "loading" ? "..." : t.contact.submit}</span>
                                    {status !== "loading" && (
                                        <Send className={`w-5 h-5 transition-transform ${isRTL ? 'group-hover:-translate-x-1 rotate-180' : 'group-hover:translate-x-1'}`} />
                                    )}
                                </button>
                                
                                {status === "success" && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-center gap-3 text-emerald-400 bg-emerald-400/10 p-4 rounded-xl border border-emerald-400/20"
                                    >
                                        <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                                        <p className="text-sm font-medium">Your message has been sent successfully. We will get back to you soon.</p>
                                    </motion.div>
                                )}

                                {status === "error" && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex flex-col gap-2 text-red-400 bg-red-400/10 p-4 rounded-xl border border-red-400/20"
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
