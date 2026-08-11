import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { ArrowUpRight, BookOpenCheck, CreditCard, GraduationCap, History, Home, Library, User } from 'lucide-react';
import Sidebar from './Sidebar';
import { useAuth } from '@/contexts/AuthContext';

const teacherMobileItems = [
    { path: '', icon: Home, label: 'Trang chủ', end: true },
    { path: '/library', icon: Library, label: 'Thư viện' },
    { path: '/classes', icon: GraduationCap, label: 'Lớp học' },
    { path: '/sessions', icon: History, label: 'Phiên chơi' },
    { path: '/billing', icon: CreditCard, label: 'Thanh toán' },
];

const studentMobileItems = [
    { path: '/flashcards', icon: BookOpenCheck, label: 'Flashcard' },
    { path: '/profile', icon: User, label: 'Hồ sơ' },
];

export default function PortalLayout() {
    const location = useLocation();
    const { user } = useAuth();
    const role = String(user?.role || user?.roleName || 'Teacher').toLowerCase();
    const isWidePortalPage = ['/library', '/sessions', '/classes', '/flashcards']
        .some((segment) => location.pathname.includes(segment));
    const basePath = location.pathname.startsWith('/dev/teacher')
        ? '/dev/teacher'
        : role === 'student'
            ? '/student'
            : role === 'parent'
                ? '/parent'
                : '/teacher';
    const mobileNavItems = role === 'student' ? studentMobileItems : teacherMobileItems;
    const scopedMobileNavItems = mobileNavItems.map((item) => ({
        ...item,
        to: `${basePath}${item.path}`,
    }));

    return (
        <div className="min-h-screen bg-[#fbfdff]">
            <Sidebar />

            <div className="flex min-h-screen flex-col lg:ml-[288px]">
                <nav className="sticky top-0 z-30 border-b border-brand-light/50 bg-white/90 px-3 py-2 shadow-sm backdrop-blur lg:hidden" aria-label="Điều hướng tài khoản">
                    <div className="mb-2 flex items-center justify-between px-1">
                        <NavLink to={basePath} className="text-sm font-black text-brand-navy">
                            Trang quản lý
                        </NavLink>
                        <NavLink to="/" className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-[0.08em] text-slate-500">
                            Trang chủ ngoài
                            <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.5} />
                        </NavLink>
                    </div>
                    <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${scopedMobileNavItems.length}, minmax(0, 1fr))` }}>
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
