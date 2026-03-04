import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MascotPanel from '@/components/portal/mascot/MascotPanel';

/**
 * PortalLayout — Shell layout wrapping all teacher portal pages
 * Includes the sidebar, main content area, and floating mascot
 */
export default function PortalLayout() {
    return (
        <div className="min-h-screen bg-slate-50/80">
            <Sidebar />

            {/* Main content area — offset by sidebar width */}
            <main className="ml-[260px] transition-all duration-300 min-h-screen">
                <div className="max-w-[1400px] mx-auto px-8 py-8">
                    <Outlet />
                </div>
            </main>

            {/* Floating mascot assistant — accessible from any page */}
            <MascotPanel />
        </div>
    );
}
