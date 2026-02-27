import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/sections/HeroSection';
import SocialProofMarquee from '@/components/sections/SocialProofMarquee';
import FeatureBentoGrid from '@/components/sections/FeatureBentoGrid';
import InteractiveShowcase from '@/components/sections/InteractiveShowcase';
import PricingTable from '@/components/sections/PricingTable';
import Testimonials from '@/components/sections/Testimonials';
import CTASection from '@/components/sections/CTASection';

export default function App() {
  return (
    <div className="min-h-screen bg-surface font-sans antialiased">
      <Header />
      <main>
        <HeroSection />
        <SocialProofMarquee />
        <FeatureBentoGrid />
        <InteractiveShowcase />
        <PricingTable />
        <Testimonials />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
