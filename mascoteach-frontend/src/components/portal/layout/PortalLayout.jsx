import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function PortalLayout() {
    const location = useLocation();
    const isWidePortalPage = location.pathname.includes('/library') || location.pathname.includes('/sessions');

    return (
        <div className="min-h-screen bg-[#fbfdff]">
            <Sidebar />

            <div className="flex min-h-screen flex-col lg:ml-[288px]">
                <main className="flex-1">
                    <div className={isWidePortalPage ? 'max-w-none px-0 py-0' : 'mx-auto max-w-[1200px] px-8 py-8'}>
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
