import Header from '@/components/layout/Header';
import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import Vision from '@/components/sections/Vision';
import Services from '@/components/sections/Services';
import Achievements from '@/components/sections/Achievements';
import Projects from '@/components/sections/Projects';
import TrustedBy from '@/components/sections/TrustedBy';
import Contact from '@/components/sections/Contact';
import Footer from '@/components/layout/Footer';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <About />
      <Vision />
      <Services />
      <Achievements />
      <Projects />
      <TrustedBy />
      <Contact />
      <Footer />
    </main>
  );
}
