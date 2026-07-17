import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import {
    AlertTriangle,
    BarChart3,
    BookOpenCheck,
    CheckCircle2,
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
    usageSeries,
} from '@/data/adminMockData';
import {
    getAdminBillingOrders,
    getAdminBillingWebhookEvents,
    getAdminAuditLogById,
    getAdminAuditLogs,
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
    hideAdminDocument,
    restoreAdminDocument,
    updateAdminUserRole,
    updateAdminUserStatus,
    updateAdminUserSubscription,
} from '@/services/adminService';

function useAdminBase() {
    const location = useLocation();
    return location.pathname.startsWith('/dev/admin') ? '/dev/admin' : '/admin';
}

function PageGrid({ children, className = '' }) {
    return <div className={`grid gap-6 ${className}`}>{children}</div>;
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

const pageSizeOptions = [10, 20, 30, 50];

function getTotal(response, fallback = 0) {
    return Number(getField(response, 'total', 'Total', fallback) || 0);
}

function AdminQueryToolbar({ draft, onDraftChange, onSubmit, searchPlaceholder = 'Tìm kiếm...', fields = [], embedded = false }) {
    const content = (
        <form className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end" onSubmit={onSubmit}>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <label className="grid gap-2 md:col-span-2 xl:col-span-1">
                    <span className="text-xs font-black uppercase tracking-[0.1em] text-[#60758D]">Tìm kiếm</span>
                    <input
                        className="h-12 rounded-[16px] border border-[#D8E9F5] bg-white px-4 text-sm font-bold text-[#102744] outline-none focus:border-[#5BAED4] focus:ring-4 focus:ring-[#A8D8EA]/30"
                        value={draft.search || ''}
                        onChange={(event) => onDraftChange('search', event.target.value)}
                        placeholder={searchPlaceholder}
                    />
                </label>
                {fields.map((field) => (
                    <label key={field.name} className="grid gap-2">
                        <span className="text-xs font-black uppercase tracking-[0.1em] text-[#60758D]">{field.label}</span>
                        {field.type === 'select' ? (
                            <select
                                className="h-12 rounded-[16px] border border-[#D8E9F5] bg-white px-4 text-sm font-bold text-[#102744] outline-none focus:border-[#5BAED4] focus:ring-4 focus:ring-[#A8D8EA]/30"
                                value={draft[field.name] || ''}
                                onChange={(event) => onDraftChange(field.name, event.target.value)}
                            >
                                {field.options.map((option) => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        ) : (
                            <input
                                className="h-12 rounded-[16px] border border-[#D8E9F5] bg-white px-4 text-sm font-bold text-[#102744] outline-none focus:border-[#5BAED4] focus:ring-4 focus:ring-[#A8D8EA]/30"
                                type={field.type || 'text'}
                                value={draft[field.name] || ''}
                                onChange={(event) => onDraftChange(field.name, event.target.value)}
                                placeholder={field.placeholder}
                            />
                        )}
                    </label>
                ))}
            </div>
            <ActionButton type="submit">Lọc</ActionButton>
        </form>
    );

    if (embedded) {
        return <div className="rounded-[22px] border border-[#D8E9F5] bg-[#F8FCFF] p-4">{content}</div>;
    }

    return (
        <AdminCard className="p-4">
            {content}
        </AdminCard>
    );
}

function AdminPagination({ page = 1, pageSize = 20, total = 0, onPageChange, onPageSizeChange }) {
    const totalPages = Math.max(1, Math.ceil(Number(total || 0) / Number(pageSize || 20)));
    const currentPage = Math.min(Math.max(1, Number(page || 1)), totalPages);

    return (
        <div className="mt-4 flex flex-col gap-3 rounded-[20px] border border-[#D8E9F5] bg-[#F8FCFF] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-bold text-[#60758D]">
                Trang <span className="font-black text-[#102744]">{currentPage}</span> / {totalPages} · {formatNumber(total)} dòng
            </p>
            <div className="flex flex-wrap items-center gap-2">
                <select
                    className="h-10 rounded-full border border-[#D8E9F5] bg-white px-3 text-sm font-black text-[#102744] outline-none"
                    value={pageSize}
                    onChange={(event) => onPageSizeChange(Number(event.target.value))}
                >
                    {pageSizeOptions.map((size) => (
                        <option key={size} value={size}>{size}/trang</option>
                    ))}
                </select>
                <ActionButton type="button" tone="ghost" disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)}>Trước</ActionButton>
                <ActionButton type="button" tone="ghost" disabled={currentPage >= totalPages} onClick={() => onPageChange(currentPage + 1)}>Sau</ActionButton>
            </div>
        </div>
    );
}

function AdminToast({ toast, onClose }) {
    if (!toast?.message) return null;

    const tone = toast.type === 'error'
        ? 'border-[#FFD3D8] bg-[#FFF1F3] text-[#C2293A]'
        : 'border-[#BFECD8] bg-[#EEFFF7] text-[#137A4B]';

    return (
        <div className={`fixed bottom-5 right-5 z-50 max-w-md rounded-[20px] border px-4 py-3 text-sm font-bold shadow-[0_18px_48px_rgba(16,39,68,0.16)] ${tone}`}>
            <div className="flex items-start gap-3">
                <span className="min-w-0 flex-1">{toast.message}</span>
                <button type="button" className="font-black" onClick={onClose}>x</button>
            </div>
        </div>
    );
}

function formatAdminActionError(error, fallback = 'Không thể thực hiện thao tác.') {
    const message = error?.message || fallback;
    if (error?.status === 400) return `Dữ liệu chưa hợp lệ: ${message}`;
    if (error?.status === 404) return `Không tìm thấy dữ liệu: ${message}`;
    if (error?.status === 409) return `Không thể thực hiện: ${message}`;
    return message;
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

function DataStateNotice({ state, fallbackLabel = 'Đang hiển thị dữ liệu mẫu vì chưa có phiên quản trị.' }) {
    if (state?.isLoading) {
        return (
            <div className="rounded-[18px] border border-[#D8E9F5] bg-white px-4 py-3 text-sm font-bold text-[#52677F]">
                Đang tải dữ liệu...
            </div>
        );
    }

    if (state?.error) {
        return (
            <div className="rounded-[18px] border border-[#FFE2B8] bg-[#FFF8EC] px-4 py-3 text-sm font-bold text-[#9B5A00]">
                Chưa thể tải dữ liệu mới nhất. {fallbackLabel}
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

function adaptAuditLog(row) {
    if (row?.time && row?.actor) return row;

    const targetType = getField(row, 'targetType', 'TargetType', '');
    const targetId = getField(row, 'targetId', 'TargetId', '');

    return {
        id: String(getField(row, 'id', 'Id', '')),
        time: formatDateTime(getField(row, 'createdAt', 'CreatedAt')),
        actor: getField(row, 'actorEmail', 'ActorEmail', 'Khong ro'),
        action: getField(row, 'action', 'Action', ''),
        target: `${targetType}${targetId ? ` #${targetId}` : ''}`,
        risk: getField(row, 'riskLevel', 'RiskLevel', ''),
        reason: getField(row, 'reason', 'Reason', ''),
        ipAddress: getField(row, 'ipAddress', 'IpAddress', ''),
        beforeJson: getField(row, 'beforeJson', 'BeforeJson', ''),
        afterJson: getField(row, 'afterJson', 'AfterJson', ''),
        userAgent: getField(row, 'userAgent', 'UserAgent', ''),
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

function AdminCommandModal({
    title,
    description,
    fields = [],
    values,
    onChange,
    onClose,
    onSubmit,
    pending,
    error,
    success,
    submitLabel = 'Xac nhan',
    tone = 'primary',
}) {
    return (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#071D35]/45 px-4 py-6 backdrop-blur-sm">
            <form
                className="w-full max-w-xl rounded-[28px] border border-[#D8E9F5] bg-white p-6 shadow-[0_30px_80px_rgba(7,29,53,0.24)]"
                onSubmit={onSubmit}
            >
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-black text-[#071D35]">{title}</h2>
                        {description && <p className="mt-2 text-sm font-semibold leading-6 text-[#6C8098]">{description}</p>}
                    </div>
                    <button
                        type="button"
                        className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#F3FAFF] text-lg font-black text-[#102744]"
                        onClick={onClose}
                        disabled={pending}
                    >
                        x
                    </button>
                </div>

                <div className="mt-5 grid gap-4">
                    {fields.map((field) => (
                        <label key={field.name} className="grid gap-2">
                            <span className="text-xs font-black uppercase tracking-[0.1em] text-[#60758D]">{field.label}</span>
                            {field.type === 'select' ? (
                                <select
                                    className="h-12 rounded-[16px] border border-[#D8E9F5] bg-white px-4 text-sm font-bold text-[#102744] outline-none focus:border-[#5BAED4] focus:ring-4 focus:ring-[#A8D8EA]/30"
                                    value={values[field.name] || ''}
                                    onChange={(event) => onChange(field.name, event.target.value)}
                                    required={field.required}
                                >
                                    {field.options.map((option) => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                            ) : field.type === 'textarea' ? (
                                <textarea
                                    className="min-h-[116px] rounded-[16px] border border-[#D8E9F5] bg-white px-4 py-3 text-sm font-bold text-[#102744] outline-none focus:border-[#5BAED4] focus:ring-4 focus:ring-[#A8D8EA]/30"
                                    value={values[field.name] || ''}
                                    onChange={(event) => onChange(field.name, event.target.value)}
                                    maxLength={field.maxLength}
                                    required={field.required}
                                />
                            ) : (
                                <input
                                    className="h-12 rounded-[16px] border border-[#D8E9F5] bg-white px-4 text-sm font-bold text-[#102744] outline-none focus:border-[#5BAED4] focus:ring-4 focus:ring-[#A8D8EA]/30"
                                    type={field.type || 'text'}
                                    value={values[field.name] || ''}
                                    onChange={(event) => onChange(field.name, event.target.value)}
                                    required={field.required}
                                />
                            )}
                        </label>
                    ))}
                </div>

                {error && (
                    <div className="mt-4 rounded-[18px] border border-[#FFD3D8] bg-[#FFF1F3] px-4 py-3 text-sm font-bold text-[#C2293A]">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mt-4 rounded-[18px] border border-[#BFECD8] bg-[#EEFFF7] px-4 py-3 text-sm font-bold text-[#137A4B]">
                        {success}
                    </div>
                )}

                <div className="mt-6 flex flex-wrap justify-end gap-3">
                    <ActionButton type="button" tone="ghost" onClick={onClose} disabled={pending}>Huy</ActionButton>
                    <ActionButton type="submit" tone={tone} disabled={pending}>{pending ? 'Dang luu...' : submitLabel}</ActionButton>
                </div>
            </form>
        </div>
    );
}

function AuditLogDetailModal({ log, onClose }) {
    if (!log) return null;

    return (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#071D35]/45 px-4 py-6 backdrop-blur-sm">
            <div className="max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-[28px] border border-[#D8E9F5] bg-white p-6 shadow-[0_30px_80px_rgba(7,29,53,0.24)]">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-black text-[#071D35]">Chi tiet audit log</h2>
                        <p className="mt-2 text-sm font-semibold text-[#6C8098]">{log.time} - {log.actor}</p>
                    </div>
                    <button type="button" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#F3FAFF] text-lg font-black text-[#102744]" onClick={onClose}>x</button>
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <InfoBlock label="Action" value={log.action} />
                    <InfoBlock label="Target" value={log.target} />
                    <InfoBlock label="Risk" value={log.risk} />
                    <InfoBlock label="IP" value={log.ipAddress || 'Khong co'} />
                </div>
                <div className="mt-5 rounded-[20px] bg-[#F7FBFE] p-4">
                    <p className="text-xs font-black uppercase tracking-[0.1em] text-[#7C91A8]">Reason</p>
                    <p className="mt-2 text-sm font-bold leading-6 text-[#102744]">{log.reason || 'Khong co'}</p>
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <pre className="max-h-80 overflow-auto rounded-[18px] bg-[#102744] p-4 text-xs font-semibold leading-5 text-white">{log.beforeJson || 'No before data'}</pre>
                    <pre className="max-h-80 overflow-auto rounded-[18px] bg-[#102744] p-4 text-xs font-semibold leading-5 text-white">{log.afterJson || 'No after data'}</pre>
                </div>
            </div>
        </div>
    );
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

            <PageGrid>
                <AdminCard className="p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <h2 className="text-2xl font-black text-[#071D35]">Doanh thu đã thu</h2>
                            <p className="mt-1 text-sm font-semibold text-[#6C8098]">Theo dõi doanh thu đã thanh toán theo tháng.</p>
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
                        <AdminSectionHeader title="Giáo viên nổi bật" description="Xếp theo mức độ sử dụng lành mạnh, trạng thái gói trả phí và phiên học đã hoàn tất." />
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
                                            <div className="mt-3">
                                                <StatusBadge value={alert.severity} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </AdminCard>
                </div>
            </PageGrid>
        </PageGrid>
    );
}

export function AdminUsersPage() {
    const base = useAdminBase();
    const [query, setQuery] = useState({ page: 1, pageSize: 20, search: '', role: '', subscription: '' });
    const [draft, setDraft] = useState({ search: '', role: '', subscription: '' });
    const usersState = useAdminResource(
        (options) => getAdminUsers(query, options),
        { items: adminUsers },
        [JSON.stringify(query)]
    );
    const users = useMemo(() => getItems(usersState.data).map((user) => {
        if (user.name) return user;
        return adaptUser(user);
    }), [usersState.data]);
    const totalUsers = getTotal(usersState.data, users.length);
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

    function applyUsersFilters(event) {
        event.preventDefault();
        setQuery((current) => ({ ...current, ...draft, page: 1 }));
    }

    return (
        <PageGrid>
            <DataStateNotice state={usersState} />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MiniMetric icon={UsersRound} label="Tổng người dùng" value={formatNumber(totalUsers)} />
                <MiniMetric icon={UserCog} label="Giáo viên trong trang" value={formatNumber(teacherCount)} tone="navy" />
                <MiniMetric icon={ShieldCheck} label="Gói trả phí" value={formatNumber(premiumCount)} tone="green" />
                <MiniMetric icon={AlertTriangle} label="Đã tải trang" value={formatNumber(getField(usersState.data, 'page', 'Page', 1))} tone="orange" />
            </div>
            <AdminQueryToolbar
                draft={draft}
                onDraftChange={(name, value) => setDraft((current) => ({ ...current, [name]: value }))}
                onSubmit={applyUsersFilters}
                searchPlaceholder="Tìm theo tên hoặc email..."
                fields={[
                    {
                        name: 'role',
                        label: 'Vai trò',
                        type: 'select',
                        options: [
                            { value: '', label: 'Tất cả' },
                            { value: 'Teacher', label: formatAdminValue('Teacher') },
                            { value: 'Student', label: formatAdminValue('Student') },
                            { value: 'Parent', label: formatAdminValue('Parent') },
                            { value: 'Admin', label: formatAdminValue('Admin') },
                        ],
                    },
                    {
                        name: 'subscription',
                        label: 'Gói',
                        type: 'select',
                        options: [
                            { value: '', label: 'Tất cả' },
                            { value: 'Freemium', label: formatAdminValue('Freemium') },
                            { value: 'Premium', label: formatAdminValue('Premium') },
                            { value: 'Expired', label: formatAdminValue('Expired') },
                        ],
                    },
                ]}
            />
            <AdminCard className="p-5">
                <AdminSectionHeader title="Danh sách người dùng" description="Theo dõi tài khoản, vai trò, gói đăng ký và hoạt động gần đây." />
                <AdminTable columns={columns} rows={users} rowHref={(row) => `${base}/users/${row.id}`} />
                <AdminPagination
                    page={query.page}
                    pageSize={query.pageSize}
                    total={totalUsers}
                    onPageChange={(page) => setQuery((current) => ({ ...current, page }))}
                    onPageSizeChange={(pageSize) => setQuery((current) => ({ ...current, page: 1, pageSize }))}
                />
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
    const [refreshKey, setRefreshKey] = useState(0);
    const [commandType, setCommandType] = useState('');
    const [commandValues, setCommandValues] = useState({});
    const [commandState, setCommandState] = useState({ pending: false, error: '', success: '' });
    const [toast, setToast] = useState(null);
    const userState = useAdminResource(
        (options) => fetchAdminUserById(userId, options),
        fallbackUser,
        [userId, refreshKey]
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
    const userCommandConfig = useMemo(() => {
        const currentStatus = user.status === 'Deleted' ? 'Deleted' : 'Active';
        const configs = {
            role: {
                title: 'Doi vai tro nguoi dung',
                description: 'Backend se ghi audit log va chan tu doi vai tro hoac ha quyen admin cuoi cung.',
                submitLabel: 'Luu vai tro',
                fields: [
                    {
                        name: 'role',
                        label: 'Vai tro',
                        type: 'select',
                        required: true,
                        options: ['Teacher', 'Student', 'Parent', 'Admin'].map((role) => ({ value: role, label: formatAdminValue(role) })),
                    },
                    { name: 'reason', label: 'Ly do', type: 'textarea', required: true, maxLength: 500 },
                ],
            },
            subscription: {
                title: 'Cap nhat goi dang ky',
                description: 'Goi Premium can ngay het han trong tuong lai.',
                submitLabel: 'Luu goi',
                fields: [
                    {
                        name: 'subscriptionTier',
                        label: 'Goi',
                        type: 'select',
                        required: true,
                        options: ['Freemium', 'Premium'].map((tier) => ({ value: tier, label: formatAdminValue(tier) })),
                    },
                    { name: 'premiumExpiresAt', label: 'Ngay het han Premium', type: 'datetime-local' },
                    { name: 'reason', label: 'Ly do', type: 'textarea', required: true, maxLength: 500 },
                ],
            },
            status: {
                title: currentStatus === 'Deleted' ? 'Khoi phuc tai khoan' : 'Khoa tai khoan',
                description: 'Backend se chan tu khoa tai khoan admin hien tai va admin cuoi cung.',
                submitLabel: currentStatus === 'Deleted' ? 'Khoi phuc' : 'Khoa tai khoan',
                tone: currentStatus === 'Deleted' ? 'primary' : 'danger',
                fields: [
                    {
                        name: 'status',
                        label: 'Trang thai moi',
                        type: 'select',
                        required: true,
                        options: ['Active', 'Deleted'].map((status) => ({ value: status, label: formatAdminValue(status) })),
                    },
                    { name: 'reason', label: 'Ly do', type: 'textarea', required: true, maxLength: 500 },
                ],
            },
        };
        return configs[commandType];
    }, [commandType, user.status]);

    function openUserCommand(type) {
        const premiumDefault = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
        const currentStatus = user.status === 'Deleted' ? 'Deleted' : 'Active';
        const initialValues = {
            role: { role: user.role || 'Teacher', reason: '' },
            subscription: { subscriptionTier: user.plan === 'Premium' ? 'Premium' : 'Freemium', premiumExpiresAt: premiumDefault, reason: '' },
            status: { status: currentStatus === 'Deleted' ? 'Active' : 'Deleted', reason: '' },
        };
        setCommandType(type);
        setCommandValues(initialValues[type] || {});
        setCommandState({ pending: false, error: '', success: '' });
    }

    function closeUserCommand() {
        if (commandState.pending) return;
        setCommandType('');
        setCommandValues({});
        setCommandState({ pending: false, error: '', success: '' });
    }

    async function submitUserCommand(event) {
        event.preventDefault();
        if (!commandType) return;

        setCommandState({ pending: true, error: '', success: '' });
        try {
            if (commandType === 'role') {
                await updateAdminUserRole(userId, {
                    role: commandValues.role,
                    reason: commandValues.reason,
                });
            } else if (commandType === 'subscription') {
                if (commandValues.subscriptionTier === 'Premium' && !commandValues.premiumExpiresAt) {
                    throw new Error('Vui long chon ngay het han Premium.');
                }
                await updateAdminUserSubscription(userId, {
                    subscriptionTier: commandValues.subscriptionTier,
                    premiumExpiresAt: commandValues.subscriptionTier === 'Premium'
                        ? new Date(commandValues.premiumExpiresAt).toISOString()
                        : null,
                    reason: commandValues.reason,
                });
            } else if (commandType === 'status') {
                await updateAdminUserStatus(userId, {
                    status: commandValues.status,
                    reason: commandValues.reason,
                });
            }
            setCommandState({ pending: false, error: '', success: 'Đã cập nhật thành công.' });
            setToast({ type: 'success', message: 'Đã cập nhật người dùng và tải lại dữ liệu mới nhất.' });
            setRefreshKey((value) => value + 1);
        } catch (error) {
            const message = formatAdminActionError(error, 'Không thể cập nhật người dùng.');
            setCommandState({
                pending: false,
                error: message,
                success: '',
            });
            setToast({ type: 'error', message });
        }
    }

    return (
        <PageGrid>
            <DataStateNotice state={userState} />
            <DetailHero
                backTo={`${base}/users`}
                title={user.name}
                subtitle={user.email}
                status={user.status}
                icon={UsersRound}
                actions={<><ActionButton tone="ghost" onClick={() => openUserCommand('role')}>Đổi vai trò</ActionButton><ActionButton tone="ghost" onClick={() => openUserCommand('subscription')}>Cập nhật gói</ActionButton><ActionButton tone={user.status === 'Deleted' ? 'primary' : 'danger'} onClick={() => openUserCommand('status')}>{user.status === 'Deleted' ? 'Khôi phục' : 'Khóa tài khoản'}</ActionButton></>}
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
                    <AdminSectionHeader title="Nội dung của giáo viên" description="Theo dõi tài liệu, bộ câu hỏi và thẻ ghi nhớ thuộc giáo viên này." />
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
                    <AdminSectionHeader title="Hồ sơ vận hành" description="Thông tin hỗ trợ nhanh cho đội quản trị." />
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
                        <ActionButton tone="ghost" onClick={() => openUserCommand('role')}>Đổi vai trò</ActionButton>
                        <ActionButton tone="ghost" onClick={() => openUserCommand('subscription')}>Cập nhật gói Premium</ActionButton>
                        <ActionButton tone={user.status === 'Deleted' ? 'primary' : 'danger'} onClick={() => openUserCommand('status')}>{user.status === 'Deleted' ? 'Khôi phục tài khoản' : 'Khóa tài khoản'}</ActionButton>
                    </div>
                </AdminCard>
            </div>

            <AdminCard className="p-5">
                <AdminSectionHeader title="Phiên gần đây" />
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
            {userCommandConfig && (
                <AdminCommandModal
                    title={userCommandConfig.title}
                    description={userCommandConfig.description}
                    fields={userCommandConfig.fields}
                    values={commandValues}
                    onChange={(name, value) => setCommandValues((current) => ({ ...current, [name]: value }))}
                    onClose={closeUserCommand}
                    onSubmit={submitUserCommand}
                    pending={commandState.pending}
                    error={commandState.error}
                    success={commandState.success}
                    submitLabel={userCommandConfig.submitLabel}
                    tone={userCommandConfig.tone || 'primary'}
                />
            )}
            <AdminToast toast={toast} onClose={() => setToast(null)} />
        </PageGrid>
    );
}

export function AdminContentPage() {
    const base = useAdminBase();
    const [query, setQuery] = useState({ page: 1, pageSize: 20, search: '', deletion: 'Active', contentType: '' });
    const [draft, setDraft] = useState({ search: '', deletion: 'Active', contentType: '' });
    const shouldFetchDocuments = !query.contentType || query.contentType === 'Document';
    const shouldFetchQuizzes = !query.contentType || query.contentType === 'Quiz' || query.contentType === 'Flashcard';
    const documentParams = {
        page: query.page,
        pageSize: query.pageSize,
        search: query.search,
        deletion: query.deletion,
    };
    const quizParams = {
        page: query.page,
        pageSize: query.pageSize,
        search: query.search,
        deletion: query.deletion,
        activityType: query.contentType === 'Quiz' || query.contentType === 'Flashcard' ? query.contentType : '',
    };
    const documentsState = useAdminResource(
        (options) => shouldFetchDocuments ? getAdminDocuments(documentParams, options) : Promise.resolve({ items: [], total: 0, page: query.page, pageSize: query.pageSize }),
        { items: adminDocuments.filter((item) => item.type === 'Document') },
        [JSON.stringify(query)]
    );
    const quizzesState = useAdminResource(
        (options) => shouldFetchQuizzes ? getAdminQuizzes(quizParams, options) : Promise.resolve({ items: [], total: 0, page: query.page, pageSize: query.pageSize }),
        { items: adminDocuments.filter((item) => item.type !== 'Document') },
        [JSON.stringify(query)]
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
    const totalContent = getTotal(documentsState.data, documents.length) + getTotal(quizzesState.data, quizzes.length);

    function applyContentFilters(event) {
        event.preventDefault();
        setQuery((current) => ({ ...current, ...draft, page: 1 }));
    }

    return (
        <PageGrid>
            <DataStateNotice state={documentsState} />
            <DataStateNotice state={quizzesState} fallbackLabel="Đang hiển thị dữ liệu nội dung mẫu vì chưa có phiên quản trị." />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MiniMetric icon={FileSearch} label="Tài liệu trong trang" value={formatNumber(documents.length)} />
                <MiniMetric icon={BookOpenCheck} label="Bộ câu hỏi trong trang" value={formatNumber(quizCount)} tone="navy" />
                <MiniMetric icon={Sparkles} label="Thẻ ghi nhớ trong trang" value={formatNumber(flashcardCount)} tone="green" />
                <MiniMetric icon={AlertTriangle} label="Đã xóa/ẩn" value={formatNumber(contentRows.filter((item) => item.status === 'Deleted').length)} tone="orange" />
            </div>
            <AdminQueryToolbar
                draft={draft}
                onDraftChange={(name, value) => setDraft((current) => ({ ...current, [name]: value }))}
                onSubmit={applyContentFilters}
                searchPlaceholder="Tìm tài liệu, quiz, flashcard, giáo viên..."
                fields={[
                    {
                        name: 'contentType',
                        label: 'Loại nội dung',
                        type: 'select',
                        options: [
                            { value: '', label: 'Tất cả' },
                            { value: 'Document', label: formatAdminValue('Document') },
                            { value: 'Quiz', label: formatAdminValue('Quiz') },
                            { value: 'Flashcard', label: formatAdminValue('Flashcards') },
                        ],
                    },
                    {
                        name: 'deletion',
                        label: 'Trạng thái',
                        type: 'select',
                        options: [
                            { value: 'Active', label: 'Đang hoạt động' },
                            { value: 'Deleted', label: 'Đã xóa/ẩn' },
                            { value: 'All', label: 'Tất cả' },
                        ],
                    },
                ]}
            />
            <AdminCard className="p-5">
                <AdminSectionHeader title="Theo dõi nội dung" description="Trang này phục vụ vận hành và kiểm duyệt, không phải nơi chỉnh nội dung học tập của giáo viên." />
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
                <AdminPagination
                    page={query.page}
                    pageSize={query.pageSize}
                    total={totalContent}
                    onPageChange={(page) => setQuery((current) => ({ ...current, page }))}
                    onPageSizeChange={(pageSize) => setQuery((current) => ({ ...current, page: 1, pageSize }))}
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
    const [refreshKey, setRefreshKey] = useState(0);
    const [moderationOpen, setModerationOpen] = useState(false);
    const [moderationValues, setModerationValues] = useState({ reason: '' });
    const [moderationState, setModerationState] = useState({ pending: false, error: '', success: '' });
    const [toast, setToast] = useState(null);
    const contentState = useAdminResource(
        (options) => {
            if (routeTarget.type === 'document') return getAdminDocumentById(routeTarget.id, options);
            if (routeTarget.type === 'quiz') return getAdminQuizById(routeTarget.id, options);
            return Promise.resolve(fallbackContent);
        },
        fallbackContent,
        [contentId, refreshKey]
    );
    const content = useMemo(() => {
        if (contentState.data?.title) return contentState.data;
        if (routeTarget.type === 'document') return adaptDocument(contentState.data);
        if (routeTarget.type === 'quiz') return adaptQuiz(contentState.data);
        return fallbackContent;
    }, [contentState.data, fallbackContent, routeTarget.type]);
    const isDocument = routeTarget.type === 'document';
    const shouldRestore = content.status === 'Deleted';
    const moderationConfig = isDocument ? {
        title: shouldRestore ? 'Khôi phục tài liệu' : 'Ẩn tài liệu',
        description: shouldRestore
            ? 'Tài liệu sẽ được mở lại cho các luồng đọc dữ liệu hợp lệ.'
            : 'Tài liệu sẽ bị đánh dấu ẩn/xóa mềm và thao tác này được ghi audit log.',
        submitLabel: shouldRestore ? 'Khôi phục tài liệu' : 'Ẩn tài liệu',
        tone: shouldRestore ? 'primary' : 'danger',
    } : null;
    const contentHeroActions = (
        <>
            <ActionButton tone="ghost" disabled><RotateCw className="mr-2 h-4 w-4" />Chưa hỗ trợ xử lý lại</ActionButton>
            {isDocument && (
                <ActionButton tone={shouldRestore ? 'primary' : 'danger'} onClick={openModerationModal}>
                    {shouldRestore ? 'Khôi phục tài liệu' : 'Ẩn tài liệu'}
                </ActionButton>
            )}
        </>
    );
    const actionTimelineItems = [
        ['Xem thông tin nội dung', 'Có thể xem chủ sở hữu, loại nội dung, ngày tạo và số lượng nội dung đã tạo ra.', 'Hoàn tất'],
        ['Lịch sử xử lý chi tiết', 'Sẽ hiển thị khi hệ thống có lịch sử xử lý nội dung đầy đủ.', 'Đang chờ'],
    ];
    if (isDocument) {
        actionTimelineItems.splice(1, 0, ['Ẩn/khôi phục tài liệu', 'Đã hỗ trợ thao tác trực tiếp cho tài liệu.', 'Hoàn tất']);
    }

    function openModerationModal() {
        setModerationOpen(true);
        setModerationValues({ reason: '' });
        setModerationState({ pending: false, error: '', success: '' });
    }

    function closeModerationModal() {
        if (moderationState.pending) return;
        setModerationOpen(false);
        setModerationValues({ reason: '' });
        setModerationState({ pending: false, error: '', success: '' });
    }

    async function submitModeration(event) {
        event.preventDefault();
        if (!isDocument) return;

        setModerationState({ pending: true, error: '', success: '' });
        try {
            const payload = { reason: moderationValues.reason };
            if (shouldRestore) {
                await restoreAdminDocument(routeTarget.id, payload);
            } else {
                await hideAdminDocument(routeTarget.id, payload);
            }
            setModerationState({ pending: false, error: '', success: 'Đã cập nhật nội dung thành công.' });
            setToast({ type: 'success', message: 'Đã cập nhật tài liệu và tải lại trạng thái mới nhất.' });
            setRefreshKey((value) => value + 1);
        } catch (error) {
            const message = formatAdminActionError(error, 'Không thể cập nhật nội dung.');
            setModerationState({
                pending: false,
                error: message,
                success: '',
            });
            setToast({ type: 'error', message });
        }
    }

    return (
        <PageGrid>
            <DataStateNotice state={contentState} />
            <DetailHero
                backTo={`${base}/content`}
                title={content.title}
                subtitle={`${formatAdminValue(content.type)} của ${content.owner}`}
                status={content.status}
                icon={FileSearch}
                actions={contentHeroActions}
            />
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
                <AdminCard className="p-6">
                    <AdminSectionHeader title="Thông tin nội dung" />
                    <div className="grid gap-4 md:grid-cols-2">
                        <InfoBlock label="Chủ sở hữu" value={content.owner} />
                        <InfoBlock label="Loại" value={content.type} />
                        <InfoBlock label="Nguồn" value={content.source} />
                        <InfoBlock label="Ngày tạo" value={content.createdAt} />
                        <InfoBlock label="Kích thước" value={content.size} />
                        <InfoBlock label="Đã tạo ra" value={content.generated} />
                    </div>
                    {content.lastError && (
                        <div className="mt-5 rounded-[20px] border border-[#FFD3D8] bg-[#FFF1F3] p-4">
                            <p className="text-sm font-black text-[#C2293A]">Lỗi gần nhất</p>
                            <p className="mt-1 text-sm font-bold text-[#7A3440]">{content.lastError}</p>
                        </div>
                    )}
                </AdminCard>
                <AdminCard className="p-6">
                    <AdminSectionHeader title="Thao tác khả dụng"/>
                    <Timeline items={actionTimelineItems} />
                </AdminCard>
            </div>
            <AdminCard className="p-5">
                <AdminSectionHeader title="Lịch sử xử lý" description="Giúp đội hỗ trợ biết nội dung đang ở bước nào." />
                <Timeline items={[
                    ['Đã nhận tệp', 'Hệ thống đã lưu tệp và ghi nhận thông tin ban đầu.', 'Hoàn tất'],
                    ['Đọc nội dung tự động', content.status === 'Failed' ? content.lastError : 'Đã đọc nội dung thành công.', content.status === 'Failed' ? 'Failed' : 'Hoàn tất'],
                    ['Chờ tạo nội dung', 'Đã đưa yêu cầu tạo bộ câu hỏi/thẻ ghi nhớ vào danh sách chờ.', content.generated > 0 ? 'Hoàn tất' : 'Đang chờ'],
                ]} />
            </AdminCard>
            {moderationOpen && moderationConfig && (
                <AdminCommandModal
                    title={moderationConfig.title}
                    description={moderationConfig.description}
                    fields={[{ name: 'reason', label: 'Lý do', type: 'textarea', required: true, maxLength: 500 }]}
                    values={moderationValues}
                    onChange={(name, value) => setModerationValues((current) => ({ ...current, [name]: value }))}
                    onClose={closeModerationModal}
                    onSubmit={submitModeration}
                    pending={moderationState.pending}
                    error={moderationState.error}
                    success={moderationState.success}
                    submitLabel={moderationConfig.submitLabel}
                    tone={moderationConfig.tone}
                />
            )}
            <AdminToast toast={toast} onClose={() => setToast(null)} />
        </PageGrid>
    );
}

export function AdminSessionsPage() {
    const base = useAdminBase();
    const [query, setQuery] = useState({ page: 1, pageSize: 20, search: '', status: '', deletion: 'Active' });
    const [draft, setDraft] = useState({ search: '', status: '', deletion: 'Active' });
    const sessionsState = useAdminResource(
        (options) => getAdminSessions(query, options),
        { items: adminSessions },
        [JSON.stringify(query)]
    );
    const sessions = useMemo(() => getItems(sessionsState.data).map((session) => (
        session.pin ? session : adaptSession(session)
    )), [sessionsState.data]);
    const activeCount = sessions.filter((session) => ['Active', 'Live'].includes(session.status)).length;
    const participantTotal = sessions.reduce((total, session) => total + Number(session.participants || 0), 0);
    const totalSessions = getTotal(sessionsState.data, sessions.length);

    function applySessionFilters(event) {
        event.preventDefault();
        setQuery((current) => ({ ...current, ...draft, page: 1 }));
    }

    return (
        <PageGrid>
            <DataStateNotice state={sessionsState} />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MiniMetric icon={Gamepad2} label="Phiên trong trang" value={formatNumber(sessions.length)} />
                <MiniMetric icon={UsersRound} label="Lượt tham gia" value={formatNumber(participantTotal)} tone="navy" />
                <MiniMetric icon={CheckCircle2} label="Đang diễn ra" value={formatNumber(activeCount)} tone="green" />
                <MiniMetric icon={ShieldAlert} label="Đã xóa/ẩn" value={formatNumber(sessions.filter((session) => session.status === 'Deleted').length)} tone="red" />
            </div>
            <AdminQueryToolbar
                draft={draft}
                onDraftChange={(name, value) => setDraft((current) => ({ ...current, [name]: value }))}
                onSubmit={applySessionFilters}
                searchPlaceholder="Tìm theo PIN, giáo viên, bộ câu hỏi..."
                fields={[
                    {
                        name: 'status',
                        label: 'Trạng thái',
                        type: 'select',
                        options: [
                            { value: '', label: 'Tất cả' },
                            { value: 'Waiting', label: formatAdminValue('Waiting') },
                            { value: 'Active', label: formatAdminValue('Active') },
                            { value: 'Ended', label: formatAdminValue('Ended') },
                        ],
                    },
                    {
                        name: 'deletion',
                        label: 'Ẩn/xóa',
                        type: 'select',
                        options: [
                            { value: 'Active', label: 'Đang hoạt động' },
                            { value: 'Deleted', label: 'Đã xóa/ẩn' },
                            { value: 'All', label: 'Tất cả' },
                        ],
                    },
                ]}
            />
            <AdminCard className="p-5">
                <AdminSectionHeader title="Phiên trực tiếp" />
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
                <AdminPagination
                    page={query.page}
                    pageSize={query.pageSize}
                    total={totalSessions}
                    onPageChange={(page) => setQuery((current) => ({ ...current, page }))}
                    onPageSizeChange={(pageSize) => setQuery((current) => ({ ...current, page: 1, pageSize }))}
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
                actions={<><ActionButton tone="ghost">Làm mới dữ liệu</ActionButton><ActionButton tone="danger">Chưa hỗ trợ kết thúc phiên</ActionButton></>}
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
                    <AdminSectionHeader title="Tổng quan người tham gia" />
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
                    <AdminSectionHeader title="Trạng thái theo dõi" />
                    <InfoList items={[
                        ['Giáo viên', session.teacher],
                        ['Chế độ', session.mode],
                        ['Người tham gia', session.participants],
                        ['Thao tác kết thúc phiên', 'Chưa hỗ trợ'],
                    ]} />
                </AdminCard>
            </div>
        </PageGrid>
    );
}

export function AdminBillingPage() {
    const [ordersQuery, setOrdersQuery] = useState({ page: 1, pageSize: 20, search: '', status: '', plan: '', deletion: 'Active' });
    const [ordersDraft, setOrdersDraft] = useState({ search: '', status: '', plan: '', deletion: 'Active' });
    const [webhookQuery, setWebhookQuery] = useState({ page: 1, pageSize: 10, search: '', processed: '', hasError: '' });
    const [webhookDraft, setWebhookDraft] = useState({ search: '', processed: '', hasError: '' });
    const overviewState = useAdminResource(
        (options) => getAdminOverview({ range: '30d' }, options),
        null,
        []
    );
    const ordersState = useAdminResource(
        (options) => getAdminBillingOrders(ordersQuery, options),
        { items: adminOrders },
        [JSON.stringify(ordersQuery)]
    );
    const webhookState = useAdminResource(
        (options) => getAdminBillingWebhookEvents(webhookQuery, options),
        { items: [] },
        [JSON.stringify(webhookQuery)]
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
    const totalOrders = getTotal(ordersState.data, orders.length);
    const totalWebhookEvents = getTotal(webhookState.data, webhookEvents.length);

    function applyOrderFilters(event) {
        event.preventDefault();
        setOrdersQuery((current) => ({ ...current, ...ordersDraft, page: 1 }));
    }

    function applyWebhookFilters(event) {
        event.preventDefault();
        setWebhookQuery((current) => ({ ...current, ...webhookDraft, page: 1 }));
    }

    return (
        <PageGrid>
            <DataStateNotice state={overviewState} />
            <DataStateNotice state={ordersState} fallbackLabel="Đang hiển thị dữ liệu đơn hàng mẫu vì chưa có phiên quản trị." />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MiniMetric icon={CircleDollarSign} label="Doanh thu đã thu" value={formatCompactVnd(collectedTotal * 1000000)} />
                <MiniMetric icon={CreditCard} label="Đơn đã thanh toán" value={formatNumber(paidOrders)} tone="green" />
                <MiniMetric icon={ReceiptText} label="Đang chờ" value={formatNumber(pendingOrders)} tone="orange" />
                <MiniMetric icon={AlertTriangle} label="Lỗi thanh toán" value={formatNumber(webhookErrors)} tone="red" />
            </div>
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
                <AdminCard className="p-6">
                    <AdminSectionHeader title="Xu hướng doanh thu" description="Theo dõi doanh thu đã thanh toán theo tháng và đối soát cùng danh sách đơn hàng." />
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
                    <AdminSectionHeader title="Thao tác thanh toán" description="Phiên bản hiện tại chỉ hỗ trợ xem và đối soát dữ liệu thanh toán." />
                    <div className="grid gap-3">
                        <ActionButton tone="ghost">Chưa hỗ trợ đồng bộ đơn</ActionButton>
                        <ActionButton tone="ghost">Chưa hỗ trợ gia hạn gói</ActionButton>
                        <ActionButton tone="ghost">Xuất doanh thu</ActionButton>
                    </div>
                </AdminCard>
            </div>
            <AdminCard className="p-5">
                <AdminSectionHeader title="Đơn hàng" description="Theo dõi trạng thái thanh toán, gói đăng ký, thời điểm thanh toán và ngày hết hạn gói trả phí." />
                <div className="mb-5">
                    <AdminQueryToolbar
                        embedded
                        draft={ordersDraft}
                        onDraftChange={(name, value) => setOrdersDraft((current) => ({ ...current, [name]: value }))}
                        onSubmit={applyOrderFilters}
                        searchPlaceholder="Tìm mã đơn, email, người dùng..."
                        fields={[
                            {
                                name: 'status',
                                label: 'Trạng thái',
                                type: 'select',
                                options: [
                                    { value: '', label: 'Tất cả' },
                                    { value: 'Pending', label: formatAdminValue('Pending') },
                                    { value: 'Paid', label: formatAdminValue('Paid') },
                                    { value: 'Cancelled', label: formatAdminValue('Cancelled') },
                                ],
                            },
                            { name: 'plan', label: 'Mã gói', placeholder: 'PRO_MONTHLY' },
                            {
                                name: 'deletion',
                                label: 'Ẩn/xóa',
                                type: 'select',
                                options: [
                                    { value: 'Active', label: 'Đang hoạt động' },
                                    { value: 'Deleted', label: 'Đã xóa/ẩn' },
                                    { value: 'All', label: 'Tất cả' },
                                ],
                            },
                        ]}
                    />
                </div>
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
                <AdminPagination
                    page={ordersQuery.page}
                    pageSize={ordersQuery.pageSize}
                    total={totalOrders}
                    onPageChange={(page) => setOrdersQuery((current) => ({ ...current, page }))}
                    onPageSizeChange={(pageSize) => setOrdersQuery((current) => ({ ...current, page: 1, pageSize }))}
                />
            </AdminCard>
            <AdminCard className="p-5">
                <AdminSectionHeader title="Ghi nhận thanh toán" description="Dùng để đối soát thông báo từ PayOS đã xử lý hay còn lỗi." />
                <div className="mb-5">
                    <AdminQueryToolbar
                        embedded
                        draft={webhookDraft}
                        onDraftChange={(name, value) => setWebhookDraft((current) => ({ ...current, [name]: value }))}
                        onSubmit={applyWebhookFilters}
                        searchPlaceholder="Tìm order code, reference..."
                        fields={[
                            {
                                name: 'processed',
                                label: 'Xử lý',
                                type: 'select',
                                options: [
                                    { value: '', label: 'Tất cả' },
                                    { value: 'true', label: 'Đã xử lý' },
                                    { value: 'false', label: 'Chưa xử lý' },
                                ],
                            },
                            {
                                name: 'hasError',
                                label: 'Lỗi',
                                type: 'select',
                                options: [
                                    { value: '', label: 'Tất cả' },
                                    { value: 'true', label: 'Có lỗi' },
                                    { value: 'false', label: 'Không lỗi' },
                                ],
                            },
                        ]}
                    />
                </div>
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
                <AdminPagination
                    page={webhookQuery.page}
                    pageSize={webhookQuery.pageSize}
                    total={totalWebhookEvents}
                    onPageChange={(page) => setWebhookQuery((current) => ({ ...current, page }))}
                    onPageSizeChange={(pageSize) => setWebhookQuery((current) => ({ ...current, page: 1, pageSize }))}
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
                <AdminSectionHeader title="Mức dùng tuần này" />
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
                <AdminSectionHeader title="Luồng xử lý AI" description="Theo dõi tỷ lệ thành công, thời gian trung bình, chi phí ước tính và trạng thái luồng xử lý." />
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
                        <p className="mt-4 text-xl font-black">Tra cứu tập trung</p>
                        <p className="mt-2 text-sm font-semibold leading-6 text-white/72">Tìm nhanh người dùng, phiên học, tài liệu và đơn hàng liên quan.</p>
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
                        ['Xem nội dung/phiên liên quan', 'Ưu tiên xem thông tin tóm tắt trước, mở chi tiết khi cần.', 'Bắt buộc'],
                        ['Ghi ghi chú kiểm tra', 'Mọi thao tác thanh toán, hạn mức, ẩn nội dung đều cần ghi nhật ký.', 'Bắt buộc'],
                    ]} />
                </AdminCard>
            </div>
        </PageGrid>
    );
}

export function AdminAuditLogsPage() {
    const [query, setQuery] = useState({ page: 1, pageSize: 50 });
    const [draft, setDraft] = useState({ search: '', action: '', targetType: '', riskLevel: '' });
    const [detailLog, setDetailLog] = useState(null);
    const [detailError, setDetailError] = useState('');
    const [detailLoading, setDetailLoading] = useState(false);
    const logsState = useAdminResource(
        (options) => getAdminAuditLogs(query, options),
        { items: auditLogs },
        [JSON.stringify(query)]
    );
    const logs = useMemo(() => getItems(logsState.data).map(adaptAuditLog), [logsState.data]);
    const totalLogs = getTotal(logsState.data, logs.length);

    function applyAuditFilters(event) {
        event.preventDefault();
        setQuery({ page: 1, pageSize: 50, ...draft });
    }

    async function openAuditDetail(row) {
        setDetailLog(row);
        setDetailError('');
        const numericId = Number(row.id);
        if (!hasAdminApiToken() || !Number.isInteger(numericId)) return;

        setDetailLoading(true);
        try {
            const detail = await getAdminAuditLogById(numericId);
            setDetailLog(adaptAuditLog(detail));
        } catch (error) {
            setDetailError(error?.message || 'Khong the tai chi tiet audit log.');
        } finally {
            setDetailLoading(false);
        }
    }

    return (
        <PageGrid>
            <AdminCard className="p-4">
                <form className="grid gap-3 xl:grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(160px,0.4fr))_auto] xl:items-end" onSubmit={applyAuditFilters}>
                    <label className="grid gap-2">
                        <span className="text-xs font-black uppercase tracking-[0.1em] text-[#60758D]">Tìm kiếm</span>
                        <input
                            className="h-12 rounded-[16px] border border-[#D8E9F5] bg-white px-4 text-sm font-bold text-[#102744] outline-none focus:border-[#5BAED4] focus:ring-4 focus:ring-[#A8D8EA]/30"
                            value={draft.search}
                            onChange={(event) => setDraft((current) => ({ ...current, search: event.target.value }))}
                            placeholder="Email, action, target..."
                        />
                    </label>
                    <label className="grid gap-2">
                        <span className="text-xs font-black uppercase tracking-[0.1em] text-[#60758D]">Rủi ro</span>
                        <select
                            className="h-12 rounded-[16px] border border-[#D8E9F5] bg-white px-4 text-sm font-bold text-[#102744] outline-none focus:border-[#5BAED4] focus:ring-4 focus:ring-[#A8D8EA]/30"
                            value={draft.riskLevel}
                            onChange={(event) => setDraft((current) => ({ ...current, riskLevel: event.target.value }))}
                        >
                            <option value="">Tất cả</option>
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>
                    </label>
                    <label className="grid gap-2">
                        <span className="text-xs font-black uppercase tracking-[0.1em] text-[#60758D]">Action</span>
                        <input
                            className="h-12 rounded-[16px] border border-[#D8E9F5] bg-white px-4 text-sm font-bold text-[#102744] outline-none focus:border-[#5BAED4] focus:ring-4 focus:ring-[#A8D8EA]/30"
                            value={draft.action}
                            onChange={(event) => setDraft((current) => ({ ...current, action: event.target.value }))}
                            placeholder="User.RoleChanged"
                        />
                    </label>
                    <label className="grid gap-2">
                        <span className="text-xs font-black uppercase tracking-[0.1em] text-[#60758D]">Target</span>
                        <input
                            className="h-12 rounded-[16px] border border-[#D8E9F5] bg-white px-4 text-sm font-bold text-[#102744] outline-none focus:border-[#5BAED4] focus:ring-4 focus:ring-[#A8D8EA]/30"
                            value={draft.targetType}
                            onChange={(event) => setDraft((current) => ({ ...current, targetType: event.target.value }))}
                            placeholder="User"
                        />
                    </label>
                    <ActionButton type="submit">Lọc</ActionButton>
                </form>
            </AdminCard>
            <DataStateNotice state={logsState} fallbackLabel="Đang hiển thị audit log mẫu vì chưa có phiên quản trị." />
            <AdminCard className="p-5">
                <AdminSectionHeader title="Nhật ký thao tác" description="Mọi hành động quản trị có tác động đến người dùng, thanh toán, nội dung, hạn mức đều cần được ghi lại." />
                <AdminTable
                    columns={[
                        { key: 'time', label: 'Thời gian' },
                        { key: 'actor', label: 'Người thao tác' },
                        { key: 'action', label: 'Hành động' },
                        { key: 'target', label: 'Đối tượng' },
                        { key: 'risk', label: 'Rủi ro', render: (row) => <StatusBadge value={row.risk} /> },
                        { key: 'detail', label: 'Chi tiết', render: (row) => <button type="button" className="text-sm font-black text-[#2B7AB5] hover:text-[#1B3A6B]" onClick={() => openAuditDetail(row)}>Xem</button> },
                    ]}
                    rows={logs}
                />
                <AdminPagination
                    page={query.page}
                    pageSize={query.pageSize}
                    total={totalLogs}
                    onPageChange={(page) => setQuery((current) => ({ ...current, page }))}
                    onPageSizeChange={(pageSize) => setQuery((current) => ({ ...current, page: 1, pageSize }))}
                />
            </AdminCard>
            {detailError && (
                <div className="rounded-[18px] border border-[#FFD3D8] bg-[#FFF1F3] px-4 py-3 text-sm font-bold text-[#C2293A]">
                    {detailError}
                </div>
            )}
            {detailLoading && (
                <div className="rounded-[18px] border border-[#D8E9F5] bg-white px-4 py-3 text-sm font-bold text-[#52677F]">
                    Đang tải chi tiết audit log...
                </div>
            )}
            <AuditLogDetailModal log={detailLog} onClose={() => setDetailLog(null)} />
        </PageGrid>
    );
}

export function AdminSettingsPage() {
    const settings = [
        { id: 'set-1', title: 'Giới hạn sử dụng gói miễn phí', description: 'Quy định tài khoản miễn phí được tải lên bao nhiêu tài liệu, tạo bao nhiêu bộ câu hỏi, thẻ ghi nhớ và phiên học.', icon: Database },
        { id: 'set-2', title: 'Bật/tắt tính năng', description: 'Quản lý tính năng nào đang mở cho giáo viên và học sinh: thẻ ghi nhớ, trò chơi phiêu lưu, phân tích dữ liệu hoặc thử nghiệm mới.', icon: Flag },
        { id: 'set-3', title: 'Điều kiện gửi cảnh báo', description: 'Thiết lập khi nào hệ thống cần báo cho quản trị viên: lỗi xử lý tăng cao, đơn đã thanh toán chưa kích hoạt gói hoặc lỗi kết nối thời gian thực.', icon: ShieldAlert },
        { id: 'set-4', title: 'Phân quyền quản trị', description: 'Quy định ai được xem dữ liệu, hỗ trợ người dùng, kiểm duyệt nội dung, quản lý thanh toán hoặc thay đổi cấu hình hệ thống.', icon: LockKeyhole },
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
