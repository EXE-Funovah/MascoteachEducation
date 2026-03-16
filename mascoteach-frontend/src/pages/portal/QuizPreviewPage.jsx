import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft, Copy, Trash2, Pencil, CheckCircle2,
    Loader2, Send, Clock, Star, BookOpen,
    LayoutList, FileText, BarChart3, AlertCircle,
    X, Plus, Check
} from 'lucide-react';
import { generateMCQFromUrl } from '@/services/aiService';
import { createQuiz, updateQuiz } from '@/services/quizService';
import { createQuestion } from '@/services/questionService';

const TABS = [
    { id: 'questions', label: 'Hoạt động', icon: LayoutList },
    { id: 'summary', label: 'Tóm tắt', icon: FileText },
    { id: 'stats', label: 'Thống kê', icon: BarChart3 },
];

export default function QuizPreviewPage() {
    const location = useLocation();
    const navigate = useNavigate();

    const settingsData = location.state?.settings;
    const fileName = location.state?.fileName;
    const fileSize = location.state?.fileSize;
    const documentId = location.state?.documentId;
    const fileUrl = location.state?.fileUrl;

    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('questions');
    const [publishing, setPublishing] = useState(false);
    const [publishError, setPublishError] = useState(null);
    const [editingQuestionId, setEditingQuestionId] = useState(null);
    const [editDraft, setEditDraft] = useState(null);

    useEffect(() => {
        if (!fileUrl) {
            setError('Không tìm thấy file tài liệu. Vui lòng quay lại và tải lên.');
            setLoading(false);
            return;
        }

        const controller = new AbortController();

        async function callAI() {
            try {
                setLoading(true);
                setError(null);

                const questionCount = settingsData?.questionCount || 5;
                const quizTitle = settingsData?.title || 'Bài kiểm tra';

                const result = await generateMCQFromUrl(fileUrl, {
                    documentId,
                    quizTitle,
                    numberOfQuestions: questionCount === 0 ? 5 : questionCount,
                }, controller.signal);

                if (controller.signal.aborted) return;

                if (!result.success || !result.data?.questions?.length) {
                    throw new Error(result.message || 'AI không trả về câu hỏi nào.');
                }

                const mapped = result.data.questions.map((q, idx) => ({
                    id: idx + 1,
                    question: q.questionText,
                    type: q.questionType === 'MultipleChoice' ? 'TRẮC NGHIỆM' : q.questionType,
                    time: 30,
                    points: 1000,
                    options: q.options.map(o => ({
                        text: o.optionText,
                        isCorrect: o.isCorrect,
                    })),
                    _raw: q,
                }));

                setQuestions(mapped);
            } catch (err) {
                if (controller.signal.aborted) return;
                console.error('[QuizPreview] AI error:', err);
                setError(err.message || 'Không thể tạo câu hỏi từ AI. Vui lòng thử lại.');
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        }

        callAI();
        return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function handlePublish() {
        if (questions.length === 0) return;

        setPublishing(true);
        setPublishError(null);

        const quizTitle = settingsData?.title || 'Bài kiểm tra';

        try {
            const quizResult = await createQuiz({
                documentId,
                title: quizTitle,
            });

            const quizId = quizResult?.id ?? quizResult?.quizId;
            if (!quizId) throw new Error('Không thể tạo quiz - Backend không trả về ID.');

            for (const q of questions) {
                await createQuestion({
                    quizId,
                    questionText: q.question,
                    questionType: 'MultipleChoice',
                    options: q.options.map(o => ({
                        optionText: o.text,
                        isCorrect: o.isCorrect,
                    })),
                });
            }

            await updateQuiz(quizId, {
                title: quizTitle,
                status: 'Teacher_Approved',
            });

            navigate('/teacher/library', {
                state: {
                    activeTab: 'quizzes',
                    targetQuizId: quizId,
                    successMessage: 'Quiz của bạn đã sẵn sàng, bạn có thể xem ở Thư viện của tôi.',
                },
            });
        } catch (err) {
            console.error('[QuizPreview] Publish error:', err);
            setPublishError(err.message || 'Không thể xuất bản quiz. Vui lòng thử lại.');
            setPublishing(false);
        }
    }

    function handleBack() {
        navigate('/teacher/quiz-settings', {
            state: { fileName, fileSize, documentId, fileUrl, settings: settingsData },
        });
    }

    function handleDeleteQuestion(id) {
        setQuestions(prev => prev.filter(q => q.id !== id));
        if (editingQuestionId === id) {
            setEditingQuestionId(null);
            setEditDraft(null);
        }
    }

    function handleDuplicate(id) {
        setQuestions(prev => {
            const idx = prev.findIndex(q => q.id === id);
            if (idx === -1) return prev;
            const copy = {
                ...prev[idx],
                id: Date.now(),
                options: prev[idx].options.map(o => ({ ...o })),
            };
            const next = [...prev];
            next.splice(idx + 1, 0, copy);
            return next;
        });
    }

    function startEditing(q) {
        setEditingQuestionId(q.id);
        setEditDraft({
            question: q.question,
            time: q.time,
            points: q.points,
            options: q.options.map(o => ({ ...o })),
        });
    }

    function cancelEditing() {
        setEditingQuestionId(null);
        setEditDraft(null);
    }

    function saveEditing(id) {
        if (!editDraft) return;
        setQuestions(prev =>
            prev.map(q =>
                q.id === id
                    ? {
                        ...q,
                        question: editDraft.question,
                        time: editDraft.time,
                        points: editDraft.points,
                        options: editDraft.options,
                    }
                    : q
            )
        );
        setEditingQuestionId(null);
        setEditDraft(null);
    }

    function updateDraftQuestion(text) {
        setEditDraft(prev => ({ ...prev, question: text }));
    }

    function updateDraftOptionText(optIdx, text) {
        setEditDraft(prev => ({
            ...prev,
            options: prev.options.map((o, i) => (i === optIdx ? { ...o, text } : o)),
        }));
    }

    function toggleDraftOptionCorrect(optIdx) {
        setEditDraft(prev => ({
            ...prev,
            options: prev.options.map((o, i) => (i === optIdx ? { ...o, isCorrect: !o.isCorrect } : o)),
        }));
    }

    function addDraftOption() {
        setEditDraft(prev => ({
            ...prev,
            options: [...prev.options, { text: '', isCorrect: false }],
        }));
    }

    function removeDraftOption(optIdx) {
        if (editDraft.options.length <= 2) return;
        setEditDraft(prev => ({
            ...prev,
            options: prev.options.filter((_, i) => i !== optIdx),
        }));
    }

    function handleAddQuestion() {
        const newQ = {
            id: Date.now(),
            question: '',
            type: 'TRẮC NGHIỆM',
            time: 30,
            points: 1000,
            options: [
                { text: '', isCorrect: true },
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
            ],
            _raw: null,
        };
        setQuestions(prev => [...prev, newQ]);
        startEditing(newQ);
    }

    return (
        <section className="max-w-4xl mx-auto px-4 py-6">
            <motion.header
                className="flex items-center justify-between mb-6"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleBack}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                        aria-label="Quay lại"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-[16px] font-bold text-slate-800">
                            {settingsData?.title || 'Bài kiểm tra'}
                        </h1>
                        <div className="flex items-center gap-4 mt-1 text-[12px] text-slate-400">
                            <span className="flex items-center gap-1">
                                <BookOpen className="w-3.5 h-3.5" />
                                {questions.length} câu hỏi
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {questions.reduce((s, q) => s + q.time, 0)}s tổng
                            </span>
                            <span className="flex items-center gap-1">
                                <Star className="w-3.5 h-3.5" />
                                {questions.reduce((s, q) => s + q.points, 0).toLocaleString()} điểm
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <motion.button
                        onClick={handlePublish}
                        disabled={publishing || questions.length === 0}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl
                                   bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[13px] font-bold
                                   hover:from-emerald-600 hover:to-teal-600 transition-all duration-200
                                   shadow-md hover:shadow-lg
                                   disabled:opacity-60 disabled:cursor-not-allowed"
                        whileHover={!publishing ? { scale: 1.02, y: -1 } : {}}
                        whileTap={!publishing ? { scale: 0.98 } : {}}
                    >
                        {publishing ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Đang xuất bản...
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4" />
                                Xuất bản
                            </>
                        )}
                    </motion.button>
                </div>
            </motion.header>

            {publishError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-600 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {publishError}
                </div>
            )}

            <div className="flex items-center gap-1 mb-6 border-b border-slate-100">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium border-b-2 transition-all duration-200 -mb-px ${activeTab === tab.id ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <motion.div className="flex flex-col items-center justify-center py-20" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="w-16 h-16 rounded-2xl bg-sky-50 flex items-center justify-center mb-4">
                        <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
                    </div>
                    <p className="text-[14px] font-medium text-slate-600 mb-1">
                        AI đang phân tích tài liệu...
                    </p>
                    <p className="text-[12px] text-slate-400">
                        Quá trình này có thể mất 15-30 giây
                    </p>
                </motion.div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center mb-4">
                        <AlertCircle className="w-8 h-8 text-rose-400" />
                    </div>
                    <p className="text-[14px] font-medium text-slate-600 mb-2">{error}</p>
                    <button
                        onClick={handleBack}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-sky-600 bg-sky-50 hover:bg-sky-100 transition-colors"
                    >
                        Quay lại cấu hình
                    </button>
                </div>
            ) : activeTab === 'questions' ? (
                <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                        {questions.map((q, idx) => {
                            const isEditing = editingQuestionId === q.id;

                            return (
                                <motion.article
                                    key={q.id}
                                    className="bg-white rounded-xl border border-slate-200/80 overflow-hidden"
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -12, scale: 0.95 }}
                                    transition={{ duration: 0.3, delay: idx * 0.03 }}
                                    layout
                                >
                                    <div className="flex items-center justify-between px-5 py-3 border-b border-slate-50">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[12px] font-bold text-slate-300">
                                                {String(idx + 1).padStart(2, '0')}
                                            </span>
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-violet-50 text-violet-500 border border-violet-100">
                                                {q.type}
                                            </span>
                                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> {q.time}s
                                            </span>
                                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                                <Star className="w-3 h-3" /> {q.points}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            {isEditing ? (
                                                <>
                                                    <button
                                                        onClick={() => saveEditing(q.id)}
                                                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-all"
                                                        title="Lưu"
                                                    >
                                                        <Check className="w-3.5 h-3.5" />
                                                        Lưu
                                                    </button>
                                                    <button
                                                        onClick={cancelEditing}
                                                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-medium text-slate-500 bg-slate-50 hover:bg-slate-100 transition-all"
                                                        title="Hủy"
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                        Hủy
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => handleDuplicate(q.id)}
                                                        className="w-7 h-7 rounded-md flex items-center justify-center text-slate-300 hover:text-slate-500 hover:bg-slate-50 transition-all"
                                                        title="Nhân đôi"
                                                    >
                                                        <Copy className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => startEditing(q)}
                                                        className="w-7 h-7 rounded-md flex items-center justify-center text-slate-300 hover:text-sky-500 hover:bg-sky-50 transition-all"
                                                        title="Chỉnh sửa"
                                                    >
                                                        <Pencil className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteQuestion(q.id)}
                                                        className="w-7 h-7 rounded-md flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all"
                                                        title="Xóa"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="px-5 pt-4 pb-3">
                                        {isEditing ? (
                                            <textarea
                                                value={editDraft.question}
                                                onChange={e => updateDraftQuestion(e.target.value)}
                                                rows={2}
                                                className="w-full text-[14px] font-medium text-slate-700 leading-relaxed border border-sky-200 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-400 bg-sky-50/30 transition-all"
                                                placeholder="Nhập câu hỏi..."
                                                autoFocus
                                            />
                                        ) : (
                                            <p className="text-[14px] font-medium text-slate-700 leading-relaxed">
                                                {q.question || <span className="italic text-slate-400">Chưa có nội dung</span>}
                                            </p>
                                        )}
                                    </div>

                                    <div className="px-5 pb-5 grid grid-cols-2 gap-2">
                                        {(isEditing ? editDraft.options : q.options).map((opt, optIdx) => (
                                            <div
                                                key={optIdx}
                                                className={`flex items-start gap-2.5 p-3 rounded-lg border transition-all ${isEditing ? 'cursor-pointer' : ''} ${opt.isCorrect ? 'bg-emerald-50/60 border-emerald-200' : 'bg-slate-50/40 border-slate-100'}`}
                                            >
                                                <button
                                                    type="button"
                                                    onClick={isEditing ? () => toggleDraftOptionCorrect(optIdx) : undefined}
                                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-200 ${isEditing ? 'cursor-pointer hover:scale-110' : 'cursor-default'} ${opt.isCorrect ? 'border-emerald-400 bg-emerald-400' : 'border-slate-300 bg-white'}`}
                                                    title={isEditing ? (opt.isCorrect ? 'Bỏ đáp án đúng' : 'Đặt đáp án đúng') : undefined}
                                                >
                                                    {opt.isCorrect && (
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                                    )}
                                                </button>

                                                {isEditing ? (
                                                    <div className="flex-1 flex items-center gap-1">
                                                        <input
                                                            type="text"
                                                            value={opt.text}
                                                            onChange={e => updateDraftOptionText(optIdx, e.target.value)}
                                                            className={`flex-1 text-[13px] leading-relaxed border-b bg-transparent outline-none pb-0.5 ${opt.isCorrect ? 'border-emerald-300 text-emerald-700 font-medium focus:border-emerald-500' : 'border-slate-200 text-slate-600 focus:border-sky-400'}`}
                                                            placeholder={`Đáp án ${optIdx + 1}`}
                                                        />
                                                        {editDraft.options.length > 2 && (
                                                            <button
                                                                onClick={() => removeDraftOption(optIdx)}
                                                                className="w-5 h-5 rounded flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all"
                                                                title="Xóa đáp án"
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className={`text-[13px] leading-relaxed ${opt.isCorrect ? 'text-emerald-700 font-medium' : 'text-slate-600'}`}>
                                                        {opt.text}
                                                    </span>
                                                )}
                                            </div>
                                        ))}

                                        {isEditing && editDraft.options.length < 6 && (
                                            <button
                                                onClick={addDraftOption}
                                                className="flex items-center justify-center gap-1.5 p-3 rounded-lg border-2 border-dashed border-slate-200 text-[12px] font-medium text-slate-400 hover:border-sky-300 hover:text-sky-500 hover:bg-sky-50/30 transition-all duration-200"
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                                Thêm đáp án
                                            </button>
                                        )}
                                    </div>
                                </motion.article>
                            );
                        })}
                    </AnimatePresence>

                    <button
                        onClick={handleAddQuestion}
                        className="w-full py-4 rounded-xl border-2 border-dashed border-slate-200 text-[13px] font-medium text-slate-400 hover:text-sky-500 hover:border-sky-300 hover:bg-sky-50/30 transition-all duration-200"
                    >
                        + Thêm câu hỏi
                    </button>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <p className="text-[14px] text-slate-400">
                        {activeTab === 'summary' ? 'Tóm tắt' : 'Thống kê'} đang được phát triển
                    </p>
                </div>
            )}
        </section>
    );
}
