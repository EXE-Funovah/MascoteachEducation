import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    AlertCircle,
    Archive,
    BookOpen,
    Bookmark,
    CheckCircle2,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Copy,
    Edit3,
    Eye,
    EyeOff,
    FileText,
    Gamepad2,
    HelpCircle,
    Layers,
    Library,
    Loader2,
    MoreVertical,
    Play,
    Plus,
    Search,
    Share2,
    Trash2,
    Users,
    X,
} from 'lucide-react';
import CreateFlowModal from '@/components/portal/create/CreateFlowModal';
import { getMyDocuments, deleteDocument } from '@/services/documentService';
import {
    deleteQuiz,
    getMyQuizzes,
    getQuizQuestions,
    toFrontendActivityType,
} from '@/services/quizService';
import { getMySessions } from '@/services/liveSessionService';

const ITEMS_PER_PAGE = 10;

const ACTIVITY_FILTERS = [
    { id: 'all', label: 'Tất cả loại' },
    { id: 'documents', label: 'Tài liệu' },
    { id: 'quizzes', label: 'Bộ câu hỏi' },
];

const COLLECTIONS = [
    { id: 'created', label: 'Đã tạo', icon: Edit3 },
    { id: 'previous', label: 'Đã dùng gần đây', icon: Play },
    { id: 'all', label: 'Tất cả hoạt động', icon: Library },
];

function formatDate(value) {
    if (!value) return 'Mới cập nhật';
    return new Date(value).toLocaleDateString('vi-VN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function normalizeText(value) {
    return String(value || '').toLowerCase().trim();
}

function getDocumentFileName(doc) {
    return doc.fileName || doc.fileUrl?.split('/').pop() || doc.s3Key?.split('/').pop();
}

function getItemDate(item) {
    return item.recentAt || item.createdAt || item.uploadedAt || item.Created_At || item.Uploaded_At;
}

function sortByNewest(items) {
    return [...items].sort((a, b) => new Date(getItemDate(b) || 0) - new Date(getItemDate(a) || 0));
}

export default function LibraryPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'documents');
    const [documents, setDocuments] = useState([]);
    const [loadingDocs, setLoadingDocs] = useState(true);
    const [docError, setDocError] = useState(null);
    const [quizzes, setQuizzes] = useState([]);
    const [loadingQuizzes, setLoadingQuizzes] = useState(false);
    const [quizError, setQuizError] = useState(null);
    const [recentSessions, setRecentSessions] = useState([]);
    const [expandedQuizId, setExpandedQuizId] = useState(null);
    const [expandedQuestions, setExpandedQuestions] = useState([]);
    const [loadingQuestions, setLoadingQuestions] = useState(false);
    const [historySessionInfo, setHistorySessionInfo] = useState(location.state?.sourceSession || null);
    const [successMessage, setSuccessMessage] = useState(location.state?.successMessage || null);
    const autoExpandedRef = useRef(false);
    const [docPage, setDocPage] = useState(1);
    const [quizPage, setQuizPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCollection, setActiveCollection] = useState('created');
    const [activityFilter, setActivityFilter] = useState('all');
    const [openMenu, setOpenMenu] = useState(null);
    const [openShareMenu, setOpenShareMenu] = useState(null);
    const [filterOpen, setFilterOpen] = useState(false);

    useEffect(() => {
        fetchDocuments();
        fetchQuizzes();
        fetchRecentSessions();
    }, []);

    useEffect(() => {
        if (location.state?.activeTab) setActiveTab(location.state.activeTab);
        setHistorySessionInfo(location.state?.sourceSession || null);
        setSuccessMessage(location.state?.successMessage || null);
        autoExpandedRef.current = false;
    }, [location.state]);

    useEffect(() => {
        const targetQuizId = location.state?.targetQuizId;
        if (!targetQuizId || activeTab !== 'quizzes' || loadingQuizzes || quizzes.length === 0) return;
        if (!quizzes.some((quiz) => quiz.id === targetQuizId)) return;
        if (autoExpandedRef.current) return;
        autoExpandedRef.current = true;
        toggleExpandQuiz(targetQuizId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.state, activeTab, loadingQuizzes, quizzes]);

    async function fetchDocuments() {
        try {
            setLoadingDocs(true);
            setDocError(null);
            const data = await getMyDocuments();
            setDocuments(Array.isArray(data) ? data : []);
        } catch (err) {
            setDocError(err.message || 'Không thể tải tài liệu');
        } finally {
            setLoadingDocs(false);
        }
    }

    async function fetchQuizzes() {
        try {
            setLoadingQuizzes(true);
            setQuizError(null);
            const data = await getMyQuizzes();
            setQuizzes(Array.isArray(data) ? data : []);
        } catch (err) {
            setQuizError(err.message || 'Không thể tải bộ câu hỏi');
        } finally {
            setLoadingQuizzes(false);
        }
    }

    async function fetchRecentSessions() {
        try {
            const data = await getMySessions();
            setRecentSessions(Array.isArray(data) ? data : []);
        } catch {
            setRecentSessions([]);
        }
    }

    async function handleDeleteDoc(id) {
        if (!confirm('Bạn có chắc chắn muốn xóa tài liệu này?')) return;
        try {
            await deleteDocument(id);
            setDocuments((prev) => prev.filter((doc) => doc.id !== id));
        } catch (err) {
            alert(err.message || 'Xóa thất bại');
        }
    }

    async function handleDeleteQuiz(id) {
        if (!confirm('Bạn có chắc chắn muốn xóa bộ câu hỏi này?')) return;
        try {
            await deleteQuiz(id);
            setQuizzes((prev) => prev.filter((quiz) => quiz.id !== id));
            if (expandedQuizId === id) {
                setExpandedQuizId(null);
                setExpandedQuestions([]);
            }
        } catch (err) {
            alert(err.message || 'Xóa thất bại');
        }
    }

    function handlePlayQuiz(quiz) {
        const basePath = location.pathname.startsWith('/dev/teacher') ? '/dev/teacher' : '/teacher';
        navigate(`${basePath}/select-game-template`, {
            state: {
                quizId: quiz.id,
                quizTitle: quiz.title || `Quiz #${quiz.id}`,
                questionCount: quiz.questionCount ?? expandedQuestions.length ?? 0,
            },
        });
    }

    function handleCreateQuizFromDocument(doc) {
        const basePath = location.pathname.startsWith('/dev/teacher') ? '/dev/teacher' : '/teacher';
        navigate(`${basePath}/quiz-settings`, {
            state: {
                fileName: doc.title || getDocumentFileName(doc) || `Tài liệu #${doc.id}`,
                fileSize: doc.fileSize || null,
                documentId: doc.id,
                fileUrl: doc.presignedUrl || null,
                activityType: 'quiz',
            },
        });
    }

    async function toggleExpandQuiz(quizId) {
        if (expandedQuizId === quizId) {
            setExpandedQuizId(null);
            setExpandedQuestions([]);
            return;
        }

        setExpandedQuizId(quizId);
        setLoadingQuestions(true);
        try {
            const questions = await getQuizQuestions(quizId);
            setExpandedQuestions(Array.isArray(questions) ? questions : []);
        } catch {
            setExpandedQuestions([]);
        } finally {
            setLoadingQuestions(false);
        }
    }

    function getDocumentName(docId) {
        const doc = documents.find((item) => item.id === docId);
        return doc?.title || getDocumentFileName(doc) || `Tài liệu #${docId}`;
    }

    const collectionDocuments = useMemo(() => {
        if (activeCollection === 'previous') return [];
        return sortByNewest(documents);
    }, [activeCollection, documents]);

    const collectionQuizzes = useMemo(() => {
        if (activeCollection === 'previous') {
            const recentByQuizId = new Map();

            recentSessions.forEach((session) => {
                if (!session.quizId) return;
                const current = recentByQuizId.get(session.quizId);
                const sessionDate = getItemDate(session);
                if (!current || new Date(sessionDate || 0) > new Date(current.createdAt || 0)) {
                    recentByQuizId.set(session.quizId, {
                        createdAt: sessionDate,
                        session,
                    });
                }
            });

            return quizzes
                .filter((quiz) => recentByQuizId.has(quiz.id))
                .map((quiz) => ({
                    ...quiz,
                    recentSession: recentByQuizId.get(quiz.id)?.session,
                    recentAt: recentByQuizId.get(quiz.id)?.createdAt,
                }))
                .sort((a, b) => new Date(b.recentAt || 0) - new Date(a.recentAt || 0));
        }
        return sortByNewest(quizzes);
    }, [activeCollection, quizzes, recentSessions]);

    const filteredDocuments = useMemo(() => {
        const query = normalizeText(searchQuery);
        if (activityFilter === 'quizzes') return [];
        return collectionDocuments.filter((doc) => {
            const title = normalizeText(doc.title || getDocumentFileName(doc) || doc.fileUrl || doc.s3Key);
            return !query || title.includes(query);
        });
    }, [activityFilter, collectionDocuments, searchQuery]);

    const filteredQuizzes = useMemo(() => {
        const query = normalizeText(searchQuery);
        if (activityFilter === 'documents') return [];
        return collectionQuizzes.filter((quiz) => {
            const title = normalizeText(quiz.title || getDocumentName(quiz.documentId));
            return !query || title.includes(query);
        });
    }, [activityFilter, collectionQuizzes, searchQuery, documents]);

    const docTotalPages = Math.ceil(filteredDocuments.length / ITEMS_PER_PAGE);
    const quizTotalPages = Math.ceil(filteredQuizzes.length / ITEMS_PER_PAGE);
    const paginatedDocs = filteredDocuments.slice((docPage - 1) * ITEMS_PER_PAGE, docPage * ITEMS_PER_PAGE);
    const paginatedQuizzes = filteredQuizzes.slice((quizPage - 1) * ITEMS_PER_PAGE, quizPage * ITEMS_PER_PAGE);
    const activeFilterLabel = ACTIVITY_FILTERS.find((item) => item.id === activityFilter)?.label || 'Tất cả loại';
    const collectionCounts = {
        created: documents.length + quizzes.length,
        previous: new Set(recentSessions.map((session) => session.quizId).filter(Boolean)).size,
        all: documents.length + quizzes.length,
    };
    const collectionTitle = activeCollection === 'previous'
        ? 'Đã dùng gần đây'
        : activeCollection === 'all'
            ? 'Tất cả hoạt động'
            : 'Bài giảng đã tạo';

    function EmptyState({ icon: Icon, title, description, action }) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex min-h-[360px] flex-col items-center justify-center rounded-xl border border-dashed border-brand-light/70 bg-white/70 px-8 text-center"
            >
                <div className="mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-brand-light/30 text-brand-blue">
                    <Icon className="h-8 w-8" />
                </div>
                <h3 className="text-[18px] font-extrabold text-slate-800">{title}</h3>
                <p className="mt-2 max-w-md text-[15px] font-medium leading-7 text-slate-500">{description}</p>
                <div className="mt-6">{action}</div>
            </motion.div>
        );
    }

    function Pagination({ currentPage, totalPages, onPageChange }) {
        if (totalPages <= 1) return null;

        return (
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-all duration-200 hover:border-brand-mid hover:bg-brand-light/20 hover:text-brand-blue disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Trang trước"
                >
                    <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="min-w-[74px] text-center text-[14px] font-bold tabular-nums text-slate-600">
                    {currentPage} / {totalPages}
                </span>
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-all duration-200 hover:border-brand-mid hover:bg-brand-light/20 hover:text-brand-blue disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Trang sau"
                >
                    <ChevronRight className="h-5 w-5" />
                </button>
            </div>
        );
    }

    function PrimaryButton({ children, onClick }) {
        return (
            <button
                onClick={onClick}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand-blue px-5 text-[14px] font-extrabold text-white shadow-[0_12px_28px_rgba(43,122,181,0.24)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-navy hover:shadow-[0_18px_34px_rgba(27,58,107,0.28)] active:translate-y-0 active:scale-[0.99]"
            >
                {children}
            </button>
        );
    }

    function ActionMenu({ id, onDelete, onCreateQuiz, type }) {
        const isOpen = openMenu === id;
        return (
            <div className="relative">
                <button
                    onClick={() => {
                        setOpenShareMenu(null);
                        setOpenMenu(isOpen ? null : id);
                    }}
                    className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-all duration-200 hover:border-brand-mid hover:bg-brand-light/20 hover:text-brand-blue active:scale-95"
                    aria-label="Mở menu hành động"
                >
                    <MoreVertical className="h-5 w-5" />
                </button>
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -6, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -6, scale: 0.98 }}
                            transition={{ duration: 0.16 }}
                            className="absolute right-0 top-12 z-30 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-[0_18px_50px_rgba(15,23,42,0.14)]"
                        >
                            <MenuItem icon={Bookmark} label="Lưu" disabled title="TODO Backend: add bookmark/save API." />
                            <MenuItem
                                icon={Copy}
                                label={type === 'quiz' ? 'Nhân bản và sửa' : 'Tạo từ tài liệu'}
                                onClick={() => {
                                    setOpenMenu(null);
                                    onCreateQuiz?.();
                                }}
                            />
                            <MenuItem icon={Archive} label="Lưu trữ" disabled title="TODO Backend: add archive API." />
                            <button
                                onClick={() => {
                                    setOpenMenu(null);
                                    onDelete();
                                }}
                                className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-[15px] font-bold text-rose-600 transition-colors duration-150 hover:bg-rose-50"
                            >
                                <Trash2 className="h-4 w-4" />
                                Xóa
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    function ShareMenu({ id }) {
        const isOpen = openShareMenu === id;
        return (
            <div className="relative">
                {/* TODO Backend: add share endpoints before enabling this menu. */}
                <button
                    disabled
                    title="TODO Backend: cần API chia sẻ trước khi bật chức năng này."
                    onClick={() => {
                        setOpenMenu(null);
                        setOpenShareMenu(isOpen ? null : id);
                    }}
                    className="grid h-10 w-10 cursor-not-allowed place-items-center rounded-lg border border-slate-200 bg-slate-50 text-slate-300"
                    aria-label="Mở menu chia sẻ"
                >
                    <Share2 className="h-5 w-5" />
                </button>
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -6, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -6, scale: 0.98 }}
                            transition={{ duration: 0.16 }}
                            className="absolute right-0 top-12 z-30 w-60 rounded-xl border border-slate-200 bg-white p-2 shadow-[0_18px_50px_rgba(15,23,42,0.14)]"
                        >
                            <MenuItem icon={Users} label="Chia sẻ với giáo viên" />
                            <MenuItem icon={Share2} label="Chia sẻ với nhóm" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    function MenuItem({ icon: Icon, label, onClick, disabled = false, title }) {
        return (
            <button
                type="button"
                disabled={disabled}
                title={title}
                onClick={onClick}
                className={[
                    'flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-[15px] font-bold transition-colors duration-150',
                    disabled
                        ? 'cursor-not-allowed text-slate-300'
                        : 'text-slate-800 hover:bg-slate-50',
                ].join(' ')}
            >
                <Icon className={`h-4 w-4 ${disabled ? 'text-slate-300' : 'text-slate-700'}`} />
                {label}
            </button>
        );
    }

    function renderDocumentRow(doc, index) {
        const fileName = getDocumentFileName(doc);
        const title = doc.title || fileName || `Tài liệu #${doc.id}`;
        return (
            <motion.article
                key={doc.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: Math.min(index * 0.035, 0.18) }}
                className="group grid grid-cols-[minmax(0,1fr)] items-center gap-5 border-t border-slate-200/80 bg-white px-6 py-4 transition-all duration-200 hover:bg-brand-light/10 lg:grid-cols-[minmax(0,1fr)_180px_280px]"
            >
                <div className="flex min-w-0 items-center gap-4">
                    <div className="grid h-12 w-12 flex-none place-items-center rounded-lg border border-slate-200 bg-slate-50 text-brand-blue">
                        <FileText className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="truncate text-[16px] font-extrabold text-slate-900">{title}</h3>
                        <p className="mt-1 truncate text-[13px] font-semibold text-slate-500">
                            Tài liệu · Sẵn sàng tạo câu hỏi · {fileName || 'Mascoteach'}
                        </p>
                    </div>
                </div>
                <span className="hidden text-center text-[14px] font-semibold text-slate-500 lg:block">{formatDate(getItemDate(doc))}</span>
                <div className="flex w-full items-center justify-end gap-2">
                    <ShareMenu id={`doc-share-${doc.id}`} />
                    <button
                        type="button"
                        onClick={() => handleDeleteDoc(doc.id)}
                        className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-all duration-200 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                        aria-label={`Xóa ${title}`}
                    >
                        <Trash2 className="h-5 w-5" />
                    </button>
                    <ActionMenu
                        id={`doc-${doc.id}`}
                        type="document"
                        onCreateQuiz={() => handleCreateQuizFromDocument(doc)}
                        onDelete={() => handleDeleteDoc(doc.id)}
                    />
                </div>
            </motion.article>
        );
    }

    function renderQuizRow(quiz, index) {
        const isExpanded = expandedQuizId === quiz.id;
        const statusLabel = quiz.status === 'AI_Drafted' ? 'Bản nháp' : quiz.status === 'Teacher_Approved' || quiz.status === 'Published' ? 'Đã duyệt' : 'Bản nháp';
        const title = quiz.title || `Quiz #${quiz.id}`;
        const frontendActivityType = toFrontendActivityType(quiz.activityType);
        const isFlashcards = frontendActivityType === 'flashcards';
        const QuizIcon = isFlashcards ? Layers : BookOpen;

        return (
            <motion.article
                key={quiz.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: Math.min(index * 0.035, 0.18) }}
                className="overflow-visible border-t border-slate-200/80 bg-white transition-all duration-200 hover:bg-brand-light/10"
            >
                <div className="group grid grid-cols-[minmax(0,1fr)] items-center gap-5 px-6 py-4 lg:grid-cols-[minmax(0,1fr)_180px_260px]">
                    <button onClick={() => toggleExpandQuiz(quiz.id)} className="flex min-w-0 items-center gap-4 text-left">
                        <div className={`grid h-12 w-12 flex-none place-items-center rounded-lg border transition-colors duration-200 ${isExpanded ? 'border-brand-mid bg-brand-light/30 text-brand-navy' : 'border-slate-200 bg-slate-50 text-brand-blue'}`}>
                            <QuizIcon className="h-6 w-6" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex min-w-0 flex-wrap items-center gap-2">
                                <h3 className="truncate text-[16px] font-extrabold text-slate-900">{title}</h3>
                                <span className="rounded-md border border-brand-light bg-brand-light/25 px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-brand-navy">
                                    {isFlashcards ? 'Flashcard' : 'Quiz'}
                                </span>
                                <span className="rounded-md border border-brand-light bg-brand-light/25 px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-brand-navy">
                                    {statusLabel}
                                </span>
                            </div>
                            <p className="mt-1 truncate text-[13px] font-semibold text-slate-500">
                                {quiz.questionCount ?? expandedQuestions.length ?? 0} câu hỏi · {quiz.recentSession ? 'Đã dùng gần đây' : getDocumentName(quiz.documentId)}
                            </p>
                        </div>
                    </button>
                    <span className="hidden text-center text-[14px] font-semibold text-slate-500 lg:block">{formatDate(getItemDate(quiz))}</span>
                    <div className="flex w-full items-center justify-end gap-2">
                        <button
                            onClick={() => handlePlayQuiz(quiz)}
                            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-[14px] font-bold text-slate-900 transition-all duration-200 hover:border-brand-mid hover:bg-brand-light/20 hover:text-brand-blue"
                        >
                            <Play className="h-4 w-4" />
                            Chơi
                        </button>
                        <button
                            onClick={() => toggleExpandQuiz(quiz.id)}
                            className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-all duration-200 hover:border-brand-mid hover:bg-brand-light/20 hover:text-brand-blue"
                            aria-label={isExpanded ? 'Ẩn câu hỏi' : 'Xem câu hỏi'}
                        >
                            {isExpanded ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                        <ShareMenu id={`quiz-share-${quiz.id}`} />
                        <ActionMenu id={`quiz-${quiz.id}`} type="quiz" onDelete={() => handleDeleteQuiz(quiz.id)} />
                    </div>
                </div>

                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                            className="overflow-hidden"
                        >
                            <div className="border-t border-slate-100 bg-[#f7fbff] px-6 py-5">
                                {loadingQuestions && (
                                    <div className="flex justify-center py-8 text-[15px] font-semibold text-slate-500">
                                        <Loader2 className="mr-3 h-6 w-6 animate-spin text-brand-blue" />
                                        Đang tải câu hỏi...
                                    </div>
                                )}
                                {!loadingQuestions && expandedQuestions.length === 0 && (
                                    <p className="py-8 text-center text-[15px] font-semibold text-slate-500">Chưa có câu hỏi trong bộ này</p>
                                )}
                                {!loadingQuestions && expandedQuestions.length > 0 && (
                                    <div className="grid gap-3">
                                        {expandedQuestions.map((question, qIdx) => (
                                            <div key={question.id} className="rounded-xl border border-slate-200 bg-white p-4">
                                                <div className="flex items-start gap-3">
                                                    <span className="grid h-8 w-8 flex-none place-items-center rounded-lg bg-brand-blue text-[13px] font-extrabold text-white">{qIdx + 1}</span>
                                                    <p className="text-[15px] font-bold leading-7 text-slate-800">{question.questionText}</p>
                                                </div>
                                                {question.options?.length > 0 && (
                                                    <div className="mt-4 grid gap-2 pl-11 md:grid-cols-2">
                                                        {question.options.map((opt, optIdx) => (
                                                            <div
                                                                key={opt.id || optIdx}
                                                                className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-[14px] font-semibold ${
                                                                    opt.isCorrect
                                                                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                                                        : 'border-slate-200 bg-white text-slate-600'
                                                                }`}
                                                            >
                                                                <span className={`grid h-5 w-5 flex-none place-items-center rounded-full border ${opt.isCorrect ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'}`}>
                                                                    {opt.isCorrect && <CheckCircle2 className="h-4 w-4 text-white" />}
                                                                </span>
                                                                {opt.optionText}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                <div className="mt-4 flex items-center gap-2 pl-11 text-[13px] font-semibold text-slate-500">
                                                    <HelpCircle className="h-4 w-4" />
                                                    {expandedQuestions.length} câu hỏi trong bộ
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.article>
        );
    }

    const isDocuments = activeTab === 'documents';
    const activeCount = isDocuments ? filteredDocuments.length : filteredQuizzes.length;

    return (
        <>
            <div className="flex min-h-screen bg-[#fbfdff] text-slate-900">
                <motion.aside
                    initial={{ opacity: 0, x: -18, scale: 0.985 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                    className="hidden w-[244px] shrink-0 border-r border-slate-200/80 bg-white px-4 py-5 lg:flex lg:flex-col"
                >
                    <div className="px-2">
                        <h1 className="text-[21px] font-extrabold text-slate-950">Thư viện</h1>
                        <p className="mt-1 text-[13px] font-semibold text-slate-500">Quản lý bài giảng lớp học</p>
                    </div>

                    <nav className="mt-6 space-y-1">
                        {COLLECTIONS.map((item) => {
                            const Icon = item.icon;
                            const isActive = item.id === activeCollection;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        setActiveCollection(item.id);
                                        setDocPage(1);
                                        setQuizPage(1);
                                        setFilterOpen(false);
                                    }}
                                    className={`flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-[15px] font-bold transition-all duration-200 ${
                                        isActive
                                            ? 'bg-brand-light/25 text-brand-navy'
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                                    }`}
                                >
                                    <span className="flex items-center gap-3">
                                        <Icon className="h-5 w-5" />
                                        {item.label}
                                    </span>
                                    <span className="text-[13px] text-slate-500">{collectionCounts[item.id]}</span>
                                </button>
                            );
                        })}
                    </nav>

                    <div className="mt-auto px-2 pb-1 pt-8">
                        <p className="text-[13px] font-extrabold text-slate-800">{documents.length + quizzes.length}/20 nội dung đã tạo</p>
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full rounded-full bg-brand-blue" style={{ width: `${Math.min(((documents.length + quizzes.length) / 20) * 100, 100)}%` }} />
                        </div>
                    </div>
                </motion.aside>

                <main className="min-w-0 flex-1">
                    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur-xl sm:px-6">
                        <div className="flex items-center gap-3">
                            <div className="relative flex-1">
                                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                                <input
                                    value={searchQuery}
                                    onChange={(event) => {
                                        setSearchQuery(event.target.value);
                                        setDocPage(1);
                                        setQuizPage(1);
                                    }}
                                    placeholder="Tìm theo tên bài giảng hoặc bộ câu hỏi"
                                    className="h-12 w-full rounded-full border border-slate-200 bg-white pl-12 pr-12 text-[15px] font-semibold text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-brand-light focus:border-brand-mid focus:ring-4 focus:ring-brand-light/30"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                                        aria-label="Xóa tìm kiếm"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </header>

                    <section className="mx-auto w-full max-w-[1180px] px-4 py-8 sm:px-8">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <h2 className="text-[28px] font-extrabold leading-tight text-slate-950 sm:text-[32px]">{collectionTitle}</h2>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="relative">
                                    <button
                                        onClick={() => setFilterOpen((value) => !value)}
                                        className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-[14px] font-extrabold text-slate-800 shadow-sm transition-all duration-200 hover:border-brand-mid hover:bg-brand-light/20"
                                    >
                                        {activeFilterLabel}
                                        <ChevronDown className="h-4 w-4" />
                                    </button>
                                    <AnimatePresence>
                                        {filterOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                                                transition={{ duration: 0.16 }}
                                                className="absolute right-0 top-[52px] z-30 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-[0_18px_50px_rgba(15,23,42,0.14)]"
                                            >
                                                {ACTIVITY_FILTERS.map((item) => (
                                                    <button
                                                        key={item.id}
                                                        onClick={() => {
                                                            setActivityFilter(item.id);
                                                            setFilterOpen(false);
                                                            setDocPage(1);
                                                            setQuizPage(1);
                                                        }}
                                                        className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-[15px] font-bold text-slate-800 transition-colors duration-150 hover:bg-slate-50"
                                                    >
                                                        <span className={`grid h-5 w-5 place-items-center rounded border ${activityFilter === item.id ? 'border-brand-blue bg-brand-blue' : 'border-slate-300'}`}>
                                                            {activityFilter === item.id && <CheckCircle2 className="h-4 w-4 text-white" />}
                                                        </span>
                                                        {item.label}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                                <PrimaryButton onClick={() => setShowCreateModal(true)}>
                                    <Plus className="h-4 w-4" />
                                    Thêm
                                </PrimaryButton>
                            </div>
                        </div>

                        <div className="mt-8 flex items-center gap-3">
                            {[
                                { id: 'documents', label: 'Tài liệu', count: filteredDocuments.length },
                                { id: 'quizzes', label: 'Bộ câu hỏi', count: filteredQuizzes.length },
                            ].map((tab) => {
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`relative h-12 rounded-full px-5 text-[15px] font-extrabold transition-all duration-200 ${
                                            isActive
                                                ? 'bg-white text-brand-navy shadow-[0_10px_28px_rgba(15,23,42,0.09)] ring-1 ring-slate-200'
                                                : 'text-slate-500 hover:bg-white/70 hover:text-slate-900'
                                        }`}
                                    >
                                        {tab.label} ({tab.count})
                                    </button>
                                );
                            })}
                        </div>

                        {successMessage && (
                            <div className="mt-5 flex items-start justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                                <div>
                                    <p className="text-[15px] font-extrabold text-emerald-800">Quiz đã sẵn sàng</p>
                                    <p className="mt-1 text-[14px] font-semibold text-emerald-700">{successMessage}</p>
                                </div>
                                <button onClick={() => setSuccessMessage(null)} className="text-[14px] font-bold text-emerald-700 hover:text-emerald-900">Đóng</button>
                            </div>
                        )}

                        {historySessionInfo && (
                            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-light bg-brand-light/20 px-4 py-3">
                                <div>
                                    <p className="text-[15px] font-extrabold text-brand-navy">Đang xem lại bộ câu hỏi từ {historySessionInfo.title}</p>
                                    <p className="mt-1 text-[14px] font-semibold text-brand-blue">Mở quiz để xem câu hỏi và tạo game lại.</p>
                                </div>
                                {expandedQuizId && (
                                    <button
                                        onClick={() => {
                                            const targetQuiz = quizzes.find((quiz) => quiz.id === expandedQuizId);
                                            if (targetQuiz) handlePlayQuiz(targetQuiz);
                                        }}
                                        className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand-blue px-4 text-[14px] font-extrabold text-white transition-all duration-200 hover:bg-brand-navy"
                                    >
                                        <Gamepad2 className="h-4 w-4" />
                                        Chơi lại
                                    </button>
                                )}
                            </div>
                        )}

                        <div className="mt-6 overflow-visible rounded-xl border border-slate-200 bg-white shadow-[0_18px_46px_rgba(15,23,42,0.05)]">
                            <div className="grid grid-cols-[minmax(0,1fr)] items-center gap-5 px-6 py-4 text-[13px] font-extrabold uppercase tracking-[0.08em] text-slate-500 lg:grid-cols-[minmax(0,1fr)_180px_260px]">
                                <span>Chi tiết nội dung</span>
                                <span className="hidden text-center lg:block">Ngày tạo</span>
                                <span className="hidden text-center lg:block">Thao tác</span>
                            </div>

                            {isDocuments && loadingDocs && <LoadingRows label="Đang tải tài liệu..." />}
                            {!isDocuments && (loadingDocs || loadingQuizzes) && <LoadingRows label="Đang tải bộ câu hỏi..." />}

                            {isDocuments && !loadingDocs && docError && (
                                <ErrorState message={docError} onRetry={fetchDocuments} />
                            )}
                            {!isDocuments && !loadingDocs && !loadingQuizzes && quizError && (
                                <ErrorState message={quizError} onRetry={fetchQuizzes} />
                            )}

                            {isDocuments && !loadingDocs && !docError && paginatedDocs.map((doc, index) => renderDocumentRow(doc, index))}

                            {!isDocuments && !loadingDocs && !loadingQuizzes && !quizError && paginatedQuizzes.map((quiz, index) => renderQuizRow(quiz, index))}
                        </div>

                        {isDocuments && !loadingDocs && !docError && filteredDocuments.length === 0 && (
                            <div className="mt-6">
                                <EmptyState
                                    icon={FileText}
                                    title="Chưa có tài liệu phù hợp"
                                    description="Tải lên tài liệu bài giảng, Mascoteach sẽ hỗ trợ tạo câu hỏi và hoạt động từ nội dung đó."
                                    action={<PrimaryButton onClick={() => setShowCreateModal(true)}><Plus className="h-4 w-4" />Tải lên tài liệu</PrimaryButton>}
                                />
                            </div>
                        )}

                        {!isDocuments && !loadingDocs && !loadingQuizzes && !quizError && filteredQuizzes.length === 0 && (
                            <div className="mt-6">
                                <EmptyState
                                    icon={BookOpen}
                                    title="Chưa có bộ câu hỏi phù hợp"
                                    description="Tạo bộ câu hỏi từ tài liệu để chuẩn bị game, kiểm tra nhanh hoặc hoạt động trên lớp."
                                    action={<PrimaryButton onClick={() => setShowCreateModal(true)}><Plus className="h-4 w-4" />Tạo bộ câu hỏi</PrimaryButton>}
                                />
                            </div>
                        )}

                        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-[14px] font-semibold text-slate-500">
                                Đang hiển thị {activeCount === 0 ? 0 : (isDocuments ? (docPage - 1) : (quizPage - 1)) * ITEMS_PER_PAGE + 1}
                                -{Math.min((isDocuments ? docPage : quizPage) * ITEMS_PER_PAGE, activeCount)} / {activeCount} nội dung
                            </p>
                            {isDocuments ? (
                                <Pagination currentPage={docPage} totalPages={docTotalPages} onPageChange={setDocPage} />
                            ) : (
                                <Pagination currentPage={quizPage} totalPages={quizTotalPages} onPageChange={setQuizPage} />
                            )}
                        </div>
                    </section>
                </main>
            </div>

            {showCreateModal && <CreateFlowModal onClose={() => setShowCreateModal(false)} />}
        </>
    );
}

function LoadingRows({ label }) {
    return (
        <div className="border-t border-slate-200 px-6 py-12">
            <div className="mb-6 flex items-center justify-center text-[15px] font-bold text-slate-500">
                <Loader2 className="mr-3 h-6 w-6 animate-spin text-brand-blue" />
                {label}
            </div>
            <div className="space-y-3">
                {[0, 1, 2].map((item) => (
                    <div key={item} className="h-16 animate-pulse rounded-lg bg-slate-100" />
                ))}
            </div>
        </div>
    );
}

function ErrorState({ message, onRetry }) {
    return (
        <div className="border-t border-slate-200 px-6 py-12 text-center">
            <AlertCircle className="mx-auto mb-3 h-10 w-10 text-rose-400" />
            <p className="text-[15px] font-bold text-slate-700">{message}</p>
            <button
                onClick={onRetry}
                className="mt-4 rounded-lg bg-brand-light/30 px-5 py-2.5 text-[14px] font-extrabold text-brand-blue transition-colors duration-200 hover:bg-brand-light/50"
            >
                Thử lại
            </button>
        </div>
    );
}
