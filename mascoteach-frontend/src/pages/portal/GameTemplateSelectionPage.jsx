import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Play, Info, Users, Clock, BrainCircuit,
    Loader2, AlertCircle, Hash,
    CheckCircle2, Lock, X, BookOpen, Zap
} from 'lucide-react';
import { getAllGameTemplates } from '@/services/gameTemplateService';
import { createSession } from '@/services/liveSessionService';
import { getQuestionsByQuiz } from '@/services/questionService';
import { normalizeQuestion } from '@/services/gameService';

/**
 * GameTemplateSelectionPage — Netflix/streaming-style game template picker
 *
 * Layout:
 *   • Full-screen dark bg with blurred in-game screenshot as hero
 *   • Left hero: game title, tags, description, action buttons
 *   • Bottom carousel: horizontal scrollable template cards
 *   • On "Tạo Game": POST /api/LiveSession → PIN modal
 */

// ─── Built-in template data ──────────────────────────────────────────────────
const BUILTIN_TEMPLATES = [
    {
        id: '__treasure_hunt__',
        name: 'Treasure Hunt',
        logoUrl: '/images/Game1.png',
        bgImage: '/images/Game1.png',
        description:
            'Phiêu lưu săn kho báu với các câu hỏi của bạn! Học sinh trả lời đúng để tiến bước trên bản đồ, vượt qua cạm bẫy và giành lấy rương vàng.',
        difficulty: 'Đơn giản',
        difficultyColor: 'text-emerald-400',
        time: '7 phút',
        skills: 'May mắn & Tốc độ',
        players: '2 – 60',
        isPlus: false,
        fallbackTemplateId: 1,
    },
    {
        id: '__adventure__',
        name: 'Mascoteach Adventure',
        logoUrl: '/images/Game2.png',
        bgImage: '/images/Game2.png',
        description:
            'Phiêu lưu cùng gấu mèo Mascoteach! Học sinh nhập mã PIN, vượt chướng ngại vật, trả lời câu hỏi và chinh phục hành trình tri thức.',
        difficulty: 'Trung bình',
        difficultyColor: 'text-amber-400',
        time: '10 phút',
        skills: 'Tư duy & Phản xạ',
        players: '2 – 60',
        isPlus: false,
        fallbackTemplateId: 2,
    },
];

/** Enrich an API template object with display defaults */
function enrichApiTemplate(t) {
    return {
        id: t.id,
        name: t.name || `Game #${t.id}`,
        logoUrl: t.thumbnailUrl || null,
        bgImage: t.thumbnailUrl || null,
        description: t.description || 'Chế độ chơi hấp dẫn dành cho lớp học của bạn.',
        difficulty: t.difficulty || 'Trung bình',
        difficultyColor: 'text-amber-400',
        time: t.idealTime || '10 phút',
        skills: t.skills || 'Tư duy & Tốc độ',
        players: t.players || '2 – 60',
        isPlus: t.isPlus ?? false,
        fallbackTemplateId: t.id,
    };
}

// ─── Difficulty badge helper ─────────────────────────────────────────────────
function diffBadgeClass(diff) {
    if (!diff) return 'text-white/60 border-white/20 bg-white/10';
    const d = diff.toLowerCase();
    if (d.includes('đơn') || d.includes('simple') || d.includes('easy'))
        return 'text-emerald-300 border-emerald-500/40 bg-emerald-500/10';
    if (d.includes('trung') || d.includes('medium'))
        return 'text-amber-300 border-amber-500/40 bg-amber-500/10';
    return 'text-rose-300 border-rose-500/40 bg-rose-500/10';
}

// ─── Back Button with spring animation ───────────────────────────────────────
function BackButton({ onClick }) {
    const [hovered, setHovered] = useState(false);
    return (
        <motion.button
            onClick={onClick}
            onHoverStart={() => setHovered(true)}
            onHoverEnd={() => setHovered(false)}
            className="relative flex items-center gap-3 px-6 py-3 rounded-full overflow-hidden
                       border border-white/25 bg-white/10 backdrop-blur-sm
                       text-white font-semibold text-[15px] cursor-pointer"
            whileTap={{ scale: 0.96 }}
            animate={{ scale: hovered ? 1.04 : 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
            {/* Sliding fill on hover — y chang HeroSection */}
            <motion.span
                className="absolute inset-0 bg-white/20 rounded-full"
                initial={{ x: '-100%' }}
                animate={{ x: hovered ? '0%' : '-100%' }}
                transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            />

            {/* Arrow slides in từ trái */}
            <motion.span
                className="relative z-10 flex items-center overflow-hidden"
                animate={{
                    opacity: hovered ? 1 : 0,
                    width: hovered ? 16 : 0,
                    marginRight: hovered ? 0 : -12,
                }}
                transition={{ duration: 0.2 }}
            >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
            </motion.span>

            <span className="relative z-10">Quay lại</span>
        </motion.button>
    );
}

// ─── Component ────────────────────────────────────────────────────────────────
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
    const [createdSession, setCreatedSession] = useState(null);

    // Redirect if no quizId
    useEffect(() => {
        if (!quizId) navigate('/teacher/library');
    }, [quizId, navigate]);

    // Fetch API templates
    useEffect(() => {
        async function fetchTemplates() {
            try {
                setLoadingTemplates(true);
                const data = await getAllGameTemplates();
                setApiTemplates(Array.isArray(data) ? data.map(enrichApiTemplate) : []);
            } catch {
                setTemplatesError('Không thể tải danh sách game');
            } finally {
                setLoadingTemplates(false);
            }
        }
        fetchTemplates();
    }, []);

    const allTemplates = [...BUILTIN_TEMPLATES, ...apiTemplates];

    async function handleCreateGame() {
        if (!activeGame || !quizId || activeGame.isPlus) return;

        // Built-in Treasure Hunt → navigate directly to single-player game
        if (activeGame.id === '__treasure_hunt__') {
            navigate('/teacher/treasure-hunt', {
                state: {
                    quizId,
                    quizTitle,
                    questionCount,
                },
            });
            return;
        }

        // Built-in Adventure → fetch questions & navigate directly (single-player for now)
        if (activeGame.id === '__adventure__') {
            setCreating(true);
            setCreateError(null);
            try {
                const raw = await getQuestionsByQuiz(quizId);
                const questions = (Array.isArray(raw) ? raw : []).map(normalizeQuestion);
                if (!questions.length) {
                    setCreateError('Bài quiz chưa có câu hỏi nào.');
                    return;
                }
                navigate('/play/adventure', {
                    state: { session: null, questions },
                });
            } catch (err) {
                setCreateError(err.message || 'Không thể tải câu hỏi. Vui lòng thử lại.');
            } finally {
                setCreating(false);
            }
            return;
        }

        setCreating(true);
        setCreateError(null);
        try {
            const templateId =
                typeof activeGame.id === 'string' && activeGame.id.startsWith('__')
                    ? (apiTemplates[0]?.id ?? activeGame.fallbackTemplateId ?? 1)
                    : activeGame.id;

            const session = await createSession({ quizId, templateId });
            setCreatedSession(session);
        } catch (err) {
            setCreateError(err.message || 'Không thể tạo phiên chơi. Vui lòng thử lại.');
        } finally {
            setCreating(false);
        }
    }

    function handleGoToSession() {
        navigate('/teacher/sessions', { state: { newSessionId: createdSession?.id } });
    }

    if (!quizId) return null;

    const game = activeGame;

    return (
        <div className="relative w-full h-screen overflow-hidden text-white flex flex-col" style={{ fontFamily: 'Inter, -apple-system, sans-serif', background: 'linear-gradient(135deg, #0f0720 0%, #160d35 40%, #0d1a3a 100%)' }}>

            {/* ══ LAYER 1 — Blurred full-bleed background ══ */}
            <div className="absolute inset-0 z-0">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={game.id}
                        initial={{ opacity: 0, scale: 1.06 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.75, ease: 'easeOut' }}
                        className="absolute inset-0"
                    >
                        {game.bgImage ? (
                            <img
                                src={game.bgImage}
                                alt=""
                                className="w-full h-full object-cover"
                                style={{ filter: 'blur(4px) brightness(0.35) saturate(1.4)' }}
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#2d0b6b] to-[#0d1a3a]" />
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Left vignette — purple-tinted fade covering hero area */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#0f0720] via-[#160d35]/80 to-transparent" />
                {/* Bottom vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d1a3a]/70 to-transparent" />
                {/* Subtle purple ambient glow top-left */}
                <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full opacity-20"
                    style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }} />
            </div>

            {/* ══ LAYER 2 — Top nav bar ══ */}
            <header className="relative z-20 flex items-center justify-between px-10 pt-6 pb-2 flex-shrink-0">
                <BackButton onClick={() => navigate(-1)} />

                {/* Quiz context pill */}
                <div className="flex items-center gap-3 px-5 py-2.5 rounded-full
                                bg-violet-500/20 border border-violet-400/30 backdrop-blur-md">
                    <BookOpen className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span className="text-[14px] text-white/85 font-semibold max-w-[260px] truncate">
                        {quizTitle}
                    </span>
                    <span className="text-[13px] text-white/35 select-none">·</span>
                    <span className="text-[13px] text-white/55 flex-shrink-0 font-medium">{questionCount} câu</span>
                </div>

                <div className="w-24" />
            </header>

            {/* ══ LAYER 3 — Body: 50/50 split ══ */}
            <div className="relative z-10 flex-1 flex overflow-hidden">

                {/* ────────────────────────────────────────
                    LEFT 50% — Game detail / hero
                ──────────────────────────────────────── */}
                <main className="w-1/2 flex flex-col justify-center px-14 pb-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={game.id}
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.4, ease: 'easeOut' }}
                        >
                            {/* Logo badge */}
                            {game.logoUrl && (
                                <div className="mb-6 w-20 h-20 rounded-2xl overflow-hidden
                                                border border-white/20 shadow-2xl">
                                    <img src={game.logoUrl} alt={game.name} className="w-full h-full object-cover" />
                                </div>
                            )}

                            {/* Title */}
                            <h1
                                className="text-6xl font-black mb-6 tracking-tight leading-none"
                                style={{ textShadow: '0 4px 32px rgba(0,0,0,0.8)' }}
                            >
                                {game.name}
                            </h1>

                            {/* Meta tags */}
                            <div className="flex flex-wrap items-center gap-3 mb-6">
                                <span className={`border px-4 py-1.5 rounded-lg text-[15px] font-semibold ${diffBadgeClass(game.difficulty)}`}>
                                    {game.difficulty}
                                </span>
                                <span className="flex items-center gap-2 text-[15px] text-white/70 font-medium">
                                    <Users size={16} className="opacity-70 flex-shrink-0" />
                                    {game.players}
                                </span>
                                <span className="flex items-center gap-2 text-[15px] text-white/70 font-medium">
                                    <Clock size={16} className="opacity-70 flex-shrink-0" />
                                    {game.time}
                                </span>
                                <span className="flex items-center gap-2 text-[15px] text-white/70 font-medium">
                                    <BrainCircuit size={16} className="opacity-70 flex-shrink-0" />
                                    {game.skills}
                                </span>
                            </div>

                            {/* Description */}
                            <p
                                className="text-[17px] text-gray-200 leading-relaxed mb-9 line-clamp-3"
                                style={{ textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}
                            >
                                {game.description}
                            </p>

                            {/* Create error */}
                            {createError && (
                                <div className="flex items-center gap-2 mb-5 text-[14px] text-rose-300
                                                bg-rose-500/15 border border-rose-500/30 px-5 py-3 rounded-xl">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    {createError}
                                </div>
                            )}

                            {/* CTA buttons */}
                            <div className="flex items-center gap-4">
                                <motion.button
                                    onClick={handleCreateGame}
                                    disabled={creating || game.isPlus}
                                    className={`flex items-center gap-3 px-10 py-4 rounded-full font-bold
                                                text-[17px] transition-all duration-200 shadow-xl
                                                ${game.isPlus
                                            ? 'bg-white/20 text-white/40 cursor-not-allowed'
                                            : 'bg-white text-black hover:bg-gray-100'
                                        }`}
                                    whileHover={!creating && !game.isPlus ? { scale: 1.03 } : {}}
                                    whileTap={!creating && !game.isPlus ? { scale: 0.97 } : {}}
                                >
                                    {creating ? (
                                        <><Loader2 className="w-6 h-6 animate-spin" />Đang tạo...</>
                                    ) : game.isPlus ? (
                                        <><Lock className="w-6 h-6" />Yêu cầu Plus</>
                                    ) : (
                                        <><Play fill="black" className="w-6 h-6" />Tạo Game</>
                                    )}
                                </motion.button>

                                <button
                                    onClick={() => setShowInfo(v => !v)}
                                    className={`p-4 rounded-full backdrop-blur border transition-all duration-200
                                                ${showInfo
                                            ? 'bg-white/25 border-white/40 text-white'
                                            : 'bg-gray-600/40 border-gray-500/30 text-white/70 hover:bg-gray-600/60 hover:text-white'
                                        }`}
                                >
                                    <Info size={26} />
                                </button>
                            </div>

                            {/* Expandable info panel */}
                            <AnimatePresence>
                                {showInfo && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                        animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                        transition={{ duration: 0.28 }}
                                        className="overflow-hidden max-w-[500px]"
                                    >
                                        <div className="grid grid-cols-2 gap-4 p-6 rounded-2xl
                                                        bg-violet-950/50 backdrop-blur-md border border-violet-400/20">
                                            <InfoTile icon={<Users size={17} />} label="Người chơi" value={game.players} />
                                            <InfoTile icon={<Clock size={17} />} label="Thời gian" value={game.time} />
                                            <InfoTile icon={<BrainCircuit size={17} />} label="Kỹ năng" value={game.skills} />
                                            <InfoTile icon={<Zap size={17} />} label="Độ khó" value={game.difficulty} />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </AnimatePresence>
                </main>

                {/* ────────────────────────────────────────
                    RIGHT 50% — Frosted-glass panel, 3-col square grid
                ──────────────────────────────────────── */}
                <aside className="w-1/2 flex flex-col py-8 px-8">

                    {/* Frosted glass container */}
                    <div className="flex-1 flex flex-col rounded-3xl overflow-hidden
                                    bg-white/[0.07] backdrop-blur-xl border border-violet-400/[0.15]
                                    shadow-[inset_0_1px_0_rgba(167,139,250,0.12),0_0_40px_rgba(109,40,217,0.15)]">

                        {/* Header inside the glass box */}
                        <div className="flex items-center justify-between px-6 pt-5 pb-4 flex-shrink-0
                                        border-b border-violet-400/[0.12]">
                            <h3 className="text-[13px] font-bold text-white/60 uppercase tracking-[0.18em]">
                                Chế độ chơi
                                {!loadingTemplates && (
                                    <span className="ml-2 text-white/35 font-normal normal-case tracking-normal">
                                        ({allTemplates.length})
                                    </span>
                                )}
                            </h3>
                            {loadingTemplates && (
                                <Loader2 className="w-4 h-4 text-white/35 animate-spin" />
                            )}
                        </div>

                        {templatesError && (
                            <div className="flex items-center gap-2 px-6 py-2.5 text-[13px] text-amber-400
                                            flex-shrink-0 border-b border-white/[0.06]">
                                <AlertCircle size={14} className="flex-shrink-0" />
                                {templatesError}
                            </div>
                        )}

                        {/* 3-col square grid — scrollable, shows 3 per row */}
                        <div className="flex-1 overflow-y-auto hide-scrollbar px-5 py-5">
                            <div className="grid grid-cols-3 gap-4">
                                {allTemplates.map((template) => {
                                    const isActive = activeGame.id === template.id;
                                    return (
                                        <motion.button
                                            key={template.id}
                                            onClick={() => {
                                                setActiveGame(template);
                                                setShowInfo(false);
                                                setCreateError(null);
                                            }}
                                            whileHover={{ scale: 1.04 }}
                                            whileTap={{ scale: 0.96 }}
                                            className={`relative w-full rounded-2xl overflow-hidden cursor-pointer
                                                        text-left transition-all duration-300
                                                        ${isActive
                                                    ? 'border-2 border-white shadow-[0_0_24px_rgba(255,255,255,0.18)]'
                                                    : 'border border-white/12 opacity-55 hover:opacity-95 hover:border-white/30'
                                                }`}
                                            style={{ aspectRatio: '1 / 1' }}
                                        >
                                            {/* Thumbnail */}
                                            {template.logoUrl ? (
                                                <img
                                                    src={template.logoUrl}
                                                    alt={template.name}
                                                    className="absolute inset-0 w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 bg-gradient-to-br
                                                                from-violet-900 to-indigo-950
                                                                flex items-center justify-center text-4xl select-none">
                                                    🎮
                                                </div>
                                            )}

                                            {/* Bottom scrim + name */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90
                                                            via-black/20 to-transparent
                                                            flex flex-col justify-end px-3 py-3">
                                                <span className="font-bold text-white text-[13px] leading-tight
                                                                 line-clamp-2">
                                                    {template.name}
                                                </span>
                                                {template.isPlus && (
                                                    <span className="text-[11px] text-amber-300 font-semibold mt-1">
                                                        ✦ Plus
                                                    </span>
                                                )}
                                            </div>

                                            {/* Active badge */}
                                            {isActive && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white
                                                               flex items-center justify-center shadow-lg"
                                                >
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                </motion.div>
                                            )}
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </aside>

            </div>{/* end body flex-row */}

            {/* ══ PIN success modal ══ */}
            <AnimatePresence>
                {createdSession && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.82, y: 24 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.82, y: 24 }}
                            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
                            className="relative w-full max-w-sm mx-4 rounded-3xl p-8 text-center
                                       bg-gradient-to-br from-[#1e0a3a] to-[#0a0a1f]
                                       border border-white/10 shadow-2xl"
                        >
                            <button
                                onClick={() => setCreatedSession(null)}
                                className="absolute top-4 right-4 text-white/35 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl
                                            bg-emerald-500/20 border border-emerald-400/30
                                            flex items-center justify-center">
                                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                            </div>

                            <h2 className="text-2xl font-extrabold text-white mb-2">
                                Phiên chơi đã sẵn sàng!
                            </h2>
                            <p className="text-[15px] text-white/55 mb-7">
                                Chia sẻ mã PIN bên dưới cho học sinh tham gia
                            </p>

                            <div className="inline-flex items-center gap-3 px-8 py-5 mb-7
                                            rounded-2xl bg-white/8 border-2 border-white/20 backdrop-blur">
                                <Hash className="w-6 h-6 text-amber-300 flex-shrink-0" />
                                <span className="text-5xl font-black tracking-[0.25em] font-mono text-white">
                                    {createdSession.gamePin
                                        || createdSession.pin
                                        || createdSession.pinCode
                                        || '------'}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setCreatedSession(null)}
                                    className="py-3.5 rounded-xl border border-white/20 text-white/75
                                               text-[15px] font-semibold hover:bg-white/10 transition-colors"
                                >
                                    Đóng
                                </button>
                                <button
                                    onClick={handleGoToSession}
                                    className="py-3.5 rounded-xl bg-white text-black text-[15px] font-bold
                                               hover:bg-gray-100 transition-colors flex items-center
                                               justify-center gap-2"
                                >
                                    <Play fill="black" className="w-5 h-5" />
                                    Vào phòng chờ
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── Info tile ────────────────────────────────────────────────────────────────
function InfoTile({ icon, label, value }) {
    return (
        <div className="flex items-start gap-3">
            <div className="mt-0.5 text-white/55 flex-shrink-0">{icon}</div>
            <div>
                <p className="text-[12px] text-white/45 uppercase tracking-wider font-semibold mb-0.5">{label}</p>
                <p className="text-[15px] text-white font-bold">{value}</p>
            </div>
        </div>
    );
}