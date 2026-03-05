import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

/**
 * PortalLayout — Redesigned shell layout for teacher portal
 * Sidebar (left) + TopBar (top) + Main content area
 * Clean, spacious Wayground-inspired layout
 */
export default function PortalLayout() {
    return (
        <div className="min-h-screen bg-white">
            <Sidebar />

            {/* Main content area — offset by sidebar width */}
            <div className="ml-[248px] min-h-screen flex flex-col">
                <TopBar />

                <main className="flex-1">
                    <div className="max-w-[1200px] mx-auto px-8 py-8">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
