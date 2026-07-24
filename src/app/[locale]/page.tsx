import Header from '@/components/layout/Header';
import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import Vision from '@/components/sections/Vision';
import Services from '@/components/sections/Services';
import Achievements from '@/components/sections/Achievements';
import TrustedBy from '@/components/sections/TrustedBy';
import StrategicImpact from '@/components/sections/StrategicImpact';
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
      <TrustedBy />
      <StrategicImpact />
      <Footer />
    </main>
  );
}
