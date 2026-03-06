import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PricingTable from '@/components/sections/PricingTable';

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-surface font-sans antialiased">
            <Header />
            <main className="pt-24">
                <PricingTable />
            </main>
            <Footer />
        </div>
    );
}
