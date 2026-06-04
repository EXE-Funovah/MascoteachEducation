import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowRight,
    CheckCircle2,
    ChevronDown,
    CloudUpload,
    FileText,
    Layers,
    ListChecks,
    Loader2,
    Pencil,
    Settings2,
    Sparkles,
    X,
} from 'lucide-react';
import { createDocument, generateUploadUrl } from '@/services/documentService';
import { zipFileForUpload } from '@/utils/zipFile';

const STRUCTURE_OPTIONS = [
    'Phát triển chuyên môn',
    'Kiểm tra kiến thức',
    'Ôn tập cuối kỳ',
    'Trò chơi tương tác',
];

const DIFFICULTY_LEVELS = [
    { id: 1, label: 'Nhận biết', name: 'Câu hỏi kiểm tra ghi nhớ và nhận diện kiến thức' },
    { id: 2, label: 'Thông hiểu', name: 'Câu hỏi yêu cầu giải thích và liên hệ kiến thức' },
    { id: 3, label: 'Nâng cao', name: 'Câu hỏi vận dụng và xử lý tình huống' },
];

const ACTIVITY_TYPES = [
    {
        id: 'quiz',
        label: 'Trắc nghiệm',
        description: 'Câu hỏi nhanh và tương tác',
        Icon: ListChecks,
        color: 'bg-[#6DA6E8]',
    },
    {
        id: 'flashcards',
        label: 'Flashcards',
        description: 'Thẻ ghi nhớ để ôn tập',
        Icon: Layers,
        color: 'bg-[#4F92DD]',
    },
];

const QUESTION_COUNTS = [
    { label: 'Tự động', value: 0 },
    { label: '10', value: 10 },
    { label: '15', value: 15 },
    { label: '20', value: 20 },
    { label: '30', value: 30 },
];

const LANGUAGES = [
    { value: 'vi', label: 'Tiếng Việt' },
    { value: 'en', label: 'English' },
];

function buildDifficultyDistribution(difficulties) {
    const selected = difficulties.length ? difficulties : [1];
    const distribution = { 1: 0, 2: 0, 3: 0 };
    const base = Math.floor(100 / selected.length);
    let remainder = 100 - base * selected.length;

    selected.forEach((levelId) => {
        distribution[levelId] = base + (remainder > 0 ? 1 : 0);
        remainder -= 1;
    });

    return distribution;
}

function uploadFileWithProgress(uploadUrl, file, onProgress) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');

        xhr.upload.onprogress = (event) => {
            if (!event.lengthComputable) return;
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress(Math.max(1, Math.min(99, percent)));
        };

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                onProgress(100);
                resolve();
                return;
            }
            reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
        };

        xhr.onerror = () => reject(new Error('Upload failed. Please try again.'));
        xhr.send(file);
    });
}

function formatFileSize(size) {
    if (!size) return '';
    return `${(size / 1024).toFixed(1)} KB`;
}

function SelectControl({ value, onChange, options, ariaLabel }) {
    return (
        <label className="relative inline-flex min-w-[178px]">
            <span className="sr-only">{ariaLabel}</span>
            <select
                value={value}
                onChange={onChange}
                className="h-10 w-full appearance-none rounded-[10px] border border-slate-300 bg-white px-4 pr-9 text-[13px] font-semibold text-slate-700 outline-none transition focus:border-[#6DA6E8] focus:ring-4 focus:ring-[#EAF4FF]"
            >
                {options.map((option) => (
                    <option key={option.value || option} value={option.value || option}>
                        {option.label || option}
                    </option>
                ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        </label>
    );
}

function SettingRow({ label, children }) {
    return (
        <div className="grid min-h-[64px] grid-cols-[minmax(160px,1fr)_auto] items-center gap-4 border-b border-slate-200 px-4 py-3 last:border-b-0">
            <p className="text-[14px] font-medium text-slate-600">{label}</p>
            <div className="flex flex-wrap items-center justify-end gap-2">{children}</div>
        </div>
    );
}

function StepDot({ active, done, Icon }) {
    return (
        <span
            className={[
                'absolute -left-[42px] grid h-6 w-6 place-items-center rounded-full',
                active
                    ? 'border-[5px] border-[#EAF4FF] bg-[#6DA6E8] text-white'
                    : done
                        ? 'bg-[#EAF4FF] text-[#4F92DD]'
                        : 'bg-slate-100 text-slate-500',
            ].join(' ')}
        >
            {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
        </span>
    );
}

const editPanelMotion = {
    initial: { height: 0, opacity: 0, y: -8, scale: 0.985 },
    animate: { height: 'auto', opacity: 1, y: 0, scale: 1 },
    exit: { height: 0, opacity: 0, y: -8, scale: 0.985 },
    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
};

export default function QuizSettingsPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const generatingRef = useRef(false);

    const isDevPreview = location.pathname.startsWith('/dev/teacher');
    const initialFileName = location.state?.fileName;
    const initialFileSize = location.state?.fileSize;
    const documentId = location.state?.documentId;
    const fileUrl = location.state?.fileUrl;

    const [activityType, setActivityType] = useState(location.state?.activityType || 'quiz');
    const [draftActivityType, setDraftActivityType] = useState(location.state?.activityType || 'quiz');
    const [currentFile, setCurrentFile] = useState({
        fileName: initialFileName,
        fileSize: initialFileSize,
        documentId,
        fileUrl,
    });
    const [editingStep, setEditingStep] = useState(null);
    const [editingTitle, setEditingTitle] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isReplacingFile, setIsReplacingFile] = useState(false);
    const [replaceProgress, setReplaceProgress] = useState(0);
    const [replaceError, setReplaceError] = useState('');
    const [settings, setSettings] = useState({
        title: 'Bài kiểm tra',
        structure: 'Phát triển chuyên môn',
        difficulties: [1],
        questionType: 'MCQ',
        questionCount: 0,
        language: 'vi',
    });

    const creationCopy = useMemo(() => {
        if (activityType === 'flashcards') {
            return {
                typeLabel: 'Flashcards',
                intro: 'Tạo bộ flashcard',
                customize: 'Tùy chỉnh bộ flashcard',
                action: 'Tạo bộ flashcard',
                generating: 'Đang tạo flashcard...',
                footer: 'AI có thể mắc lỗi. Hãy xem lại và tùy chỉnh flashcard trước khi dùng trong lớp.',
                titleLabel: 'Tên bộ flashcard',
                titleFallback: 'Bộ flashcard',
            };
        }

        return {
            typeLabel: 'Trắc nghiệm',
            intro: 'Tạo bộ câu hỏi',
            customize: 'Tùy chỉnh bộ câu hỏi',
            action: 'Tạo bộ câu hỏi',
            generating: 'Đang tạo câu hỏi...',
            footer: 'AI có thể mắc lỗi. Hãy xem lại và tùy chỉnh bộ câu hỏi trước khi dùng trong lớp.',
            titleLabel: 'Tên bộ câu hỏi',
            titleFallback: 'Bài kiểm tra',
        };
    }, [activityType]);

    useEffect(() => {
        if (!currentFile.fileName && !currentFile.documentId) {
            navigate(isDevPreview ? '/dev/teacher' : '/teacher');
        }
    }, [currentFile.fileName, currentFile.documentId, isDevPreview, navigate]);

    useEffect(() => {
        setSettings((prev) => ({
            ...prev,
            title: activityType === 'flashcards' && prev.title === 'Bài kiểm tra'
                ? 'Bộ flashcard'
                : activityType === 'quiz' && prev.title === 'Bộ flashcard'
                    ? 'Bài kiểm tra'
                    : prev.title,
            questionType: 'MCQ',
        }));
    }, [activityType]);

    function routeFor(path) {
        return isDevPreview ? path.replace('/teacher', '/dev/teacher') : path;
    }

    function handleDifficultyToggle(levelId) {
        setSettings((prev) => {
            const exists = prev.difficulties.includes(levelId);
            const next = exists
                ? prev.difficulties.filter((id) => id !== levelId)
                : [...prev.difficulties, levelId].sort((a, b) => a - b);

            return {
                ...prev,
                difficulties: next.length > 0 ? next : [levelId],
            };
        });
    }

    async function handleFileChange(event) {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;

        setReplaceError('');
        setReplaceProgress(0);

        if (isDevPreview) {
            setIsReplacingFile(true);
            for (const value of [24, 52, 76, 100]) {
                await new Promise((resolve) => setTimeout(resolve, 110));
                setReplaceProgress(value);
            }
            setCurrentFile({
                fileName: file.name,
                fileSize: file.size,
                documentId: 'dev-replaced-upload',
                fileUrl: null,
            });
            setIsReplacingFile(false);
            setEditingStep(null);
            return;
        }

        setIsReplacingFile(true);
        try {
            const zippedFile = await zipFileForUpload(file);
            const { uploadUrl, s3Key } = await generateUploadUrl(file.name);
            await uploadFileWithProgress(uploadUrl, zippedFile, setReplaceProgress);
            const doc = await createDocument({ s3Key, fileName: file.name });

            setCurrentFile({
                fileName: file.name,
                fileSize: file.size,
                documentId: doc?.id ?? doc?.documentId ?? null,
                fileUrl: doc?.presignedUrl ?? null,
            });
            setEditingStep(null);
        } catch (error) {
            setReplaceError(error.message || 'Không thể tải tài liệu mới. Vui lòng thử lại.');
        } finally {
            setIsReplacingFile(false);
        }
    }

    async function handleGenerate() {
        if (generatingRef.current) return;
        generatingRef.current = true;
        setIsGenerating(true);

        const finalSettings = {
            ...settings,
            questionType: 'MCQ',
            difficultyDistribution: buildDifficultyDistribution(settings.difficulties),
        };

        setTimeout(() => {
            navigate(routeFor('/teacher/quiz-preview'), {
                state: {
                    fileName: currentFile.fileName,
                    fileSize: currentFile.fileSize,
                    documentId: currentFile.documentId,
                    fileUrl: currentFile.fileUrl,
                    activityType,
                    settings: finalSettings,
                },
            });
        }, 600);
    }

    if (!currentFile.fileName && !currentFile.documentId) return null;

    return (
        <section className="mx-auto max-w-[920px] px-4 py-8">
            <motion.article
                className="min-h-[760px] overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_22px_80px_rgba(109,166,232,0.12)]"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
            >
                <header className="flex items-center justify-between gap-5 px-8 py-7">
                    <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 place-items-center text-[#6DA6E8]">
                            <Sparkles className="h-8 w-8" />
                        </span>
                        <h1 className="text-[23px] font-extrabold tracking-[-0.02em] text-slate-950">
                            {creationCopy.intro}
                        </h1>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate(routeFor('/teacher'))}
                        className="grid h-10 w-10 place-items-center rounded-[10px] border border-slate-300 text-slate-900 transition hover:-translate-y-0.5 hover:bg-[#F0F7FC]"
                        aria-label="Đóng"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </header>

                <div className="relative px-8 pb-6 pl-[78px]">
                    <div className="absolute bottom-12 left-[42px] top-8 w-px bg-gradient-to-b from-slate-200 via-slate-200 to-transparent" aria-hidden="true" />

                    <div className="relative mb-7">
                        <StepDot active={editingStep === 'document'} done Icon={FileText} />
                        <div className="flex items-center gap-3">
                            <div className="min-w-0">
                                <p className="truncate text-[15px] font-semibold text-slate-700">
                                    {currentFile.fileName || `Tài liệu #${currentFile.documentId}`}
                                </p>
                                {currentFile.fileSize && (
                                    <p className="mt-0.5 text-[11px] font-medium text-slate-400">
                                        {formatFileSize(currentFile.fileSize)}
                                    </p>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => setEditingStep(editingStep === 'document' ? null : 'document')}
                                className="grid h-8 w-8 place-items-center rounded-lg text-slate-700 transition hover:bg-[#EAF4FF] hover:text-[#4F92DD]"
                                aria-label="Chọn lại tài liệu"
                            >
                                <motion.span
                                    animate={{ rotate: editingStep === 'document' ? -12 : 0, scale: editingStep === 'document' ? 1.08 : 1 }}
                                    transition={{ type: 'spring', stiffness: 420, damping: 24 }}
                                >
                                    <Pencil className="h-4 w-4" />
                                </motion.span>
                            </button>
                        </div>

                        <AnimatePresence initial={false}>
                            {editingStep === 'document' && (
                                <motion.div
                                    {...editPanelMotion}
                                    className="overflow-hidden"
                                >
                                    <div className="mt-4 rounded-[14px] border border-dashed border-[#BFDDFB] bg-[#F8FBFF] p-5">
                                        <div className="grid gap-5 md:grid-cols-[1fr_1.1fr] md:items-center">
                                            <div className="relative min-h-[170px] overflow-hidden rounded-xl border border-[#D7EAF4] bg-white">
                                                <div className="absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#D7EAF4]" />
                                                <div className="absolute left-[18%] top-[24%] grid h-9 w-9 place-items-center rounded-full bg-white text-[#6DA6E8] shadow-sm">
                                                    <FileText className="h-4 w-4" />
                                                </div>
                                                <div className="absolute right-[18%] top-[30%] grid h-9 w-9 place-items-center rounded-full bg-white text-[#4F92DD] shadow-sm">
                                                    <Layers className="h-4 w-4" />
                                                </div>
                                                <div className="absolute bottom-6 left-1/2 grid h-20 w-28 -translate-x-1/2 place-items-center rounded-xl border border-[#BFDCEB] bg-[#F0F7FC] shadow-sm">
                                                    <CloudUpload className="h-8 w-8 text-[#6DA6E8]" />
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-extrabold tracking-[-0.02em] text-slate-950">
                                                    Chọn tài liệu khác
                                                </h3>
                                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                                    Tải lên PDF, DOCX hoặc PPTX. File mới sẽ được dùng cho lần tạo này.
                                                </p>
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept=".pdf,.doc,.docx,.pptx"
                                                    className="hidden"
                                                    onChange={handleFileChange}
                                                />
                                                <div className="mt-4 flex flex-wrap gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => fileInputRef.current?.click()}
                                                        disabled={isReplacingFile}
                                                        className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-[#6DA6E8] px-4 text-[13px] font-extrabold text-white shadow-[0_12px_24px_rgba(109,166,232,0.28)] transition hover:-translate-y-0.5 hover:bg-[#4F92DD] disabled:cursor-not-allowed disabled:opacity-60"
                                                    >
                                                        {isReplacingFile ? <Loader2 className="h-4 w-4 animate-spin" /> : <CloudUpload className="h-4 w-4" />}
                                                        {isReplacingFile ? 'Đang tải lên...' : 'Chọn từ thiết bị'}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditingStep(null)}
                                                        className="h-10 rounded-[10px] border border-slate-300 bg-white px-4 text-[13px] font-bold text-slate-700 transition hover:bg-slate-50"
                                                    >
                                                        Hủy
                                                    </button>
                                                </div>
                                                {isReplacingFile && (
                                                    <div className="mt-4 max-w-sm">
                                                        <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-500">
                                                            <span>Đang tải tài liệu</span>
                                                            <span>{replaceProgress}%</span>
                                                        </div>
                                                        <div className="h-2 overflow-hidden rounded-full bg-white">
                                                            <div
                                                                className="h-full rounded-full bg-[#6DA6E8] transition-all duration-300 ease-out"
                                                                style={{ width: `${replaceProgress}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                                {replaceError && (
                                                    <p className="mt-3 text-sm font-semibold text-rose-500">{replaceError}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="relative mb-7">
                        <StepDot active={editingStep === 'type'} done Icon={Settings2} />
                        <div className="flex items-center gap-3">
                            <p className="text-[15px] font-semibold text-slate-700">{creationCopy.typeLabel}</p>
                            <button
                                type="button"
                                onClick={() => {
                                    setDraftActivityType(activityType);
                                    setEditingStep(editingStep === 'type' ? null : 'type');
                                }}
                                className="grid h-8 w-8 place-items-center rounded-lg text-slate-700 transition hover:bg-[#EAF4FF] hover:text-[#4F92DD]"
                                aria-label="Chọn lại loại nội dung"
                            >
                                <motion.span
                                    animate={{ rotate: editingStep === 'type' ? -12 : 0, scale: editingStep === 'type' ? 1.08 : 1 }}
                                    transition={{ type: 'spring', stiffness: 420, damping: 24 }}
                                >
                                    <Pencil className="h-4 w-4" />
                                </motion.span>
                            </button>
                        </div>

                        <AnimatePresence initial={false}>
                            {editingStep === 'type' && (
                                <motion.div
                                    {...editPanelMotion}
                                    className="overflow-hidden"
                                >
                                    <div className="mt-4">
                                        <p className="mb-3 text-[15px] font-extrabold text-slate-950">Chọn loại nội dung</p>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            {ACTIVITY_TYPES.map((type, index) => {
                                                const active = draftActivityType === type.id;
                                                return (
                                                    <motion.button
                                                        key={type.id}
                                                        type="button"
                                                        onClick={() => setDraftActivityType(type.id)}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: index * 0.04, duration: 0.22, ease: 'easeOut' }}
                                                        className={[
                                                            'relative flex min-h-[170px] flex-col items-center justify-center gap-2 rounded-[14px] border bg-white text-center transition',
                                                            active
                                                                ? 'border-2 border-[#6DA6E8] bg-[#F8FBFF] shadow-[0_16px_38px_rgba(109,166,232,0.16)]'
                                                                : 'border-slate-200 hover:border-[#BFDDFB] hover:shadow-[0_12px_28px_rgba(109,166,232,0.12)]',
                                                        ].join(' ')}
                                                    >
                                                        <span className={`grid h-16 w-16 place-items-center rounded-[10px] text-white ${type.color}`}>
                                                            <type.Icon className="h-9 w-9" />
                                                        </span>
                                                        <span className="mt-2 text-[16px] font-extrabold text-slate-950">{type.label}</span>
                                                        <span className="max-w-[180px] text-[13px] leading-5 text-slate-500">{type.description}</span>
                                                        <AnimatePresence>
                                                            {active && (
                                                                <motion.span
                                                                    initial={{ scale: 0.65, opacity: 0 }}
                                                                    animate={{ scale: 1, opacity: 1 }}
                                                                    exit={{ scale: 0.65, opacity: 0 }}
                                                                    transition={{ type: 'spring', stiffness: 520, damping: 26 }}
                                                                    className="absolute right-4 top-4 grid h-6 w-6 place-items-center rounded-full bg-[#6DA6E8] text-white"
                                                                >
                                                                    <CheckCircle2 className="h-5 w-5" />
                                                                </motion.span>
                                                            )}
                                                        </AnimatePresence>
                                                    </motion.button>
                                                );
                                            })}
                                        </div>
                                        <div className="mt-4 flex justify-end gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setEditingStep(null)}
                                                className="h-10 rounded-[10px] border border-slate-300 bg-white px-5 text-[13px] font-bold text-slate-700 transition hover:bg-slate-50"
                                            >
                                                Hủy
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setActivityType(draftActivityType);
                                                    setEditingStep(null);
                                                }}
                                                className="h-10 rounded-[10px] bg-[#6DA6E8] px-5 text-[13px] font-extrabold text-white shadow-[0_12px_24px_rgba(109,166,232,0.28)] transition hover:-translate-y-0.5 hover:bg-[#4F92DD]"
                                            >
                                                Áp dụng
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="relative mb-7 flex items-center gap-3">
                        <StepDot done Icon={Layers} />
                        <p className="text-[15px] font-semibold text-slate-700">Toàn bộ tài liệu đã chọn</p>
                    </div>

                    <div className="relative">
                        <StepDot active />
                        <div className="mb-4">
                            <h2 className="text-[16px] font-extrabold text-slate-900">{creationCopy.customize}</h2>
                        </div>

                        <div className="overflow-hidden rounded-[10px] border border-slate-300 bg-white">
                            <SettingRow label={creationCopy.titleLabel}>
                                {editingTitle ? (
                                    <input
                                        type="text"
                                        value={settings.title}
                                        onChange={(event) => setSettings((prev) => ({ ...prev, title: event.target.value }))}
                                        onBlur={() => setEditingTitle(false)}
                                        onKeyDown={(event) => event.key === 'Enter' && setEditingTitle(false)}
                                        className="h-10 min-w-[220px] rounded-[10px] border border-[#6DA6E8] px-3 text-[13px] font-semibold text-slate-700 outline-none ring-4 ring-[#EAF4FF]"
                                        autoFocus
                                    />
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setEditingTitle(true)}
                                        className="inline-flex h-10 min-w-[178px] items-center justify-between gap-3 rounded-[10px] border border-slate-300 bg-white px-4 text-[13px] font-semibold text-slate-700 transition hover:border-[#6DA6E8]"
                                    >
                                        <span>{settings.title || creationCopy.titleFallback}</span>
                                        <Pencil className="h-3.5 w-3.5 text-slate-400" />
                                    </button>
                                )}
                            </SettingRow>

                            <SettingRow label="Mục tiêu bài học">
                                <SelectControl
                                    value={settings.structure}
                                    onChange={(event) => setSettings((prev) => ({ ...prev, structure: event.target.value }))}
                                    options={STRUCTURE_OPTIONS}
                                    ariaLabel="Chọn mục tiêu bài học"
                                />
                            </SettingRow>

                            <SettingRow label="Độ sâu kiến thức (DOK)">
                                {DIFFICULTY_LEVELS.map((level) => {
                                    const active = settings.difficulties.includes(level.id);
                                    return (
                                        <button
                                            key={level.id}
                                            type="button"
                                            onClick={() => handleDifficultyToggle(level.id)}
                                            title={level.name}
                                            className={[
                                                'h-8 rounded-full border px-4 text-[12px] font-extrabold transition',
                                                active
                                                    ? 'border-[#6DA6E8] bg-[#EAF4FF] text-[#173154] shadow-[0_8px_18px_rgba(109,166,232,0.14)]'
                                                    : 'border-slate-300 bg-white text-slate-600 hover:border-[#6DA6E8]',
                                            ].join(' ')}
                                        >
                                            {level.label}
                                        </button>
                                    );
                                })}
                            </SettingRow>

                            {activityType === 'quiz' && (
                                <SettingRow label="Loại câu hỏi">
                                    <span className="h-8 rounded-full border border-[#6DA6E8] bg-[#EAF4FF] px-4 py-1.5 text-[12px] font-extrabold text-[#173154]">
                                        Trắc nghiệm
                                    </span>
                                </SettingRow>
                            )}

                            <SettingRow label={activityType === 'flashcards' ? 'Số lượng thẻ' : 'Số lượng câu hỏi'}>
                                {QUESTION_COUNTS.map((count) => (
                                    <button
                                        key={count.value}
                                        type="button"
                                        onClick={() => setSettings((prev) => ({ ...prev, questionCount: count.value }))}
                                        className={[
                                            'h-8 rounded-full border px-4 text-[12px] font-extrabold transition',
                                            settings.questionCount === count.value
                                                ? 'border-[#6DA6E8] bg-[#6DA6E8] text-white'
                                                : 'border-slate-300 bg-white text-slate-600 hover:border-[#6DA6E8]',
                                        ].join(' ')}
                                    >
                                        {count.label}
                                    </button>
                                ))}
                            </SettingRow>

                            <SettingRow label="Ngôn ngữ đầu ra">
                                <SelectControl
                                    value={settings.language}
                                    onChange={(event) => setSettings((prev) => ({ ...prev, language: event.target.value }))}
                                    options={LANGUAGES}
                                    ariaLabel="Chọn ngôn ngữ đầu ra"
                                />
                            </SettingRow>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <motion.button
                                type="button"
                                onClick={handleGenerate}
                                disabled={isGenerating}
                                className="inline-flex h-12 items-center justify-center gap-2 rounded-[10px] bg-[#6DA6E8] px-7 text-[13px] font-extrabold text-white shadow-[0_16px_34px_rgba(109,166,232,0.3)] transition hover:bg-[#4F92DD] disabled:cursor-not-allowed disabled:opacity-60"
                                whileHover={!isGenerating ? { scale: 1.02, y: -1 } : {}}
                                whileTap={!isGenerating ? { scale: 0.98 } : {}}
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        {creationCopy.generating}
                                    </>
                                ) : (
                                    <>
                                        {creationCopy.action}
                                        <ArrowRight className="h-4 w-4" />
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </div>
                </div>

                <footer className="mt-auto border-t border-slate-100 px-8 py-4 text-center">
                    <p className="text-[11px] font-medium text-slate-400">
                        {creationCopy.footer}
                    </p>
                </footer>
            </motion.article>
        </section>
    );
}
