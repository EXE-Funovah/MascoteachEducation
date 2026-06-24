import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertCircle,
    ArrowLeft,
    Check,
    CheckCircle2,
    Copy,
    Grip,
    Loader2,
    Pencil,
    Plus,
    Send,
    Sparkles,
    Trash2,
    X,
} from 'lucide-react';
import { generateFlashcardsFromUrl, generateMCQFromUrl } from '@/services/aiService';
import { publishQuiz } from '@/services/quizService';

const DEMO_QUESTIONS = [
    {
        id: 1,
        question: 'Trong một tiết học tương tác, yếu tố nào giúp học sinh tập trung trở lại nhanh nhất?',
        type: 'TRẮC NGHIỆM',
        time: 30,
        points: 1,
        options: [
            { text: 'Câu hỏi ngắn, rõ nhiệm vụ và có phản hồi tức thì', isCorrect: true },
            { text: 'Một đoạn lý thuyết dài để học sinh đọc lại', isCorrect: false },
            { text: 'Tăng số lượng bài tập trong cùng thời gian', isCorrect: false },
            { text: 'Chỉ yêu cầu học sinh ghi chép nhiều hơn', isCorrect: false },
        ],
        _raw: null,
    },
    {
        id: 2,
        question: 'Mục tiêu chính của hoạt động ôn tập nhanh là gì?',
        type: 'TRẮC NGHIỆM',
        time: 30,
        points: 1,
        options: [
            { text: 'Giúp giáo viên kiểm tra lại điểm kiến thức trọng tâm', isCorrect: true },
            { text: 'Thay thế toàn bộ phần giảng bài mới', isCorrect: false },
            { text: 'Chỉ tạo không khí vui mà không cần đo kết quả', isCorrect: false },
            { text: 'Giảm toàn bộ tương tác giữa giáo viên và học sinh', isCorrect: false },
        ],
        _raw: null,
    },
    {
        id: 3,
        question: 'Khi học sinh trả lời sai, phản hồi nào phù hợp nhất?',
        type: 'TRẮC NGHIỆM',
        time: 30,
        points: 1,
        options: [
            { text: 'Gợi ý ngắn để học sinh tự điều chỉnh cách nghĩ', isCorrect: true },
            { text: 'Bỏ qua câu đó để tiết kiệm thời gian', isCorrect: false },
            { text: 'Chỉ hiển thị đáp án đúng mà không giải thích', isCorrect: false },
            { text: 'Chuyển ngay sang nội dung khó hơn', isCorrect: false },
        ],
        _raw: null,
    },
    {
        id: 4,
        question: 'Điểm mạnh của việc tạo câu hỏi từ tài liệu có sẵn là gì?',
        type: 'TRẮC NGHIỆM',
        time: 30,
        points: 1,
        options: [
            { text: 'Giữ câu hỏi bám sát nội dung giáo viên đã chuẩn bị', isCorrect: true },
            { text: 'Loại bỏ hoàn toàn vai trò kiểm duyệt của giáo viên', isCorrect: false },
            { text: 'Luôn tạo ra cùng một bộ câu hỏi cho mọi lớp', isCorrect: false },
            { text: 'Không cần học sinh tham gia tương tác', isCorrect: false },
        ],
        _raw: null,
    },
    {
        id: 5,
        question: 'Vì sao giáo viên nên xem lại câu hỏi trước khi xuất bản?',
        type: 'TRẮC NGHIỆM',
        time: 30,
        points: 1,
        options: [
            { text: 'Để điều chỉnh ngôn ngữ, độ khó và đáp án cho phù hợp với lớp', isCorrect: true },
            { text: 'Vì AI không thể tạo câu hỏi trắc nghiệm', isCorrect: false },
            { text: 'Để xóa toàn bộ đáp án đúng', isCorrect: false },
            { text: 'Để thay tài liệu bằng một bài giảng không liên quan', isCorrect: false },
        ],
        _raw: null,
    },
];

const DEMO_FLASHCARDS = [
    {
        id: 1,
        question: 'Yếu tố nào giúp học sinh tập trung trở lại trong một tiết học tương tác?',
        back: 'Một câu hỏi ngắn, rõ nhiệm vụ và có phản hồi tức thì.',
        type: 'FLASHCARD',
        options: [{ text: 'Một câu hỏi ngắn, rõ nhiệm vụ và có phản hồi tức thì.', isCorrect: true }],
        _raw: null,
    },
    {
        id: 2,
        question: 'Mục tiêu chính của hoạt động ôn tập nhanh là gì?',
        back: 'Giúp giáo viên kiểm tra lại điểm kiến thức trọng tâm trước khi chuyển bài.',
        type: 'FLASHCARD',
        options: [{ text: 'Giúp giáo viên kiểm tra lại điểm kiến thức trọng tâm trước khi chuyển bài.', isCorrect: true }],
        _raw: null,
    },
    {
        id: 3,
        question: 'Vì sao giáo viên nên xem lại nội dung AI tạo trước khi xuất bản?',
        back: 'Để chỉnh ngôn ngữ, độ khó và đáp án cho phù hợp với lớp học.',
        type: 'FLASHCARD',
        options: [{ text: 'Để chỉnh ngôn ngữ, độ khó và đáp án cho phù hợp với lớp học.', isCorrect: true }],
        _raw: null,
    },
];

function formatTotalDuration(seconds) {
    const safeSeconds = Math.max(0, Math.round(seconds));
    const minutes = Math.floor(safeSeconds / 60);
    const remainingSeconds = safeSeconds % 60;

    if (minutes <= 0) return `${remainingSeconds} giây`;
    if (remainingSeconds === 0) return `${minutes} phút`;
    return `${minutes} phút ${remainingSeconds} giây`;
}

function distributeSeconds(totalSeconds, itemCount) {
    const safeCount = Math.max(1, itemCount);
    const safeTotal = Math.max(safeCount * 5, Math.round(totalSeconds));
    const base = Math.floor(safeTotal / safeCount);
    let remainder = safeTotal - base * safeCount;

    return Array.from({ length: safeCount }, () => {
        const extra = remainder > 0 ? 1 : 0;
        remainder -= extra;
        return base + extra;
    });
}

function mapAiQuestion(q, idx) {
    return {
        id: idx + 1,
        question: q.questionText,
        type: q.questionType === 'MultipleChoice' ? 'TRẮC NGHIỆM' : q.questionType,
        time: 30,
        points: 1,
        options: q.options.map((option) => ({
            text: option.optionText,
            isCorrect: option.isCorrect,
        })),
        _raw: q,
    };
}

function mapAiFlashcard(q, idx) {
    const back = q.options?.find((option) => option.isCorrect)?.optionText || q.options?.[0]?.optionText || '';
    return {
        id: idx + 1,
        question: q.questionText,
        back,
        type: 'FLASHCARD',
        options: [{ text: back, isCorrect: true }],
        _raw: q,
    };
}

function emptyQuestion() {
    return {
        id: Date.now(),
        question: '',
        type: 'TRẮC NGHIỆM',
        time: 30,
        points: 1,
        options: [
            { text: '', isCorrect: true },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
        ],
        _raw: null,
    };
}

function emptyFlashcard() {
    return {
        id: Date.now(),
        question: '',
        back: '',
        type: 'FLASHCARD',
        options: [{ text: '', isCorrect: true }],
        _raw: null,
    };
}

export default function QuizPreviewPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const isDevPreview = location.pathname.startsWith('/dev/teacher');

    const settingsData = location.state?.settings || (isDevPreview
        ? {
            title: 'Phỏng vấn giáo viên: khó khăn và giải pháp AI',
            questionCount: 5,
            difficultyDistribution: { 1: 60, 2: 40, 3: 0 },
            language: 'vi',
            activityType: 'quiz',
        }
        : null);
    const fileName = location.state?.fileName || (isDevPreview ? 'Mascoteach_demo_document.pdf' : null);
    const fileSize = location.state?.fileSize || null;
    const documentId = location.state?.documentId || (isDevPreview ? 'dev-preview-document' : null);
    const fileUrl = location.state?.fileUrl || null;
    const activityType = location.state?.activityType || settingsData?.activityType || 'quiz';
    const isFlashcards = activityType === 'flashcards' || settingsData?.questionType === 'Flashcard';

    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [publishing, setPublishing] = useState(false);
    const [publishError, setPublishError] = useState(null);
    const [editingQuestionId, setEditingQuestionId] = useState(null);
    const [editDraft, setEditDraft] = useState(null);
    const [editingTotalTime, setEditingTotalTime] = useState(false);
    const [totalMinutesDraft, setTotalMinutesDraft] = useState('');
    const [editingTimeQuestionId, setEditingTimeQuestionId] = useState(null);
    const [questionTimeDraft, setQuestionTimeDraft] = useState('');

    const stats = useMemo(() => {
        if (isFlashcards) return { totalTime: 0, totalPoints: 0 };
        const totalTime = questions.reduce((sum, question) => sum + (question.time || 0), 0);
        const totalPoints = questions.reduce((sum, question) => sum + (question.points || 0), 0);
        return { totalTime, totalPoints };
    }, [isFlashcards, questions]);

    const contentCopy = useMemo(() => {
        if (isFlashcards) {
            return {
                fallbackTitle: 'Bộ thẻ ôn tập',
                itemSingular: 'thẻ ôn tập',
                itemCount: 'thẻ ôn tập',
                add: 'Thêm thẻ',
                addBottom: 'Thêm thẻ',
                loading: 'AI đang tạo thẻ ôn tập...',
                loadingHint: 'Quá trình này có thể mất 15-30 giây',
                aiActions: ['Thêm thẻ tương tự', 'Rút gọn mặt sau', 'Dịch thẻ', 'Tùy chọn khác'],
                publish: 'Xuất bản',
            };
        }

        return {
            fallbackTitle: 'Bài kiểm tra',
            itemSingular: 'câu hỏi',
            itemCount: 'câu hỏi',
            add: 'Tạo câu hỏi',
            addBottom: 'Thêm câu hỏi',
            loading: 'AI đang phân tích tài liệu...',
            loadingHint: 'Quá trình này có thể mất 15-30 giây',
            aiActions: ['Thêm câu hỏi tương tự', 'Thêm giải thích đáp án', 'Dịch bài kiểm tra', 'Tùy chọn khác'],
            publish: 'Xuất bản',
        };
    }, [isFlashcards]);

    useEffect(() => {
        if (!fileUrl && isDevPreview) {
            const timer = setTimeout(() => {
                setQuestions(isFlashcards ? DEMO_FLASHCARDS : DEMO_QUESTIONS);
                setLoading(false);
            }, 420);
            return () => clearTimeout(timer);
        }

        if (!fileUrl) {
            setError('Không tìm thấy file tài liệu. Vui lòng quay lại và tải lên.');
            setLoading(false);
            return undefined;
        }

        const controller = new AbortController();

        async function callAI() {
            try {
                setLoading(true);
                setError(null);

                const questionCount = settingsData?.questionCount || 5;
                const quizTitle = settingsData?.title || (isFlashcards ? 'Bộ thẻ ôn tập' : 'Bài kiểm tra');
                const difficultyDistribution = settingsData?.difficultyDistribution;
                const language = settingsData?.language || 'vi';

                const generator = isFlashcards ? generateFlashcardsFromUrl : generateMCQFromUrl;
                const result = await generator(fileUrl, {
                    documentId,
                    quizTitle,
                    numberOfQuestions: questionCount === 0 ? 5 : questionCount,
                    numberOfCards: questionCount === 0 ? 5 : questionCount,
                    difficultyDistribution,
                    language,
                }, controller.signal);

                if (controller.signal.aborted) return;

                if (!result.success || !result.data?.questions?.length) {
                    throw new Error(result.message || (isFlashcards ? 'AI không trả về thẻ ôn tập nào.' : 'AI không trả về câu hỏi nào.'));
                }

                setQuestions(result.data.questions.map(isFlashcards ? mapAiFlashcard : mapAiQuestion));
            } catch (err) {
                if (controller.signal.aborted) return;
                console.error('[QuizPreview] AI error:', err);
                setError(err.message || (isFlashcards ? 'Không thể tạo thẻ ôn tập từ AI. Vui lòng thử lại.' : 'Không thể tạo câu hỏi từ AI. Vui lòng thử lại.'));
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        }

        callAI();
        return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function routeFor(path) {
        return isDevPreview ? path.replace('/teacher', '/dev/teacher') : path;
    }

    function handleBack() {
        navigate(routeFor('/teacher/quiz-settings'), {
            state: { fileName, fileSize, documentId, fileUrl, activityType, settings: settingsData },
        });
    }

    async function handlePublish() {
        if (questions.length === 0 || isDevPreview) return;

        setPublishing(true);
        setPublishError(null);

        const payload = {
            documentId: Number(documentId),
            title: settingsData?.title || (isFlashcards ? 'Bộ thẻ ôn tập' : 'Bài kiểm tra'),
            activityType: isFlashcards ? 'flashcards' : 'quiz',
            questions: questions.map((question, index) => ({
                questionText: question.question.trim(),
                questionType: isFlashcards ? 'Flashcard' : 'MultipleChoice',
                position: index,
                options: isFlashcards
                    ? [
                        {
                            optionText: (question.back || question.options?.[0]?.text || '').trim(),
                            isCorrect: true,
                        },
                    ]
                    : question.options.map((option) => ({
                        optionText: option.text.trim(),
                        isCorrect: option.isCorrect,
                    })),
            })),
        };

        const quizTitle = settingsData?.title || (isFlashcards ? 'Bộ thẻ ôn tập' : 'Bài kiểm tra');

        try {
            const result = await publishQuiz(payload);
            const quizId = result?.id ?? result?.quizId;
            if (!quizId) {
                throw new Error(isFlashcards
                    ? 'Không thể tạo bộ thẻ ôn tập - backend không trả về ID.'
                    : 'Không thể tạo bộ câu hỏi - backend không trả về ID.');
            }

            navigate(routeFor('/teacher/library'), {
                state: {
                    activeTab: 'quizzes',
                    targetQuizId: quizId,
                    successMessage: isFlashcards
                        ? 'Bộ thẻ ôn tập của bạn đã sẵn sàng, bạn có thể xem ở Thư viện của tôi.'
                        : 'Bài kiểm tra của bạn đã sẵn sàng, bạn có thể xem ở Thư viện của tôi.',
                },
            });
        } catch (err) {
            console.error('[QuizPreview] Publish error:', err);
            setPublishError(err.message || (isFlashcards ? 'Không thể xuất bản bộ thẻ ôn tập. Vui lòng thử lại.' : 'Không thể xuất bản bài kiểm tra. Vui lòng thử lại.'));
            setPublishing(false);
        }
    }

    function handleDeleteQuestion(id) {
        setQuestions((prev) => prev.filter((question) => question.id !== id));
        if (editingQuestionId === id) {
            setEditingQuestionId(null);
            setEditDraft(null);
        }
    }

    function handleDuplicate(id) {
        setQuestions((prev) => {
            const idx = prev.findIndex((question) => question.id === id);
            if (idx === -1) return prev;
            const copy = {
                ...prev[idx],
                id: Date.now(),
                back: prev[idx].back,
                options: prev[idx].options.map((option) => ({ ...option })),
            };
            const next = [...prev];
            next.splice(idx + 1, 0, copy);
            return next;
        });
    }

    function startEditing(question) {
        setEditingQuestionId(question.id);
        setEditDraft({
            question: question.question,
            back: question.back || question.options?.[0]?.text || '',
            time: question.time,
            points: question.points,
            options: question.options.map((option) => ({ ...option })),
        });
    }

    function cancelEditing() {
        setEditingQuestionId(null);
        setEditDraft(null);
    }

    function saveEditing(id) {
        if (!editDraft) return;
        setQuestions((prev) =>
            prev.map((question) =>
                question.id === id
                    ? {
                        ...question,
                        question: editDraft.question,
                        back: editDraft.back,
                        time: editDraft.time,
                        points: editDraft.points,
                        options: question.type === 'FLASHCARD'
                            ? [{ text: editDraft.back || '', isCorrect: true }]
                            : editDraft.options,
                    }
                    : question,
            ),
        );
        setEditingQuestionId(null);
        setEditDraft(null);
    }

    function updateDraftQuestion(text) {
        setEditDraft((prev) => ({ ...prev, question: text }));
    }

    function updateDraftBack(text) {
        setEditDraft((prev) => ({ ...prev, back: text }));
    }

    function updateDraftOptionText(optionIndex, text) {
        setEditDraft((prev) => ({
            ...prev,
            options: prev.options.map((option, index) => (index === optionIndex ? { ...option, text } : option)),
        }));
    }

    function toggleDraftOptionCorrect(optionIndex) {
        setEditDraft((prev) => ({
            ...prev,
            options: prev.options.map((option, index) => (index === optionIndex ? { ...option, isCorrect: !option.isCorrect } : option)),
        }));
    }

    function addDraftOption() {
        setEditDraft((prev) => ({
            ...prev,
            options: [...prev.options, { text: '', isCorrect: false }],
        }));
    }

    function removeDraftOption(optionIndex) {
        if (editDraft.options.length <= 2) return;
        setEditDraft((prev) => ({
            ...prev,
            options: prev.options.filter((_, index) => index !== optionIndex),
        }));
    }

    function handleAddQuestion() {
        const newQuestion = isFlashcards ? emptyFlashcard() : emptyQuestion();
        setQuestions((prev) => [...prev, newQuestion]);
        startEditing(newQuestion);
    }

    function startTotalTimeEdit() {
        setTotalMinutesDraft(String(Math.max(1, Math.round(stats.totalTime / 60))));
        setEditingTotalTime(true);
    }

    function applyTotalTimeEdit() {
        const minutes = Number(totalMinutesDraft);
        if (!Number.isFinite(minutes) || minutes <= 0) {
            setEditingTotalTime(false);
            return;
        }

        const totalSeconds = Math.round(minutes * 60);
        setQuestions((prev) => {
            if (prev.length === 0) return prev;
            const nextTimes = distributeSeconds(totalSeconds, prev.length);
            return prev.map((question, index) => ({ ...question, time: nextTimes[index] }));
        });
        setEditingTotalTime(false);
    }

    function startQuestionTimeEdit(question) {
        setEditingTimeQuestionId(question.id);
        setQuestionTimeDraft(String(question.time));
    }

    function applyQuestionTimeEdit(questionId) {
        const seconds = Number(questionTimeDraft);
        if (!Number.isFinite(seconds) || seconds <= 0) {
            setEditingTimeQuestionId(null);
            return;
        }

        const nextTime = Math.max(5, Math.round(seconds));
        setQuestions((prev) =>
            prev.map((question) =>
                question.id === questionId ? { ...question, time: nextTime } : question,
            ),
        );
        if (editingQuestionId === questionId) {
            setEditDraft((prev) => prev ? { ...prev, time: nextTime } : prev);
        }
        setEditingTimeQuestionId(null);
    }

    function handleDragEnd(result) {
        if (!result.destination || result.destination.index === result.source.index) return;

        setQuestions((prev) => {
            const next = [...prev];
            const [movedQuestion] = next.splice(result.source.index, 1);
            next.splice(result.destination.index, 0, movedQuestion);
            return next;
        });
    }

    function renderFlashcardCard(card, index, draggableProvided, dragSnapshot) {
        const isEditing = editingQuestionId === card.id;
        const displayed = isEditing ? editDraft : card;

        return (
            <article
                ref={draggableProvided.innerRef}
                {...draggableProvided.draggableProps}
                className={[
                    'group relative rounded-[8px] border bg-white px-6 py-5 transition-[border-color,box-shadow,background-color,opacity] duration-200',
                    dragSnapshot.isDragging
                        ? 'z-10 border-dashed border-[#8DBDF0] bg-white/80 opacity-70 shadow-none'
                        : 'border-slate-200 hover:border-slate-300',
                ].join(' ')}
                style={draggableProvided.draggableProps.style}
            >
                <button
                    type="button"
                    {...draggableProvided.dragHandleProps}
                    className="absolute left-1/2 top-0 grid h-7 w-7 -translate-x-1/2 -translate-y-1/2 cursor-grab place-items-center rounded-[8px] border border-slate-200 bg-white text-slate-400 shadow-sm transition hover:border-[#BFDDFB] hover:bg-[#F8FBFF] hover:text-[#4F92DD] active:cursor-grabbing"
                    title="Kéo để đổi vị trí thẻ ôn tập"
                    aria-label="Kéo để sắp xếp"
                >
                    <Grip className="h-4 w-4" />
                </button>

                <div className="mb-4 flex items-start justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-400">
                        <span className="font-extrabold text-slate-950">{String(index + 1).padStart(2, '0')}</span>
                        <span>THẺ ÔN TẬP</span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-500">
                        {isEditing ? (
                            <>
                                <button
                                    type="button"
                                    onClick={() => saveEditing(card.id)}
                                    className="inline-flex h-8 items-center gap-1.5 rounded-[8px] bg-emerald-50 px-3 text-xs font-bold text-emerald-600 transition hover:bg-emerald-100"
                                >
                                    <Check className="h-3.5 w-3.5" />
                                    Lưu
                                </button>
                                <button
                                    type="button"
                                    onClick={cancelEditing}
                                    className="inline-flex h-8 items-center gap-1.5 rounded-[8px] border border-slate-200 bg-white px-3 text-xs font-bold text-slate-500 transition hover:bg-slate-50"
                                >
                                    <X className="h-3.5 w-3.5" />
                                    Hủy
                                </button>
                            </>
                        ) : (
                            <>
                                <button type="button" onClick={() => handleDuplicate(card.id)} className="grid h-8 w-8 place-items-center rounded-[8px] transition hover:bg-slate-100" title="Nhân đôi">
                                    <Copy className="h-4 w-4" />
                                </button>
                                <button type="button" onClick={() => handleDeleteQuestion(card.id)} className="grid h-8 w-8 place-items-center rounded-[8px] transition hover:bg-rose-50 hover:text-rose-500" title="Xóa">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => startEditing(card)}
                                    className="inline-flex h-8 items-center gap-1.5 rounded-[8px] px-2 text-xs font-bold text-slate-600 transition hover:bg-[#EAF4FF] hover:text-[#4F92DD]"
                                >
                                    <Pencil className="h-4 w-4" />
                                    Sửa
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="grid gap-5 md:grid-cols-[1fr_1px_1fr] md:items-start">
                    <div className="min-w-0">
                        <p className="mb-2 text-[11px] font-extrabold text-slate-500">Mặt trước</p>
                        {isEditing ? (
                            <textarea
                                value={displayed.question}
                                onChange={(event) => updateDraftQuestion(event.target.value)}
                                rows={3}
                                className="w-full resize-none rounded-[10px] border border-[#BFDDFB] bg-[#F8FBFF] p-3 text-[14px] font-bold leading-6 text-slate-900 outline-none transition focus:border-[#6DA6E8] focus:ring-4 focus:ring-[#EAF4FF]"
                                placeholder="Nhập mặt trước..."
                                autoFocus
                            />
                        ) : (
                            <p className="text-[15px] font-extrabold leading-7 text-slate-950">
                                {card.question || <span className="italic text-slate-400">Chưa có mặt trước</span>}
                            </p>
                        )}
                    </div>

                    <div className="hidden h-full min-h-[72px] w-px bg-slate-200 md:block" />

                    <div className="min-w-0">
                        <p className="mb-2 text-[11px] font-extrabold text-slate-500">Mặt sau</p>
                        {isEditing ? (
                            <textarea
                                value={displayed.back}
                                onChange={(event) => updateDraftBack(event.target.value)}
                                rows={3}
                                className="w-full resize-none rounded-[10px] border border-[#BFDDFB] bg-[#F8FBFF] p-3 text-[14px] font-bold leading-6 text-slate-900 outline-none transition focus:border-[#6DA6E8] focus:ring-4 focus:ring-[#EAF4FF]"
                                placeholder="Nhập mặt sau..."
                            />
                        ) : (
                            <p className="text-[15px] font-extrabold leading-7 text-slate-950">
                                {card.back || card.options?.[0]?.text || <span className="italic text-slate-400">Chưa có mặt sau</span>}
                            </p>
                        )}
                    </div>
                </div>
            </article>
        );
    }

    function renderQuestionCard(question, index, draggableProvided, dragSnapshot) {
        const isEditing = editingQuestionId === question.id;
        const displayed = isEditing ? editDraft : question;

        return (
            <article
                ref={draggableProvided.innerRef}
                {...draggableProvided.draggableProps}
                className={[
                    'group relative rounded-[8px] bg-white px-6 py-5 transition-[border-color,box-shadow,background-color,opacity] duration-200 hover:border-slate-300',
                    dragSnapshot.isDragging
                        ? 'z-10 border border-dashed border-[#8DBDF0] bg-white/80 opacity-55 shadow-none'
                        : 'border border-slate-200',
                ].join(' ')}
                style={draggableProvided.draggableProps.style}
            >
                <button
                    type="button"
                    {...draggableProvided.dragHandleProps}
                    className="absolute left-1/2 top-0 grid h-7 w-7 -translate-x-1/2 -translate-y-1/2 cursor-grab place-items-center rounded-[8px] border border-slate-200 bg-white text-slate-400 shadow-sm transition hover:border-[#BFDDFB] hover:bg-[#F8FBFF] hover:text-[#4F92DD] active:cursor-grabbing"
                    title="Kéo để đổi vị trí câu hỏi"
                    aria-label="Kéo để sắp xếp"
                >
                    <Grip className="h-4 w-4" />
                </button>

                <div className="mb-5 flex items-start justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-400">
                        <span className="font-extrabold text-slate-950">{String(index + 1).padStart(2, '0')}</span>
                        <span>{question.type}</span>
                        <span>•</span>
                        {editingTimeQuestionId === question.id ? (
                            <input
                                value={questionTimeDraft}
                                onChange={(event) => setQuestionTimeDraft(event.target.value)}
                                onBlur={() => applyQuestionTimeEdit(question.id)}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') applyQuestionTimeEdit(question.id);
                                    if (event.key === 'Escape') setEditingTimeQuestionId(null);
                                }}
                                className="h-6 w-16 rounded-md border border-[#6DA6E8] bg-[#F8FBFF] px-2 text-[11px] font-bold text-slate-700 outline-none ring-2 ring-[#EAF4FF]"
                                autoFocus
                            />
                        ) : (
                            <button
                                type="button"
                                onClick={() => startQuestionTimeEdit(question)}
                                className="rounded-md px-1 py-0.5 transition hover:bg-[#EAF4FF] hover:text-[#4F92DD]"
                                title="Chỉnh thời gian câu hỏi"
                            >
                                {question.time} giây
                            </button>
                        )}
                        <span>•</span>
                        <span>{question.points} điểm</span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-500">
                        {isEditing ? (
                            <>
                                <button
                                    type="button"
                                    onClick={() => saveEditing(question.id)}
                                    className="inline-flex h-8 items-center gap-1.5 rounded-[8px] bg-emerald-50 px-3 text-xs font-bold text-emerald-600 transition hover:bg-emerald-100"
                                >
                                    <Check className="h-3.5 w-3.5" />
                                    Lưu
                                </button>
                                <button
                                    type="button"
                                    onClick={cancelEditing}
                                    className="inline-flex h-8 items-center gap-1.5 rounded-[8px] border border-slate-200 bg-white px-3 text-xs font-bold text-slate-500 transition hover:bg-slate-50"
                                >
                                    <X className="h-3.5 w-3.5" />
                                    Hủy
                                </button>
                            </>
                        ) : (
                            <>
                                <button type="button" onClick={() => handleDuplicate(question.id)} className="grid h-8 w-8 place-items-center rounded-[8px] transition hover:bg-slate-100" title="Nhân đôi">
                                    <Copy className="h-4 w-4" />
                                </button>
                                <button type="button" onClick={() => handleDeleteQuestion(question.id)} className="grid h-8 w-8 place-items-center rounded-[8px] transition hover:bg-rose-50 hover:text-rose-500" title="Xóa">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => startEditing(question)}
                                    className="inline-flex h-8 items-center gap-1.5 rounded-[8px] px-2 text-xs font-bold text-slate-600 transition hover:bg-[#EAF4FF] hover:text-[#4F92DD]"
                                >
                                    <Pencil className="h-4 w-4" />
                                    Sửa
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <AnimatePresence mode="wait" initial={false}>
                    {isEditing ? (
                        <motion.div
                            key="question-edit"
                            className="mb-5"
                            initial={{ opacity: 0, y: -4, scale: 0.995 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 4, scale: 0.995 }}
                            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <textarea
                                value={displayed.question}
                                onChange={(event) => updateDraftQuestion(event.target.value)}
                                rows={2}
                                className="w-full resize-none rounded-[10px] border border-[#BFDDFB] bg-[#F8FBFF] p-3 text-[15px] font-bold leading-7 text-slate-900 outline-none transition focus:border-[#6DA6E8] focus:ring-4 focus:ring-[#EAF4FF]"
                                placeholder="Nhập câu hỏi..."
                                autoFocus
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="question-view"
                            className="mb-5"
                            initial={{ opacity: 0, y: -4, scale: 0.995 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 4, scale: 0.995 }}
                            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <h2 className="text-[15px] font-extrabold leading-7 text-slate-950">
                                {question.question || <span className="italic text-slate-400">Chưa có nội dung</span>}
                            </h2>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                        key={isEditing ? 'options-edit' : 'options-view'}
                        className="grid gap-x-12 gap-y-3 md:grid-cols-2"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                    >
                        {displayed.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-start gap-3">
                            <button
                                type="button"
                                onClick={isEditing ? () => toggleDraftOptionCorrect(optionIndex) : undefined}
                                className={[
                                    'mt-0.5 grid h-5 w-5 flex-none place-items-center rounded-full border transition',
                                    isEditing ? 'cursor-pointer hover:scale-105' : 'cursor-default',
                                    option.isCorrect ? 'border-emerald-600 bg-emerald-600' : 'border-slate-400 bg-white',
                                ].join(' ')}
                                title={isEditing ? 'Đổi trạng thái đáp án đúng' : undefined}
                            >
                                {option.isCorrect && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                            </button>

                            {isEditing ? (
                                <div className="flex min-w-0 flex-1 items-center gap-2">
                                    <input
                                        type="text"
                                        value={option.text}
                                        onChange={(event) => updateDraftOptionText(optionIndex, event.target.value)}
                                        className="min-w-0 flex-1 border-b border-slate-200 bg-transparent pb-1 text-sm font-medium text-slate-700 outline-none transition focus:border-[#6DA6E8]"
                                        placeholder={`Đáp án ${optionIndex + 1}`}
                                    />
                                    {editDraft.options.length > 2 && (
                                        <button
                                            type="button"
                                            onClick={() => removeDraftOption(optionIndex)}
                                            className="grid h-7 w-7 place-items-center rounded-lg text-slate-300 transition hover:bg-rose-50 hover:text-rose-500"
                                            title="Xóa đáp án"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm font-medium leading-6 text-slate-700">{option.text}</p>
                            )}
                        </div>
                        ))}

                        {isEditing && editDraft.options.length < 6 && (
                            <button
                                type="button"
                                onClick={addDraftOption}
                                className="inline-flex items-center gap-2 rounded-[10px] border border-dashed border-slate-200 px-3 py-2 text-sm font-bold text-slate-400 transition hover:border-[#BFDDFB] hover:bg-[#F8FBFF] hover:text-[#4F92DD]"
                            >
                                <Plus className="h-4 w-4" />
                                Thêm đáp án
                            </button>
                        )}
                    </motion.div>
                </AnimatePresence>
            </article>
        );
    }

    return (
        <section className="min-h-screen bg-white">
            <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                        <button
                            type="button"
                            onClick={handleBack}
                            className="grid h-9 w-9 flex-none place-items-center rounded-[8px] border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                            aria-label="Quay lại"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            className="min-w-0 truncate rounded-[8px] border border-slate-200 bg-white px-4 py-2 text-left text-sm font-bold text-slate-800"
                        >
                            {settingsData?.title || contentCopy.fallbackTitle}
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={handlePublish}
                            disabled={publishing || questions.length === 0 || isDevPreview}
                            className="inline-flex h-9 items-center gap-2 rounded-[8px] bg-[#6DA6E8] px-4 text-sm font-extrabold text-white shadow-[0_10px_22px_rgba(109,166,232,0.25)] transition hover:bg-[#4F92DD] disabled:cursor-not-allowed disabled:opacity-60"
                            title={isDevPreview ? 'Dev preview không xuất bản dữ liệu thật' : undefined}
                        >
                            {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            {contentCopy.publish}
                        </button>
                    </div>
                </div>
            </header>

            <main className="px-5 py-7">
                <div className="mx-auto max-w-[1460px]">
                    {publishError && (
                        <div className="mb-4 flex items-center gap-2 rounded-[10px] border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-600">
                            <AlertCircle className="h-4 w-4 flex-none" />
                            {publishError}
                        </div>
                    )}

                    {loading ? (
                        <motion.div className="grid min-h-[520px] place-items-center rounded-[12px] border border-slate-200 bg-white text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div>
                                <div className="mx-auto grid h-16 w-16 place-items-center rounded-[18px] bg-[#EAF4FF]">
                                    <Loader2 className="h-8 w-8 animate-spin text-[#6DA6E8]" />
                                </div>
                                <p className="mt-4 text-sm font-bold text-slate-700">{contentCopy.loading}</p>
                                <p className="mt-1 text-xs font-medium text-slate-400">{contentCopy.loadingHint}</p>
                            </div>
                        </motion.div>
                    ) : error ? (
                        <div className="grid min-h-[520px] place-items-center rounded-[12px] border border-slate-200 bg-white text-center">
                            <div>
                                <div className="mx-auto grid h-16 w-16 place-items-center rounded-[18px] bg-rose-50">
                                    <AlertCircle className="h-8 w-8 text-rose-400" />
                                </div>
                                <p className="mt-4 text-sm font-bold text-slate-700">{error}</p>
                                <button
                                    type="button"
                                    onClick={handleBack}
                                    className="mt-4 rounded-[10px] bg-[#EAF4FF] px-4 py-2 text-sm font-bold text-[#4F92DD] transition hover:bg-[#DDEEFF]"
                                >
                                    Quay lại cấu hình
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                                <div className="flex flex-wrap items-center gap-5 text-base font-extrabold text-slate-700">
                                    <span>{questions.length} {contentCopy.itemCount}</span>
                                    {!isFlashcards && (
                                        <>
                                            <span className="text-slate-300">•</span>
                                            <span>{stats.totalPoints} điểm</span>
                                            <span className="text-slate-300">•</span>
                                            {editingTotalTime ? (
                                                <span className="inline-flex items-center gap-2">
                                                    <input
                                                        value={totalMinutesDraft}
                                                        onChange={(event) => setTotalMinutesDraft(event.target.value)}
                                                        onBlur={applyTotalTimeEdit}
                                                        onKeyDown={(event) => {
                                                            if (event.key === 'Enter') applyTotalTimeEdit();
                                                            if (event.key === 'Escape') setEditingTotalTime(false);
                                                        }}
                                                        className="h-8 w-16 rounded-md border border-[#6DA6E8] bg-[#F8FBFF] px-2 text-sm font-extrabold text-slate-700 outline-none ring-2 ring-[#EAF4FF]"
                                                        autoFocus
                                                    />
                                                    <span>phút</span>
                                                </span>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={startTotalTimeEdit}
                                                    className="rounded-md px-1.5 py-1 transition hover:bg-[#EAF4FF] hover:text-[#4F92DD]"
                                                    title="Chỉnh tổng thời gian"
                                                >
                                                    {formatTotalDuration(stats.totalTime)}
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                                {!isFlashcards && (
                                    <button
                                        type="button"
                                        onClick={handleAddQuestion}
                                        className="inline-flex h-10 items-center gap-2 rounded-[8px] border border-slate-200 bg-white px-5 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50"
                                    >
                                        <Plus className="h-4 w-4" />
                                        {contentCopy.add}
                                    </button>
                                )}
                            </div>

                            <div className="mb-8 flex flex-wrap items-center gap-3">
                                <span className="inline-flex items-center gap-2 text-sm font-extrabold text-slate-700">
                                    <Sparkles className="h-4 w-4 text-[#6DA6E8]" />
                                    Trợ lý AI
                                </span>
                                {contentCopy.aiActions.map((label) => (
                                    <button
                                        key={label}
                                        type="button"
                                        className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-[#BFDDFB] hover:bg-[#F8FBFF]"
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>

                            <DragDropContext onDragEnd={handleDragEnd}>
                                <Droppable droppableId="quiz-questions">
                                    {(droppableProvided) => (
                                        <div
                                            ref={droppableProvided.innerRef}
                                            {...droppableProvided.droppableProps}
                                            className="space-y-8"
                                        >
                                            {questions.map((question, index) => (
                                                <Draggable
                                                    key={question.id}
                                                    draggableId={String(question.id)}
                                                    index={index}
                                                >
                                                    {(draggableProvided, dragSnapshot) =>
                                                        isFlashcards
                                                            ? renderFlashcardCard(question, index, draggableProvided, dragSnapshot)
                                                            : renderQuestionCard(question, index, draggableProvided, dragSnapshot)
                                                    }
                                                </Draggable>
                                            ))}
                                            {droppableProvided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </DragDropContext>

                            <button
                                type="button"
                                onClick={handleAddQuestion}
                                className="mt-8 flex w-full items-center justify-center gap-2 rounded-[10px] border-2 border-dashed border-slate-200 py-5 text-sm font-extrabold text-slate-400 transition hover:border-[#BFDDFB] hover:bg-[#F8FBFF] hover:text-[#4F92DD]"
                            >
                                <Plus className="h-4 w-4" />
                                {contentCopy.addBottom}
                            </button>
                        </>
                    )}
                </div>
            </main>
        </section>
    );
}
