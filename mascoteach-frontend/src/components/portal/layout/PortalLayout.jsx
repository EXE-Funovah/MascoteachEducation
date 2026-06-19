import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { CreditCard, History, Home, Library } from 'lucide-react';
import Sidebar from './Sidebar';

const mobileNavItems = [
    { to: '/teacher', icon: Home, label: 'Trang chủ', end: true },
    { to: '/teacher/library', icon: Library, label: 'Thư viện' },
    { to: '/teacher/sessions', icon: History, label: 'Buổi học' },
    { to: '/teacher/billing', icon: CreditCard, label: 'Thanh toán' },
];

export default function PortalLayout() {
    const location = useLocation();
    const isWidePortalPage = location.pathname.includes('/library') || location.pathname.includes('/sessions');
    const basePath = location.pathname.startsWith('/dev/teacher') ? '/dev/teacher' : '/teacher';
    const scopedMobileNavItems = mobileNavItems.map((item) => ({
        ...item,
        to: item.to.replace('/teacher', basePath),
    }));

    return (
        <div className="min-h-screen bg-[#fbfdff]">
            <Sidebar />

            <div className="flex min-h-screen flex-col lg:ml-[288px]">
                <nav className="sticky top-0 z-30 border-b border-brand-light/50 bg-white/90 px-3 py-2 shadow-sm backdrop-blur lg:hidden" aria-label="Điều hướng giáo viên">
                    <div className="grid grid-cols-4 gap-1">
                        {scopedMobileNavItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.end}
                                className={({ isActive }) =>
                                    `flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-2 text-[11px] font-black transition ${
                                        isActive
                                            ? 'bg-brand-light/45 text-brand-navy'
                                            : 'text-slate-600 hover:bg-brand-light/20 hover:text-brand-navy'
                                    }`
                                }
                            >
                                <item.icon className="h-4 w-4" />
                                <span className="truncate">{item.label}</span>
                            </NavLink>
                        ))}
                    </div>
                </nav>
                <main className="flex-1">
                    <div className={isWidePortalPage ? 'max-w-none px-0 py-0' : 'mx-auto max-w-[1200px] px-8 py-8'}>
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
