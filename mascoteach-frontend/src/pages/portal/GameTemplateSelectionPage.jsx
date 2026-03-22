import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertCircle,
    BookOpen,
    BrainCircuit,
    CheckCircle2,
    Clock3,
    Gamepad2,
    Info,
    Loader2,
    Lock,
    Play,
    Sparkles,
    Users,
} from 'lucide-react';
import { getAllGameTemplates } from '@/services/gameTemplateService';
import { createSession } from '@/services/liveSessionService';
import { getQuestionsByQuiz } from '@/services/questionService';
import { normalizeQuestion } from '@/services/gameService';

const BUILTIN_TEMPLATES = [
    {
        id: '__treasure_hunt__',
        name: 'Treasure Hunt',
        logoUrl: '/images/Game1.png',
        bgImage: '/images/treasure-map.jpg',
        description:
            'Tạo phòng live cho Treasure Hunt, chia sẻ PIN cho học sinh và cho cả lớp vào chờ như Kahoot.',
        difficulty: 'Dễ vào',
        duration: '7 phút',
        skills: 'May mắn và tốc độ',
        players: '2 - 60',
        isPlus: false,
        fallbackTemplateId: 1,
        launchMode: 'live',
        accent: 'from-amber-300 via-orange-400 to-rose-500',
    },
    {
        id: '__adventure__',
        name: 'Mascoteach Adventure',
        logoUrl: '/images/mascot-head.png',
        bgImage: '/images/mascot-speaking.png',
        description:
            'Chế độ phiêu lưu hiện có. Frontend đang cho chạy local trên người chơi để test nhanh câu hỏi.',
        difficulty: 'Trung bình',
        duration: '10 phút',
        skills: 'Tư duy và phản xạ',
        players: '1 - 1',
        isPlus: false,
        fallbackTemplateId: 2,
        launchMode: 'solo',
        accent: 'from-sky-400 via-cyan-400 to-emerald-400',
    },
];

function canonicalTemplateKey(value) {
    return String(value || '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');
}

function enrichApiTemplate(template) {
    return {
        id: template.id,
        name: template.name || `Game #${template.id}`,
        logoUrl: template.thumbnailUrl || null,
        bgImage: template.thumbnailUrl || null,
        description: template.description || 'Chế độ chơi có thể tạo live session từ quiz của bạn.',
        difficulty: template.difficulty || 'Trung bình',
        duration: template.idealTime || '10 phút',
        skills: template.skills || 'Tư duy và tốc độ',
        players: template.players || '2 - 60',
        isPlus: template.isPlus ?? false,
        fallbackTemplateId: template.id,
        launchMode: 'live',
        accent: 'from-violet-500 via-indigo-500 to-sky-500',
    };
}

function dedupeTemplates(templates) {
    const seen = new Set();

    return templates.filter((template) => {
        const key = canonicalTemplateKey(template.name || template.id);
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

function difficultyClass(difficulty) {
    const value = String(difficulty || '').toLowerCase();
    if (value.includes('dễ') || value.includes('de') || value.includes('easy')) {
        return 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100';
    }
    if (value.includes('trung') || value.includes('medium')) {
        return 'border-amber-300/30 bg-amber-300/10 text-amber-100';
    }
    return 'border-rose-400/30 bg-rose-400/10 text-rose-100';
}

function BackButton({ onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white/90 backdrop-blur hover:bg-white/15"
        >
            <span aria-hidden="true">&lt;</span>
            Quay lại
        </button>
    );
}

function TemplateCard({ template, active, onSelect }) {
    return (
        <motion.button
            type="button"
            onClick={() => onSelect(template)}
            whileHover={{ y: -4, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className={`group relative aspect-square overflow-hidden rounded-[28px] border text-left transition-all ${active
                    ? 'border-white bg-white/12 shadow-[0_0_0_1px_rgba(255,255,255,0.55),0_18px_60px_rgba(15,23,42,0.35)]'
                    : 'border-white/12 bg-white/5 hover:border-white/30 hover:bg-white/10'
                }`}
        >
            {template.logoUrl ? (
                <img
                    src={template.logoUrl}
                    alt={template.name}
                    className="absolute inset-0 h-full w-full object-cover"
                    onError={(event) => {
                        event.currentTarget.style.display = 'none';
                    }}
                />
            ) : null}

            <div
                className={`absolute inset-0 bg-gradient-to-br ${template.accent || 'from-slate-700 to-slate-900'} ${template.logoUrl ? 'opacity-20' : 'opacity-100'
                    }`}
            />

            {!template.logoUrl ? (
                <div className="absolute inset-0 flex items-center justify-center">
                    <Gamepad2 className="h-14 w-14 text-white/55" />
                </div>
            ) : null}

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-transparent" />

            {active ? (
                <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-emerald-500 shadow-lg">
                    <CheckCircle2 className="h-5 w-5" />
                </div>
            ) : null}

            <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="text-sm font-bold text-white">{template.name}</p>
                <p className="mt-1 text-xs text-white/60">
                    {template.launchMode === 'live' ? 'Phòng live' : 'Chơi thử local'}
                </p>
            </div>
        </motion.button>
    );
}

export default function GameTemplateSelectionPage() {
    const location = useLocation();
    const navigate = useNavigate();

    const quizId = location.state?.quizId;
    const quizTitle = location.state?.quizTitle || 'Bài kiểm tra';
    const questionCount = location.state?.questionCount || 0;

    const [apiTemplates, setApiTemplates] = useState([]);
    const [loadingTemplates, setLoadingTemplates] = useState(true);
    const [templatesError, setTemplatesError] = useState(null);
    const [activeGame, setActiveGame] = useState(BUILTIN_TEMPLATES[0]);
    const [showInfo, setShowInfo] = useState(false);
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState(null);

    useEffect(() => {
        if (!quizId) {
            navigate('/teacher/library');
        }
    }, [navigate, quizId]);

    useEffect(() => {
        async function loadTemplates() {
            try {
                setLoadingTemplates(true);
                setTemplatesError(null);
                const data = await getAllGameTemplates();
                setApiTemplates(Array.isArray(data) ? data.map(enrichApiTemplate) : []);
            } catch {
                setTemplatesError('Không thể tải danh sách game từ server.');
            } finally {
                setLoadingTemplates(false);
            }
        }

        loadTemplates();
    }, []);

    const allTemplates = useMemo(
        () => dedupeTemplates([...BUILTIN_TEMPLATES, ...apiTemplates]),
        [apiTemplates]
    );

    useEffect(() => {
        if (!allTemplates.some((template) => template.id === activeGame?.id)) {
            setActiveGame(allTemplates[0] || null);
        }
    }, [activeGame?.id, allTemplates]);

    async function handleCreateGame() {
        if (!activeGame || !quizId || activeGame.isPlus) return;

        setCreating(true);
        setCreateError(null);

        try {
            if (activeGame.id === '__adventure__') {
                const rawQuestions = await getQuestionsByQuiz(quizId);
                const questions = (Array.isArray(rawQuestions) ? rawQuestions : []).map(normalizeQuestion);

                if (!questions.length) {
                    throw new Error('Quiz này chưa có câu hỏi nào.');
                }

                navigate('/play/adventure', {
                    state: { session: null, questions },
                });
                return;
            }

            const templateId =
                typeof activeGame.id === 'string' && activeGame.id.startsWith('__')
                    ? activeGame.fallbackTemplateId ?? 3
                    : activeGame.id;

            const session = await createSession({ quizId, templateId });
            navigate(`/teacher/live-session/${session.id}`, {
                state: {
                    session,
                    quizId,
                    quizTitle,
                    questionCount,
                    gameName: activeGame.name,
                },
            });
        } catch (error) {
            setCreateError(error.message || 'Không thể tạo game lúc này.');
        } finally {
            setCreating(false);
        }
    }

    if (!quizId || !activeGame) {
        return null;
    }

    return (
        <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#2b145d_0%,#140b35_42%,#0b1024_100%)] text-white">
            <div className="absolute inset-0 opacity-20">
                {activeGame.bgImage ? (
                    <img
                        src={activeGame.bgImage}
                        alt=""
                        className="h-full w-full object-cover blur-sm"
                        onError={(event) => {
                            event.currentTarget.style.display = 'none';
                        }}
                    />
                ) : null}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.18),transparent_55%)]" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/88 via-slate-950/62 to-slate-950/40" />

            <div className="relative z-10 flex min-h-screen flex-col px-4 py-6 md:px-8">
                <header className="flex items-center justify-between gap-4">
                    <BackButton onClick={() => navigate(-1)} />

                    <div className="inline-flex max-w-full items-center gap-3 rounded-full border border-violet-300/20 bg-violet-400/10 px-5 py-3 text-sm text-white/85 backdrop-blur">
                        <BookOpen className="h-4 w-4 text-emerald-300" />
                        <span className="max-w-[240px] truncate font-semibold">{quizTitle}</span>
                        <span className="text-white/30">•</span>
                        <span className="text-white/60">{questionCount} câu</span>
                    </div>

                    <div className="hidden w-28 md:block" />
                </header>

                <div className="mt-8 grid flex-1 gap-8 xl:grid-cols-[1.1fr_0.9fr]">
                    <section className="flex min-h-[420px] flex-col justify-center px-2 md:px-6">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeGame.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -12 }}
                                transition={{ duration: 0.28, ease: 'easeOut' }}
                            >
                                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-[28px] border border-white/15 bg-white/8 shadow-2xl">
                                    {activeGame.logoUrl ? (
                                        <img
                                            src={activeGame.logoUrl}
                                            alt={activeGame.name}
                                            className="h-full w-full object-cover"
                                            onError={(event) => {
                                                event.currentTarget.style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <Gamepad2 className="h-10 w-10 text-white/70" />
                                    )}
                                </div>

                                <h1 className="mt-8 text-5xl font-black tracking-tight md:text-7xl">{activeGame.name}</h1>

                                <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-white/75">
                                    <span className={`rounded-full border px-4 py-2 font-semibold ${difficultyClass(activeGame.difficulty)}`}>
                                        {activeGame.difficulty}
                                    </span>
                                    <span className="inline-flex items-center gap-2">
                                        <Users className="h-4 w-4" />
                                        {activeGame.players}
                                    </span>
                                    <span className="inline-flex items-center gap-2">
                                        <Clock3 className="h-4 w-4" />
                                        {activeGame.duration}
                                    </span>
                                    <span className="inline-flex items-center gap-2">
                                        <BrainCircuit className="h-4 w-4" />
                                        {activeGame.skills}
                                    </span>
                                </div>

                                <p className="mt-6 max-w-2xl text-base leading-8 text-white/82 md:text-lg">
                                    {activeGame.description}
                                </p>

                                {activeGame.launchMode === 'live' ? (
                                    <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-sm text-emerald-100">
                                        <Sparkles className="h-4 w-4" />
                                        Tạo phòng live, lấy PIN và đợi học sinh join
                                    </div>
                                ) : (
                                    <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-sky-300/20 bg-sky-300/10 px-4 py-2 text-sm text-sky-100">
                                        <Sparkles className="h-4 w-4" />
                                        Chế độ này đang chạy local để test nhanh
                                    </div>
                                )}

                                {createError ? (
                                    <div className="mt-6 flex max-w-xl items-start gap-3 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                                        <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                                        <span>{createError}</span>
                                    </div>
                                ) : null}

                                <div className="mt-8 flex flex-wrap items-center gap-4">
                                    <motion.button
                                        type="button"
                                        onClick={handleCreateGame}
                                        disabled={creating || activeGame.isPlus}
                                        whileHover={!creating && !activeGame.isPlus ? { scale: 1.02 } : undefined}
                                        whileTap={!creating && !activeGame.isPlus ? { scale: 0.98 } : undefined}
                                        className={`inline-flex min-w-[220px] items-center justify-center gap-3 rounded-full px-8 py-4 text-base font-bold shadow-xl transition ${activeGame.isPlus
                                                ? 'cursor-not-allowed bg-white/10 text-white/35'
                                                : 'bg-white text-slate-950 hover:bg-slate-100'
                                            }`}
                                    >
                                        {creating ? <Loader2 className="h-5 w-5 animate-spin" /> : activeGame.isPlus ? <Lock className="h-5 w-5" /> : <Play className="h-5 w-5 fill-current" />}
                                        {creating ? 'Đang tạo...' : activeGame.launchMode === 'live' ? 'Tạo phòng game' : 'Chơi thử ngay'}
                                    </motion.button>

                                    <button
                                        type="button"
                                        onClick={() => setShowInfo((value) => !value)}
                                        className={`inline-flex h-14 w-14 items-center justify-center rounded-full border transition ${showInfo
                                                ? 'border-white/30 bg-white/18 text-white'
                                                : 'border-white/12 bg-white/8 text-white/65 hover:bg-white/12 hover:text-white'
                                            }`}
                                    >
                                        <Info className="h-5 w-5" />
                                    </button>
                                </div>

                                <AnimatePresence>
                                    {showInfo ? (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                            animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                            className="max-w-2xl overflow-hidden"
                                        >
                                            <div className="grid gap-4 rounded-[28px] border border-white/10 bg-white/8 p-5 backdrop-blur md:grid-cols-2">
                                                <div>
                                                    <p className="text-xs uppercase tracking-[0.25em] text-white/45">Loại phòng</p>
                                                    <p className="mt-2 text-base font-semibold text-white">
                                                        {activeGame.launchMode === 'live' ? 'Live session cho cả lớp' : 'Chơi thử local'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs uppercase tracking-[0.25em] text-white/45">Template ID</p>
                                                    <p className="mt-2 text-base font-semibold text-white">
                                                        {typeof activeGame.id === 'string'
                                                            ? activeGame.fallbackTemplateId ?? 'Built-in'
                                                            : activeGame.id}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs uppercase tracking-[0.25em] text-white/45">Khuyến nghị</p>
                                                    <p className="mt-2 text-base font-semibold text-white">{activeGame.players}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs uppercase tracking-[0.25em] text-white/45">Thời lượng</p>
                                                    <p className="mt-2 text-base font-semibold text-white">{activeGame.duration}</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ) : null}
                                </AnimatePresence>
                            </motion.div>
                        </AnimatePresence>
                    </section>

                    <aside className="rounded-[32px] border border-white/10 bg-white/[0.07] backdrop-blur-xl shadow-[0_22px_80px_rgba(15,23,42,0.35)]">
                        <div className="flex items-center justify-between border-b border-white/8 px-6 py-5">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/45">Chế độ chơi</p>
                                <p className="mt-2 text-sm text-white/60">Đã lọc trùng template để không bị lặp game</p>
                            </div>
                            {loadingTemplates ? <Loader2 className="h-4 w-4 animate-spin text-white/40" /> : <span className="text-sm text-white/40">{allTemplates.length} game</span>}
                        </div>

                        {templatesError ? (
                            <div className="mx-6 mt-4 flex items-start gap-3 rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
                                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                                <span>{templatesError}</span>
                            </div>
                        ) : null}

                        <div className="max-h-[70vh] overflow-y-auto px-5 py-5">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-2">
                                {allTemplates.map((template) => (
                                    <TemplateCard
                                        key={template.id}
                                        template={template}
                                        active={template.id === activeGame.id}
                                        onSelect={setActiveGame}
                                    />
                                ))}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}