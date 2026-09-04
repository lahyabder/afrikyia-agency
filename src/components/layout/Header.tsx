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
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 w-full z-50 bg-black/80 backdrop-blur-md py-4 md:py-6 border-b border-white/5"
    >
      <div className="container mx-auto px-6 flex justify-between items-center relative z-20">
        <Link href="/" className="flex items-center" onClick={() => setIsMenuOpen(false)}>
          <Image
            src="/logo.png"
            alt="Afrikyia Logo"
            width={180}
            height={50}
            priority
            className="h-7 md:h-10 w-auto"
            style={{ filter: 'invert(1) hue-rotate(180deg) saturate(20)', mixBlendMode: 'screen' }}
          />
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8 text-brand-white/90 text-sm uppercase tracking-widest font-medium">
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
            className="hidden sm:block text-brand-white border border-brand-red px-6 py-2 rounded-full hover:bg-brand-red transition-all duration-300 text-sm font-medium"
          >
            {t.nav.discover}
          </Link>
          
          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden text-white p-2 focus:outline-none"
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
            className="lg:hidden absolute top-full left-0 w-full bg-black/95 backdrop-blur-xl border-b border-white/10 overflow-hidden"
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
                    className="text-white text-xl font-medium block hover:text-brand-red transition-colors"
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
                className="pt-4 border-t border-white/10"
              >
                <Link
                  href="/#vision"
                  onClick={() => setIsMenuOpen(false)}
                  className="inline-block text-brand-white bg-brand-red px-8 py-3 rounded-full hover:bg-[#EB2F36] transition-all duration-300 text-base font-medium"
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
