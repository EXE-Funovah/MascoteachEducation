import { Users, Calendar, Eye, Gamepad2 } from 'lucide-react';
import { sessionsHistory } from '@/data/mockData';

/**
 * SessionsPage — "Lịch sử Phiên" — Past game sessions
 * Structured minimalist table/list view
 * Columns: Tên phiên, Chế độ chơi, Ngày tạo, Số học sinh, Xem chi tiết
 */
const modeBadgeColors = {
    'Trận chiến Câu hỏi': 'bg-sky-50 text-sky-600',
    'Chạy đua Thời gian': 'bg-amber-50 text-amber-600',
    'Đấu trường Đội': 'bg-emerald-50 text-emerald-600',
    'Chế độ Kho báu': 'bg-violet-50 text-violet-600',
    'Chế độ Sinh tồn': 'bg-rose-50 text-rose-600',
};

export default function SessionsPage() {
    return (
        <div className="space-y-8">
            {/* ── Page Header ── */}
            <header>
                <h1 className="text-2xl font-bold text-slate-800">
                    Lịch sử Phiên
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                    Xem lại các phiên chơi đã diễn ra
                </p>
            </header>

            {/* ── Sessions Table/List ── */}
            <section>
                {/* Table header (visible on md+) */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 text-[11px] font-semibold
                                text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <div className="col-span-4">Tên phiên</div>
                    <div className="col-span-2">Chế độ chơi</div>
                    <div className="col-span-2">Ngày tạo</div>
                    <div className="col-span-2">Số học sinh</div>
                    <div className="col-span-2 text-right">Hành động</div>
                </div>

                {/* Session rows */}
                <div className="space-y-1 mt-1">
                    {sessionsHistory.map((session) => (
                        <article
                            key={session.id}
                            className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 items-center
                                       px-5 py-4 rounded-xl
                                       border border-transparent hover:border-slate-100
                                       hover:bg-slate-50/30
                                       transition-all duration-200 group cursor-pointer"
                        >
                            {/* Session Name */}
                            <div className="md:col-span-4 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center flex-shrink-0">
                                    <Gamepad2 className="w-4 h-4 text-sky-500" />
                                </div>
                                <h3 className="text-[13px] font-medium text-slate-700 truncate
                                               group-hover:text-slate-800 transition-colors">
                                    {session.title}
                                </h3>
                            </div>

                            {/* Game Mode Badge */}
                            <div className="md:col-span-2">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg
                                                  text-[11px] font-semibold
                                                  ${modeBadgeColors[session.mode] || 'bg-slate-50 text-slate-500'}`}>
                                    {session.mode}
                                </span>
                            </div>

                            {/* Date */}
                            <div className="md:col-span-2 flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-slate-400 md:hidden" />
                                <span className="text-[12px] text-slate-500">
                                    {new Date(session.date).toLocaleDateString('vi-VN', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                    })}
                                </span>
                            </div>

                            {/* Players */}
                            <div className="md:col-span-2 flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5 text-slate-400" />
                                <span className="text-[12px] text-slate-600 font-medium">
                                    {session.players} học sinh
                                </span>
                            </div>

                            {/* Action */}
                            <div className="md:col-span-2 flex justify-end">
                                <button
                                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg
                                               border border-slate-200/80 bg-white
                                               text-[12px] font-medium text-slate-500
                                               hover:border-sky-300 hover:text-sky-600 hover:bg-sky-50/50
                                               transition-all duration-200"
                                >
                                    <Eye className="w-3.5 h-3.5" />
                                    Xem chi tiết
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            </section>
        </div>
    );
}
