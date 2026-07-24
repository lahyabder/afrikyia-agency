"use client";

import { useLanguage } from '@/context/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

const Header = () => {
  const { t, isRTL } = useLanguage();

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 w-full z-50 bg-black/80 backdrop-blur-md py-6 border-b border-white/5"
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="Afrikyia Logo"
            width={180}
            height={50}
            priority
            className="h-8 md:h-10 w-auto"
            style={{ filter: 'invert(1) hue-rotate(180deg) saturate(20)', mixBlendMode: 'screen' }}
          />
        </Link>
        <div className="hidden lg:flex items-center gap-8 text-brand-white/90 text-sm uppercase tracking-widest font-medium">
          <Link href="/#about" className="hover:text-brand-red transition-colors">{t.nav.about}</Link>
          <Link href="/#vision" className="hover:text-brand-red transition-colors">{t.nav.vision}</Link>
          <Link href="/#services" className="hover:text-brand-red transition-colors">{t.nav.services}</Link>
          <Link href="/#achievements" className="hover:text-brand-red transition-colors">{t.nav.achievements}</Link>

          <Link href="/#impact" className="hover:text-brand-red transition-colors">{t.nav.impact}</Link>
        </div>
        <div className="flex items-center gap-4 md:gap-8">
          <LanguageSwitcher />
          <Link
            href="/#vision"
            className="hidden sm:block text-brand-white border border-brand-red px-6 py-2 rounded-full hover:bg-brand-red transition-all duration-300 text-sm font-medium"
          >
            {t.nav.discover}
          </Link>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
