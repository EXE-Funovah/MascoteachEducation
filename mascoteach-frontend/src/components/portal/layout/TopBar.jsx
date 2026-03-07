import { Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

/**
 * TopBar — Clean top navigation bar
 * Contains search input and teacher profile avatar
 * Wayground-inspired minimal design
 */
export default function TopBar() {
    const { user } = useAuth();

    const displayName = user?.fullName || user?.name || 'Giáo viên';
    const displayAvatar = user?.avatar || '👩‍🏫';

    return (
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100/60">
            <div className="flex items-center justify-between h-16 px-8">
                {/* ── Search ── */}
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm tài nguyên, quiz..."
                        className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200/80 bg-slate-50/50
                                   text-[14px] text-slate-700 placeholder:text-slate-400
                                   focus:outline-none focus:border-sky-300 focus:bg-white
                                   focus:ring-2 focus:ring-sky-100
                                   transition-all duration-200"
                    />
                </div>

                {/* ── Profile Avatar ── */}
                <button
                    className="flex items-center gap-3 ml-6 px-3 py-1.5 rounded-xl
                               hover:bg-slate-50 transition-colors duration-200"
                    aria-label="Hồ sơ giáo viên"
                >
                    <div className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center text-lg
                                    ring-2 ring-sky-200/50">
                        {displayAvatar}
                    </div>
                    <span className="text-[14px] font-medium text-slate-600 hidden sm:block">
                        {displayName}
                    </span>
                </button>
            </div>
        </header>
    );
}
