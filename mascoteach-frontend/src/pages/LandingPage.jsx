import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/sections/HeroSection';
import SocialProofMarquee from '@/components/sections/SocialProofMarquee';
import FeatureBentoGrid from '@/components/sections/FeatureBentoGrid';
import InteractiveShowcase from '@/components/sections/InteractiveShowcase';
import Testimonials from '@/components/sections/Testimonials';
import CTASection from '@/components/sections/CTASection';

export default function LandingPage() {
    const { hash } = useLocation();

    // Scroll to section when arriving via hash (e.g. from /pricing → /#features)
    useEffect(() => {
        if (hash) {
            // Small delay to let the DOM render
            setTimeout(() => {
                const el = document.querySelector(hash);
                if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    }, [hash]);
    return (
        <div className="min-h-screen bg-surface font-sans antialiased">
            <Header />
            <main>
                <HeroSection />
                <SocialProofMarquee />
                <FeatureBentoGrid />
                {/* Showcase on clean white background */}
                <InteractiveShowcase />
                <Testimonials />
                <CTASection />
            </main>
            <Footer />
        </div>
    );
}
