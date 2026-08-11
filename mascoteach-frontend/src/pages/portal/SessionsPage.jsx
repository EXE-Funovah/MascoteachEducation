import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    AlertCircle,
    CalendarDays,
    ChevronDown,
    Eye,
    Gamepad2,
    Library,
    Loader2,
    Search,
} from 'lucide-react';
import { getMySessions } from '@/services/liveSessionService';

const TABS = [
    { id: 'all', label: 'Tất cả' },
    { id: 'waiting', label: 'Chờ bắt đầu' },
    { id: 'running', label: 'Đang diễn ra' },
    { id: 'ended', label: 'Đã kết thúc' },
];

const DATE_FILTERS = [
    { id: 'all', label: 'Tất cả ngày' },
    { id: 'today', label: 'Hôm nay' },
    { id: '7d', label: '7 ngày qua' },
    { id: '30d', label: '30 ngày qua' },
];

const STATUS_META = {
    Waiting: { label: 'Chờ bắt đầu', tab: 'waiting', className: 'bg-brand-light/25 text-brand-navy border-brand-light' },
    Active: { label: 'Đang diễn ra', tab: 'running', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    Running: { label: 'Đang diễn ra', tab: 'running', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    Scheduled: { label: 'Chờ bắt đầu', tab: 'waiting', className: 'bg-brand-light/25 text-brand-navy border-brand-light' },
    Ended: { label: 'Đã kết thúc', tab: 'ended', className: 'bg-slate-50 text-slate-600 border-slate-200' },
    Completed: { label: 'Đã kết thúc', tab: 'ended', className: 'bg-slate-50 text-slate-600 border-slate-200' },
    Pending: { label: 'Tạm dừng', tab: 'paused', className: 'bg-amber-50 text-amber-700 border-amber-200' },
    Paused: { label: 'Tạm dừng', tab: 'paused', className: 'bg-amber-50 text-amber-700 border-amber-200' },
};

function getSessionTitle(session) {
    return session.title || session.quizTitle || `Phiên chơi #${session.id}`;
}

function getStatusMeta(status) {
    return STATUS_META[status] || { label: status || 'Chưa rõ', tab: 'other', className: 'bg-slate-50 text-slate-600 border-slate-200' };
}

function isRunningSession(status) {
    return status === 'Active' || status === 'Running';
}

function isWaitingSession(status) {
    return status === 'Waiting' || status === 'Scheduled';
}

function getSessionActionLabel(session) {
    if (!session?.quizId) return 'Chưa có quiz';
    if (isRunningSession(session.status)) return 'Tiếp tục chơi';
    if (isWaitingSession(session.status)) return 'Mở phòng chờ';
    return 'Xem báo cáo';
}

function formatDate(value) {
    if (!value) return 'Chưa có ngày';
    return new Date(value).toLocaleDateString('vi-VN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function normalize(value) {
    return String(value || '').toLowerCase().trim();
}

function matchesDateFilter(value, filterId) {
    if (filterId === 'all') return true;
    if (!value) return false;

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return false;

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (filterId === 'today') {
        return date >= startOfToday;
    }

    const days = filterId === '7d' ? 7 : 30;
    const start = new Date(startOfToday);
    start.setDate(start.getDate() - (days - 1));
    return date >= start;
}

export default function SessionsPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState('all');

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
            setError(err.message || 'Không thể tải lịch sử phiên chơi');
        } finally {
            setLoading(false);
        }
    }

    function goToLibrary(state = {}) {
        const basePath = location.pathname.startsWith('/dev/teacher') ? '/dev/teacher' : '/teacher';
        navigate(`${basePath}/library`, { state });
    }

    function handleOpenSession(session) {
        if (!session?.quizId) return;

        if (isRunningSession(session.status)) {
            navigate('/teacher/treasure-hunt', {
                state: {
                    sessionId: session.id,
                    quizId: session.quizId,
                    quizTitle: getSessionTitle(session),
                    gamePin: session.gamePin || session.pin,
                    hostMode: true,
                    resumeSession: true,
                },
            });
            return;
        }

        if (isWaitingSession(session.status)) {
            navigate(`/teacher/live-session/${session.id}`);
            return;
        }

        const basePath = location.pathname.startsWith('/dev/teacher') ? '/dev/teacher' : '/teacher';
        navigate(`${basePath}/sessions/${session.id}/report`);
    }

    const tabCounts = useMemo(() => {
        return sessions.reduce(
            (counts, session) => {
                const tab = getStatusMeta(session.status).tab;
                counts.all += 1;
                if (counts[tab] !== undefined) counts[tab] += 1;
                return counts;
            },
            { all: 0, waiting: 0, running: 0, ended: 0 }
        );
    }, [sessions]);

    const filteredSessions = useMemo(() => {
        const query = normalize(searchQuery);
        return sessions.filter((session) => {
            const statusTab = getStatusMeta(session.status).tab;
            const matchesTab = activeTab === 'all' || statusTab === activeTab;
            const title = normalize(`${getSessionTitle(session)} ${session.pin || session.gamePin || ''}`);
            const matchesSearch = !query || title.includes(query);
            const matchesDate = matchesDateFilter(session.createdAt, dateFilter);
            return matchesTab && matchesSearch && matchesDate;
        });
    }, [activeTab, dateFilter, searchQuery, sessions]);

    return (
        <div className="min-h-screen bg-[#fbfdff] px-5 py-6 text-slate-900 sm:px-8">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div>
                    <h1 className="text-[28px] font-extrabold leading-tight text-slate-950">Lịch sử phiên chơi</h1>
                    <p className="mt-2 text-[15px] font-semibold text-slate-500">
                        Quản lý các phiên quiz đã mở cho người chơi tham gia bằng mã PIN.
                    </p>
                </div>

                <div className="relative w-full xl:w-[360px]">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                    <input
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        placeholder="Tìm theo tên nội dung hoặc mã PIN"
                        className="h-12 w-full rounded-full border border-slate-200 bg-white pl-12 pr-4 text-[15px] font-semibold text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-brand-light focus:border-brand-mid focus:ring-4 focus:ring-brand-light/30"
                    />
                </div>
            </div>

            <div className="mt-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                    {TABS.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`h-11 rounded-full px-4 text-[14px] font-extrabold transition-all duration-200 ${
                                    isActive
                                        ? 'bg-white text-brand-navy shadow-[0_10px_28px_rgba(15,23,42,0.09)] ring-1 ring-slate-200'
                                        : 'text-slate-500 hover:bg-white/70 hover:text-slate-900'
                                }`}
                            >
                                {tab.label} ({tabCounts[tab.id]})
                            </button>
                        );
                    })}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <DateFilterControl value={dateFilter} onChange={setDateFilter} />
                </div>
            </div>

            <motion.section
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                className="mt-8"
            >
                {loading ? (
                    <LoadingState />
                ) : error ? (
                    <ErrorState message={error} onRetry={fetchSessions} />
                ) : filteredSessions.length === 0 ? (
                    <EmptyReports onOpenLibrary={() => goToLibrary()} hasSearch={Boolean(searchQuery) || activeTab !== 'all'} />
                ) : (
                    <ReportsTable sessions={filteredSessions} onOpenSession={handleOpenSession} />
                )}
            </motion.section>
        </div>
    );
}

function DateFilterControl({ value, onChange }) {
    return (
        <label className="relative inline-flex h-10 items-center rounded-lg border border-slate-200 bg-white text-[13px] font-extrabold text-slate-800 shadow-sm transition-all duration-200 hover:border-brand-mid hover:bg-brand-light/20">
            <CalendarDays className="ml-4 h-4 w-4 text-slate-600" />
            <select
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="h-full appearance-none rounded-lg bg-transparent pl-2 pr-9 font-extrabold outline-none"
                aria-label="Lọc theo ngày"
            >
                {DATE_FILTERS.map((filter) => (
                    <option key={filter.id} value={filter.id}>
                        {filter.label}
                    </option>
                ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-slate-500" />
        </label>
    );
}

function EmptyReports({ onOpenLibrary, hasSearch }) {
    return (
        <div className="flex min-h-[560px] flex-col items-center justify-start pt-20 text-center">
            <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-brand-light/30 text-brand-blue shadow-[0_18px_40px_rgba(43,122,181,0.12)]">
                <Gamepad2 className="h-8 w-8" />
            </div>
            <h2 className="text-[20px] font-extrabold text-slate-800">
                {hasSearch ? 'Chưa tìm thấy phiên chơi phù hợp' : 'Chưa có phiên chơi nào'}
            </h2>
            <p className="mt-2 text-[14px] font-semibold text-slate-500">Chọn một quiz hoặc flashcard trong thư viện để bắt đầu phiên mới.</p>
            <button
                onClick={onOpenLibrary}
                className="mt-6 inline-flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 text-[14px] font-extrabold text-slate-900 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-mid hover:bg-brand-light/20 hover:text-brand-navy active:translate-y-0"
            >
                <Library className="h-4 w-4" />
                Mở thư viện của tôi
            </button>
        </div>
    );
}

function LoadingState() {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-[0_18px_46px_rgba(15,23,42,0.05)]">
            <div className="mb-6 flex items-center justify-center py-8 text-[15px] font-bold text-slate-500">
                <Loader2 className="mr-3 h-6 w-6 animate-spin text-brand-blue" />
                Đang tải lịch sử phiên chơi...
            </div>
            <div className="space-y-3">
                {[0, 1, 2, 3].map((item) => (
                    <div key={item} className="h-16 animate-pulse rounded-lg bg-slate-100" />
                ))}
            </div>
        </div>
    );
}

function ErrorState({ message, onRetry }) {
    return (
        <div className="flex min-h-[420px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-center shadow-[0_18px_46px_rgba(15,23,42,0.05)]">
            <AlertCircle className="mb-3 h-11 w-11 text-rose-400" />
            <p className="text-[16px] font-extrabold text-slate-800">{message}</p>
            <button
                onClick={onRetry}
                className="mt-5 rounded-lg bg-brand-light/30 px-5 py-2.5 text-[14px] font-extrabold text-brand-blue transition-colors duration-200 hover:bg-brand-light/50"
            >
                Thử lại
            </button>
        </div>
    );
}

function ReportsTable({ sessions, onOpenSession }) {
    return (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_18px_46px_rgba(15,23,42,0.05)]">
            <div className="hidden grid-cols-[minmax(0,1fr)_160px_150px_130px_180px] items-center gap-5 px-6 py-4 text-[13px] font-extrabold uppercase tracking-[0.08em] text-slate-500 lg:grid">
                <span>Nội dung</span>
                <span>Trạng thái</span>
                <span>Ngày tạo</span>
                <span>Mã PIN</span>
                <span className="text-right">Kết quả</span>
            </div>

            <div>
                {sessions.map((session, index) => {
                    const status = getStatusMeta(session.status);
                    return (
                        <motion.article
                            key={session.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.22, delay: Math.min(index * 0.035, 0.18) }}
                            onClick={() => onOpenSession(session)}
                            className="grid cursor-pointer grid-cols-1 gap-4 border-t border-slate-200 px-6 py-4 transition-all duration-200 hover:bg-brand-light/10 lg:grid-cols-[minmax(0,1fr)_160px_150px_130px_180px] lg:items-center lg:gap-5"
                        >
                            <div className="flex min-w-0 items-center gap-4">
                                <div className="grid h-12 w-12 flex-none place-items-center rounded-lg border border-slate-200 bg-slate-50 text-brand-blue">
                                    <Gamepad2 className="h-6 w-6" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="truncate text-[16px] font-extrabold text-slate-900">{getSessionTitle(session)}</h3>
                                    <p className="mt-1 truncate text-[13px] font-semibold text-slate-500">
                                        Phiên chơi trực tiếp · {session.participantCount || 0} người chơi
                                    </p>
                                </div>
                            </div>

                            <div>
                                <span className={`inline-flex rounded-lg border px-3 py-1.5 text-[12px] font-extrabold ${status.className}`}>
                                    {status.label}
                                </span>
                            </div>

                            <span className="text-[14px] font-semibold text-slate-500">{formatDate(session.createdAt)}</span>

                            <span className="text-[14px] font-extrabold tracking-wide text-brand-navy">
                                {session.pin || session.gamePin || 'Chưa có'}
                            </span>

                            <div className="flex justify-start lg:justify-end">
                                <button
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        onOpenSession(session);
                                    }}
                                    disabled={!session.quizId}
                                    className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-[14px] font-bold text-slate-800 transition-all duration-200 hover:border-brand-mid hover:bg-brand-light/20 hover:text-brand-blue disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isRunningSession(session.status)
                                        ? <Gamepad2 className="h-4 w-4" />
                                        : <Eye className="h-4 w-4" />}
                                    {getSessionActionLabel(session)}
                                </button>
                            </div>
                        </motion.article>
                    );
                })}
            </div>
        </div>
    );
}
