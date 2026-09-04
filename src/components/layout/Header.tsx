"use client";

import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const { t, isRTL } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navLinks = [
    { href: '/#about', label: t.nav.about },
    { href: '/#vision', label: t.nav.vision },
    { href: '/#services', label: t.nav.services },
    { href: '/#achievements', label: t.nav.achievements },
    { href: '/#impact', label: t.nav.impact },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl z-50 bg-white/80 backdrop-blur-2xl py-3 px-6 md:px-8 border border-slate-200 rounded-full shadow-lg shadow-slate-200/50"
    >
      <div className="flex justify-between items-center relative z-20 w-full">
        <Link href="/" className="flex items-center" onClick={() => setIsMenuOpen(false)}>
          <Image
            src="/logo.png"
            alt="Afrikyia Logo"
            width={180}
            height={50}
            priority
            className="h-7 md:h-10 w-auto"
          />
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8 text-slate-700 text-sm uppercase tracking-widest font-semibold">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-brand-red transition-colors">
              {link.label}
            </Link>
          ))}
        </div>
        
        <div className="flex items-center gap-4 md:gap-8">
          <LanguageSwitcher />
          <Link
            href="/#vision"
            className="hidden sm:block text-white bg-brand-red border border-brand-red px-6 py-2 rounded-full hover:bg-red-700 transition-all duration-300 text-sm font-medium shadow-md shadow-brand-red/20"
          >
            {t.nav.discover}
          </Link>
          
          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden text-slate-800 p-2 focus:outline-none"
            onClick={toggleMenu}
            aria-label="Toggle mobile menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden absolute top-full left-0 w-full mt-2 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-3xl overflow-hidden shadow-xl"
          >
            <div className={`container mx-auto px-6 py-8 flex flex-col gap-6 ${isRTL ? 'text-right' : 'text-left'}`}>
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link 
                    href={link.href} 
                    className="text-slate-800 text-xl font-medium block hover:text-brand-red transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              
              <motion.div
                initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: navLinks.length * 0.1 }}
                className="pt-4 border-t border-slate-100"
              >
                <Link
                  href="/#vision"
                  onClick={() => setIsMenuOpen(false)}
                  className="inline-block text-white bg-brand-red px-8 py-3 rounded-full hover:bg-[#EB2F36] transition-all duration-300 text-base font-medium shadow-md"
                >
                  {t.nav.discover}
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
