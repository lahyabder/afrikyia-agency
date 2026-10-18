import Header from '@/components/layout/Header';
import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import Services from '@/components/sections/Services';
import Applications from '@/components/sections/Applications';
import Works from '@/components/sections/Works';
import TrustedBy from '@/components/sections/TrustedBy';
import Contact from '@/components/sections/Contact';
import Footer from '@/components/layout/Footer';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <About />
      <Services />
      <Applications />
      <Works />
      <TrustedBy />
      <Contact />
      <Footer />
    </main>
  );
}
