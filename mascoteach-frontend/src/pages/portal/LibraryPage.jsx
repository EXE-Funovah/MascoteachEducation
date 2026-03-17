import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    AlertCircle,
    BookOpen,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Edit3,
    Eye,
    EyeOff,
    FileText,
    Gamepad2,
    HelpCircle,
    Loader2,
    Plus,
    Trash2,
} from 'lucide-react';
import CreateFlowModal from '@/components/portal/create/CreateFlowModal';
import { getMyDocuments, deleteDocument } from '@/services/documentService';
import { getQuizzesByDocuments, deleteQuiz } from '@/services/quizService';
import { getQuestionsByQuiz } from '@/services/questionService';

const ITEMS_PER_PAGE = 10;

const LIBRARY_TABS = [
    { id: 'documents', label: 'Tài liệu', icon: FileText },
    { id: 'quizzes', label: 'Bộ câu hỏi', icon: BookOpen },
];

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
    const [expandedQuizId, setExpandedQuizId] = useState(null);
    const [expandedQuestions, setExpandedQuestions] = useState([]);
    const [loadingQuestions, setLoadingQuestions] = useState(false);
    const [historySessionInfo, setHistorySessionInfo] = useState(location.state?.sourceSession || null);
    const [successMessage, setSuccessMessage] = useState(location.state?.successMessage || null);
    const autoExpandedRef = useRef(false);
    const [docPage, setDocPage] = useState(1);
    const [quizPage, setQuizPage] = useState(1);

    useEffect(() => {
        fetchDocuments();
    }, []);

    useEffect(() => {
        if (location.state?.activeTab) setActiveTab(location.state.activeTab);
        setHistorySessionInfo(location.state?.sourceSession || null);
        setSuccessMessage(location.state?.successMessage || null);
        // Reset auto-expand flag when navigation state changes (new publish)
        autoExpandedRef.current = false;
    }, [location.state]);

    useEffect(() => {
        if (documents.length > 0 && quizzes.length === 0 && !loadingQuizzes) {
            fetchQuizzes();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [documents]);

    useEffect(() => {
        const targetQuizId = location.state?.targetQuizId;
        if (!targetQuizId || activeTab !== 'quizzes' || loadingQuizzes || quizzes.length === 0) return;
        if (!quizzes.some((quiz) => quiz.id === targetQuizId)) return;
        // Only auto-expand once per navigation; prevents re-expanding after user collapses
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
            const data = await getQuizzesByDocuments(documents);
            setQuizzes(Array.isArray(data) ? data : []);
        } catch (err) {
            setQuizError(err.message || 'Không thể tải bộ câu hỏi');
        } finally {
            setLoadingQuizzes(false);
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
        navigate('/teacher/select-game-template', {
            state: {
                quizId: quiz.id,
                quizTitle: quiz.title || `Quiz #${quiz.id}`,
                questionCount: quiz.questionCount ?? expandedQuestions.length ?? 0,
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
            const questions = await getQuestionsByQuiz(quizId);
            setExpandedQuestions(Array.isArray(questions) ? questions : []);
        } catch {
            setExpandedQuestions([]);
        } finally {
            setLoadingQuestions(false);
        }
    }

    function getDocumentName(docId) {
        const doc = documents.find((item) => item.id === docId);
        return doc?.title || doc?.fileName || doc?.fileUrl?.split('/').pop() || `Tài liệu #${docId}`;
    }

    function EmptyState({ icon: Icon, title, description, action }) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50">
                    <Icon className="h-7 w-7 text-slate-300" />
                </div>
                <h3 className="mb-1 text-[14px] font-medium text-slate-500">{title}</h3>
                <p className="mb-4 text-[13px] text-slate-400">{description}</p>
                {action}
            </div>
        );
    }

    // Pagination helpers
    const totalDocPages = Math.ceil(documents.length / ITEMS_PER_PAGE);
    const paginatedDocs = documents.slice((docPage - 1) * ITEMS_PER_PAGE, docPage * ITEMS_PER_PAGE);
    const totalQuizPages = Math.ceil(quizzes.length / ITEMS_PER_PAGE);
    const paginatedQuizzes = quizzes.slice((quizPage - 1) * ITEMS_PER_PAGE, quizPage * ITEMS_PER_PAGE);

    function Pagination({ currentPage, totalPages, onPageChange }) {
        if (totalPages <= 1) return null;

        const pages = [];
        const maxVisible = 5;
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);
        if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);

        for (let i = start; i <= end; i++) pages.push(i);

        return (
            <div className="mt-6 flex items-center justify-center gap-1.5">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200/80 bg-white text-slate-400 transition-all duration-200 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200/80 disabled:hover:bg-white disabled:hover:text-slate-400"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>

                {start > 1 && (
                    <>
                        <button onClick={() => onPageChange(1)} className="flex h-8 min-w-[32px] items-center justify-center rounded-lg border border-slate-200/80 bg-white px-2 text-[12px] font-medium text-slate-500 transition-all duration-200 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-600">1</button>
                        {start > 2 && <span className="px-1 text-[12px] text-slate-300">…</span>}
                    </>
                )}

                {pages.map((page) => (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`flex h-8 min-w-[32px] items-center justify-center rounded-lg px-2 text-[12px] font-medium transition-all duration-200 ${page === currentPage
                                ? 'border border-sky-500 bg-sky-500 text-white shadow-sm'
                                : 'border border-slate-200/80 bg-white text-slate-500 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-600'
                            }`}
                    >
                        {page}
                    </button>
                ))}

                {end < totalPages && (
                    <>
                        {end < totalPages - 1 && <span className="px-1 text-[12px] text-slate-300">…</span>}
                        <button onClick={() => onPageChange(totalPages)} className="flex h-8 min-w-[32px] items-center justify-center rounded-lg border border-slate-200/80 bg-white px-2 text-[12px] font-medium text-slate-500 transition-all duration-200 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-600">{totalPages}</button>
                    </>
                )}

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200/80 bg-white text-slate-400 transition-all duration-200 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200/80 disabled:hover:bg-white disabled:hover:text-slate-400"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-8">
                <header className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Thư viện</h1>
                        <p className="mt-1 text-sm text-slate-400">Quản lý tất cả tài liệu và tài nguyên của bạn</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-sky-600 hover:shadow-md"
                    >
                        <Plus className="h-4 w-4" />
                        Thêm tài nguyên
                    </button>
                </header>

                <div className="flex items-center gap-1 border-b border-slate-100">
                    {LIBRARY_TABS.map((tab) => {
                        const isActive = activeTab === tab.id;
                        const count = tab.id === 'documents' ? documents.length : quizzes.length;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-3 text-[13px] font-medium transition-all duration-200 ${isActive ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                            >
                                <tab.icon className="h-4 w-4" />
                                {tab.label}
                                <span className={`ml-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-md px-1.5 text-[11px] font-semibold ${isActive ? 'bg-sky-100 text-sky-600' : 'bg-slate-100 text-slate-400'}`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {activeTab === 'documents' && (
                    <>
                        {loadingDocs && <div className="flex justify-center py-20 text-sm text-slate-400"><Loader2 className="mr-3 h-6 w-6 animate-spin text-sky-500" />Đang tải tài liệu...</div>}
                        {!loadingDocs && docError && <div className="flex flex-col items-center py-20 text-center"><AlertCircle className="mb-3 h-10 w-10 text-slate-300" /><p className="mb-4 text-sm text-slate-500">{docError}</p><button onClick={fetchDocuments} className="rounded-lg bg-sky-50 px-4 py-2 text-sm font-medium text-sky-600 hover:bg-sky-100">Thử lại</button></div>}
                        {!loadingDocs && !docError && documents.length === 0 && (
                            <EmptyState
                                icon={FileText}
                                title="Chưa có tài nguyên nào"
                                description="Bắt đầu bằng cách tải lên tài liệu mới"
                                action={<button onClick={() => setShowCreateModal(true)} className="rounded-xl bg-sky-500 px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-sky-600">Tải lên tài liệu</button>}
                            />
                        )}
                        {!loadingDocs && !docError && documents.length > 0 && (
                            <>
                                <div className="space-y-2">
                                    {paginatedDocs.map((doc) => (
                                        <article key={doc.id} className="group flex items-center justify-between rounded-xl border border-slate-100/80 bg-white p-5 transition-all duration-200 hover:border-slate-200 hover:bg-slate-50/30">
                                            <div className="flex min-w-0 flex-1 items-center gap-4">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-50"><FileText className="h-[18px] w-[18px] text-sky-500" /></div>
                                                <div className="min-w-0">
                                                    <h3 className="truncate text-[14px] font-medium text-slate-700 transition-colors group-hover:text-slate-800">
                                                        {doc.title || doc.fileName || doc.fileUrl?.split('/').pop() || `Tài liệu #${doc.id}`}
                                                    </h3>
                                                    <div className="mt-1.5 flex items-center gap-3">
                                                        {doc.fileUrl && <span className="max-w-[200px] truncate text-[12px] text-slate-400">{doc.fileUrl.split('/').pop()}</span>}
                                                        {doc.isDeleted && <span className="inline-flex items-center rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-500">Đã xóa</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="ml-4 flex shrink-0 items-center gap-3">
                                                {doc.createdAt && <span className="hidden text-[12px] text-slate-400 sm:block">{new Date(doc.createdAt).toLocaleDateString('vi-VN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                                                <button className="flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-white px-3.5 py-2 text-[12px] font-medium text-slate-500 transition-all duration-200 hover:border-sky-300 hover:bg-sky-50/50 hover:text-sky-600"><Edit3 className="h-3.5 w-3.5" />Chỉnh sửa</button>
                                                <button onClick={() => handleDeleteDoc(doc.id)} className="flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-white px-3 py-2 text-[12px] font-medium text-slate-400 transition-all duration-200 hover:border-rose-300 hover:bg-rose-50/50 hover:text-rose-500" aria-label="Xóa tài liệu"><Trash2 className="h-3.5 w-3.5" /></button>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-[12px] text-slate-400">
                                        Hiển thị {(docPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(docPage * ITEMS_PER_PAGE, documents.length)} / {documents.length} tài liệu
                                    </p>
                                    <Pagination currentPage={docPage} totalPages={totalDocPages} onPageChange={setDocPage} />
                                </div>
                            </>
                        )}
                    </>
                )}

                {activeTab === 'quizzes' && (
                    <>
                        {successMessage && <div className="flex items-start justify-between gap-3 rounded-xl border border-emerald-100 bg-emerald-50/80 px-4 py-3"><div><p className="text-[13px] font-semibold text-emerald-700">Quiz của bạn đã sẵn sàng</p><p className="text-[12px] text-emerald-700/80">{successMessage}</p></div><button onClick={() => setSuccessMessage(null)} className="text-[12px] font-medium text-emerald-700/70 hover:text-emerald-700">Đóng</button></div>}
                        {historySessionInfo && <div className="flex items-center justify-between gap-3 rounded-xl border border-sky-100 bg-sky-50/70 px-4 py-3"><div><p className="text-[13px] font-semibold text-sky-700">Đang xem lại bộ câu hỏi từ {historySessionInfo.title}</p><p className="text-[12px] text-sky-600/80">Quiz sẽ tự mở ra để xem lại câu hỏi và có thể tạo game lại.</p></div>{expandedQuizId && <button onClick={() => { const targetQuiz = quizzes.find((quiz) => quiz.id === expandedQuizId); if (targetQuiz) handlePlayQuiz(targetQuiz); }} className="flex items-center gap-1.5 rounded-lg bg-violet-500 px-3.5 py-2 text-[12px] font-semibold text-white transition-all duration-200 hover:bg-violet-600"><Gamepad2 className="h-3.5 w-3.5" />Chơi lại</button>}</div>}
                        {(loadingQuizzes || loadingDocs) && <div className="flex justify-center py-20 text-sm text-slate-400"><Loader2 className="mr-3 h-6 w-6 animate-spin text-sky-500" />Đang tải bộ câu hỏi...</div>}
                        {!loadingQuizzes && !loadingDocs && quizError && <div className="flex flex-col items-center py-20 text-center"><AlertCircle className="mb-3 h-10 w-10 text-slate-300" /><p className="mb-4 text-sm text-slate-500">{quizError}</p><button onClick={fetchQuizzes} className="rounded-lg bg-sky-50 px-4 py-2 text-sm font-medium text-sky-600 hover:bg-sky-100">Thử lại</button></div>}
                        {!loadingQuizzes && !loadingDocs && !quizError && quizzes.length === 0 && (
                            <EmptyState
                                icon={BookOpen}
                                title="Chưa có bộ câu hỏi nào"
                                description="Tải tài liệu và tạo câu hỏi từ AI để bắt đầu"
                                action={<button onClick={() => setShowCreateModal(true)} className="rounded-xl bg-sky-500 px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-sky-600">Tạo bộ câu hỏi</button>}
                            />
                        )}
                        {!loadingQuizzes && !loadingDocs && !quizError && quizzes.length > 0 && (
                            <>
                                <div className="space-y-3">
                                    <AnimatePresence>
                                        {paginatedQuizzes.map((quiz) => {
                                            const isExpanded = expandedQuizId === quiz.id;
                                            const statusLabel = quiz.status === 'AI_Drafted' ? 'AI Nháp' : quiz.status === 'Teacher_Approved' ? 'Teacher Approved' : quiz.status || 'Nháp';
                                            const statusClass = quiz.status === 'AI_Drafted'
                                                ? 'bg-amber-50 text-amber-600 border border-amber-100'
                                                : quiz.status === 'Teacher_Approved' || quiz.status === 'Published'
                                                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                    : 'bg-slate-50 text-slate-500 border border-slate-100';

                                            return (
                                                <motion.div key={quiz.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8, scale: 0.95 }} transition={{ duration: 0.2 }} className="overflow-hidden rounded-xl border border-slate-100/80 bg-white transition-all duration-200 hover:border-slate-200">
                                                    <div className="flex items-center justify-between p-5">
                                                        <div className="flex min-w-0 flex-1 cursor-pointer items-center gap-4" onClick={() => toggleExpandQuiz(quiz.id)}>
                                                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${isExpanded ? 'bg-sky-100' : 'bg-violet-50'}`}><BookOpen className={`h-[18px] w-[18px] ${isExpanded ? 'text-sky-600' : 'text-violet-500'}`} /></div>
                                                            <div className="min-w-0">
                                                                <h3 className="truncate text-[14px] font-medium text-slate-700">{quiz.title || `Quiz #${quiz.id}`}</h3>
                                                                <div className="mt-1 flex items-center gap-3">
                                                                    <span className="text-[11px] text-slate-400">{getDocumentName(quiz.documentId)}</span>
                                                                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold ${statusClass}`}>{statusLabel}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="ml-4 flex shrink-0 items-center gap-3">
                                                            {quiz.createdAt && <span className="hidden text-[12px] text-slate-400 sm:block">{new Date(quiz.createdAt).toLocaleDateString('vi-VN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                                                            <button onClick={() => toggleExpandQuiz(quiz.id)} className="flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-white px-3 py-2 text-[12px] font-medium text-slate-500 transition-all duration-200 hover:border-sky-300 hover:bg-sky-50/50 hover:text-sky-600">{isExpanded ? <><EyeOff className="h-3.5 w-3.5" />Ẩn</> : <><Eye className="h-3.5 w-3.5" />Xem</>}</button>
                                                            <button onClick={() => handlePlayQuiz(quiz)} className="flex items-center gap-1.5 rounded-lg bg-violet-500 px-3.5 py-2 text-[12px] font-semibold text-white shadow-sm transition-all duration-200 hover:bg-violet-600 hover:shadow-md"><Gamepad2 className="h-3.5 w-3.5" />Chơi ngay</button>
                                                            <button onClick={() => handleDeleteQuiz(quiz.id)} className="flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-white px-3 py-2 text-[12px] font-medium text-slate-400 transition-all duration-200 hover:border-rose-300 hover:bg-rose-50/50 hover:text-rose-500" aria-label="Xóa bộ câu hỏi"><Trash2 className="h-3.5 w-3.5" /></button>
                                                        </div>
                                                    </div>
                                                    <AnimatePresence>
                                                        {isExpanded && (
                                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: 'easeInOut' }} className="overflow-hidden">
                                                                <div className="border-t border-slate-100 bg-slate-50/30 px-5 py-4">
                                                                    {loadingQuestions && <div className="flex justify-center py-6 text-[12px] text-slate-400"><Loader2 className="mr-2 h-5 w-5 animate-spin text-sky-500" />Đang tải câu hỏi...</div>}
                                                                    {!loadingQuestions && expandedQuestions.length === 0 && <p className="py-6 text-center text-[13px] text-slate-400">Chưa có câu hỏi nào trong bộ câu hỏi này</p>}
                                                                    {!loadingQuestions && expandedQuestions.length > 0 && (
                                                                        <div className="space-y-3">
                                                                            {expandedQuestions.map((question, qIdx) => (
                                                                                <div key={question.id} className="rounded-lg border border-slate-100 bg-white p-4">
                                                                                    <div className="mb-3 flex items-start gap-3">
                                                                                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-violet-50 text-[11px] font-bold text-violet-500">{qIdx + 1}</span>
                                                                                        <p className="text-[13px] font-medium leading-relaxed text-slate-700">{question.questionText}</p>
                                                                                    </div>
                                                                                    {question.options?.length > 0 && <div className="ml-9 grid grid-cols-2 gap-2">{question.options.map((opt, optIdx) => <div key={opt.id || optIdx} className={`flex items-center gap-2 rounded-md border px-3 py-2 text-[12px] ${opt.isCorrect ? 'border-emerald-200 bg-emerald-50/60 font-medium text-emerald-700' : 'border-slate-100 bg-white text-slate-600'}`}><div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${opt.isCorrect ? 'border-emerald-400 bg-emerald-400' : 'border-slate-300 bg-white'}`}>{opt.isCorrect && <CheckCircle2 className="h-3 w-3 text-white" />}</div><span>{opt.optionText}</span></div>)}</div>}
                                                                                </div>
                                                                            ))}
                                                                            <div className="flex items-center gap-4 pt-2 text-[11px] text-slate-400"><span className="flex items-center gap-1"><HelpCircle className="h-3 w-3" />{expandedQuestions.length} câu hỏi</span></div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </motion.div>
                                            );
                                        })}
                                    </AnimatePresence>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-[12px] text-slate-400">
                                        Hiển thị {(quizPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(quizPage * ITEMS_PER_PAGE, quizzes.length)} / {quizzes.length} bộ câu hỏi
                                    </p>
                                    <Pagination currentPage={quizPage} totalPages={totalQuizPages} onPageChange={setQuizPage} />
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>

            {showCreateModal && <CreateFlowModal onClose={() => { setShowCreateModal(false); fetchDocuments(); }} />}
        </>
    );
}
