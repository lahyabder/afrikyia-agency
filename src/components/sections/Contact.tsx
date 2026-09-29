"use client";

import { useState } from 'react';
import { useSiteContent } from '@/lib/useSiteContent';
import { useLanguage } from '@/context/LanguageContext';
import { Send, Mail, Phone, CheckCircle2, AlertCircle, Facebook } from 'lucide-react';
import { TiktokIcon } from '@/components/icons/TiktokIcon';

const Contact = () => {
    const { t, isRTL, language } = useLanguage();
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState<string>("");

    const { content } = useSiteContent('contact', {
        tag: t.contact.tag,
        title: t.contact.title,
        desc: t.contact.desc,
    });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        setStatus("loading");
        setErrorMessage("");
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // 1. Save the message in the admin panel (Messages)
        let saved = false;
        let saveError = '';
        try {
            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...data, locale: language }),
            });
            saved = response.ok;
            if (!response.ok) saveError = `Status: ${response.status}`;
        } catch (error: unknown) {
            saveError = error instanceof Error ? error.message : String(error);
        }

        // 2. Email notification through Formspree (as before)
        let emailed = false;
        const formspreeUrl = process.env.NEXT_PUBLIC_FORMSPREE_URL;
        if (formspreeUrl && !data.company) {
            try {
                const { company: _honeypot, ...fields } = data;
                void _honeypot;
                const response = await fetch(formspreeUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify(fields),
                });
                emailed = response.ok;
            } catch {
                // The message is already saved in the admin panel
            }
        }

        if (saved || emailed) {
            setStatus("success");
            form.reset();
        } else {
            setStatus("error");
            setErrorMessage(saveError);
        }
    };

    const h = t.home.contact;
    const inputClass =
        'w-full rounded-lg border border-line bg-white px-4 py-3.5 text-[15px] text-ink placeholder:text-[#9AA0A8] focus:outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/15 transition';
    const channels = [
        { href: 'mailto:contact@afrikyia.com', icon: Mail, label: h.emailLabel, value: 'contact@afrikyia.com' },
        { href: 'tel:+22230609040', icon: Phone, label: h.phoneLabel, value: '+222 30 60 90 40' },
    ];
    const socials = [
        { href: 'https://www.facebook.com/profile.php?id=61594179056891', icon: Facebook, label: 'Facebook' },
        { href: 'https://www.tiktok.com/@afrikyiadeveloper', icon: TiktokIcon, label: 'TikTok' },
    ];

    return (
        <section id="contact" className="bg-night site-section scroll-mt-16 lg:scroll-mt-[88px]">
            <div className="site-container grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
                <div>
                    <p className="text-[#FB7185] text-sm font-bold">{content.tag}</p>
                    <h2 className="mt-4 text-white text-3xl lg:text-5xl font-bold leading-tight">{content.title}</h2>
                    <p className="mt-5 max-w-lg text-[#C9CED6] text-base lg:text-lg leading-relaxed">{content.desc}</p>

                    <ul className="mt-10 space-y-3 max-w-md">
                        {channels.map(c => (
                            <li key={c.href}>
                                <a
                                    href={c.href}
                                    className="flex items-center gap-4 rounded-xl bg-night-2 border border-white/5 p-4 hover:border-white/20 transition-colors"
                                >
                                    <span className="w-11 h-11 rounded-lg bg-white/5 text-[#FB7185] flex items-center justify-center shrink-0">
                                        <c.icon className="w-5 h-5" />
                                    </span>
                                    <span>
                                        <span className="block text-xs text-[#A3A9B3]">{c.label}</span>
                                        <span className="block text-white font-bold" dir="ltr">{c.value}</span>
                                    </span>
                                </a>
                            </li>
                        ))}
                    </ul>

                    <div className="mt-8 flex items-center gap-3">
                        <span className="text-sm text-[#A3A9B3]">{h.follow}</span>
                        {socials.map(s => (
                            <a
                                key={s.href}
                                href={s.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={s.label}
                                className="w-10 h-10 rounded-lg bg-night-2 border border-white/5 text-[#C9CED6] hover:text-white hover:border-white/20 flex items-center justify-center transition-colors"
                            >
                                <s.icon className="w-4 h-4" />
                            </a>
                        ))}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-6 lg:p-10 space-y-5">
                    {/* Honeypot against spam bots: hidden from visitors */}
                    <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
                    <div className="space-y-2">
                        <label htmlFor="contact-name" className="block text-sm font-bold text-ink">{t.contact.name}</label>
                        <input id="contact-name" type="text" name="name" required className={inputClass} />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="contact-email" className="block text-sm font-bold text-ink">{t.contact.email}</label>
                        <input id="contact-email" type="email" name="email" required dir="ltr" className={`${inputClass} ${isRTL ? 'text-right' : ''}`} placeholder="name@example.com" />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="contact-message" className="block text-sm font-bold text-ink">{t.contact.message}</label>
                        <textarea id="contact-message" name="message" rows={5} required className={`${inputClass} resize-none`} />
                    </div>
                    <button
                        type="submit"
                        disabled={status === "loading"}
                        className="w-full h-14 rounded-lg bg-brand-red hover:bg-red-dark disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold flex items-center justify-center gap-3 transition-colors"
                    >
                        <span>{status === "loading" ? "..." : t.contact.submit}</span>
                        {status !== "loading" && <Send className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />}
                    </button>

                    {status === "success" && (
                        <div className="flex items-center gap-3 text-emerald-700 bg-emerald-50 p-4 rounded-lg border border-emerald-200" role="status">
                            <CheckCircle2 className="w-5 h-5 shrink-0" />
                            <p className="text-sm font-medium">{t.contact.success}</p>
                        </div>
                    )}
                    {status === "error" && (
                        <div className="text-red-700 bg-red-50 p-4 rounded-lg border border-red-200" role="alert">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <p className="text-sm font-medium">{t.contact.error}</p>
                            </div>
                            {errorMessage && <p className="text-xs opacity-80 mt-2 break-all" dir="ltr">{errorMessage}</p>}
                        </div>
                    )}
                </form>
            </div>
        </section>
    );
};

export default Contact;
