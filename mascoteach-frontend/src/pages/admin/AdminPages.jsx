import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import {
    AlertTriangle,
    BarChart3,
    BookOpenCheck,
    CalendarClock,
    CheckCircle2,
    ChevronRight,
    CircleDollarSign,
    Clock3,
    CreditCard,
    Database,
    FileSearch,
    Filter,
    Flag,
    Gamepad2,
    HardDrive,
    LifeBuoy,
    LockKeyhole,
    ReceiptText,
    RotateCw,
    Search,
    ShieldAlert,
    ShieldCheck,
    Sparkles,
    UserCog,
    UsersRound,
    Zap,
} from 'lucide-react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import {
    AdminCard,
    AdminSectionHeader,
    AdminTable,
    ActionButton,
    formatAdminValue,
    MiniMetric,
    StatusBadge,
} from '@/components/admin/AdminLayout';
import {
    adminAlerts,
    adminDocuments,
    adminOrders,
    adminOverviewStats,
    adminSessions,
    adminUsers,
    aiUsageRows,
    auditLogs,
    getContentById,
    getSessionById,
    getUserById,
    revenueSeries,
    supportTimeline,
    topTeachers,
    upcomingOps,
    usageSeries,
} from '@/data/adminMockData';
import {
    getAdminBillingOrders,
    getAdminBillingWebhookEvents,
    getAdminDocumentById,
    getAdminDocuments,
    getAdminOverview,
    getAdminQuizById,
    getAdminQuizzes,
    getAdminSessionById,
    getAdminSessionParticipants,
    getAdminSessions,
    getAdminUserById as fetchAdminUserById,
    getAdminUsers,
    hasAdminApiToken,
} from '@/services/adminService';

function useAdminBase() {
    const location = useLocation();
    return location.pathname.startsWith('/dev/admin') ? '/dev/admin' : '/admin';
}

function PageGrid({ children, className = '' }) {
    return <div className={`grid gap-6 ${className}`}>{children}</div>;
}

function ApiTag({ children }) {
    return (
        <span className="inline-flex rounded-full bg-[#EEF7FD] px-3 py-1 text-xs font-black text-[#2B7AB5]">
            {children}
        </span>
    );
}

function FilterBar({ placeholder = 'Tìm kiếm', filters = [] }) {
    return (
        <AdminCard className="p-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="relative min-w-0 flex-1">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7790A8]" />
                    <input
                        className="h-12 w-full rounded-full border border-[#D8E9F5] bg-white pl-11 pr-4 text-sm font-bold text-[#102744] outline-none placeholder:text-[#8EA1B4] focus:border-[#5BAED4] focus:ring-4 focus:ring-[#A8D8EA]/30"
                        placeholder={placeholder}
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    {filters.map((filter) => (
                        <button key={filter} className="inline-flex h-11 items-center gap-2 rounded-full border border-[#D8E9F5] bg-white px-4 text-sm font-black text-[#52677F] transition hover:border-[#A8D8EA] hover:text-[#102744]">
                            <Filter className="h-4 w-4" />
                            {filter}
                        </button>
                    ))}
                </div>
            </div>
        </AdminCard>
    );
}

function getField(source, camelKey, pascalKey = camelKey.charAt(0).toUpperCase() + camelKey.slice(1), fallback = undefined) {
    if (!source) return fallback;
    return source[camelKey] ?? source[pascalKey] ?? fallback;
}

function getItems(response) {
    return getField(response, 'items', 'Items', []);
}

function formatNumber(value) {
    const numeric = Number(value || 0);
    return new Intl.NumberFormat('vi-VN').format(numeric);
}

function formatCompactVnd(value) {
    const numeric = Number(value || 0);
    if (numeric >= 1000000) {
        return `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 }).format(numeric / 1000000)}M`;
    }
    return new Intl.NumberFormat('vi-VN').format(numeric);
}

function formatMoney(value, currency = 'VND') {
    const numeric = Number(value || 0);
    if (String(currency).toUpperCase() === 'VND') {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0,
        }).format(numeric);
    }
    return `${formatNumber(numeric)} ${currency}`;
}

function formatDate(value) {
    if (!value) return 'Chưa có';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(date);
}

function formatDateTime(value) {
    if (!value) return 'Chưa có';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

function formatKpiValue(value, format) {
    if (format === 'currency') return formatCompactVnd(value);
    if (format === 'percent') return `${Number(value || 0).toFixed(1)}%`;
    return formatNumber(value);
}

function getStatusFromDeletion(isDeleted, fallback = 'Active') {
    return isDeleted ? 'Deleted' : fallback;
}

function useAdminResource(fetcher, fallback, deps = []) {
    const [state, setState] = useState({
        data: fallback,
        error: '',
        isLoading: false,
        isFallback: true,
    });

    useEffect(() => {
        if (!hasAdminApiToken()) {
            setState({ data: fallback, error: '', isLoading: false, isFallback: true });
            return undefined;
        }

        const controller = new AbortController();
        setState((current) => ({ ...current, isLoading: true, error: '' }));

        fetcher({ signal: controller.signal })
            .then((data) => {
                setState({ data, error: '', isLoading: false, isFallback: false });
            })
            .catch((error) => {
                if (controller.signal.aborted) return;
                setState({
                    data: fallback,
                    error: error?.message || 'Không thể tải dữ liệu admin.',
                    isLoading: false,
                    isFallback: true,
                });
            });

        return () => controller.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    return state;
}

function DataStateNotice({ state, fallbackLabel = 'Đang hiển thị dữ liệu mẫu vì chưa có phiên Admin hoặc API chưa sẵn sàng.' }) {
    if (state?.isLoading) {
        return (
            <div className="rounded-[18px] border border-[#D8E9F5] bg-white px-4 py-3 text-sm font-bold text-[#52677F]">
                Đang tải dữ liệu từ backend...
            </div>
        );
    }

    if (state?.error) {
        return (
            <div className="rounded-[18px] border border-[#FFE2B8] bg-[#FFF8EC] px-4 py-3 text-sm font-bold text-[#9B5A00]">
                {state.error} {fallbackLabel}
            </div>
        );
    }

    if (state?.isFallback && !hasAdminApiToken()) {
        return (
            <div className="rounded-[18px] border border-[#D8E9F5] bg-[#F7FCFF] px-4 py-3 text-sm font-bold text-[#52677F]">
                {fallbackLabel}
            </div>
        );
    }

    return null;
}

function adaptOverviewStats(overview) {
    const kpis = getField(overview, 'kpis', 'Kpis', []);
    if (!kpis.length) return adminOverviewStats;

    const tones = ['blue', 'cyan', 'green', 'peach'];
    return kpis.slice(0, 4).map((item, index) => {
        const value = getField(item, 'value', 'Value', 0);
        const format = getField(item, 'format', 'Format', 'int');
        const deltaPercent = getField(item, 'deltaPercent', 'DeltaPercent', 0);
        const up = getField(item, 'up', 'Up', true);

        return {
            id: getField(item, 'key', 'Key', `kpi-${index}`),
            label: getField(item, 'label', 'Label', 'Chỉ số'),
            value: formatKpiValue(value, format),
            delta: `${up ? '+' : '-'}${Math.abs(Number(deltaPercent || 0)).toFixed(1)}%`,
            note: 'so với kỳ trước',
            tone: tones[index] || 'blue',
            api: 'GET /api/Admin/overview',
        };
    });
}

function adaptRevenueSeries(overview) {
    const series = getField(overview, 'paidRevenueSeries', 'PaidRevenueSeries', []);
    if (!series.length) return revenueSeries;

    return series.map((point) => {
        const value = getField(point, 'value', 'Value', 0);
        return {
            month: getField(point, 'label', 'Label', ''),
            revenue: Math.round(Number(value || 0) / 1000000),
            collected: Math.round(Number(value || 0) / 1000000),
            aiCost: 0,
        };
    });
}

function adaptUser(row) {
    const subscriptionTier = getField(row, 'subscriptionTier', 'SubscriptionTier', 'Freemium');
    const subscriptionStatus = getField(row, 'subscriptionStatus', 'SubscriptionStatus', subscriptionTier);
    const fullName = getField(row, 'fullName', 'FullName', 'Chưa đặt tên');
    const quizCount = Number(getField(row, 'quizCount', 'QuizCount', 0));
    const flashcardCount = Number(getField(row, 'flashcardCount', 'FlashcardCount', 0));

    return {
        id: String(getField(row, 'id', 'Id', '')),
        name: fullName,
        email: getField(row, 'email', 'Email', ''),
        role: getField(row, 'role', 'Role', 'Teacher'),
        plan: subscriptionTier === 'Premium' ? 'Premium' : subscriptionTier,
        status: subscriptionStatus,
        joinedAt: formatDate(getField(row, 'createdAt', 'CreatedAt')),
        lastActive: formatDate(getField(row, 'lastActiveDate', 'LastActiveDate')),
        documents: Number(getField(row, 'documentCount', 'DocumentCount', 0)),
        quizzes: quizCount,
        flashcards: flashcardCount,
        sessions: Number(getField(row, 'liveSessionCount', 'LiveSessionCount', 0)),
        storage: `${Number(getField(row, 'documentsProcessed', 'DocumentsProcessed', 0))} tài liệu xử lý`,
        revenue: getField(row, 'latestPaymentStatus', 'LatestPaymentStatus') || 'Chưa có thanh toán',
        latestPaymentPlanCode: getField(row, 'latestPaymentPlanCode', 'LatestPaymentPlanCode', ''),
        latestPaymentAt: formatDateTime(getField(row, 'latestPaymentAt', 'LatestPaymentAt')),
        xp: Number(getField(row, 'xp', 'Xp', 0)),
        currentStreak: Number(getField(row, 'currentStreak', 'CurrentStreak', 0)),
        learningSeconds: Number(getField(row, 'totalLearningSeconds', 'TotalLearningSeconds', 0)),
        correctAnswers: Number(getField(row, 'totalCorrectAnswers', 'TotalCorrectAnswers', 0)),
        totalQuestions: Number(getField(row, 'totalQuestionsAnswered', 'TotalQuestionsAnswered', 0)),
        paymentOrderCount: Number(getField(row, 'paymentOrderCount', 'PaymentOrderCount', 0)),
    };
}

function adaptDocument(row) {
    const id = getField(row, 'id', 'Id', '');
    const quizCount = Number(getField(row, 'quizCount', 'QuizCount', 0));
    const flashcardCount = Number(getField(row, 'flashcardCount', 'FlashcardCount', 0));

    return {
        id: `document-${id}`,
        rawId: String(id),
        detailType: 'document',
        title: getField(row, 'fileName', 'FileName', 'Tài liệu chưa đặt tên'),
        ownerId: String(getField(row, 'ownerId', 'OwnerId', '')),
        owner: getField(row, 'ownerName', 'OwnerName', 'Không rõ'),
        ownerEmail: getField(row, 'ownerEmail', 'OwnerEmail', ''),
        type: 'Document',
        source: 'Upload',
        status: getStatusFromDeletion(getField(row, 'isDeleted', 'IsDeleted', false), 'Ready'),
        size: `${quizCount} quiz / ${flashcardCount} thẻ`,
        createdAt: formatDate(getField(row, 'uploadedAt', 'UploadedAt')),
        generated: quizCount + flashcardCount,
        lastError: '',
    };
}

function adaptQuiz(row) {
    const id = getField(row, 'id', 'Id', '');
    const activityType = getField(row, 'activityType', 'ActivityType', 'Quiz');
    const questionCount = Number(getField(row, 'questionCount', 'QuestionCount', 0));

    return {
        id: `${activityType === 'Flashcard' ? 'flashcard' : 'quiz'}-${id}`,
        rawId: String(id),
        detailType: 'quiz',
        title: getField(row, 'title', 'Title', 'Bộ câu hỏi chưa đặt tên'),
        ownerId: String(getField(row, 'ownerId', 'OwnerId', '')),
        owner: getField(row, 'ownerName', 'OwnerName', 'Không rõ'),
        ownerEmail: getField(row, 'ownerEmail', 'OwnerEmail', ''),
        type: activityType === 'Flashcard' ? 'Flashcards' : 'Quiz',
        source: getField(row, 'documentFileName', 'DocumentFileName', 'AI Generated'),
        status: getStatusFromDeletion(getField(row, 'isDeleted', 'IsDeleted', false), getField(row, 'status', 'Status', 'AI_Drafted')),
        size: `${questionCount} ${activityType === 'Flashcard' ? 'thẻ' : 'câu'}`,
        createdAt: formatDate(getField(row, 'createdAt', 'CreatedAt')),
        generated: questionCount,
        documentId: getField(row, 'documentId', 'DocumentId', ''),
        lastError: '',
    };
}

function adaptSession(row) {
    const id = getField(row, 'id', 'Id', '');
    const status = getStatusFromDeletion(getField(row, 'isDeleted', 'IsDeleted', false), getField(row, 'status', 'Status', 'Waiting'));

    return {
        id: String(id),
        pin: getField(row, 'gamePin', 'GamePin', ''),
        title: getField(row, 'quizTitle', 'QuizTitle', 'Phiên học chưa đặt tên'),
        teacherId: String(getField(row, 'teacherId', 'TeacherId', '')),
        teacher: getField(row, 'teacherName', 'TeacherName', 'Không rõ'),
        teacherEmail: getField(row, 'teacherEmail', 'TeacherEmail', ''),
        quizId: String(getField(row, 'quizId', 'QuizId', '')),
        mode: getField(row, 'templateName', 'TemplateName', getField(row, 'quizActivityType', 'QuizActivityType', 'Quiz')),
        status,
        participants: Number(getField(row, 'participantCount', 'ParticipantCount', 0)),
        accuracy: 'Chưa có',
        startedAt: formatDateTime(getField(row, 'createdAt', 'CreatedAt')),
        duration: 'Chưa có',
    };
}

function adaptParticipant(row) {
    return {
        id: String(getField(row, 'id', 'Id', '')),
        name: getField(row, 'studentName', 'StudentName', 'Học sinh'),
        score: Number(getField(row, 'totalScore', 'TotalScore', 0) || 0),
        answers: 'Chưa có',
        status: getField(row, 'isDeleted', 'IsDeleted', false) ? 'Deleted' : 'Connected',
    };
}

function adaptBillingOrder(row) {
    if (row?.user && row?.amount) {
        return {
            ...row,
            orderCode: row.orderCode || row.id,
            provider: row.provider || 'PayOS',
            premiumStatus: row.premiumStatus || row.status,
        };
    }

    const id = getField(row, 'id', 'Id', '');
    const currency = getField(row, 'currency', 'Currency', 'VND');
    const isDeleted = getField(row, 'isDeleted', 'IsDeleted', false);
    const isPremiumActive = getField(row, 'isPremiumActive', 'IsPremiumActive', false);

    return {
        id: String(id),
        orderCode: String(getField(row, 'orderCode', 'OrderCode', id)),
        userId: String(getField(row, 'userId', 'UserId', '')),
        user: getField(row, 'userName', 'UserName', 'Không rõ'),
        email: getField(row, 'userEmail', 'UserEmail', ''),
        plan: getField(row, 'planCode', 'PlanCode', ''),
        amount: formatMoney(getField(row, 'amount', 'Amount', 0), currency),
        status: isDeleted ? 'Deleted' : getField(row, 'status', 'Status', 'Pending'),
        provider: getField(row, 'provider', 'Provider', ''),
        reference: getField(row, 'payosReference', 'PayosReference', ''),
        paidAt: formatDateTime(getField(row, 'paidAt', 'PaidAt')),
        cancelledAt: formatDateTime(getField(row, 'cancelledAt', 'CancelledAt')),
        createdAt: formatDateTime(getField(row, 'createdAt', 'CreatedAt')),
        updatedAt: formatDateTime(getField(row, 'updatedAt', 'UpdatedAt')),
        expiresAt: formatDate(getField(row, 'premiumExpiresAt', 'PremiumExpiresAt')),
        subscription: getField(row, 'subscriptionTier', 'SubscriptionTier', 'Freemium'),
        premiumStatus: isPremiumActive ? 'Premium' : 'Expired',
    };
}

function adaptWebhookEvent(row) {
    const error = getField(row, 'processingError', 'ProcessingError', '');
    const isProcessed = getField(row, 'isProcessed', 'IsProcessed', false);

    return {
        id: String(getField(row, 'id', 'Id', '')),
        provider: getField(row, 'provider', 'Provider', ''),
        orderCode: getField(row, 'orderCode', 'OrderCode', 'Chưa có'),
        reference: getField(row, 'reference', 'Reference', 'Chưa có'),
        processedAt: formatDateTime(getField(row, 'processedAt', 'ProcessedAt')),
        status: error ? 'Failed' : isProcessed ? 'Done' : 'Pending',
        error: error || 'Không có lỗi',
    };
}

function splitContentRouteId(contentId) {
    if (String(contentId).startsWith('document-')) {
        return { type: 'document', id: String(contentId).replace('document-', '') };
    }
    if (String(contentId).startsWith('quiz-') || String(contentId).startsWith('flashcard-')) {
        return { type: 'quiz', id: String(contentId).replace('quiz-', '').replace('flashcard-', '') };
    }
    return { type: 'mock', id: contentId };
}

function StatCard({ stat }) {
    const tones = {
        blue: 'bg-[#DDF2FF] text-[#2B7AB5]',
        cyan: 'bg-[#E0F7FA] text-[#168AA2]',
        green: 'bg-[#E8FFD7] text-[#2D7A21]',
        peach: 'bg-[#FFE6D8] text-[#C55B24]',
    };

    return (
        <AdminCard className="relative overflow-hidden p-5">
            <div className="absolute -right-12 -top-10 h-36 w-36 rounded-full bg-white/60" />
            <div className="relative">
                <div className={`grid h-12 w-12 place-items-center rounded-2xl ${tones[stat.tone]}`}>
                    <BarChart3 className="h-6 w-6" />
                </div>
                <p className="mt-5 text-sm font-black text-[#63788F]">{stat.label}</p>
                <div className="mt-2 flex items-end justify-between gap-3">
                    <p className="text-[34px] font-black leading-none text-[#071D35]">{stat.value}</p>
                    <span className="rounded-full bg-[#102744] px-3 py-1.5 text-xs font-black text-white">{stat.delta}</span>
                </div>
                <p className="mt-3 text-sm font-bold text-[#6C8098]">{stat.note}</p>
                <div className="mt-4">
                    <ApiTag>{stat.api}</ApiTag>
                </div>
            </div>
        </AdminCard>
    );
}

function CalendarCard() {
    const days = Array.from({ length: 30 }, (_, index) => index + 1);
    return (
        <AdminCard className="p-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-[#071D35]">Lịch vận hành</h2>
                <CalendarClock className="h-6 w-6 text-[#2B7AB5]" />
            </div>
            <div className="mt-5 grid grid-cols-7 gap-2 text-center text-xs font-black text-[#60758D]">
                {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day) => <span key={day}>{day}</span>)}
                {days.map((day) => (
                    <span
                        key={day}
                        className={[
                            'grid h-9 place-items-center rounded-full text-sm font-black',
                            day === 27 ? 'bg-[#2B7AB5] text-white shadow-[0_10px_24px_rgba(43,122,181,0.28)]' : '',
                            [6, 13, 20].includes(day) ? 'bg-[#EFF8FE] text-[#2B7AB5]' : '',
                        ].join(' ')}
                    >
                        {day}
                    </span>
                ))}
            </div>
            <div className="mt-6 space-y-3">
                {upcomingOps.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 rounded-[18px] bg-[#F7FBFE] p-3">
                        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-sm font-black text-[#2B7AB5]">{item.time}</span>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-black text-[#102744]">{item.title}</p>
                            <p className="text-xs font-bold text-[#7C91A8]">{item.meta}</p>
                        </div>
                    </div>
                ))}
            </div>
        </AdminCard>
    );
}

export function AdminOverviewPage() {
    const base = useAdminBase();
    const overviewState = useAdminResource(
        (options) => getAdminOverview({ range: '30d' }, options),
        null,
        []
    );
    const overviewStats = useMemo(() => adaptOverviewStats(overviewState.data), [overviewState.data]);
    const chartSeries = useMemo(() => adaptRevenueSeries(overviewState.data), [overviewState.data]);
    const collectedTotal = chartSeries.reduce((total, point) => total + Number(point.collected || 0), 0);

    return (
        <PageGrid>
            <DataStateNotice state={overviewState} />
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {overviewStats.map((stat) => <StatCard key={stat.id} stat={stat} />)}
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px] 2xl:grid-cols-[minmax(0,1fr)_400px]">
                <PageGrid>
                    <AdminCard className="p-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <h2 className="text-2xl font-black text-[#071D35]">Doanh thu đã thu</h2>
                                <p className="mt-1 text-sm font-semibold text-[#6C8098]">Dữ liệu doanh thu Paid theo kỳ từ API Overview. Chi phí AI sẽ nối sau khi backend có telemetry.</p>
                            </div>
                            <div className="rounded-full bg-[#102744] px-4 py-2 text-sm font-black text-white">
                                Đã thu: {formatCompactVnd(collectedTotal * 1000000)}
                            </div>
                        </div>
                        <div className="mt-6 h-[330px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartSeries}>
                                    <defs>
                                        <linearGradient id="adminRevenue" x1="0" x2="0" y1="0" y2="1">
                                            <stop offset="5%" stopColor="#2B7AB5" stopOpacity={0.28} />
                                            <stop offset="95%" stopColor="#2B7AB5" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="adminCost" x1="0" x2="0" y1="0" y2="1">
                                            <stop offset="5%" stopColor="#FB923C" stopOpacity={0.24} />
                                            <stop offset="95%" stopColor="#FB923C" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid stroke="#E5F0F8" vertical={false} />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#7C91A8', fontSize: 12, fontWeight: 700 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#7C91A8', fontSize: 12, fontWeight: 700 }} />
                                    <Tooltip contentStyle={{ borderRadius: 18, border: '1px solid #D8E9F5', boxShadow: '0 18px 50px rgba(43,122,181,.16)' }} />
                                    <Area type="monotone" dataKey="revenue" stroke="#2B7AB5" strokeWidth={4} fill="url(#adminRevenue)" />
                                    <Line type="monotone" dataKey="collected" stroke="#1B3A6B" strokeWidth={3} dot={false} />
                                    <Area type="monotone" dataKey="aiCost" stroke="#FB923C" strokeWidth={3} fill="url(#adminCost)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </AdminCard>

                    <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                        <AdminCard className="p-6">
                            <AdminSectionHeader title="Giáo viên nổi bật" description="Xếp theo mức độ sử dụng lành mạnh, trạng thái Pro và phiên học đã hoàn tất." />
                            <div className="space-y-3">
                                {topTeachers.map((teacher) => (
                                    <Link key={teacher.id} to={`${base}/users/${teacher.id}`} className="flex items-center gap-3 rounded-[18px] bg-[#F7FBFE] p-3 transition hover:-translate-y-0.5 hover:bg-[#EEF7FD]">
                                        <span className="grid h-11 w-11 place-items-center rounded-full bg-[#DDF2FF] text-sm font-black text-[#2B7AB5]">{teacher.avatar}</span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate text-sm font-black text-[#102744]">{teacher.name}</span>
                                            <span className="block truncate text-xs font-bold text-[#7C91A8]">{teacher.email}</span>
                                        </span>
                                        <span className="text-sm font-black text-[#102744]">{teacher.score}</span>
                                    </Link>
                                ))}
                            </div>
                        </AdminCard>

                        <AdminCard className="p-6">
                            <AdminSectionHeader title="Việc cần xử lý" description="Các cảnh báo vận hành ưu tiên trong ngày." />
                            <div className="space-y-3">
                                {adminAlerts.map((alert) => (
                                    <div key={alert.id} className="rounded-[20px] border border-[#D8E9F5] bg-white p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#FFF4EA] text-[#CF5B1B]">
                                                <AlertTriangle className="h-5 w-5" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-black text-[#102744]">{alert.title}</p>
                                                <p className="mt-1 text-sm font-semibold leading-6 text-[#6C8098]">{alert.description}</p>
                                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                                    <StatusBadge value={alert.severity} />
                                                    <ApiTag>{alert.api}</ApiTag>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </AdminCard>
                    </div>
                </PageGrid>

                <PageGrid>
                    <CalendarCard />
                        <AdminCard className="self-start overflow-hidden !bg-[#173154] p-6 text-white">
                        <div className="grid h-14 w-14 place-items-center rounded-full bg-white/12">
                            <Sparkles className="h-7 w-7 text-[#A8D8EA]" />
                        </div>
                        <h2 className="mt-6 text-2xl font-black">Đã nối API read-only</h2>
                        <p className="mt-2 text-sm font-semibold leading-6 text-white/72">
                            Overview, người dùng, nội dung và phiên trực tiếp dùng API backend khi có token Admin.
                        </p>
                        <Link to={`${base}/settings`} className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-black text-[#071D35]">
                            Xem cấu hình
                            <ChevronRight className="h-4 w-4" />
                        </Link>
                    </AdminCard>
                </PageGrid>
            </div>
        </PageGrid>
    );
}

export function AdminUsersPage() {
    const base = useAdminBase();
    const usersState = useAdminResource(
        (options) => getAdminUsers({ page: 1, pageSize: 50 }, options),
        { items: adminUsers },
        []
    );
    const users = useMemo(() => getItems(usersState.data).map((user) => {
        if (user.name) return user;
        return adaptUser(user);
    }), [usersState.data]);
    const totalUsers = getField(usersState.data, 'total', 'Total', users.length);
    const teacherCount = users.filter((user) => user.role === 'Teacher').length;
    const premiumCount = users.filter((user) => ['Premium', 'Active'].includes(user.plan) || user.status === 'Premium').length;
    const columns = [
        { key: 'name', label: 'Người dùng', render: (row) => <UserCell row={row} /> },
        { key: 'role', label: 'Vai trò' },
        { key: 'plan', label: 'Gói' },
        { key: 'status', label: 'Trạng thái', render: (row) => <StatusBadge value={row.status} /> },
        { key: 'documents', label: 'Tài liệu' },
        { key: 'sessions', label: 'Phiên' },
        { key: 'lastActive', label: 'Hoạt động gần nhất' },
    ];

    return (
        <PageGrid>
            <DataStateNotice state={usersState} />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MiniMetric icon={UsersRound} label="Tổng người dùng" value={formatNumber(totalUsers)} />
                <MiniMetric icon={UserCog} label="Giáo viên trong trang" value={formatNumber(teacherCount)} tone="navy" />
                <MiniMetric icon={ShieldCheck} label="Premium trong trang" value={formatNumber(premiumCount)} tone="green" />
                <MiniMetric icon={AlertTriangle} label="Đã tải trang" value={formatNumber(getField(usersState.data, 'page', 'Page', 1))} tone="orange" />
            </div>
            <FilterBar placeholder="Tìm theo tên, email, vai trò..." filters={['Vai trò', 'Gói Pro', 'Trạng thái', 'Ngày tạo']} />
            <AdminCard className="p-5">
                <AdminSectionHeader title="Danh sách người dùng" description="Dữ liệu lấy từ Admin Users API, hỗ trợ search, role, subscription và pagination." action={<ApiTag>GET /api/Admin/users</ApiTag>} />
                <AdminTable columns={columns} rows={users} rowHref={(row) => `${base}/users/${row.id}`} />
            </AdminCard>
        </PageGrid>
    );
}

function UserCell({ row }) {
    return (
        <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-[#DDF2FF] text-sm font-black text-[#2B7AB5]">
                {row.name.split(' ').slice(-2).map((part) => part[0]).join('')}
            </span>
            <span>
                <span className="block font-black text-[#102744]">{row.name}</span>
                <span className="block text-xs font-bold text-[#7C91A8]">{row.email}</span>
            </span>
        </div>
    );
}

export function AdminUserDetailPage() {
    const base = useAdminBase();
    const { userId } = useParams();
    const fallbackUser = getUserById(userId);
    const userState = useAdminResource(
        (options) => fetchAdminUserById(userId, options),
        fallbackUser,
        [userId]
    );
    const user = useMemo(() => {
        if (userState.data?.name) return userState.data;
        return adaptUser(userState.data);
    }, [userState.data]);
    const documentsState = useAdminResource(
        (options) => getAdminDocuments({ ownerId: userId, page: 1, pageSize: 8 }, options),
        { items: adminDocuments.filter((item) => item.ownerId === fallbackUser.id && item.type === 'Document') },
        [userId]
    );
    const quizzesState = useAdminResource(
        (options) => getAdminQuizzes({ ownerId: userId, page: 1, pageSize: 8 }, options),
        { items: adminDocuments.filter((item) => item.ownerId === fallbackUser.id && item.type !== 'Document') },
        [userId]
    );
    const sessionsState = useAdminResource(
        (options) => getAdminSessions({ teacherId: userId, page: 1, pageSize: 8 }, options),
        { items: adminSessions.filter((session) => session.teacher === fallbackUser.name) },
        [userId]
    );
    const userContent = useMemo(() => [
        ...getItems(documentsState.data).map((item) => (item.title ? item : adaptDocument(item))),
        ...getItems(quizzesState.data).map((item) => (item.title ? item : adaptQuiz(item))),
    ], [documentsState.data, quizzesState.data]);
    const userSessions = useMemo(() => getItems(sessionsState.data).map((session) => (
        session.pin ? session : adaptSession(session)
    )), [sessionsState.data]);

    return (
        <PageGrid>
            <DataStateNotice state={userState} />
            <DetailHero
                backTo={`${base}/users`}
                title={user.name}
                subtitle={user.email}
                status={user.status}
                icon={UsersRound}
                actions={<><ActionButton tone="ghost">Chờ API audit để chỉnh gói</ActionButton><ActionButton tone="ghost">Gửi email</ActionButton></>}
            />

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <MiniMetric icon={FileSearch} label="Tài liệu" value={user.documents} />
                <MiniMetric icon={BookOpenCheck} label="Bộ câu hỏi" value={user.quizzes} tone="navy" />
                <MiniMetric icon={Sparkles} label="Thẻ ghi nhớ" value={user.flashcards} tone="green" />
                <MiniMetric icon={Gamepad2} label="Phiên" value={user.sessions} tone="orange" />
                <MiniMetric icon={HardDrive} label="XP học tập" value={formatNumber(user.xp || 0)} />
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
                <AdminCard className="p-5">
                    <AdminSectionHeader title="Nội dung của giáo viên" description="Nối bằng documents/quizzes API có ownerId. Backend chưa có endpoint timeline riêng cho user." action={<ApiTag>GET /api/Admin/documents + quizzes?ownerId={userId}</ApiTag>} />
                    <AdminTable
                        columns={[
                            { key: 'title', label: 'Nội dung' },
                            { key: 'type', label: 'Loại' },
                            { key: 'status', label: 'Trạng thái', render: (row) => <StatusBadge value={row.status} /> },
                            { key: 'size', label: 'Dung lượng' },
                            { key: 'createdAt', label: 'Ngày tạo' },
                        ]}
                        rows={userContent}
                        rowHref={(row) => `${base}/content/${row.id}`}
                    />
                </AdminCard>

                <AdminCard className="p-6">
                    <AdminSectionHeader title="Hồ sơ vận hành" description="Các trường API cần trả về cho đội hỗ trợ." />
                    <InfoList items={[
                        ['Vai trò', user.role],
                        ['Gói', user.plan],
                        ['Ngày tham gia', user.joinedAt],
                        ['Hoạt động gần nhất', user.lastActive],
                        ['Thanh toán gần nhất', user.revenue],
                        ['Gói thanh toán gần nhất', user.latestPaymentPlanCode || 'Chưa có'],
                        ['Số đơn thanh toán', user.paymentOrderCount || 0],
                        ['Streak hiện tại', `${user.currentStreak || 0} ngày`],
                    ]} />
                    <div className="mt-6 grid gap-3">
                        <ActionButton tone="ghost">Chờ API quota</ActionButton>
                        <ActionButton tone="ghost">Chờ API khóa tài khoản</ActionButton>
                        <ActionButton tone="danger">Chờ audit log để xóa mềm</ActionButton>
                    </div>
                </AdminCard>
            </div>

            <AdminCard className="p-5">
                <AdminSectionHeader title="Phiên gần đây" action={<ApiTag>GET /api/Admin/sessions?teacherId={userId}</ApiTag>} />
                <AdminTable
                    columns={[
                        { key: 'pin', label: 'PIN' },
                        { key: 'title', label: 'Tên phiên' },
                        { key: 'mode', label: 'Chế độ chơi' },
                        { key: 'status', label: 'Trạng thái', render: (row) => <StatusBadge value={row.status} /> },
                        { key: 'participants', label: 'Học sinh' },
                        { key: 'startedAt', label: 'Bắt đầu' },
                    ]}
                    rows={userSessions}
                    rowHref={(row) => `${base}/sessions/${row.id}`}
                />
            </AdminCard>
        </PageGrid>
    );
}

export function AdminContentPage() {
    const base = useAdminBase();
    const documentsState = useAdminResource(
        (options) => getAdminDocuments({ page: 1, pageSize: 30 }, options),
        { items: adminDocuments.filter((item) => item.type === 'Document') },
        []
    );
    const quizzesState = useAdminResource(
        (options) => getAdminQuizzes({ page: 1, pageSize: 30 }, options),
        { items: adminDocuments.filter((item) => item.type !== 'Document') },
        []
    );
    const documents = useMemo(() => getItems(documentsState.data).map((item) => (
        item.title ? item : adaptDocument(item)
    )), [documentsState.data]);
    const quizzes = useMemo(() => getItems(quizzesState.data).map((item) => (
        item.title ? item : adaptQuiz(item)
    )), [quizzesState.data]);
    const contentRows = useMemo(() => [...documents, ...quizzes], [documents, quizzes]);
    const flashcardCount = quizzes.filter((item) => item.type === 'Flashcards').length;
    const quizCount = quizzes.length - flashcardCount;

    return (
        <PageGrid>
            <DataStateNotice state={documentsState} />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MiniMetric icon={FileSearch} label="Tài liệu trong trang" value={formatNumber(documents.length)} />
                <MiniMetric icon={BookOpenCheck} label="Bộ câu hỏi trong trang" value={formatNumber(quizCount)} tone="navy" />
                <MiniMetric icon={Sparkles} label="Thẻ ghi nhớ trong trang" value={formatNumber(flashcardCount)} tone="green" />
                <MiniMetric icon={AlertTriangle} label="Đã xóa/ẩn" value={formatNumber(contentRows.filter((item) => item.status === 'Deleted').length)} tone="orange" />
            </div>
            <FilterBar placeholder="Tìm tài liệu, bộ câu hỏi, thẻ ghi nhớ, giáo viên..." filters={['Loại nội dung', 'Trạng thái', 'Chủ sở hữu', 'Ngày tạo']} />
            <AdminCard className="p-5">
                <AdminSectionHeader title="Theo dõi nội dung" description="Trang này gộp dữ liệu từ Documents API và Quizzes API. Backend không có endpoint /content tổng hợp." action={<ApiTag>GET /api/Admin/documents + quizzes</ApiTag>} />
                <AdminTable
                    columns={[
                        { key: 'title', label: 'Tên nội dung' },
                        { key: 'owner', label: 'Giáo viên' },
                        { key: 'type', label: 'Loại' },
                        { key: 'source', label: 'Nguồn' },
                        { key: 'status', label: 'Trạng thái', render: (row) => <StatusBadge value={row.status} /> },
                        { key: 'size', label: 'Kích thước' },
                        { key: 'createdAt', label: 'Ngày tạo' },
                    ]}
                    rows={contentRows}
                    rowHref={(row) => `${base}/content/${row.id}`}
                />
            </AdminCard>
        </PageGrid>
    );
}

export function AdminContentDetailPage() {
    const base = useAdminBase();
    const { contentId } = useParams();
    const routeTarget = splitContentRouteId(contentId);
    const fallbackContent = getContentById(contentId);
    const contentState = useAdminResource(
        (options) => {
            if (routeTarget.type === 'document') return getAdminDocumentById(routeTarget.id, options);
            if (routeTarget.type === 'quiz') return getAdminQuizById(routeTarget.id, options);
            return Promise.resolve(fallbackContent);
        },
        fallbackContent,
        [contentId]
    );
    const content = useMemo(() => {
        if (contentState.data?.title) return contentState.data;
        if (routeTarget.type === 'document') return adaptDocument(contentState.data);
        if (routeTarget.type === 'quiz') return adaptQuiz(contentState.data);
        return fallbackContent;
    }, [contentState.data, fallbackContent, routeTarget.type]);
    const detailEndpoint = content.detailType === 'document'
        ? 'GET /api/Admin/documents/{id}'
        : 'GET /api/Admin/quizzes/{id}';

    return (
        <PageGrid>
            <DataStateNotice state={contentState} />
            <DetailHero
                backTo={`${base}/content`}
                title={content.title}
                subtitle={`${formatAdminValue(content.type)} của ${content.owner}`}
                status={content.status}
                icon={FileSearch}
                actions={<><ActionButton tone="ghost"><RotateCw className="mr-2 h-4 w-4" />Chờ API retry</ActionButton><ActionButton tone="danger">Chờ audit log để ẩn</ActionButton></>}
            />
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
                <AdminCard className="p-6">
                    <AdminSectionHeader title="Siêu dữ liệu" action={<ApiTag>{detailEndpoint}</ApiTag>} />
                    <div className="grid gap-4 md:grid-cols-2">
                        <InfoBlock label="Chủ sở hữu" value={content.owner} />
                        <InfoBlock label="Loại" value={content.type} />
                        <InfoBlock label="Nguồn" value={content.source} />
                        <InfoBlock label="Ngày tạo" value={content.createdAt} />
                        <InfoBlock label="Kích thước" value={content.size} />
                        <InfoBlock label="Nội dung đã sinh" value={content.generated} />
                    </div>
                    {content.lastError && (
                        <div className="mt-5 rounded-[20px] border border-[#FFD3D8] bg-[#FFF1F3] p-4">
                            <p className="text-sm font-black text-[#C2293A]">Lỗi gần nhất</p>
                            <p className="mt-1 text-sm font-bold text-[#7A3440]">{content.lastError}</p>
                        </div>
                    )}
                </AdminCard>
                <AdminCard className="p-6">
                    <AdminSectionHeader title="Trạng thái API" />
                    <div className="space-y-3">
                        <ApiTag>{detailEndpoint}</ApiTag>
                        <ApiTag>Chưa có retry/hide/restore</ApiTag>
                        <ApiTag>Chờ Admin_Audit_Logs</ApiTag>
                        <ApiTag>Chưa có processing logs</ApiTag>
                    </div>
                </AdminCard>
            </div>
            <AdminCard className="p-5">
                <AdminSectionHeader title="Nhật ký xử lý" description="Dòng thời gian này giúp đội hỗ trợ biết tệp lỗi ở bộ đọc tài liệu, bộ xử lý AI hay lưu trữ." />
                <Timeline items={[
                    ['Đã nhận tệp', 'Hệ thống lưu trữ nhận tệp và tạo siêu dữ liệu tài liệu.', 'Hoàn tất'],
                    ['Đọc nội dung bằng AI', content.status === 'Failed' ? content.lastError : 'Trích xuất nội dung thành công.', content.status === 'Failed' ? 'Failed' : 'Hoàn tất'],
                    ['Hàng đợi tạo nội dung', 'Đẩy tác vụ tạo bộ câu hỏi/thẻ ghi nhớ vào hàng đợi.', content.generated > 0 ? 'Hoàn tất' : 'Đang chờ'],
                ]} />
            </AdminCard>
        </PageGrid>
    );
}

export function AdminSessionsPage() {
    const base = useAdminBase();
    const sessionsState = useAdminResource(
        (options) => getAdminSessions({ page: 1, pageSize: 40 }, options),
        { items: adminSessions },
        []
    );
    const sessions = useMemo(() => getItems(sessionsState.data).map((session) => (
        session.pin ? session : adaptSession(session)
    )), [sessionsState.data]);
    const activeCount = sessions.filter((session) => ['Active', 'Live'].includes(session.status)).length;
    const participantTotal = sessions.reduce((total, session) => total + Number(session.participants || 0), 0);

    return (
        <PageGrid>
            <DataStateNotice state={sessionsState} />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MiniMetric icon={Gamepad2} label="Phiên trong trang" value={formatNumber(sessions.length)} />
                <MiniMetric icon={UsersRound} label="Lượt tham gia" value={formatNumber(participantTotal)} tone="navy" />
                <MiniMetric icon={CheckCircle2} label="Đang diễn ra" value={formatNumber(activeCount)} tone="green" />
                <MiniMetric icon={ShieldAlert} label="Đã xóa/ẩn" value={formatNumber(sessions.filter((session) => session.status === 'Deleted').length)} tone="red" />
            </div>
            <FilterBar placeholder="Tìm theo PIN, giáo viên, bộ câu hỏi..." filters={['Trạng thái', 'Chế độ chơi', 'Ngày', 'Giáo viên']} />
            <AdminCard className="p-5">
                <AdminSectionHeader title="Phiên trực tiếp" action={<ApiTag>GET /api/Admin/sessions</ApiTag>} />
                <AdminTable
                    columns={[
                        { key: 'pin', label: 'PIN' },
                        { key: 'title', label: 'Tên phiên' },
                        { key: 'teacher', label: 'Giáo viên' },
                        { key: 'mode', label: 'Chế độ' },
                        { key: 'status', label: 'Trạng thái', render: (row) => <StatusBadge value={row.status} /> },
                        { key: 'participants', label: 'Học sinh' },
                        { key: 'accuracy', label: 'Đúng' },
                        { key: 'startedAt', label: 'Bắt đầu' },
                    ]}
                    rows={sessions}
                    rowHref={(row) => `${base}/sessions/${row.id}`}
                />
            </AdminCard>
        </PageGrid>
    );
}

export function AdminSessionDetailPage() {
    const base = useAdminBase();
    const { sessionId } = useParams();
    const fallbackSession = getSessionById(sessionId);
    const sessionState = useAdminResource(
        (options) => getAdminSessionById(sessionId, options),
        fallbackSession,
        [sessionId]
    );
    const participantsState = useAdminResource(
        (options) => getAdminSessionParticipants(sessionId, { page: 1, pageSize: 30 }, options),
        {
            items: [
                { id: 'p-1', name: 'Lan Anh', score: 920, answers: '12/14', status: 'Connected' },
                { id: 'p-2', name: 'Minh Khang', score: 860, answers: '11/14', status: 'Connected' },
                { id: 'p-3', name: 'Gia Huy', score: 640, answers: '8/14', status: 'Reconnected' },
            ],
        },
        [sessionId]
    );
    const session = useMemo(() => {
        if (sessionState.data?.pin) return sessionState.data;
        return adaptSession(sessionState.data);
    }, [sessionState.data]);
    const participants = useMemo(() => getItems(participantsState.data).map((participant) => (
        participant.name ? participant : adaptParticipant(participant)
    )), [participantsState.data]);

    return (
        <PageGrid>
            <DataStateNotice state={sessionState} />
            <DetailHero
                backTo={`${base}/sessions`}
                title={session.title}
                subtitle={`PIN ${session.pin} • ${session.teacher}`}
                status={session.status}
                icon={Gamepad2}
                actions={<><ActionButton tone="ghost">Làm mới dữ liệu</ActionButton><ActionButton tone="danger">Chờ audit log để kết thúc phiên</ActionButton></>}
            />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <MiniMetric icon={UsersRound} label="Người tham gia" value={session.participants} />
                <MiniMetric icon={CheckCircle2} label="Độ đúng" value={session.accuracy} tone="green" />
                <MiniMetric icon={Clock3} label="Thời lượng" value={session.duration} tone="navy" />
                <MiniMetric icon={Gamepad2} label="Chế độ" value={formatAdminValue(session.mode)} tone="orange" />
                <MiniMetric icon={Zap} label="Thời gian thực" value={session.status === 'Realtime Issue' ? 'Cần theo dõi' : 'Ổn'} tone={session.status === 'Realtime Issue' ? 'red' : 'green'} />
            </div>
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
                <AdminCard className="p-5">
                    <AdminSectionHeader title="Tổng quan người tham gia" action={<ApiTag>GET /api/Admin/sessions/{'{id}'}/participants</ApiTag>} />
                    <AdminTable
                        columns={[
                            { key: 'name', label: 'Học sinh' },
                            { key: 'score', label: 'Điểm' },
                            { key: 'answers', label: 'Câu trả lời' },
                            { key: 'status', label: 'Trạng thái', render: (row) => <StatusBadge value={row.status} /> },
                        ]}
                        rows={participants}
                    />
                </AdminCard>
                <AdminCard className="p-6">
                    <AdminSectionHeader title="API phiên học" />
                    <div className="space-y-3">
                        <ApiTag>GET /api/Admin/sessions/{'{id}'}</ApiTag>
                        <ApiTag>GET /api/Admin/sessions/{'{id}'}/participants</ApiTag>
                        <ApiTag>Chưa có POST end/events</ApiTag>
                    </div>
                </AdminCard>
            </div>
        </PageGrid>
    );
}

export function AdminBillingPage() {
    const overviewState = useAdminResource(
        (options) => getAdminOverview({ range: '30d' }, options),
        null,
        []
    );
    const ordersState = useAdminResource(
        (options) => getAdminBillingOrders({ page: 1, pageSize: 30 }, options),
        { items: adminOrders },
        []
    );
    const webhookState = useAdminResource(
        (options) => getAdminBillingWebhookEvents({ page: 1, pageSize: 10 }, options),
        { items: [] },
        []
    );
    const billingSeries = useMemo(() => adaptRevenueSeries(overviewState.data), [overviewState.data]);
    const collectedTotal = billingSeries.reduce((total, point) => total + Number(point.collected || 0), 0);
    const orders = useMemo(() => getItems(ordersState.data).map((order) => (
        order.orderCode ? order : adaptBillingOrder(order)
    )), [ordersState.data]);
    const webhookEvents = useMemo(() => getItems(webhookState.data).map((event) => (
        event.processedAt ? event : adaptWebhookEvent(event)
    )), [webhookState.data]);
    const paidOrders = orders.filter((order) => order.status === 'Paid').length;
    const pendingOrders = orders.filter((order) => order.status === 'Pending').length;
    const webhookErrors = webhookEvents.filter((event) => event.status === 'Failed').length;

    return (
        <PageGrid>
            <DataStateNotice state={overviewState} />
            <DataStateNotice state={ordersState} fallbackLabel="Đang hiển thị dữ liệu đơn hàng mẫu vì chưa có phiên Admin hoặc API billing chưa sẵn sàng." />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MiniMetric icon={CircleDollarSign} label="Doanh thu từ Overview" value={formatCompactVnd(collectedTotal * 1000000)} />
                <MiniMetric icon={CreditCard} label="Đơn đã thanh toán" value={formatNumber(paidOrders)} tone="green" />
                <MiniMetric icon={ReceiptText} label="Đang chờ" value={formatNumber(pendingOrders)} tone="orange" />
                <MiniMetric icon={AlertTriangle} label="Webhook lỗi" value={formatNumber(webhookErrors)} tone="red" />
            </div>
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
                <AdminCard className="p-6">
                    <AdminSectionHeader title="Xu hướng doanh thu" description="Doanh thu Paid theo kỳ nằm trong Overview; danh sách đơn và webhook đã có Admin Billing API riêng." action={<ApiTag>GET /api/Admin/overview</ApiTag>} />
                    <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={billingSeries}>
                                <CartesianGrid stroke="#E5F0F8" vertical={false} />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Line type="monotone" dataKey="collected" stroke="#2B7AB5" strokeWidth={4} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </AdminCard>
                <AdminCard className="p-6">
                    <AdminSectionHeader title="Thao tác thanh toán" description="Backend hiện mới có read-only orders/webhooks. Sync/manual subscription vẫn cần API mutation và audit log." />
                    <div className="grid gap-3">
                        <ActionButton tone="ghost">Chờ API đồng bộ đơn</ActionButton>
                        <ActionButton tone="ghost">Chờ API gia hạn Pro</ActionButton>
                        <ActionButton tone="ghost">Xuất doanh thu từ Overview</ActionButton>
                    </div>
                </AdminCard>
            </div>
            <AdminCard className="p-5">
                <AdminSectionHeader title="Đơn hàng" description="Dữ liệu lấy từ Admin Billing Orders API, hỗ trợ search, userId, status, plan, deletion và date range." action={<ApiTag>GET /api/Admin/billing/orders</ApiTag>} />
                <AdminTable
                    columns={[
                        { key: 'orderCode', label: 'Mã đơn' },
                        { key: 'user', label: 'Người dùng' },
                        { key: 'plan', label: 'Gói' },
                        { key: 'amount', label: 'Số tiền' },
                        { key: 'status', label: 'Trạng thái', render: (row) => <StatusBadge value={row.status} /> },
                        { key: 'paidAt', label: 'Thanh toán lúc' },
                        { key: 'expiresAt', label: 'Hết hạn' },
                    ]}
                    rows={orders}
                />
            </AdminCard>
            <AdminCard className="p-5">
                <AdminSectionHeader title="Webhook thanh toán" description="Dùng để đối soát callback PayOS đã xử lý hay còn lỗi." action={<ApiTag>GET /api/Admin/billing/webhook-events</ApiTag>} />
                <AdminTable
                    columns={[
                        { key: 'provider', label: 'Nhà cung cấp' },
                        { key: 'orderCode', label: 'Mã đơn' },
                        { key: 'reference', label: 'Tham chiếu' },
                        { key: 'processedAt', label: 'Thời điểm xử lý' },
                        { key: 'status', label: 'Trạng thái', render: (row) => <StatusBadge value={row.status} /> },
                        { key: 'error', label: 'Lỗi' },
                    ]}
                    rows={webhookEvents}
                />
            </AdminCard>
        </PageGrid>
    );
}

export function AdminAiUsagePage() {
    return (
        <PageGrid>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MiniMetric icon={Sparkles} label="Lượt tạo bằng AI" value="4,082" />
                <MiniMetric icon={CheckCircle2} label="Tỷ lệ thành công" value="96.1%" tone="green" />
                <MiniMetric icon={Clock3} label="Độ trễ trung bình" value="18.4s" tone="navy" />
                <MiniMetric icon={AlertTriangle} label="Tác vụ lỗi" value="162" tone="orange" />
            </div>
            <AdminCard className="p-6">
                <AdminSectionHeader title="Mức dùng tuần này" action={<ApiTag>GET /api/Admin/ai-usage</ApiTag>} />
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={usageSeries}>
                            <CartesianGrid stroke="#E5F0F8" vertical={false} />
                            <XAxis dataKey="day" axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip />
                            <Bar dataKey="documents" radius={[12, 12, 0, 0]} fill="#A8D8EA" />
                            <Bar dataKey="quizzes" radius={[12, 12, 0, 0]} fill="#2B7AB5" />
                            <Bar dataKey="sessions" radius={[12, 12, 0, 0]} fill="#1B3A6B" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </AdminCard>
            <AdminCard className="p-5">
                <AdminSectionHeader title="Luồng xử lý AI" description="API nên trả tỷ lệ thành công, thời gian trung bình, chi phí ước tính và trạng thái luồng xử lý." />
                <AdminTable
                    columns={[
                        { key: 'type', label: 'Luồng xử lý' },
                        { key: 'requests', label: 'Lượt gọi' },
                        { key: 'success', label: 'Thành công' },
                        { key: 'avgTime', label: 'Thời gian TB' },
                        { key: 'cost', label: 'Chi phí ước tính' },
                        { key: 'status', label: 'Trạng thái', render: (row) => <StatusBadge value={row.status} /> },
                    ]}
                    rows={aiUsageRows}
                />
            </AdminCard>
        </PageGrid>
    );
}

export function AdminSupportPage() {
    return (
        <PageGrid>
            <AdminCard className="p-6">
                <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
                    <div>
                        <h2 className="text-2xl font-black text-[#071D35]">Tra cứu hỗ trợ</h2>
                        <p className="mt-1 text-sm font-semibold text-[#6C8098]">Tìm người dùng bằng email, PIN phiên học, mã tài liệu hoặc mã đơn hàng.</p>
                        <div className="relative mt-5">
                            <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7790A8]" />
                            <input className="h-14 w-full rounded-full border border-[#D8E9F5] bg-white pl-12 pr-5 text-sm font-bold outline-none focus:border-[#5BAED4] focus:ring-4 focus:ring-[#A8D8EA]/30" placeholder="Ví dụ: huong.le@school.vn hoặc PIN 183650" />
                        </div>
                    </div>
                    <div className="rounded-[24px] bg-[#102744] p-5 text-white">
                        <LifeBuoy className="h-8 w-8 text-[#A8D8EA]" />
                        <p className="mt-4 text-xl font-black">API hỗ trợ</p>
                        <p className="mt-2 text-sm font-semibold leading-6 text-white/72">GET /api/Admin/support/search?q=</p>
                    </div>
                </div>
            </AdminCard>
            <div className="grid gap-6 xl:grid-cols-2">
                <AdminCard className="p-6">
                    <AdminSectionHeader title="Dòng thời gian sự cố hôm nay" />
                    <div className="space-y-4">
                        {supportTimeline.map((item) => (
                            <div key={item.id} className="flex gap-4 rounded-[20px] bg-[#F7FBFE] p-4">
                                <span className="text-sm font-black text-[#2B7AB5]">{item.time}</span>
                                <div className="min-w-0">
                                    <p className="text-sm font-black text-[#102744]">{item.title}</p>
                                    <p className="mt-1 text-xs font-bold text-[#7C91A8]">{item.meta}</p>
                                    <div className="mt-2"><StatusBadge value={item.status} /></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </AdminCard>
                <AdminCard className="p-6">
                    <AdminSectionHeader title="Danh sách kiểm tra hỗ trợ" />
                    <Timeline items={[
                        ['Xác minh người dùng', 'Email, vai trò, gói đăng ký và hạn mức hiện tại.', 'Bắt buộc'],
                        ['Xem nội dung/phiên liên quan', 'Chỉ xem siêu dữ liệu trước, mở chi tiết khi cần.', 'Bắt buộc'],
                        ['Ghi ghi chú kiểm tra', 'Mọi thao tác thanh toán, hạn mức, ẩn nội dung đều cần ghi nhật ký.', 'Bắt buộc'],
                    ]} />
                </AdminCard>
            </div>
        </PageGrid>
    );
}

export function AdminAuditLogsPage() {
    return (
        <PageGrid>
            <FilterBar placeholder="Tìm người thao tác, đối tượng, hành động..." filters={['Người thao tác', 'Rủi ro', 'Hành động', 'Ngày']} />
            <AdminCard className="p-5">
                <AdminSectionHeader title="Nhật ký thao tác" description="Mọi hành động quản trị có tác động đến người dùng, thanh toán, nội dung, hạn mức đều cần được ghi lại." action={<ApiTag>GET /api/Admin/audit-logs</ApiTag>} />
                <AdminTable
                    columns={[
                        { key: 'time', label: 'Thời gian' },
                        { key: 'actor', label: 'Người thao tác' },
                        { key: 'action', label: 'Hành động' },
                        { key: 'target', label: 'Đối tượng' },
                        { key: 'risk', label: 'Rủi ro', render: (row) => <StatusBadge value={row.risk} /> },
                    ]}
                    rows={auditLogs}
                />
            </AdminCard>
        </PageGrid>
    );
}

export function AdminSettingsPage() {
    const settings = [
        { id: 'set-1', title: 'Giới hạn sử dụng gói miễn phí', description: 'Quy định tài khoản miễn phí được tải lên bao nhiêu tài liệu, tạo bao nhiêu bộ câu hỏi, thẻ ghi nhớ và phiên học.', icon: Database, api: 'PATCH /api/Admin/settings/quota' },
        { id: 'set-2', title: 'Bật/tắt tính năng', description: 'Quản lý tính năng nào đang mở cho giáo viên và học sinh: thẻ ghi nhớ, trò chơi phiêu lưu, phân tích dữ liệu hoặc thử nghiệm mới.', icon: Flag, api: 'PATCH /api/Admin/settings/feature-flags' },
        { id: 'set-3', title: 'Điều kiện gửi cảnh báo', description: 'Thiết lập khi nào hệ thống cần báo cho quản trị viên: lỗi AI tăng cao, đơn đã thanh toán chưa cấp Pro hoặc lỗi kết nối thời gian thực.', icon: ShieldAlert, api: 'PATCH /api/Admin/settings/alerts' },
        { id: 'set-4', title: 'Phân quyền quản trị', description: 'Quy định ai được xem dữ liệu, hỗ trợ người dùng, kiểm duyệt nội dung, quản lý thanh toán hoặc thay đổi cấu hình hệ thống.', icon: LockKeyhole, api: 'PATCH /api/Admin/settings/roles' },
    ];

    return (
        <PageGrid className="xl:grid-cols-2">
            {settings.map((item) => {
                const Icon = item.icon;
                return (
                    <AdminCard key={item.id} className="p-6">
                        <div className="flex items-start gap-4">
                            <div className="grid h-14 w-14 place-items-center rounded-[20px] bg-[#DDF2FF] text-[#2B7AB5]">
                                <Icon className="h-7 w-7" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h2 className="text-xl font-black text-[#071D35]">{item.title}</h2>
                                <p className="mt-2 text-sm font-semibold leading-6 text-[#6C8098]">{item.description}</p>
                                <div className="mt-4"><ApiTag>{item.api}</ApiTag></div>
                            </div>
                        </div>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <ActionButton>Cập nhật thiết lập</ActionButton>
                            <ActionButton tone="ghost">Lịch sử thay đổi</ActionButton>
                        </div>
                    </AdminCard>
                );
            })}
        </PageGrid>
    );
}

function DetailHero({ backTo, title, subtitle, status, icon: Icon, actions }) {
    return (
        <AdminCard className="p-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex items-start gap-4">
                    <div className="grid h-16 w-16 place-items-center rounded-[24px] bg-[#102744] text-white">
                        <Icon className="h-8 w-8" />
                    </div>
                    <div className="min-w-0">
                        <Link to={backTo} className="text-sm font-black text-[#2B7AB5] hover:text-[#1B3A6B]">Quay lại</Link>
                        <h2 className="mt-2 text-3xl font-black text-[#071D35]">{title}</h2>
                        <p className="mt-1 text-sm font-bold text-[#6C8098]">{subtitle}</p>
                        <div className="mt-3"><StatusBadge value={status} /></div>
                    </div>
                </div>
                <div className="flex flex-wrap gap-3">{actions}</div>
            </div>
        </AdminCard>
    );
}

function InfoBlock({ label, value }) {
    return (
        <div className="rounded-[20px] bg-[#F7FBFE] p-4">
            <p className="text-xs font-black uppercase tracking-[0.1em] text-[#7C91A8]">{label}</p>
            <p className="mt-2 text-base font-black text-[#102744]">{formatAdminValue(value)}</p>
        </div>
    );
}

function InfoList({ items }) {
    return (
        <div className="divide-y divide-[#E5F0F8] rounded-[20px] border border-[#D8E9F5] bg-white">
            {items.map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 px-4 py-3">
                    <span className="text-sm font-bold text-[#6C8098]">{label}</span>
                    <span className="text-right text-sm font-black text-[#102744]">{formatAdminValue(value)}</span>
                </div>
            ))}
        </div>
    );
}

function Timeline({ items }) {
    return (
        <div className="space-y-3">
            {items.map(([title, description, status]) => (
                <div key={title} className="flex gap-4 rounded-[20px] bg-[#F7FBFE] p-4">
                    <span className="mt-1 h-3 w-3 rounded-full bg-[#2B7AB5]" />
                    <div>
                        <p className="text-sm font-black text-[#102744]">{title}</p>
                        <p className="mt-1 text-sm font-semibold leading-6 text-[#6C8098]">{description}</p>
                        <div className="mt-2"><StatusBadge value={status} /></div>
                    </div>
                </div>
            ))}
        </div>
    );
}
