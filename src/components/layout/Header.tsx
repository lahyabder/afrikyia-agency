"use client";

import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const { t } = useLanguage();
  const h = t.home.nav;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { href: '/', label: h.home || 'الرئيسية' },
    { href: '/#solutions', label: h.solutions || 'حلولنا' },
    { href: '/#products', label: h.products || 'منتجاتنا' },
    { href: '/#works', label: h.works || 'مشاريعنا' },
    { href: '/#about', label: h.about || 'عن الشركة' },
    { href: '/#contact', label: h.contact || 'تواصل معنا' },
  ];

  const close = () => setIsMenuOpen(false);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-b transition-all ${
        scrolled ? 'border-slate-200/80 shadow-xs' : 'border-transparent'
      }`}
    >
      <div className="site-container h-16 lg:h-[88px] flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center shrink-0" onClick={close}>
          <Image src="/logo.png" alt="Afrikyia" width={180} height={50} priority className="h-8 lg:h-10 w-auto" />
        </Link>

        <nav className="hidden lg:flex items-center gap-9 text-[15px] font-bold text-slate-800">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className="hover:text-brand-red transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 lg:gap-6">
          <LanguageSwitcher />
          <button
            className="lg:hidden w-10 h-10 -me-2 flex items-center justify-center text-ink"
            onClick={() => setIsMenuOpen(open => !open)}
            aria-label={h.menu}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <nav className="lg:hidden border-t border-line bg-white">
          <div className="site-container py-4 flex flex-col">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={close}
                className="py-3.5 text-lg font-bold text-ink border-b border-line last:border-0 hover:text-brand-red"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;
