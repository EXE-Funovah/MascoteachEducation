import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FileText, Pencil, Layers, BookOpen,
    Settings2, ArrowRight, Loader2,
    ChevronDown, CheckCircle2
} from 'lucide-react';

/**
 * QuizSettingsPage — Cấu hình trước khi gọi AI Module generate câu hỏi
 * Inspired by Wayground resource settings modal
 *
 * Flow: Upload file (CreateFlowModal) → navigate('/portal/quiz-settings', { state: { file, documentId } })
 */

const STRUCTURE_OPTIONS = [
    'Phát triển chuyên môn',
    'Kiểm tra kiến thức',
    'Ôn tập cuối kỳ',
    'Trò chơi tương tác',
];

const DIFFICULTY_LEVELS = [
    { id: 1, label: 'Cấp độ 1', color: 'emerald' },
    { id: 2, label: 'Cấp độ 2', color: 'amber' },
    { id: 3, label: 'Cấp độ 3', color: 'rose' },
];

const QUESTION_TYPES = [
    { id: 'MCQ', label: 'MCQ', active: true },
    { id: 'FillBlank', label: 'Điền vào chỗ trống', active: false },
    { id: 'Open', label: 'Mở ra', active: false },
    { id: 'Essay', label: 'Đoạn văn', active: false },
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

export default function QuizSettingsPage() {
    const location = useLocation();
    const navigate = useNavigate();

    // Data passed from CreateFlowModal
    const fileName = location.state?.fileName;
    const fileSize = location.state?.fileSize;
    const documentId = location.state?.documentId;

    const [settings, setSettings] = useState({
        title: 'Bài kiểm tra',
        structure: 'Phát triển chuyên môn',
        difficulties: [1, 2, 3],
        questionType: 'MCQ',
        questionCount: 20,
        language: 'vi',
    });

    const [isGenerating, setIsGenerating] = useState(false);
    const [editingTitle, setEditingTitle] = useState(false);

    // Redirect if no file data
    useEffect(() => {
        if (!pendingFile && !documentId) {
            navigate('/teacher');
        }
    }, [pendingFile, documentId, navigate]);

    function toggleDifficulty(id) {
        setSettings(prev => {
            const has = prev.difficulties.includes(id);
            if (has && prev.difficulties.length === 1) return prev; // keep at least 1
            return {
                ...prev,
                difficulties: has
                    ? prev.difficulties.filter(d => d !== id)
                    : [...prev.difficulties, id],
            };
        });
    }

    async function handleGenerate() {
        setIsGenerating(true);

        // Navigate to preview with settings — the preview page will call the AI API
        setTimeout(() => {
            navigate('/teacher/quiz-preview', {
                state: {
                    fileName,
                    fileSize,
                    documentId,
                    settings,
                },
            });
        }, 600);
    }

    if (!pendingFile && !documentId) return null;

    return (
        <section className="max-w-2xl mx-auto px-4 py-8">
            <motion.article
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                {/* ── Header ── */}
                <header className="px-8 py-6 border-b border-slate-100/60">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center">
                            <Settings2 className="w-[18px] h-[18px] text-sky-500" />
                        </div>
                        <h1 className="text-[16px] font-bold text-slate-800">
                            Hãy cùng tạo tài nguyên của bạn
                        </h1>
                    </div>
                </header>

                <div className="px-8 py-6 space-y-6">
                    {/* ── File Info ── */}
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/60 border border-slate-100">
                        <div className="w-9 h-9 rounded-lg bg-slate-200/60 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 text-slate-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-medium text-slate-700 truncate">
                                {fileName || `Document #${documentId}`}
                            </p>
                            {fileSize && (
                                <p className="text-[11px] text-slate-400">
                                    {(fileSize / 1024).toFixed(1)} KB
                                </p>
                            )}
                        </div>
                        <Pencil className="w-4 h-4 text-slate-300" />
                    </div>

                    {/* ── Title ── */}
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-emerald-400 flex-shrink-0" />
                        {editingTitle ? (
                            <input
                                type="text"
                                value={settings.title}
                                onChange={e => setSettings(p => ({ ...p, title: e.target.value }))}
                                onBlur={() => setEditingTitle(false)}
                                onKeyDown={e => e.key === 'Enter' && setEditingTitle(false)}
                                className="text-[14px] font-medium text-slate-700 border-b-2 border-sky-400 outline-none bg-transparent pb-0.5"
                                autoFocus
                            />
                        ) : (
                            <button
                                onClick={() => setEditingTitle(true)}
                                className="flex items-center gap-2 text-[14px] font-medium text-slate-700 hover:text-sky-600 transition-colors"
                            >
                                {settings.title}
                                <Pencil className="w-3.5 h-3.5 text-slate-300" />
                            </button>
                        )}
                    </div>

                    {/* ── Pages ── */}
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-sky-400 flex-shrink-0" />
                        <div className="flex items-center gap-2 text-[14px] text-slate-600">
                            <Layers className="w-4 h-4 text-slate-400" />
                            <span>Toàn bộ tài liệu đã chọn</span>
                            <Pencil className="w-3.5 h-3.5 text-slate-300" />
                        </div>
                    </div>

                    {/* ── Customization Section ── */}
                    <div className="pt-2">
                        <div className="flex items-center gap-2 mb-5">
                            <div className="w-3 h-3 rounded-full bg-violet-400 flex-shrink-0" />
                            <h2 className="text-[14px] font-semibold text-slate-700">
                                Tùy chỉnh tài nguyên của bạn
                            </h2>
                        </div>

                        <div className="space-y-5">
                            {/* Cấu trúc */}
                            <div className="flex items-center justify-between">
                                <span className="text-[13px] text-slate-500 font-medium">Cấu trúc</span>
                                <div className="relative">
                                    <select
                                        value={settings.structure}
                                        onChange={e => setSettings(p => ({ ...p, structure: e.target.value }))}
                                        className="appearance-none text-[13px] text-slate-600 font-medium
                                                   bg-white border border-slate-200 rounded-lg px-4 py-2 pr-8
                                                   focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-300
                                                   transition-all cursor-pointer"
                                    >
                                        {STRUCTURE_OPTIONS.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                            </div>

                            {/* Độ sâu kiến thức */}
                            <div className="flex items-center justify-between">
                                <span className="text-[13px] text-slate-500 font-medium">
                                    Độ sâu kiến thức (DOK)
                                </span>
                                <div className="flex items-center gap-2">
                                    {DIFFICULTY_LEVELS.map(level => {
                                        const isActive = settings.difficulties.includes(level.id);
                                        const colorClasses = {
                                            emerald: isActive ? 'bg-emerald-50 border-emerald-300 text-emerald-600' : '',
                                            amber: isActive ? 'bg-amber-50 border-amber-300 text-amber-600' : '',
                                            rose: isActive ? 'bg-rose-50 border-rose-300 text-rose-600' : '',
                                        };
                                        return (
                                            <button
                                                key={level.id}
                                                onClick={() => toggleDifficulty(level.id)}
                                                className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all duration-200
                                                            ${isActive
                                                        ? colorClasses[level.color]
                                                        : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                                                    }`}
                                            >
                                                {isActive && <span className="mr-1">✓</span>}
                                                {level.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Loại câu hỏi */}
                            <div className="flex items-center justify-between">
                                <span className="text-[13px] text-slate-500 font-medium">Loại câu hỏi</span>
                                <div className="flex items-center gap-2">
                                    {QUESTION_TYPES.map(qt => (
                                        <button
                                            key={qt.id}
                                            onClick={() => qt.active && setSettings(p => ({ ...p, questionType: qt.id }))}
                                            disabled={!qt.active}
                                            className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all duration-200
                                                        ${settings.questionType === qt.id
                                                    ? 'bg-sky-50 border-sky-300 text-sky-600'
                                                    : qt.active
                                                        ? 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 cursor-pointer'
                                                        : 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'
                                                }`}
                                        >
                                            {settings.questionType === qt.id ? '✓ ' : '+ '}
                                            {qt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Số lượng câu hỏi */}
                            <div className="flex items-center justify-between">
                                <span className="text-[13px] text-slate-500 font-medium">Số lượng câu hỏi</span>
                                <div className="flex items-center gap-1.5">
                                    {QUESTION_COUNTS.map(qc => (
                                        <button
                                            key={qc.value}
                                            onClick={() => setSettings(p => ({ ...p, questionCount: qc.value }))}
                                            className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all duration-200
                                                        ${settings.questionCount === qc.value
                                                    ? 'bg-slate-800 border-slate-800 text-white'
                                                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                                                }`}
                                        >
                                            {qc.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Ngôn ngữ */}
                            <div className="flex items-center justify-between">
                                <span className="text-[13px] text-slate-500 font-medium">Ngôn ngữ đầu ra</span>
                                <div className="relative">
                                    <select
                                        value={settings.language}
                                        onChange={e => setSettings(p => ({ ...p, language: e.target.value }))}
                                        className="appearance-none text-[13px] text-slate-600 font-medium
                                                   bg-white border border-slate-200 rounded-lg px-4 py-2 pr-8
                                                   focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-300
                                                   transition-all cursor-pointer"
                                    >
                                        {LANGUAGES.map(lang => (
                                            <option key={lang.value} value={lang.value}>{lang.label}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Generate Button ── */}
                    <div className="flex justify-end pt-4 border-t border-slate-100/60">
                        <motion.button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl
                                       bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[13px] font-bold
                                       hover:from-emerald-600 hover:to-teal-600 transition-all duration-200
                                       shadow-md hover:shadow-lg
                                       disabled:opacity-60 disabled:cursor-not-allowed"
                            whileHover={!isGenerating ? { scale: 1.02, y: -1 } : {}}
                            whileTap={!isGenerating ? { scale: 0.98 } : {}}
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Đang tạo...
                                </>
                            ) : (
                                <>
                                    Tạo tài nguyên
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </motion.button>
                    </div>
                </div>

                {/* ── Footer hint ── */}
                <footer className="px-8 py-3 bg-slate-50/50 border-t border-slate-100/60 text-center">
                    <p className="text-[11px] text-slate-400">
                        AI sẽ phân tích tài liệu. Hãy xem xét và tùy chỉnh tài nguyên để điều chỉnh theo nhu cầu của bạn.
                    </p>
                </footer>
            </motion.article>
        </section>
    );
}
