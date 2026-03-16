import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FileText, Pencil, Layers, Settings2,
    ArrowRight, Loader2, ChevronDown,
    Minus, Plus, Sliders
} from 'lucide-react';

const STRUCTURE_OPTIONS = [
    'Phát triển chuyên môn',
    'Kiểm tra kiến thức',
    'Ôn tập cuối kỳ',
    'Trò chơi tương tác',
];

const DIFFICULTY_LEVELS = [
    { id: 1, label: 'Nhận biết', sublabel: 'Cấp độ 1', color: 'emerald', emoji: '🟢' },
    { id: 2, label: 'Thông hiểu', sublabel: 'Cấp độ 2', color: 'amber', emoji: '🟡' },
    { id: 3, label: 'Vận dụng', sublabel: 'Cấp độ 3', color: 'rose', emoji: '🔴' },
];

const DIFFICULTY_PRESETS = [
    { id: 'easy', label: 'Dễ trước', desc: 'Ưu tiên nhận biết', distribution: { 1: 50, 2: 30, 3: 20 } },
    { id: 'balanced', label: 'Cân bằng', desc: 'Phân bổ đều', distribution: { 1: 40, 2: 40, 3: 20 } },
    { id: 'advanced', label: 'Nâng cao', desc: 'Ưu tiên vận dụng', distribution: { 1: 20, 2: 40, 3: 40 } },
    { id: 'custom', label: 'Tùy chỉnh', desc: 'Tự điều chỉnh', distribution: null },
];

const DEFAULT_DIFFICULTY_DISTRIBUTION = {
    1: 40,
    2: 40,
    3: 20,
};

const QUESTION_TYPES = [
    { id: 'MCQ', label: 'MCQ', active: true },
    { id: 'FillBlank', label: 'Điền vào chỗ trống', active: false },
    { id: 'Open', label: 'Mở', active: false },
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

    const fileName = location.state?.fileName;
    const fileSize = location.state?.fileSize;
    const documentId = location.state?.documentId;
    const fileUrl = location.state?.fileUrl;

    const [settings, setSettings] = useState({
        title: 'Bài kiểm tra',
        structure: 'Phát triển chuyên môn',
        difficulties: [1, 2, 3],
        difficultyDistribution: DEFAULT_DIFFICULTY_DISTRIBUTION,
        questionType: 'MCQ',
        questionCount: 20,
        language: 'vi',
    });

    const [selectedPreset, setSelectedPreset] = useState('balanced');
    const [isGenerating, setIsGenerating] = useState(false);
    const [editingTitle, setEditingTitle] = useState(false);
    const generatingRef = useRef(false);

    useEffect(() => {
        if (!fileName && !documentId) {
            navigate('/teacher');
        }
    }, [fileName, documentId, navigate]);

    function handlePresetSelect(presetId) {
        setSelectedPreset(presetId);
        const preset = DIFFICULTY_PRESETS.find(p => p.id === presetId);
        if (preset && preset.distribution) {
            setSettings(prev => ({
                ...prev,
                difficultyDistribution: { ...preset.distribution },
                difficulties: DIFFICULTY_LEVELS.filter(l => preset.distribution[l.id] > 0).map(l => l.id),
            }));
        }
    }

    function handleCustomStep(levelId, delta) {
        setSettings(prev => {
            const current = { ...(prev.difficultyDistribution || DEFAULT_DIFFICULTY_DISTRIBUTION) };
            const newVal = Math.max(0, Math.min(100, (current[levelId] || 0) + delta));
            const diff = newVal - (current[levelId] || 0);

            if (diff === 0) return prev;

            current[levelId] = newVal;

            // Redistribute the difference among other levels proportionally
            const others = DIFFICULTY_LEVELS.filter(l => l.id !== levelId);
            const otherTotal = others.reduce((sum, l) => sum + (current[l.id] || 0), 0);

            if (otherTotal === 0 && diff > 0) {
                // If other levels are 0, we can't reduce them further
                // Distribute remaining evenly
                const remaining = 100 - newVal;
                const evenShare = Math.floor(remaining / others.length);
                let leftover = remaining - evenShare * others.length;
                others.forEach(l => {
                    current[l.id] = evenShare + (leftover > 0 ? 1 : 0);
                    if (leftover > 0) leftover--;
                });
            } else if (diff > 0) {
                // Increased this level → decrease others proportionally
                let toReduce = diff;
                // Sort by descending value so we take from the biggest first
                const sortedOthers = [...others].sort((a, b) => (current[b.id] || 0) - (current[a.id] || 0));
                for (const l of sortedOthers) {
                    const canTake = Math.min(current[l.id] || 0, toReduce);
                    current[l.id] -= canTake;
                    toReduce -= canTake;
                    if (toReduce <= 0) break;
                }
            } else {
                // Decreased this level → increase others proportionally
                let toAdd = Math.abs(diff);
                if (otherTotal > 0) {
                    let assigned = 0;
                    others.forEach((l, idx) => {
                        if (idx === others.length - 1) {
                            current[l.id] += (toAdd - assigned);
                        } else {
                            const share = Math.round(((current[l.id] || 0) / otherTotal) * toAdd);
                            current[l.id] += share;
                            assigned += share;
                        }
                    });
                } else {
                    const evenShare = Math.floor(toAdd / others.length);
                    let leftover = toAdd - evenShare * others.length;
                    others.forEach(l => {
                        current[l.id] = (current[l.id] || 0) + evenShare + (leftover > 0 ? 1 : 0);
                        if (leftover > 0) leftover--;
                    });
                }
            }

            return {
                ...prev,
                difficultyDistribution: current,
                difficulties: DIFFICULTY_LEVELS.filter(l => current[l.id] > 0).map(l => l.id),
            };
        });
        setSelectedPreset('custom');
    }

    async function handleGenerate() {
        if (generatingRef.current) return;
        generatingRef.current = true;
        setIsGenerating(true);

        setTimeout(() => {
            navigate('/teacher/quiz-preview', {
                state: {
                    fileName,
                    fileSize,
                    documentId,
                    fileUrl,
                    settings,
                },
            });
        }, 600);
    }

    if (!fileName && !documentId) return null;

    const colorMap = {
        emerald: {
            bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700',
            barBg: 'bg-emerald-400', btnHover: 'hover:bg-emerald-100',
            btnActive: 'bg-emerald-100 text-emerald-700',
        },
        amber: {
            bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700',
            barBg: 'bg-amber-400', btnHover: 'hover:bg-amber-100',
            btnActive: 'bg-amber-100 text-amber-700',
        },
        rose: {
            bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700',
            barBg: 'bg-rose-400', btnHover: 'hover:bg-rose-100',
            btnActive: 'bg-rose-100 text-rose-700',
        },
    };

    return (
        <section className="max-w-2xl mx-auto px-4 py-8">
            <motion.article
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
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

                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-sky-400 flex-shrink-0" />
                        <div className="flex items-center gap-2 text-[14px] text-slate-600">
                            <Layers className="w-4 h-4 text-slate-400" />
                            <span>Toàn bộ tài liệu đã chọn</span>
                            <Pencil className="w-3.5 h-3.5 text-slate-300" />
                        </div>
                    </div>

                    <div className="pt-2">
                        <div className="flex items-center gap-2 mb-5">
                            <div className="w-3 h-3 rounded-full bg-violet-400 flex-shrink-0" />
                            <h2 className="text-[14px] font-semibold text-slate-700">
                                Tùy chỉnh tài nguyên của bạn
                            </h2>
                        </div>

                        <div className="space-y-5">
                            <div className="flex items-center justify-between">
                                <span className="text-[13px] text-slate-500 font-medium">Cấu trúc</span>
                                <div className="relative">
                                    <select
                                        value={settings.structure}
                                        onChange={e => setSettings(p => ({ ...p, structure: e.target.value }))}
                                        className="appearance-none text-[13px] text-slate-600 font-medium bg-white border border-slate-200 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-300 transition-all cursor-pointer"
                                    >
                                        {STRUCTURE_OPTIONS.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                            </div>

                            {/* ── Difficulty Distribution ── */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Sliders className="w-4 h-4 text-slate-400" />
                                    <span className="text-[13px] text-slate-500 font-medium">
                                        Phân bổ độ khó
                                    </span>
                                </div>

                                {/* Preset buttons */}
                                <div className="grid grid-cols-4 gap-2">
                                    {DIFFICULTY_PRESETS.map(preset => (
                                        <button
                                            key={preset.id}
                                            onClick={() => handlePresetSelect(preset.id)}
                                            className={`relative flex flex-col items-center gap-1 px-3 py-3 rounded-xl border-2 text-center transition-all duration-200
                                                ${selectedPreset === preset.id
                                                    ? 'border-sky-400 bg-sky-50 shadow-sm'
                                                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                                                }`}
                                        >
                                            <span className={`text-[12px] font-bold ${selectedPreset === preset.id ? 'text-sky-700' : 'text-slate-700'}`}>
                                                {preset.label}
                                            </span>
                                            <span className={`text-[10px] ${selectedPreset === preset.id ? 'text-sky-500' : 'text-slate-400'}`}>
                                                {preset.desc}
                                            </span>
                                            {selectedPreset === preset.id && (
                                                <motion.div
                                                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-sky-500 flex items-center justify-center"
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                                                >
                                                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </motion.div>
                                            )}
                                        </button>
                                    ))}
                                </div>

                                {/* Visual bar + level breakdown */}
                                <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-4 space-y-3">
                                    {/* Stacked bar */}
                                    <div className="flex h-3 rounded-full overflow-hidden bg-slate-200/60">
                                        {DIFFICULTY_LEVELS.map(level => {
                                            const pct = settings.difficultyDistribution?.[level.id] || 0;
                                            if (pct === 0) return null;
                                            return (
                                                <motion.div
                                                    key={level.id}
                                                    className={`${colorMap[level.color].barBg}`}
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${pct}%` }}
                                                    transition={{ duration: 0.3, ease: 'easeOut' }}
                                                />
                                            );
                                        })}
                                    </div>

                                    {/* Level rows */}
                                    <div className="space-y-2">
                                        {DIFFICULTY_LEVELS.map(level => {
                                            const pct = settings.difficultyDistribution?.[level.id] || 0;
                                            const colors = colorMap[level.color];
                                            const isCustom = selectedPreset === 'custom';

                                            return (
                                                <div
                                                    key={level.id}
                                                    className={`flex items-center gap-3 rounded-lg px-3 py-2 ${colors.bg} border ${colors.border}`}
                                                >
                                                    <span className="text-[14px]">{level.emoji}</span>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-[12px] font-bold ${colors.text}`}>{level.label}</p>
                                                        <p className="text-[10px] text-slate-400">{level.sublabel}</p>
                                                    </div>

                                                    {isCustom ? (
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                onClick={() => handleCustomStep(level.id, -5)}
                                                                disabled={pct <= 0}
                                                                className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-all duration-150
                                                                    ${pct <= 0
                                                                        ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                                                                        : `border-slate-200 text-slate-500 ${colors.btnHover} active:scale-95`
                                                                    }`}
                                                            >
                                                                <Minus className="w-3.5 h-3.5" />
                                                            </button>
                                                            <span className={`w-12 text-center text-[14px] font-bold tabular-nums ${colors.text}`}>
                                                                {pct}%
                                                            </span>
                                                            <button
                                                                onClick={() => handleCustomStep(level.id, 5)}
                                                                disabled={pct >= 100}
                                                                className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-all duration-150
                                                                    ${pct >= 100
                                                                        ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                                                                        : `border-slate-200 text-slate-500 ${colors.btnHover} active:scale-95`
                                                                    }`}
                                                            >
                                                                <Plus className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className={`text-[14px] font-bold tabular-nums ${colors.text}`}>
                                                            {pct}%
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-[13px] text-slate-500 font-medium">Loại câu hỏi</span>
                                <div className="flex items-center gap-2">
                                    {QUESTION_TYPES.map(qt => (
                                        <button
                                            key={qt.id}
                                            onClick={() => qt.active && setSettings(p => ({ ...p, questionType: qt.id }))}
                                            disabled={!qt.active}
                                            className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all duration-200 ${settings.questionType === qt.id ? 'bg-sky-50 border-sky-300 text-sky-600' : qt.active ? 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 cursor-pointer' : 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'}`}
                                        >
                                            {settings.questionType === qt.id ? '✓ ' : '+ '}
                                            {qt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-[13px] text-slate-500 font-medium">Số lượng câu hỏi</span>
                                <div className="flex items-center gap-1.5">
                                    {QUESTION_COUNTS.map(qc => (
                                        <button
                                            key={qc.value}
                                            onClick={() => setSettings(p => ({ ...p, questionCount: qc.value }))}
                                            className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all duration-200 ${settings.questionCount === qc.value ? 'bg-slate-800 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
                                        >
                                            {qc.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-[13px] text-slate-500 font-medium">Ngôn ngữ đầu ra</span>
                                <div className="relative">
                                    <select
                                        value={settings.language}
                                        onChange={e => setSettings(p => ({ ...p, language: e.target.value }))}
                                        className="appearance-none text-[13px] text-slate-600 font-medium bg-white border border-slate-200 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-300 transition-all cursor-pointer"
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

                    <div className="flex justify-end pt-4 border-t border-slate-100/60">
                        <motion.button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[13px] font-bold hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
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

                <footer className="px-8 py-3 bg-slate-50/50 border-t border-slate-100/60 text-center">
                    <p className="text-[11px] text-slate-400">
                        AI sẽ phân tích tài liệu. Hãy xem xét và tùy chỉnh tài nguyên để điều chỉnh theo nhu cầu của bạn.
                    </p>
                </footer>
            </motion.article>
        </section>
    );
}
