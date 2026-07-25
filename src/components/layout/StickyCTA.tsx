"use client";

import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { CalendarCheck } from 'lucide-react';
import { useEffect, useState } from 'react';

const StickyCTA = () => {
    const { t, isRTL } = useLanguage();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 500) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToContact = () => {
        const contactSection = document.getElementById('contact');
        if (contactSection) {
            contactSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    if (!t.contact) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ 
                opacity: isVisible ? 1 : 0, 
                scale: isVisible ? 1 : 0.8,
                y: isVisible ? 0 : 50,
                pointerEvents: isVisible ? 'auto' : 'none'
            }}
            transition={{ duration: 0.3 }}
            className={`fixed bottom-8 ${isRTL ? 'left-8' : 'right-8'} z-50`}
        >
            <button
                onClick={scrollToContact}
                className="bg-brand-red hover:bg-[#EB2F36] text-white shadow-xl shadow-brand-red/30 px-6 py-4 rounded-full font-bold flex items-center gap-3 transition-all hover:scale-105 active:scale-95 group"
            >
                <CalendarCheck className="w-5 h-5" />
                <span>{t.contact.sticky}</span>
            </button>
        </motion.div>
    );
};

export default StickyCTA;
