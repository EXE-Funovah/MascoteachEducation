import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ChevronLeft, Copy, Trash2, Pencil, CheckCircle2,
    Loader2, Send, Clock, Star, BookOpen,
    LayoutList, FileText, BarChart3, AlertCircle
} from 'lucide-react';
import { generateMCQFromUrl } from '@/services/aiService';
import { generateQuizFromAI } from '@/services/quizService';

/**
 * QuizPreviewPage — Preview AI-generated MCQ questions before publishing
 *
 * Flow:
 *   QuizSettingsPage passes { fileName, fileSize, documentId, fileUrl, settings } via route state
 *   → This page sends the S3 fileUrl to the AI Module to generate questions
 *   → User previews, edits, deletes questions
 *   → "Xuất bản" saves to Backend via POST /api/Quiz/generate-from-ai
 *   → Navigates to /teacher/select-game-template with quizId
 */

const TABS = [
    { id: 'questions', label: 'Hoạt động', icon: LayoutList },
    { id: 'summary', label: 'Tóm tắt', icon: FileText },
    { id: 'stats', label: 'Thống kê', icon: BarChart3 },
];

export default function QuizPreviewPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const calledRef = useRef(false);

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

    // Call AI Module to generate questions on mount
    useEffect(() => {
        if (calledRef.current) return;
        calledRef.current = true;

        if (!fileUrl) {
            setError('Không tìm thấy file tài liệu. Vui lòng quay lại và tải lên.');
            setLoading(false);
            return;
        }

        async function callAI() {
            try {
                setLoading(true);
                setError(null);

                const questionCount = settingsData?.questionCount || 5;
                const quizTitle = settingsData?.title || 'Bài kiểm tra';

                const result = await generateMCQFromUrl(fileUrl, {
                    documentId,
                    quizTitle,
                    numberOfQuestions: questionCount === 0 ? 5 : questionCount, // 0 = auto → default 5
                });

                if (!result.success || !result.data?.questions?.length) {
                    throw new Error(result.message || 'AI không trả về câu hỏi nào.');
                }

                // Map AI response to preview format
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
                    // Keep raw data for publishing
                    _raw: q,
                }));

                setQuestions(mapped);
            } catch (err) {
                console.error('[QuizPreview] AI error:', err);
                setError(err.message || 'Không thể tạo câu hỏi từ AI. Vui lòng thử lại.');
            } finally {
                setLoading(false);
            }
        }

        callAI();
    }, [documentId, settingsData]);

    // Publish quiz to Backend, then navigate to game template selection
    async function handlePublish() {
        if (questions.length === 0) return;

        setPublishing(true);
        setPublishError(null);

        try {
            // Build AIGenerateQuizRequest for Backend
            const payload = {
                documentId: documentId,
                quizTitle: settingsData?.title || 'Bài kiểm tra',
                questions: questions.map(q => ({
                    questionText: q.question,
                    questionType: 'MultipleChoice',
                    options: q.options.map(o => ({
                        optionText: o.text,
                        isCorrect: o.isCorrect,
                    })),
                })),
            };

            const quizResult = await generateQuizFromAI(payload);

            // Navigate to game template selection with quizId
            const quizId = quizResult?.id ?? quizResult?.quizId ?? null;
            navigate('/teacher/select-game-template', {
                state: {
                    quizId,
                    quizTitle: settingsData?.title || 'Bài kiểm tra',
                    questionCount: questions.length,
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
    }

    function handleDuplicate(id) {
        setQuestions(prev => {
            const idx = prev.findIndex(q => q.id === id);
            if (idx === -1) return prev;
            const copy = { ...prev[idx], id: Date.now() };
            const next = [...prev];
            next.splice(idx + 1, 0, copy);
            return next;
        });
    }

    return (
        <section className="max-w-4xl mx-auto px-4 py-6">
            {/* ── Top bar ── */}
            <motion.header
                className="flex items-center justify-between mb-6"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleBack}
                        className="w-8 h-8 rounded-lg flex items-center justify-center
                                   text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
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
                                {questions.length * 30}s tổng
                            </span>
                            <span className="flex items-center gap-1">
                                <Star className="w-3.5 h-3.5" />
                                {questions.reduce((s, q) => s + q.points, 0).toLocaleString()} điểm
                            </span>
                        </div>
                    </div>
                </div>

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
            </motion.header>

            {/* Publish error */}
            {publishError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-600 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {publishError}
                </div>
            )}

            {/* ── Tabs ── */}
            <div className="flex items-center gap-1 mb-6 border-b border-slate-100">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium
                                    border-b-2 transition-all duration-200 -mb-px
                                    ${activeTab === tab.id
                                ? 'border-sky-500 text-sky-600'
                                : 'border-transparent text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ── Content ── */}
            {loading ? (
                <motion.div
                    className="flex flex-col items-center justify-center py-20"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
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
                    {questions.map((q, idx) => (
                        <motion.article
                            key={q.id}
                            className="bg-white rounded-xl border border-slate-200/80 overflow-hidden"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: idx * 0.05 }}
                        >
                            {/* Question Header */}
                            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-50">
                                <div className="flex items-center gap-3">
                                    <span className="text-[12px] font-bold text-slate-300">
                                        {String(idx + 1).padStart(2, '0')}
                                    </span>
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                                                     bg-violet-50 text-violet-500 border border-violet-100">
                                        {q.type}
                                    </span>
                                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {q.time}s
                                    </span>
                                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                        <Star className="w-3 h-3" /> {q.points}
                                    </span>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => handleDuplicate(q.id)}
                                        className="w-7 h-7 rounded-md flex items-center justify-center
                                                   text-slate-300 hover:text-slate-500 hover:bg-slate-50 transition-all"
                                        title="Nhân đôi"
                                    >
                                        <Copy className="w-3.5 h-3.5" />
                                    </button>
                                    <button className="w-7 h-7 rounded-md flex items-center justify-center
                                                       text-slate-300 hover:text-slate-500 hover:bg-slate-50 transition-all"
                                        title="Chỉnh sửa">
                                        <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteQuestion(q.id)}
                                        className="w-7 h-7 rounded-md flex items-center justify-center
                                                   text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all"
                                        title="Xóa"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>

                            {/* Question Text */}
                            <div className="px-5 pt-4 pb-3">
                                <p className="text-[14px] font-medium text-slate-700 leading-relaxed">
                                    {q.question}
                                </p>
                            </div>

                            {/* Options Grid */}
                            <div className="px-5 pb-5 grid grid-cols-2 gap-2">
                                {q.options.map((opt, optIdx) => (
                                    <div
                                        key={optIdx}
                                        className={`flex items-start gap-2.5 p-3 rounded-lg border transition-all
                                                    ${opt.isCorrect
                                                ? 'bg-emerald-50/60 border-emerald-200'
                                                : 'bg-slate-50/40 border-slate-100'
                                            }`}
                                    >
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5
                                                         ${opt.isCorrect
                                                ? 'border-emerald-400 bg-emerald-400'
                                                : 'border-slate-300 bg-white'
                                            }`}>
                                            {opt.isCorrect && (
                                                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                            )}
                                        </div>
                                        <span className={`text-[13px] leading-relaxed
                                                          ${opt.isCorrect
                                                ? 'text-emerald-700 font-medium'
                                                : 'text-slate-600'
                                            }`}>
                                            {opt.text}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </motion.article>
                    ))}

                    {/* Add more button */}
                    <button className="w-full py-4 rounded-xl border-2 border-dashed border-slate-200
                                       text-[13px] font-medium text-slate-400 hover:text-sky-500
                                       hover:border-sky-300 hover:bg-sky-50/30 transition-all duration-200">
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
