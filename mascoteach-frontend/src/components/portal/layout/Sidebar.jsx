import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Sparkles,
    Gamepad2,
    History,
    BarChart3,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    GraduationCap,
} from 'lucide-react';
import { teacherProfile } from '@/data/mockData';

/**
 * Sidebar — Main navigation for the teacher portal
 * Collapsible design with icon-only mode for more workspace
 * Uses NavLink for active state highlighting
 */
const navItems = [
    { to: '/portal', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/portal/create', icon: Sparkles, label: 'Create with AI' },
    { to: '/portal/games', icon: Gamepad2, label: 'Game Modes' },
    { to: '/portal/sessions', icon: History, label: 'Sessions' },
    { to: '/portal/analytics', icon: BarChart3, label: 'Analytics' },
];

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <aside
            className={`fixed top-0 left-0 h-screen z-40 flex flex-col
                  bg-white border-r border-slate-100
                  transition-all duration-300 ease-out
                  ${collapsed ? 'w-[72px]' : 'w-[260px]'}`}
            role="navigation"
            aria-label="Main navigation"
        >
            {/* ── Brand Header ── */}
            <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-navy to-brand-blue flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-5 h-5 text-white" />
                </div>
                {!collapsed && (
                    <span className="text-lg font-bold text-ink tracking-tight">Mascoteach</span>
                )}
            </div>

            {/* ── Navigation Links ── */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
               transition-all duration-200 group
               ${isActive
                                ? 'bg-gradient-to-r from-brand-navy/10 to-brand-blue/5 text-brand-navy'
                                : 'text-ink-secondary hover:bg-slate-50 hover:text-ink'
                            }`
                        }
                    >
                        <item.icon className={`w-5 h-5 flex-shrink-0 transition-colors duration-200`} />
                        {!collapsed && <span>{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* ── Teacher Profile ── */}
            <div className="px-3 py-3 border-t border-slate-100">
                {!collapsed && (
                    <div className="flex items-center gap-3 px-3 py-2 mb-2">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-mid to-brand-light flex items-center justify-center text-lg">
                            {teacherProfile.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-ink truncate">{teacherProfile.name}</p>
                            <p className="text-xs text-ink-muted truncate">{teacherProfile.school}</p>
                        </div>
                    </div>
                )}

                <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-ink-muted
                           hover:bg-rose-50 hover:text-rose-600 w-full transition-all duration-200">
                    <LogOut className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span>Log out</span>}
                </button>
            </div>

            {/* ── Collapse Toggle ── */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="absolute top-1/2 -right-3 w-6 h-6 rounded-full bg-white border border-slate-200
                   shadow-sm flex items-center justify-center
                   hover:bg-slate-50 transition-colors duration-200 z-50"
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
                {collapsed ? (
                    <ChevronRight className="w-3.5 h-3.5 text-ink-muted" />
                ) : (
                    <ChevronLeft className="w-3.5 h-3.5 text-ink-muted" />
                )}
            </button>
        </aside>
    );
}
