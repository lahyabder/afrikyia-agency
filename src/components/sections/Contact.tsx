"use client";

import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Send, Mail, Phone, CheckCircle2, AlertCircle, Facebook, Radio } from 'lucide-react';
import { TiktokIcon } from '@/components/icons/TiktokIcon';

const Contact = () => {
    const { t, isRTL, language } = useLanguage();
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState<string>("");

    const c = t.contact;
    const h = t.home.contact;
    const pTypes = c.projectTypes || {};

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        setStatus("loading");
        setErrorMessage("");
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // 1. Save the message in the internal database / admin panel (Messages)
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

        // 2. Email notification through Formspree if configured
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
                // Defensive: Message is already saved locally
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

    const inputClass =
        'w-full rounded-xl border border-slate-200/90 bg-slate-50/60 focus:bg-white px-4 py-3.5 text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/15 transition-all';

    const channels = [
        {
            href: 'mailto:contact@afrikyia.com',
            icon: Mail,
            iconBg: 'bg-rose-50 text-brand-red',
            label: h.emailLabel || (isRTL ? 'البريد الإلكتروني' : 'Adresse e-mail'),
            value: 'contact@afrikyia.com',
            sub: isRTL ? 'استفسارات المشاريع والشراكات' : 'Demandes de projets & partenariats',
        },
        {
            href: 'tel:+22230609040',
            icon: Phone,
            iconBg: 'bg-rose-50 text-brand-red',
            label: h.phoneLabel || (isRTL ? 'الهاتف المباشر' : 'Téléphone direct'),
            value: '+222 30 60 90 40',
            sub: isRTL ? 'أوقات العمل الرسمية' : 'Heures d’ouverture officielles',
        },
        {
            href: 'https://whatsapp.com/channel/0029VbDnuKB5Ui2eXs8BZn1O',
            icon: Radio,
            iconBg: 'bg-emerald-50 text-emerald-600',
            label: h.whatsappLabel || (isRTL ? 'قناة واتساب الرسمية' : 'Chaîne WhatsApp officielle'),
            value: 'AFRIKYIA Channel',
            sub: isRTL ? 'قناة نشر مستجدات الحلول والمنتجات' : 'Canal officiel d’annonces et nouveautés',
        },
    ];

    const socials = [
        { href: 'https://www.facebook.com/profile.php?id=61594179056891', icon: Facebook, label: 'Facebook' },
        { href: 'https://www.tiktok.com/@afrikyiadeveloper', icon: TiktokIcon, label: 'TikTok' },
    ];

    return (
        <section id="contact" className="py-20 lg:py-28 bg-[#F8FAFC] border-t border-slate-200/80 scroll-mt-16 lg:scroll-mt-24 relative overflow-hidden">
            <div className="site-container grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
                {/* Left Info Column */}
                <div className="lg:col-span-5">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white border border-slate-200/80 px-3.5 py-1 text-xs font-bold text-brand-red mb-4 shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-red" />
                        <span>{c.tag || (isRTL ? 'تواصل معنا' : 'Contactez-nous')}</span>
                    </div>

                    <h2 className="text-slate-900 text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">
                        {c.title || (isRTL ? 'لديك مشروع رقمي؟ لنتحدث عنه.' : 'Vous avez un projet numérique ? Parlons-en.')}
                    </h2>

                    <p className="mt-5 text-slate-600 text-base lg:text-lg leading-relaxed font-normal">
                        {c.desc}
                    </p>

                    {/* Official Channels List */}
                    <ul className="mt-8 space-y-3.5">
                        {channels.map(ch => (
                            <li key={ch.href}>
                                <a
                                    href={ch.href}
                                    target={ch.href.startsWith('http') ? '_blank' : undefined}
                                    rel={ch.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                                    className="flex items-center gap-4 rounded-2xl bg-white border border-slate-200/80 p-4 hover:border-slate-300 hover:shadow-md transition-all duration-200 group"
                                >
                                    <span className={`w-12 h-12 rounded-xl ${ch.iconBg} border border-slate-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                                        <ch.icon className="w-5 h-5 stroke-[1.8]" />
                                    </span>
                                    <span className="min-w-0">
                                        <span className="block text-xs font-semibold text-slate-400">{ch.label}</span>
                                        <span className="block text-slate-900 font-bold text-sm sm:text-base truncate" dir="ltr">
                                            {ch.value}
                                        </span>
                                        <span className="block text-[11px] text-slate-500 mt-0.5">
                                            {ch.sub}
                                        </span>
                                    </span>
                                </a>
                            </li>
                        ))}
                    </ul>

                    {/* Social networks */}
                    <div className="mt-8 flex items-center gap-3">
                        <span className="text-sm font-semibold text-slate-500">{h.follow || (isRTL ? 'تابعنا' : 'Suivez-nous')}</span>
                        {socials.map(s => (
                            <a
                                key={s.href}
                                href={s.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={s.label}
                                className="w-10 h-10 rounded-xl bg-white border border-slate-200/80 text-slate-600 hover:text-brand-red hover:border-slate-300 flex items-center justify-center transition-colors shadow-2xs"
                            >
                                <s.icon className="w-4 h-4" />
                            </a>
                        ))}
                    </div>
                </div>

                {/* Right Form Column */}
                <div className="lg:col-span-7">
                    <form onSubmit={handleSubmit} className="rounded-3xl bg-white border border-slate-200/90 p-7 sm:p-10 space-y-5 shadow-xl shadow-slate-200/50">
                        {/* Honeypot anti-spam */}
                        <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

                        <div className="grid sm:grid-cols-2 gap-5">
                            {/* Full Name */}
                            <div className="space-y-2">
                                <label htmlFor="contact-name" className="block text-sm font-bold text-slate-900">
                                    {c.name || (isRTL ? 'الاسم الكامل' : 'Nom complet')}
                                </label>
                                <input
                                    id="contact-name"
                                    type="text"
                                    name="name"
                                    required
                                    className={inputClass}
                                    placeholder={isRTL ? 'الاسم وممثل المؤسسة' : 'Votre nom ou organisation'}
                                />
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <label htmlFor="contact-email" className="block text-sm font-bold text-slate-900">
                                    {c.email || (isRTL ? 'البريد الإلكتروني' : 'Adresse e-mail')}
                                </label>
                                <input
                                    id="contact-email"
                                    type="email"
                                    name="email"
                                    required
                                    dir="ltr"
                                    className={`${inputClass} ${isRTL ? 'text-right' : ''}`}
                                    placeholder="contact@company.com"
                                />
                            </div>
                        </div>

                        {/* Project Type */}
                        <div className="space-y-2">
                            <label htmlFor="contact-project-type" className="block text-sm font-bold text-slate-900">
                                {c.projectType || (isRTL ? 'نوع المشروع' : 'Type de projet')}
                            </label>
                            <select
                                id="contact-project-type"
                                name="projectType"
                                defaultValue="app"
                                className={`${inputClass} cursor-pointer`}
                            >
                                <option value="app">{pTypes.app || (isRTL ? 'تطوير تطبيق ويب أو هاتف' : 'Développement d’application web ou mobile')}</option>
                                <option value="platform">{pTypes.platform || (isRTL ? 'بناء منصة رقمية مخصصة' : 'Plateforme numérique sur mesure')}</option>
                                <option value="system">{pTypes.system || (isRTL ? 'أنظمة إدارة ومؤسسات (ERP / لوحات تحكم)' : 'Système de gestion d’entreprise')}</option>
                                <option value="automation">{pTypes.automation || (isRTL ? 'أتمتة العمليات وتكامل الأنظمة (APIs)' : 'Automatisation & intégration d’APIs')}</option>
                                <option value="ai">{pTypes.ai || (isRTL ? 'حلول الذكاء الاصطناعي ومعالجة البيانات' : 'Solution IA & traitement de données')}</option>
                                <option value="maintenance">{pTypes.maintenance || (isRTL ? 'صيانة وتطوير نظام قائم' : 'Maintenance & évolution de système')}</option>
                                <option value="other">{pTypes.other || (isRTL ? 'استشارة برمجية / أخرى' : 'Conseil logiciel / Autre')}</option>
                            </select>
                        </div>

                        {/* Message / Brief Description */}
                        <div className="space-y-2">
                            <label htmlFor="contact-message" className="block text-sm font-bold text-slate-900">
                                {c.message || (isRTL ? 'وصف مختصر للاحتياج' : 'Description du besoin')}
                            </label>
                            <textarea
                                id="contact-message"
                                name="message"
                                rows={4}
                                required
                                className={`${inputClass} resize-none`}
                                placeholder={isRTL ? 'أخبرنا عن فكرة المشروع، الأهداف الرئيسية، والجدول الزمني المستهدف...' : 'Décrivez brièvement les objectifs clés et les fonctionnalités attendues...'}
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            id="contact-btn-submit"
                            disabled={status === "loading"}
                            className="w-full h-14 rounded-xl bg-brand-red hover:bg-red-dark disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold text-base flex items-center justify-center gap-3 transition-colors shadow-sm hover:shadow-md cursor-pointer"
                        >
                            <span>{status === "loading" ? "..." : (c.submit || (isRTL ? 'إرسال الطلب' : 'Envoyer la demande'))}</span>
                            {status !== "loading" && <Send className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />}
                        </button>

                        {/* Feedback alerts */}
                        {status === "success" && (
                            <div className="flex items-center gap-3 text-emerald-800 bg-emerald-50 p-4 rounded-xl border border-emerald-200" role="status">
                                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
                                <p className="text-sm font-medium">{c.success}</p>
                            </div>
                        )}
                        {status === "error" && (
                            <div className="text-rose-800 bg-rose-50 p-4 rounded-xl border border-rose-200" role="alert">
                                <div className="flex items-center gap-3">
                                    <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
                                    <p className="text-sm font-medium">{c.error}</p>
                                </div>
                                {errorMessage && <p className="text-xs opacity-80 mt-2 break-all font-mono" dir="ltr">{errorMessage}</p>}
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </section>
    );
};

export default Contact;
