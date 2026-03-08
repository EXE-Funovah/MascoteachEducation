import { useState, useEffect } from 'react';
import { Plus, Clock, Users, Play, FileText, Sparkles, Search, CloudUpload, Loader2, AlertCircle } from 'lucide-react';
import CreateFlowModal from '@/components/portal/create/CreateFlowModal';
import { useAuth } from '@/contexts/AuthContext';
import { getMySessions } from '@/services/liveSessionService';

/* ── Tab definitions ── */
const TABS = [
    { id: 'create', label: 'Tạo mới', Icon: Sparkles },
    { id: 'search', label: 'Tìm kiếm', Icon: Search },
    { id: 'upload', label: 'Tải lên', Icon: CloudUpload },
];

/* ── Category tags for search view ── */
const SEARCH_CATEGORIES = [
    'Toán học', 'Sinh học', 'Lịch sử', 'Tiếng Anh',
    'Vật lý', 'Hóa học', 'Địa lý', 'Văn học',
];

export default function HomePage() {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [activeTab, setActiveTab] = useState('create');
    const [animKey, setAnimKey] = useState(0);

    // Real data from API
    const [recentSessions, setRecentSessions] = useState([]);
    const [loadingSessions, setLoadingSessions] = useState(true);
    const [sessionsError, setSessionsError] = useState(null);

    const { user } = useAuth();
    const displayName = user?.fullName || user?.FullName || user?.full_name || user?.name || user?.userName || 'Giáo viên';

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Chào buổi sáng' : hour < 17 ? 'Chào buổi chiều' : 'Chào buổi tối';

    // Fetch recent sessions from API
    useEffect(() => {
        async function fetchSessions() {
            try {
                setLoadingSessions(true);
                const data = await getMySessions();
                // Take the most recent 5 sessions
                const sessions = Array.isArray(data) ? data.slice(0, 5) : [];
                setRecentSessions(sessions);
            } catch (err) {
                setSessionsError(err.message || 'Không thể tải hoạt động gần đây');
            } finally {
                setLoadingSessions(false);
            }
        }
        fetchSessions();
    }, []);

    /* Re-trigger mount animation whenever the active tab changes */
    useEffect(() => {
        setAnimKey((k) => k + 1);
    }, [activeTab]);

    /* ── Tab content renderers ── */
    const renderCreateContent = () => (
        <section aria-label="Hoạt động gần đây">
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-[15px] font-semibold text-slate-700">
                    Hoạt động gần đây
                </h2>
            </div>

            {loadingSessions ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 text-sky-500 animate-spin" />
                    <span className="ml-3 text-sm text-slate-400">Đang tải...</span>
                </div>
            ) : sessionsError ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <AlertCircle className="w-8 h-8 text-slate-300 mb-3" />
                    <p className="text-sm text-slate-400">{sessionsError}</p>
                </div>
            ) : recentSessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
                        <FileText className="w-7 h-7 text-slate-300" />
                    </div>
                    <h3 className="text-[14px] font-medium text-slate-500 mb-1">
                        Chưa có hoạt động nào
                    </h3>
                    <p className="text-[13px] text-slate-400">
                        Bắt đầu bằng cách tạo quiz mới
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {recentSessions.map((session) => (
                        <article
                            key={session.id}
                            className="flex items-center justify-between p-4 rounded-xl
                                       border border-slate-100/80 bg-white
                                       hover:border-slate-200 hover:bg-slate-50/30
                                       transition-all duration-200 group cursor-pointer"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-9 h-9 rounded-lg bg-sky-50 flex items-center justify-center flex-shrink-0">
                                    {session.status === 'Active' ? (
                                        <Play className="w-4 h-4 text-sky-500" />
                                    ) : (
                                        <Plus className="w-4 h-4 text-sky-500" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-[13px] font-medium text-slate-700 group-hover:text-slate-800
                                                   transition-colors">
                                        {session.title || session.quizTitle || `Phiên #${session.id}`}
                                    </h3>
                                    <div className="flex items-center gap-3 mt-1">
                                        {session.pin && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-md
                                                             bg-sky-50 text-sky-600 text-[11px] font-medium">
                                                PIN: {session.pin}
                                            </span>
                                        )}
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-md
                                                         bg-slate-50 text-slate-500 text-[11px] font-medium">
                                            {session.status || 'Hoàn thành'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-5 text-right">
                                {session.participantCount != null && (
                                    <div className="flex items-center gap-1.5">
                                        <Users className="w-3.5 h-3.5 text-slate-400" />
                                        <span className="text-[12px] text-slate-500 font-medium">
                                            {session.participantCount}
                                        </span>
                                    </div>
                                )}
                                {session.createdAt && (
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                                        <span className="text-[12px] text-slate-400">
                                            {new Date(session.createdAt).toLocaleDateString('vi-VN', {
                                                day: 'numeric',
                                                month: 'short',
                                            })}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );

    const renderSearchContent = () => (
        <section aria-label="Tìm kiếm" className="space-y-6">
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Tìm kiếm bài quiz, chủ đề, hoặc từ khóa..."
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200
                               bg-white text-sm text-slate-700 placeholder:text-slate-400
                               focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-300
                               transition-all duration-200"
                />
            </div>
            <div>
                <p className="text-[13px] text-slate-400 mb-3">Khám phá theo danh mục</p>
                <div className="flex flex-wrap gap-2">
                    {SEARCH_CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            className="px-4 py-2 rounded-full text-[13px] font-medium
                                       bg-sky-50 text-sky-600 border border-sky-100
                                       hover:bg-sky-100 hover:border-sky-200
                                       transition-all duration-200 cursor-pointer"
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );

    const renderUploadContent = () => (
        <section aria-label="Tải lên">
            <div className="flex flex-col items-center justify-center py-16 px-6
                            rounded-2xl border-2 border-dashed border-slate-200
                            bg-slate-50/50 hover:border-sky-300 hover:bg-sky-50/30
                            transition-all duration-300 cursor-pointer group">
                <div className="w-14 h-14 rounded-2xl bg-sky-50 flex items-center justify-center mb-4
                                group-hover:bg-sky-100 transition-colors duration-300">
                    <CloudUpload className="w-7 h-7 text-sky-500" />
                </div>
                <p className="text-[15px] font-semibold text-slate-700 mb-1">
                    Tải lên tài liệu của bạn
                </p>
                <p className="text-[13px] text-slate-400 mb-5">
                    Kéo thả hoặc nhấn để chọn PDF, DOCX, PPTX
                </p>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-5 py-2.5 rounded-xl text-[13px] font-semibold
                               bg-sky-500 text-white shadow-gamma-btn
                               hover:bg-sky-600 hover:shadow-gamma-btn-hover
                               transition-all duration-200 cursor-pointer"
                >
                    Chọn tệp
                </button>
            </div>
        </section>
    );

    const contentMap = {
        create: renderCreateContent,
        search: renderSearchContent,
        upload: renderUploadContent,
    };

    return (
        <>
            <div className="space-y-10">
                {/* ── Centered Hero / Greeting ── */}
                <header className="flex flex-col items-center text-center pt-4">
                    <h1 className="text-2xl font-bold text-slate-800">
                        {greeting}, {displayName} 👋
                    </h1>
                    <p className="text-sm text-slate-400 mt-1.5 max-w-md">
                        Bắt đầu tạo quiz hoặc xem lại hoạt động gần đây.
                    </p>
                </header>

                {/* ── Compact Tab Row (Wayground-style) ── */}
                <nav aria-label="Chức năng chính" className="flex justify-center">
                    <div className="inline-flex items-center gap-1 p-1.5 rounded-2xl bg-slate-100/60">
                        {TABS.map(({ id, label, Icon }) => {
                            const isActive = activeTab === id;
                            return (
                                <button
                                    key={id}
                                    onClick={() => setActiveTab(id)}
                                    className={`
                                        relative flex flex-col items-center gap-1 px-6 py-3 rounded-xl
                                        text-[13px] font-medium transition-all duration-250 cursor-pointer
                                        ${isActive
                                            ? 'bg-white text-sky-600 shadow-gamma-soft border-b-2 border-sky-500'
                                            : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
                                        }
                                    `}
                                >
                                    <Icon className={`w-5 h-5 transition-colors duration-250 ${isActive ? 'text-sky-500' : 'text-slate-400'}`} />
                                    <span>{label}</span>
                                </button>
                            );
                        })}
                    </div>
                </nav>

                {/* ── Dynamic Content Area (animated) ── */}
                <div
                    key={animKey}
                    className="animate-fade-slide-up"
                >
                    {contentMap[activeTab]()}
                </div>
            </div>

            {/* ── Create Flow Modal ── */}
            {showCreateModal && (
                <CreateFlowModal onClose={() => setShowCreateModal(false)} />
            )}
        </>
    );
}
