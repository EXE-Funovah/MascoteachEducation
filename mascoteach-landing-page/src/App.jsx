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
        {/* Gradient background ONLY for Features section with Gamma-style fade-out */}
        <div
          className="relative bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/Background1.jpg')" }}
        >
          {/* Gamma-style bottom fade: keeps gradient vivid, fades to white at bottom */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(to bottom, transparent 0%, transparent 60%, rgba(255,255,255,0.5) 75%, rgba(255,255,255,0.85) 88%, white 100%)',
            }}
          />
          <div className="relative z-10 pb-16">
            <FeatureBentoGrid />
          </div>
        </div>
        {/* Showcase on clean white background */}
        <InteractiveShowcase />
        <PricingTable />
        <Testimonials />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
