import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/sections/HeroSection';
import UnderHeroImage from '@/components/sections/UnderHeroImage';
import InteractiveShowcase from '@/components/sections/InteractiveShowcase';
import HowMascoteachWorks from '@/components/sections/HowMascoteachWorks';
import TargetPersona from '@/components/sections/TargetPersona';
import CTASection from '@/components/sections/CTASection';

export default function Home() {
  return (
    <div className="min-h-screen bg-surface font-sans antialiased">
      <Header />
      <main>
        <HeroSection />
        <UnderHeroImage />
        <HowMascoteachWorks />
        <InteractiveShowcase />
        <TargetPersona />
        <CTASection />
      </main>
      <Footer withOverlappingCta />
    </div>
  );
}
