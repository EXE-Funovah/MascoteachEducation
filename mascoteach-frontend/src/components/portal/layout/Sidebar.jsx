import { NavLink } from 'react-router-dom';
import {
    Home,
    Library,
    History,
    LogOut,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Sidebar — Redesigned minimalist left navigation
 * 3 main nav items: Trang chủ, Thư viện của tôi, Lịch sử Phiên
 * Wayground-inspired clean design with light sky blue accents
 */
const navItems = [
    { to: '/teacher', icon: Home, label: 'Trang chủ', end: true },
    { to: '/teacher/library', icon: Library, label: 'Thư viện của tôi' },
    { to: '/teacher/sessions', icon: History, label: 'Lịch sử Phiên' },
];

export default function Sidebar() {
    const { user, logout } = useAuth();

    // Display name from API or fallback
    const displayName = user?.fullName || user?.name || 'Giáo viên';
    const displaySchool = user?.school || user?.email || '';
    const displayAvatar = user?.avatar || '👩‍🏫';

    return (
        <aside
            className="fixed top-0 left-0 h-screen z-40 flex flex-col w-[248px]
                  bg-white border-r border-slate-100/80"
            role="navigation"
            aria-label="Điều hướng chính"
        >
            {/* ── Brand Header ── */}
            <div className="flex items-center px-6 h-16 border-b border-slate-100/60">
                <img src="/images/Logo.png" alt="Mascoteach" className="h-6 object-contain" />
            </div>

            {/* ── Navigation Links ── */}
            <nav className="flex-1 px-3 pt-6 pb-4 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-medium
                             transition-all duration-200 group
                             ${isActive
                                ? 'bg-sky-50 text-sky-600 font-semibold'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon className={`w-5 h-5 flex-shrink-0 transition-colors duration-200
                                    ${isActive ? 'text-sky-500' : 'text-slate-400 group-hover:text-slate-600'}`} />
                                <span>{item.label}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* ── Teacher Profile & Logout ── */}
            <div className="px-3 py-4 border-t border-slate-100/60">
                <div className="flex items-center gap-3 px-4 py-3 mb-2">
                    <div className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center text-lg flex-shrink-0">
                        {displayAvatar}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-semibold text-slate-700 truncate">{displayName}</p>
                        <p className="text-[12px] text-slate-400 truncate">{displaySchool}</p>
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-medium text-slate-400
                           hover:bg-rose-50 hover:text-rose-500 w-full transition-all duration-200"
                >
                    <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
                    <span>Đăng xuất</span>
                </button>
            </div>
        </aside>
    );
}
