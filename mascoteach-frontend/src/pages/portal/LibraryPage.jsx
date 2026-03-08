import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, Edit3, Plus, Loader2, AlertCircle, Trash2,
    BookOpen, ChevronDown, ChevronRight, CheckCircle2,
    Clock, HelpCircle, Eye, EyeOff
} from 'lucide-react';
import CreateFlowModal from '@/components/portal/create/CreateFlowModal';
import { getMyDocuments, deleteDocument } from '@/services/documentService';
import { getQuizzesByDocuments, deleteQuiz } from '@/services/quizService';
import { getQuestionsByQuiz } from '@/services/questionService';

/**
 * LibraryPage — "Thư viện của tôi" — Main resource management
 * Two tabs:
 *   1. "Tài liệu" — uploaded documents
 *   2. "Bộ câu hỏi" — saved quizzes (from AI generation / publish)
 */

const LIBRARY_TABS = [
    { id: 'documents', label: 'Tài liệu', icon: FileText },
    { id: 'quizzes', label: 'Bộ câu hỏi', icon: BookOpen },
];

export default function LibraryPage() {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [activeTab, setActiveTab] = useState('documents');

    // ── Document state ──
    const [documents, setDocuments] = useState([]);
    const [loadingDocs, setLoadingDocs] = useState(true);
    const [docError, setDocError] = useState(null);

    // ── Quiz state ──
    const [quizzes, setQuizzes] = useState([]);
    const [loadingQuizzes, setLoadingQuizzes] = useState(false);
    const [quizError, setQuizError] = useState(null);

    // Expanded quiz ID → shows questions inline
    const [expandedQuizId, setExpandedQuizId] = useState(null);
    const [expandedQuestions, setExpandedQuestions] = useState([]);
    const [loadingQuestions, setLoadingQuestions] = useState(false);

    // Fetch documents on mount
    useEffect(() => {
        fetchDocuments();
    }, []);

    // Fetch quizzes whenever documents change (we need doc IDs) or tab switches to quizzes
    useEffect(() => {
        if (activeTab === 'quizzes' && documents.length > 0 && quizzes.length === 0 && !loadingQuizzes) {
            fetchQuizzes();
        }
    }, [activeTab, documents]);

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
            setQuizzes((prev) => prev.filter((q) => q.id !== id));
            if (expandedQuizId === id) {
                setExpandedQuizId(null);
                setExpandedQuestions([]);
            }
        } catch (err) {
            alert(err.message || 'Xóa thất bại');
        }
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

    // Refresh documents when modal closes
    function handleModalClose() {
        setShowCreateModal(false);
        fetchDocuments();
    }

    // Helper to get document name for a quiz
    function getDocumentName(docId) {
        const doc = documents.find(d => d.id === docId);
        if (!doc) return `Tài liệu #${docId}`;
        return doc.title || doc.fileName || doc.fileUrl?.split('/').pop() || `Tài liệu #${docId}`;
    }

    return (
        <>
            <div className="space-y-8">
                {/* ── Page Header ── */}
                <header className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">
                            Thư viện
                        </h1>
                        <p className="text-sm text-slate-400 mt-1">
                            Quản lý tất cả tài liệu và tài nguyên của bạn
                        </p>
                    </div>

                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl
                                   bg-sky-500 text-white text-[13px] font-semibold
                                   hover:bg-sky-600 transition-colors duration-200
                                   shadow-sm hover:shadow-md"
                    >
                        <Plus className="w-4 h-4" />
                        Thêm tài nguyên
                    </button>
                </header>

                {/* ── Tabs ── */}
                <div className="flex items-center gap-1 border-b border-slate-100 pb-0">
                    {LIBRARY_TABS.map(tab => {
                        const isActive = activeTab === tab.id;
                        const count = tab.id === 'documents' ? documents.length : quizzes.length;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-3 text-[13px] font-medium
                                            border-b-2 transition-all duration-200 -mb-px
                                            ${isActive
                                        ? 'border-sky-500 text-sky-600'
                                        : 'border-transparent text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                                {(!loadingDocs && tab.id === 'documents') || (!loadingQuizzes && tab.id === 'quizzes') ? (
                                    <span className={`ml-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5
                                                       rounded-md text-[11px] font-semibold
                                                       ${isActive ? 'bg-sky-100 text-sky-600' : 'bg-slate-100 text-slate-400'}`}>
                                        {count}
                                    </span>
                                ) : null}
                            </button>
                        );
                    })}
                </div>

                {/* ── Documents Tab ── */}
                {activeTab === 'documents' && (
                    <>
                        {loadingDocs ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="w-6 h-6 text-sky-500 animate-spin" />
                                <span className="ml-3 text-sm text-slate-400">Đang tải tài liệu...</span>
                            </div>
                        ) : docError ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <AlertCircle className="w-10 h-10 text-slate-300 mb-3" />
                                <p className="text-sm text-slate-500 mb-4">{docError}</p>
                                <button
                                    onClick={fetchDocuments}
                                    className="px-4 py-2 rounded-lg text-sm font-medium text-sky-600 bg-sky-50
                                               hover:bg-sky-100 transition-colors"
                                >
                                    Thử lại
                                </button>
                            </div>
                        ) : documents.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
                                    <FileText className="w-7 h-7 text-slate-300" />
                                </div>
                                <h3 className="text-[14px] font-medium text-slate-500 mb-1">
                                    Chưa có tài nguyên nào
                                </h3>
                                <p className="text-[13px] text-slate-400 mb-4">
                                    Bắt đầu bằng cách tải lên tài liệu mới
                                </p>
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="px-5 py-2.5 rounded-xl text-[13px] font-semibold
                                               bg-sky-500 text-white hover:bg-sky-600 transition-colors"
                                >
                                    Tải lên tài liệu
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {documents.map((doc) => (
                                    <article
                                        key={doc.id}
                                        className="flex items-center justify-between p-5 rounded-xl
                                                   border border-slate-100/80 bg-white
                                                   hover:border-slate-200 hover:bg-slate-50/30
                                                   transition-all duration-200 group"
                                    >
                                        {/* Left: Icon + Info */}
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center flex-shrink-0">
                                                <FileText className="w-[18px] h-[18px] text-sky-500" />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="text-[14px] font-medium text-slate-700 truncate
                                                               group-hover:text-slate-800 transition-colors">
                                                    {doc.title || doc.fileName || doc.fileUrl?.split('/').pop() || `Tài liệu #${doc.id}`}
                                                </h3>
                                                <div className="flex items-center gap-3 mt-1.5">
                                                    {doc.fileUrl && (
                                                        <span className="text-[12px] text-slate-400 truncate max-w-[200px]">
                                                            {doc.fileUrl.split('/').pop()}
                                                        </span>
                                                    )}
                                                    {doc.isDeleted && (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-md
                                                                         bg-rose-50 text-rose-500 text-[11px] font-medium">
                                                            Đã xóa
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right: Date + Actions */}
                                        <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                                            {doc.createdAt && (
                                                <span className="text-[12px] text-slate-400 hidden sm:block">
                                                    {new Date(doc.createdAt).toLocaleDateString('vi-VN', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric',
                                                    })}
                                                </span>
                                            )}
                                            <button
                                                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg
                                                           border border-slate-200/80 bg-white
                                                           text-[12px] font-medium text-slate-500
                                                           hover:border-sky-300 hover:text-sky-600 hover:bg-sky-50/50
                                                           transition-all duration-200"
                                            >
                                                <Edit3 className="w-3.5 h-3.5" />
                                                Chỉnh sửa
                                            </button>
                                            <button
                                                onClick={() => handleDeleteDoc(doc.id)}
                                                className="flex items-center gap-1.5 px-3 py-2 rounded-lg
                                                           border border-slate-200/80 bg-white
                                                           text-[12px] font-medium text-slate-400
                                                           hover:border-rose-300 hover:text-rose-500 hover:bg-rose-50/50
                                                           transition-all duration-200"
                                                aria-label="Xóa tài liệu"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* ── Quizzes Tab ── */}
                {activeTab === 'quizzes' && (
                    <>
                        {loadingQuizzes || loadingDocs ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="w-6 h-6 text-sky-500 animate-spin" />
                                <span className="ml-3 text-sm text-slate-400">Đang tải bộ câu hỏi...</span>
                            </div>
                        ) : quizError ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <AlertCircle className="w-10 h-10 text-slate-300 mb-3" />
                                <p className="text-sm text-slate-500 mb-4">{quizError}</p>
                                <button
                                    onClick={fetchQuizzes}
                                    className="px-4 py-2 rounded-lg text-sm font-medium text-sky-600 bg-sky-50
                                               hover:bg-sky-100 transition-colors"
                                >
                                    Thử lại
                                </button>
                            </div>
                        ) : quizzes.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
                                    <BookOpen className="w-7 h-7 text-slate-300" />
                                </div>
                                <h3 className="text-[14px] font-medium text-slate-500 mb-1">
                                    Chưa có bộ câu hỏi nào
                                </h3>
                                <p className="text-[13px] text-slate-400 mb-4">
                                    Tải tài liệu và tạo câu hỏi từ AI để bắt đầu
                                </p>
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="px-5 py-2.5 rounded-xl text-[13px] font-semibold
                                               bg-sky-500 text-white hover:bg-sky-600 transition-colors"
                                >
                                    Tạo bộ câu hỏi
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <AnimatePresence>
                                    {quizzes.map((quiz) => {
                                        const isExpanded = expandedQuizId === quiz.id;
                                        return (
                                            <motion.div
                                                key={quiz.id}
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                                                transition={{ duration: 0.2 }}
                                                className="rounded-xl border border-slate-100/80 bg-white overflow-hidden
                                                           hover:border-slate-200 transition-all duration-200"
                                            >
                                                {/* Quiz row */}
                                                <div className="flex items-center justify-between p-5">
                                                    {/* Left: Icon + Info */}
                                                    <div
                                                        className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer"
                                                        onClick={() => toggleExpandQuiz(quiz.id)}
                                                    >
                                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors
                                                                         ${isExpanded ? 'bg-sky-100' : 'bg-violet-50'}`}>
                                                            <BookOpen className={`w-[18px] h-[18px] ${isExpanded ? 'text-sky-600' : 'text-violet-500'}`} />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h3 className="text-[14px] font-medium text-slate-700 truncate">
                                                                {quiz.title || `Quiz #${quiz.id}`}
                                                            </h3>
                                                            <div className="flex items-center gap-3 mt-1">
                                                                <span className="text-[11px] text-slate-400">
                                                                    {getDocumentName(quiz.documentId)}
                                                                </span>
                                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md
                                                                                 text-[10px] font-semibold
                                                                                 ${quiz.status === 'AI_Drafted'
                                                                        ? 'bg-amber-50 text-amber-600 border border-amber-100'
                                                                        : quiz.status === 'Published'
                                                                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                                            : 'bg-slate-50 text-slate-500 border border-slate-100'
                                                                    }`}>
                                                                    {quiz.status === 'AI_Drafted' ? 'AI Nháp' : quiz.status || 'Nháp'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Right: Date + Actions */}
                                                    <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                                                        {quiz.createdAt && (
                                                            <span className="text-[12px] text-slate-400 hidden sm:block">
                                                                {new Date(quiz.createdAt).toLocaleDateString('vi-VN', {
                                                                    day: 'numeric',
                                                                    month: 'short',
                                                                    year: 'numeric',
                                                                })}
                                                            </span>
                                                        )}
                                                        <button
                                                            onClick={() => toggleExpandQuiz(quiz.id)}
                                                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg
                                                                       border border-slate-200/80 bg-white
                                                                       text-[12px] font-medium text-slate-500
                                                                       hover:border-sky-300 hover:text-sky-600 hover:bg-sky-50/50
                                                                       transition-all duration-200"
                                                        >
                                                            {isExpanded ? (
                                                                <>
                                                                    <EyeOff className="w-3.5 h-3.5" />
                                                                    Ẩn
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Eye className="w-3.5 h-3.5" />
                                                                    Xem
                                                                </>
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteQuiz(quiz.id)}
                                                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg
                                                                       border border-slate-200/80 bg-white
                                                                       text-[12px] font-medium text-slate-400
                                                                       hover:border-rose-300 hover:text-rose-500 hover:bg-rose-50/50
                                                                       transition-all duration-200"
                                                            aria-label="Xóa bộ câu hỏi"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Expanded: Questions list */}
                                                <AnimatePresence>
                                                    {isExpanded && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="border-t border-slate-100 px-5 py-4 bg-slate-50/30">
                                                                {loadingQuestions ? (
                                                                    <div className="flex items-center justify-center py-6">
                                                                        <Loader2 className="w-5 h-5 text-sky-500 animate-spin" />
                                                                        <span className="ml-2 text-[12px] text-slate-400">Đang tải câu hỏi...</span>
                                                                    </div>
                                                                ) : expandedQuestions.length === 0 ? (
                                                                    <p className="text-[13px] text-slate-400 text-center py-6">
                                                                        Chưa có câu hỏi nào trong bộ câu hỏi này
                                                                    </p>
                                                                ) : (
                                                                    <div className="space-y-3">
                                                                        {expandedQuestions.map((question, qIdx) => (
                                                                            <div
                                                                                key={question.id}
                                                                                className="bg-white rounded-lg border border-slate-100 p-4"
                                                                            >
                                                                                {/* Question header */}
                                                                                <div className="flex items-start gap-3 mb-3">
                                                                                    <span className="flex-shrink-0 w-6 h-6 rounded-md
                                                                                                     bg-violet-50 text-violet-500
                                                                                                     text-[11px] font-bold
                                                                                                     flex items-center justify-center">
                                                                                        {qIdx + 1}
                                                                                    </span>
                                                                                    <p className="text-[13px] font-medium text-slate-700 leading-relaxed">
                                                                                        {question.questionText}
                                                                                    </p>
                                                                                </div>

                                                                                {/* Options */}
                                                                                {question.options?.length > 0 && (
                                                                                    <div className="grid grid-cols-2 gap-2 ml-9">
                                                                                        {question.options.map((opt, optIdx) => (
                                                                                            <div
                                                                                                key={opt.id || optIdx}
                                                                                                className={`flex items-center gap-2 px-3 py-2 rounded-md
                                                                                                            text-[12px] border transition-all
                                                                                                            ${opt.isCorrect
                                                                                                        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-700 font-medium'
                                                                                                        : 'bg-white border-slate-100 text-slate-600'
                                                                                                    }`}
                                                                                            >
                                                                                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0
                                                                                                                 ${opt.isCorrect
                                                                                                        ? 'border-emerald-400 bg-emerald-400'
                                                                                                        : 'border-slate-300 bg-white'
                                                                                                    }`}>
                                                                                                    {opt.isCorrect && (
                                                                                                        <CheckCircle2 className="w-3 h-3 text-white" />
                                                                                                    )}
                                                                                                </div>
                                                                                                <span>{opt.optionText}</span>
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        ))}

                                                                        {/* Summary */}
                                                                        <div className="flex items-center gap-4 pt-2 text-[11px] text-slate-400">
                                                                            <span className="flex items-center gap-1">
                                                                                <HelpCircle className="w-3 h-3" />
                                                                                {expandedQuestions.length} câu hỏi
                                                                            </span>
                                                                        </div>
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
                        )}
                    </>
                )}
            </div>

            {/* ── Create Flow Modal ── */}
            {showCreateModal && (
                <CreateFlowModal onClose={handleModalClose} />
            )}
        </>
    );
}
