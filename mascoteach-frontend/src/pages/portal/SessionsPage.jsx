import { useState, useEffect } from 'react';
import { Users, Calendar, Eye, Gamepad2, Loader2, AlertCircle, Inbox } from 'lucide-react';
import { getMySessions } from '@/services/liveSessionService';

/**
 * SessionsPage — "Lịch sử Phiên" — Past game sessions
 * Now fetches real data from the LiveSession API
 * Structured minimalist table/list view
 */
const statusBadgeColors = {
    'Active': 'bg-emerald-50 text-emerald-600',
    'Ended': 'bg-slate-50 text-slate-500',
    'Pending': 'bg-amber-50 text-amber-600',
};

export default function SessionsPage() {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchSessions();
    }, []);

    async function fetchSessions() {
        try {
            setLoading(true);
            setError(null);
            const data = await getMySessions();
            setSessions(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message || 'Không thể tải lịch sử phiên');
        } finally {
            setLoading(false);
        }
    }

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

            {/* ── Content ── */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-6 h-6 text-sky-500 animate-spin" />
                    <span className="ml-3 text-sm text-slate-400">Đang tải lịch sử...</span>
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <AlertCircle className="w-10 h-10 text-slate-300 mb-3" />
                    <p className="text-sm text-slate-500 mb-4">{error}</p>
                    <button
                        onClick={fetchSessions}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-sky-600 bg-sky-50
                                   hover:bg-sky-100 transition-colors"
                    >
                        Thử lại
                    </button>
                </div>
            ) : sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
                        <Inbox className="w-7 h-7 text-slate-300" />
                    </div>
                    <h3 className="text-[14px] font-medium text-slate-500 mb-1">
                        Chưa có phiên chơi nào
                    </h3>
                    <p className="text-[13px] text-slate-400">
                        Tạo quiz và bắt đầu phiên chơi mới
                    </p>
                </div>
            ) : (
                <section>
                    {/* Table header (visible on md+) */}
                    <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 text-[11px] font-semibold
                                    text-slate-400 uppercase tracking-wider border-b border-slate-100">
                        <div className="col-span-4">Tên phiên</div>
                        <div className="col-span-2">Trạng thái</div>
                        <div className="col-span-2">Ngày tạo</div>
                        <div className="col-span-2">PIN</div>
                        <div className="col-span-2 text-right">Hành động</div>
                    </div>

                    {/* Session rows */}
                    <div className="space-y-1 mt-1">
                        {sessions.map((session) => (
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
                                        {session.title || session.quizTitle || `Phiên #${session.id}`}
                                    </h3>
                                </div>

                                {/* Status Badge */}
                                <div className="md:col-span-2">
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg
                                                      text-[11px] font-semibold
                                                      ${statusBadgeColors[session.status] || 'bg-slate-50 text-slate-500'}`}>
                                        {session.status || 'N/A'}
                                    </span>
                                </div>

                                {/* Date */}
                                <div className="md:col-span-2 flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5 text-slate-400 md:hidden" />
                                    <span className="text-[12px] text-slate-500">
                                        {session.createdAt
                                            ? new Date(session.createdAt).toLocaleDateString('vi-VN', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                            })
                                            : '—'}
                                    </span>
                                </div>

                                {/* PIN */}
                                <div className="md:col-span-2 flex items-center gap-1.5">
                                    {session.pin ? (
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg
                                                         bg-sky-50 text-sky-600 text-[12px] font-bold tracking-wider">
                                            {session.pin}
                                        </span>
                                    ) : (
                                        <span className="text-[12px] text-slate-400">—</span>
                                    )}
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
            )}
        </div>
    );
}
