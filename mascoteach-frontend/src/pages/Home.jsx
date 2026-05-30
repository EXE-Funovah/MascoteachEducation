import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/sections/HeroSection';
import UnderHeroImage from '@/components/sections/UnderHeroImage';
import InteractiveShowcase from '@/components/sections/InteractiveShowcase';
import TargetPersona from '@/components/sections/TargetPersona';
import CTASection from '@/components/sections/CTASection';

export default function Home() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;

    const timeout = setTimeout(() => {
      const el = document.querySelector(hash);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);

    return () => clearTimeout(timeout);
  }, [hash]);

  return (
    <div className="min-h-screen bg-surface font-sans antialiased">
      <Header />
      <main>
        <HeroSection />
        <UnderHeroImage />
        <InteractiveShowcase />
        <TargetPersona />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
