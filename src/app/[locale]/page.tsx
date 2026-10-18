import Header from '@/components/layout/Header';
import Hero from '@/components/sections/Hero';
import Services from '@/components/sections/Services';
import Applications from '@/components/sections/Applications';
import Works from '@/components/sections/Works';
import Methodology from '@/components/sections/Methodology';
import About from '@/components/sections/About';
import TrustedBy from '@/components/sections/TrustedBy';
import Contact from '@/components/sections/Contact';
import Footer from '@/components/layout/Footer';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      {/* 01: Hero Section */}
      <Hero />
      {/* 02: حلولنا | Nos solutions */}
      <Services />
      {/* 03: منتجاتنا | Nos produits */}
      <Applications />
      {/* 04: مشاريعنا | Nos réalisations */}
      <Works />
      {/* 05: منهجيتنا | Notre méthode */}
      <Methodology />
      {/* 06: عن AFRIKYIA */}
      <About />
      {/* شركاء النجاح */}
      <TrustedBy />
      {/* 07: التواصل */}
      <Contact />
      <Footer />
    </main>
  );
}
