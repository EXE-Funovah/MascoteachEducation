import { NavLink, useLocation } from 'react-router-dom';
import {
    History,
    Home,
    Library,
    LogOut,
    Pin,
    Sparkles,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const mainItems = [
    { to: '/teacher', icon: Home, label: 'Trang chủ', end: true },
    { to: '/teacher/library', icon: Library, label: 'Thư viện của tôi', dot: true },
    { to: '/teacher/sessions', icon: History, label: 'Lịch sử buổi học' },
];

export default function Sidebar() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const basePath = location.pathname.startsWith('/dev/teacher') ? '/dev/teacher' : '/teacher';
    const scopedNavItems = mainItems.map((item) => ({
        ...item,
        to: item.to.replace('/teacher', basePath),
    }));

    return (
        <aside
            className="fixed left-0 top-0 z-40 hidden h-screen w-[288px] items-stretch bg-[#eaf3ff] p-3 lg:flex"
            role="navigation"
            aria-label="Điều hướng chính"
        >
            <div className="flex min-h-0 w-full flex-col rounded-[26px] border border-white/80 bg-white px-5 py-5 shadow-[0_24px_70px_rgba(27,58,107,0.12)]">
                <div className="mb-7 flex items-start justify-between gap-4">
                    <NavLink to={basePath} aria-label="Mascoteach" className="block">
                        <img src="/images/Logo.png" alt="Mascoteach" className="h-12 max-w-[154px] object-contain" />
                    </NavLink>
                    <button
                        type="button"
                        className="grid h-9 w-9 place-items-center rounded-xl text-slate-500 transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-light/25 hover:text-brand-blue active:translate-y-0"
                        aria-label="Ghim thanh điều hướng"
                        title="Ghim"
                    >
                        <Pin className="h-5 w-5" />
                    </button>
                </div>

                <nav className="space-y-2">
                    {scopedNavItems.map((item) => (
                        <SidebarNavLink key={item.to} item={item} />
                    ))}
                </nav>

                <div className="mt-auto space-y-3 pt-5">
                    <button
                        type="button"
                        className="flex min-h-12 w-full items-center gap-4 rounded-2xl px-4 text-left text-[15px] font-extrabold text-slate-800 transition-all duration-200 hover:bg-amber-100/80 hover:text-amber-800"
                    >
                        <Sparkles className="h-5 w-5 text-amber-600" strokeWidth={2.15} />
                        Nâng cấp
                    </button>

                    <button
                        onClick={logout}
                        className="flex min-h-12 w-full items-center gap-4 rounded-2xl px-4 text-left text-[15px] font-extrabold text-slate-800 transition-all duration-200 hover:bg-rose-50 hover:text-rose-600 active:scale-[0.99]"
                    >
                        <LogOut className="h-5 w-5 text-brand-blue" strokeWidth={2.15} />
                        Đăng xuất
                    </button>

                    {user?.email && (
                        <p className="truncate px-4 pt-1 text-[12px] font-bold text-slate-400">{user.email}</p>
                    )}
                </div>
            </div>
        </aside>
    );
}

function SidebarNavLink({ item }) {
    return (
        <NavLink
            to={item.to}
            end={item.end}
            title={item.label}
            className={({ isActive }) =>
                `group flex min-h-12 items-center justify-between rounded-2xl px-4 text-[15px] font-extrabold transition-all duration-200 ${
                    isActive
                        ? 'bg-brand-light/55 text-slate-950 shadow-sm'
                        : 'text-slate-800 hover:bg-brand-light/25 hover:text-brand-navy'
                }`
            }
        >
            {({ isActive }) => (
                <>
                    <span className="flex min-w-0 items-center gap-4">
                        <item.icon
                            className={`h-5 w-5 flex-none transition-transform duration-200 group-hover:scale-105 ${
                                isActive ? 'text-brand-blue' : 'text-brand-blue'
                            }`}
                            strokeWidth={2.15}
                        />
                        <span className="truncate">{item.label}</span>
                    </span>
                    {item.dot && <span className="h-2 w-2 flex-none rounded-full bg-rose-500" />}
                </>
            )}
        </NavLink>
    );
}
