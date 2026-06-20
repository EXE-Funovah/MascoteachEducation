import { NavLink, useLocation } from 'react-router-dom';
import {
    ArrowUpRight,
    CreditCard,
    Crown,
    History,
    Home,
    Library,
    LogOut,
    Pin,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { isPremiumActive } from '@/lib/billingUi';

const mainItems = [
    { to: '/teacher', icon: Home, label: 'Trang chủ', end: true },
    { to: '/teacher/library', icon: Library, label: 'Thư viện của tôi' },
    { to: '/teacher/sessions', icon: History, label: 'Lịch sử buổi học' },
    { to: '/teacher/billing', icon: CreditCard, label: 'Thanh toán' },
];

export default function Sidebar() {
    const { logout, user } = useAuth();
    const location = useLocation();
    const basePath = location.pathname.startsWith('/dev/teacher') ? '/dev/teacher' : '/teacher';
    const isPremiumTeacher = isPremiumActive(user);
    const avatarInitial = (user?.fullName || user?.email || 'M').trim().charAt(0).toUpperCase() || 'M';
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
            <div className="relative min-h-0 w-full rounded-[26px] border border-white/80 bg-white px-5 py-5 shadow-[0_24px_70px_rgba(27,58,107,0.12)]">
                <div className="mb-7 flex items-start justify-between gap-4">
                    <div>
                        <NavLink to="/" aria-label="Về trang chủ Mascoteach" className="block">
                            <img src="/images/Logo.png" alt="Mascoteach" className="h-12 max-w-[154px] object-contain" />
                        </NavLink>
                        <NavLink
                            to="/"
                            className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-extrabold uppercase tracking-[0.08em] text-slate-500 transition hover:text-brand-blue"
                        >
                            Trang chủ ngoài
                            <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.6} />
                        </NavLink>
                    </div>
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

                {isPremiumTeacher ? (
                    <div className="absolute bottom-[154px] left-5 right-5 rounded-[20px] border border-emerald-200 bg-emerald-50 px-4 py-4 shadow-[0_16px_36px_rgba(34,197,94,0.12)]">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-[11px] font-black uppercase tracking-[0.08em] text-emerald-700">
                                    Trạng thái gói
                                </p>
                                <p className="mt-2 text-[15px] font-extrabold text-emerald-900">
                                    Bạn đang dùng Pro
                                </p>
                            </div>
                            <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-emerald-700 shadow-[0_10px_24px_rgba(15,23,42,0.11)]">
                                <Crown className="h-5 w-5" strokeWidth={2.4} />
                            </span>
                        </div>
                    </div>
                ) : (
                    <NavLink
                        to="/checkout?plan=yearly"
                        className="group absolute bottom-[154px] left-5 right-5 flex min-h-[62px] items-center justify-between gap-2 overflow-hidden rounded-[20px] border border-brand-light/70 bg-[#edf7fd] px-3 text-left shadow-[0_16px_36px_rgba(43,122,181,0.16),inset_0_1px_0_rgba(255,255,255,0.96)] transition-all duration-300 before:absolute before:inset-y-[-10px] before:left-[-48%] before:w-[34%] before:-skew-x-12 before:bg-gradient-to-r before:from-transparent before:via-white before:to-transparent before:opacity-0 before:blur-[1px] before:transition-all before:duration-700 hover:-translate-y-0.5 hover:border-brand-mid/70 hover:bg-[#e5f3fb] hover:shadow-[0_22px_48px_rgba(43,122,181,0.24),inset_0_1px_0_rgba(255,255,255,1)] hover:before:left-[124%] hover:before:opacity-90 active:translate-y-0"
                        aria-label="Nâng cấp PRO"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            <span className="whitespace-nowrap text-[14px] font-extrabold leading-none tracking-[-0.01em] text-slate-500 transition-colors duration-300 group-hover:text-slate-700">
                                Nâng cấp
                            </span>
                            <span className="flex h-7 items-center rounded-[9px] bg-black px-2.5 text-[13px] font-black leading-none text-white shadow-[0_7px_15px_rgba(0,0,0,0.18)]">
                                PRO
                            </span>
                        </span>
                        <span className="relative z-10 grid h-9 w-9 flex-none place-items-center rounded-full bg-white text-black shadow-[0_10px_24px_rgba(15,23,42,0.11)] transition-all duration-300 group-hover:scale-105">
                            <ArrowUpRight className="h-5 w-5" strokeWidth={3} />
                        </span>
                    </NavLink>
                )}

                <NavLink
                    to={`${basePath}/profile`}
                    className={({ isActive }) =>
                        `absolute bottom-[84px] left-5 right-5 flex min-h-12 items-center gap-4 rounded-2xl px-4 text-left text-[15px] font-extrabold transition-all duration-200 ${
                            isActive
                                ? 'bg-brand-light/55 text-slate-950 shadow-sm'
                                : 'text-slate-800 hover:bg-brand-light/25 hover:text-brand-navy'
                        }`
                    }
                >
                    <span className="-ml-3 flex min-w-0 items-center gap-4">
                        <span className="ml-2 grid h-8 w-8 flex-none place-items-center overflow-hidden rounded-full border-2 border-[#5DA9F6] bg-brand-blue text-[10px] font-black text-white ring-2 ring-[#DCEEFF] shadow-[0_10px_22px_rgba(43,122,181,0.22)]">
                            {user?.avatarUrl ? (
                                <img
                                    src={user.avatarUrl}
                                    alt={`${user?.fullName || user?.email || 'Người dùng'} avatar`}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                avatarInitial
                            )}
                        </span>
                        <span className="-ml-2 truncate">Hồ sơ cá nhân</span>
                    </span>
                </NavLink>

                <button
                    onClick={logout}
                    className="absolute bottom-5 left-5 right-5 flex min-h-12 items-center gap-4 rounded-2xl px-4 text-left text-[15px] font-extrabold text-slate-800 transition-all duration-200 hover:bg-rose-50 hover:text-rose-600 active:scale-[0.99]"
                >
                    <LogOut className="h-5 w-5 text-brand-blue" strokeWidth={2.15} />
                    Đăng xuất
                </button>
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
                        <item.icon className="h-5 w-5 flex-none text-brand-blue transition-transform duration-200 group-hover:scale-105" strokeWidth={2.15} />
                        <span className="truncate">{item.label}</span>
                    </span>
                    {item.dot && <span className="h-2 w-2 flex-none rounded-full bg-rose-500" />}
                </>
            )}
        </NavLink>
    );
}
