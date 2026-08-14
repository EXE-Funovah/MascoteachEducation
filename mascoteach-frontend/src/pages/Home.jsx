import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/sections/HeroSection';
import UnderHeroImage from '@/components/sections/UnderHeroImage';
import FeatureBentoGrid from '@/components/sections/FeatureBentoGrid';
import HowMascoteachWorks from '@/components/sections/HowMascoteachWorks';
import TargetPersona from '@/components/sections/TargetPersona';
import CTASection from '@/components/sections/CTASection';

export default function Home() {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return undefined;

    const sectionId = decodeURIComponent(location.hash.slice(1));
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(sectionId)?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'start',
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [location.hash]);

  return (
    <div className="min-h-screen bg-surface font-sans antialiased">
      <Header />
      <main>
        <HeroSection />
        <UnderHeroImage />
        <HowMascoteachWorks />
        <FeatureBentoGrid />
        <TargetPersona />
        <CTASection />
      </main>
      <Footer withOverlappingCta />
    </div>
  );
}
