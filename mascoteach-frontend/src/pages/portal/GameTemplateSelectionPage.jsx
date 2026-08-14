import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { AlertCircle, ArrowLeft, BookOpen, BrainCircuit, CheckCircle2, Clock3, Gamepad2, Info, Loader2, Lock, Play, Sparkles, Users } from 'lucide-react';
import { getAllGameTemplates } from '@/services/gameTemplateService';
import { createSession } from '@/services/liveSessionService';

const BUILTIN_TEMPLATES = [{
    id: '__treasure_hunt__', name: 'Treasure Hunt',
    logoUrl: '/images/treasure-hunt/chest.svg', bgImage: '/images/treasure-hunt/island-map.svg',
    description: 'Tạo phòng trực tiếp, chia sẻ mã PIN và đưa cả lớp vào một hoạt động ôn tập nhanh, vui và dễ bắt đầu.',
    difficulty: 'Dễ tham gia', duration: '7 phút', skills: 'Phản xạ và tốc độ', players: '2 - 60',
    isPlus: false, fallbackTemplateId: 1, launchMode: 'live', accent: 'from-amber-200 via-orange-300 to-sky-300',
}];

const HIDDEN_TEMPLATE_KEYS = new Set(['mascoteachadventure', 'adventure']);

function canonicalTemplateKey(value) {
    return String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function enrichApiTemplate(template) {
    return {
        id: template.id, name: template.name || `Trò chơi #${template.id}`,
        logoUrl: template.thumbnailUrl || null, bgImage: template.thumbnailUrl || null,
        description: template.description || 'Tạo phòng chơi trực tiếp từ bộ câu hỏi của bạn.',
        difficulty: template.difficulty || 'Trung bình', duration: template.idealTime || '10 phút',
        skills: template.skills || 'Tư duy và tốc độ', players: template.players || '2 - 60',
        isPlus: template.isPlus ?? false, fallbackTemplateId: template.id, launchMode: 'live',
        accent: 'from-sky-200 via-cyan-200 to-emerald-200',
    };
}

function dedupeTemplates(templates) {
    const seen = new Set();
    return templates.filter((template) => {
        const key = canonicalTemplateKey(template.name || template.id);
        if (!key || HIDDEN_TEMPLATE_KEYS.has(key) || seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

function difficultyClass(difficulty) {
    const value = String(difficulty || '').toLowerCase();
    if (value.includes('dễ') || value.includes('de') || value.includes('easy')) return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    if (value.includes('trung') || value.includes('medium')) return 'border-amber-200 bg-amber-50 text-amber-700';
    return 'border-rose-200 bg-rose-50 text-rose-700';
}

function BackButton({ onClick }) {
    return <button type="button" onClick={onClick} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:border-sky-200 hover:bg-sky-50 hover:text-[#17375f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2"><ArrowLeft className="h-4 w-4" />Quay lại</button>;
}

function TemplateCard({ template, active, onSelect, reduceMotion }) {
    return (
        <motion.button type="button" onClick={() => onSelect(template)} whileHover={reduceMotion ? undefined : { y: -3 }} whileTap={reduceMotion ? undefined : { scale: 0.985 }} className={`group w-full overflow-hidden rounded-2xl border p-3 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 ${active ? 'border-sky-300 bg-sky-50 shadow-[0_14px_35px_rgba(37,125,181,0.13)]' : 'border-slate-200 bg-white hover:border-sky-200 hover:bg-slate-50'}`}>
            <div className="relative h-40 overflow-hidden rounded-xl bg-[#edf7fc]">
                <div className={`absolute inset-0 bg-gradient-to-br ${template.accent} opacity-35`} />
                {template.bgImage ? <img src={template.bgImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" onError={(event) => { event.currentTarget.style.display = 'none'; }} /> : null}
                {template.logoUrl ? <img src={template.logoUrl} alt="" className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 object-contain drop-shadow-lg transition-transform duration-300 group-hover:scale-105" onError={(event) => { event.currentTarget.style.display = 'none'; }} /> : <Gamepad2 className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 text-sky-500" />}
                {active ? <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-emerald-600 shadow-sm"><CheckCircle2 className="h-5 w-5" /></div> : null}
            </div>
            <div className="flex items-center justify-between gap-3 px-1 pb-1 pt-4">
                <div className="min-w-0"><p className="truncate text-base font-black text-[#0b1f3a]">{template.name}</p><p className="mt-1 text-sm text-slate-500">Phòng trực tiếp</p></div>
                <Play className={`h-5 w-5 shrink-0 ${active ? 'fill-sky-600 text-sky-600' : 'text-slate-400'}`} />
            </div>
        </motion.button>
    );
}

export default function GameTemplateSelectionPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const reduceMotion = useReducedMotion();
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

    useEffect(() => { if (!quizId) navigate('/teacher/library'); }, [navigate, quizId]);
    useEffect(() => {
        async function loadTemplates() {
            try {
                setLoadingTemplates(true); setTemplatesError(null);
                const data = await getAllGameTemplates();
                setApiTemplates(Array.isArray(data) ? data.map(enrichApiTemplate) : []);
            } catch {
                setTemplatesError('Không thể tải thêm chế độ chơi. Bạn vẫn có thể dùng chế độ có sẵn.');
            } finally { setLoadingTemplates(false); }
        }
        loadTemplates();
    }, []);

    const allTemplates = useMemo(() => dedupeTemplates([...BUILTIN_TEMPLATES, ...apiTemplates]), [apiTemplates]);
    useEffect(() => {
        if (!allTemplates.some((template) => template.id === activeGame?.id)) setActiveGame(allTemplates[0] || null);
    }, [activeGame?.id, allTemplates]);

    async function handleCreateGame() {
        if (!activeGame || !quizId || activeGame.isPlus) return;
        setCreating(true); setCreateError(null);
        try {
            const templateId = typeof activeGame.id === 'string' && activeGame.id.startsWith('__') ? activeGame.fallbackTemplateId ?? 1 : activeGame.id;
            const session = await createSession({ quizId, templateId });
            navigate(`/teacher/live-session/${session.id}`, { state: { session, quizId, quizTitle, questionCount, gameName: activeGame.name } });
        } catch (error) {
            setCreateError(error.message || 'Không thể tạo phòng chơi lúc này.');
        } finally { setCreating(false); }
    }

    if (!quizId || !activeGame) return null;
    const panelMotion = reduceMotion ? {} : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 } };

    return (
        <div className="relative min-h-dvh overflow-hidden bg-[#f4f8ff] text-slate-900">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(84,183,230,0.18),transparent_30%),radial-gradient(circle_at_88%_82%,rgba(30,94,148,0.10),transparent_32%)]" />
            <div className="pointer-events-none absolute inset-0 opacity-35 [background-image:radial-gradient(#8fcceb_1px,transparent_1px)] [background-size:34px_34px]" />
            <main className="relative mx-auto max-w-[1380px] px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
                <header className="flex flex-col gap-4 rounded-[24px] border border-slate-200/80 bg-white/95 p-4 shadow-[0_14px_40px_rgba(26,73,112,0.08)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
                    <BackButton onClick={() => navigate(-1)} />
                    <div className="flex min-w-0 items-center gap-3 rounded-xl bg-slate-50 px-4 py-3"><BookOpen className="h-5 w-5 shrink-0 text-sky-600" /><span className="truncate font-bold text-[#17375f]">{quizTitle}</span><span className="text-slate-300">•</span><span className="shrink-0 text-sm font-semibold text-slate-500">{questionCount} câu</span></div>
                </header>
                <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
                    <section className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_22px_60px_rgba(26,73,112,0.10)]">
                        <AnimatePresence mode="wait">
                            <motion.div key={activeGame.id} {...panelMotion} transition={{ duration: 0.24, ease: 'easeOut' }} className="p-5 sm:p-7 lg:p-9">
                                <div className="relative h-52 overflow-hidden rounded-[22px] bg-[#e9f6fc] sm:h-64">
                                    <div className={`absolute inset-0 bg-gradient-to-br ${activeGame.accent} opacity-40`} />
                                    {activeGame.bgImage ? <img src={activeGame.bgImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" /> : null}
                                    {activeGame.logoUrl ? <img src={activeGame.logoUrl} alt="" className="absolute bottom-5 right-5 h-36 w-36 object-contain drop-shadow-xl sm:h-44 sm:w-44" /> : null}
                                    <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-sky-700 shadow-sm backdrop-blur"><Sparkles className="h-4 w-4" />Hoạt động cả lớp</div>
                                </div>
                                <div className="mt-7"><p className="text-sm font-black uppercase tracking-[0.22em] text-sky-700">Chế độ đã chọn</p><h1 className="mt-2 text-4xl font-black tracking-tight text-[#071a33] sm:text-5xl">{activeGame.name}</h1><p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">{activeGame.description}</p></div>
                                <div className="mt-6 flex flex-wrap gap-3">
                                    <span className={`rounded-full border px-3 py-2 text-sm font-bold ${difficultyClass(activeGame.difficulty)}`}>{activeGame.difficulty}</span>
                                    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600"><Users className="h-4 w-4" />{activeGame.players}</span>
                                    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600"><Clock3 className="h-4 w-4" />{activeGame.duration}</span>
                                    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600"><BrainCircuit className="h-4 w-4" />{activeGame.skills}</span>
                                </div>
                                <div className="mt-6 flex items-start gap-3 rounded-2xl border border-sky-100 bg-sky-50 p-4 text-sm text-[#245780]"><Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" /><div><p className="font-bold text-[#17375f]">Sẵn sàng mở phòng</p><p className="mt-1 leading-6">Hệ thống sẽ tạo mã PIN để học sinh tham gia ngay.</p></div></div>
                                {createError ? <div className="mt-5 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{createError}</span></div> : null}
                                <div className="mt-7 flex flex-wrap items-center gap-3">
                                    <motion.button type="button" onClick={handleCreateGame} disabled={creating || activeGame.isPlus} whileHover={!reduceMotion && !creating && !activeGame.isPlus ? { y: -2 } : undefined} whileTap={!reduceMotion && !creating && !activeGame.isPlus ? { scale: 0.985 } : undefined} className={`inline-flex min-w-[220px] items-center justify-center gap-3 rounded-xl px-6 py-4 text-base font-black shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 ${activeGame.isPlus ? 'cursor-not-allowed bg-slate-200 text-slate-400' : 'bg-[#17375f] text-white hover:bg-[#0f2c4e]'}`}>
                                        {creating ? <Loader2 className="h-5 w-5 animate-spin" /> : activeGame.isPlus ? <Lock className="h-5 w-5" /> : <Play className="h-5 w-5 fill-current" />}{creating ? 'Đang tạo phòng...' : 'Tạo phòng chơi'}
                                    </motion.button>
                                    <button type="button" onClick={() => setShowInfo((value) => !value)} aria-label="Xem thông tin chế độ chơi" aria-expanded={showInfo} className={`inline-flex h-14 w-14 items-center justify-center rounded-xl border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${showInfo ? 'border-sky-300 bg-sky-50 text-sky-700' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-[#17375f]'}`}><Info className="h-5 w-5" /></button>
                                </div>
                                <AnimatePresence initial={false}>{showInfo ? <motion.div initial={reduceMotion ? false : { opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }} className="overflow-hidden"><div className="mt-5 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-3"><div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Loại phòng</p><p className="mt-1 font-bold text-slate-700">Trực tiếp cả lớp</p></div><div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Số người phù hợp</p><p className="mt-1 font-bold text-slate-700">{activeGame.players}</p></div><div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Thời lượng</p><p className="mt-1 font-bold text-slate-700">{activeGame.duration}</p></div></div></motion.div> : null}</AnimatePresence>
                            </motion.div>
                        </AnimatePresence>
                    </section>
                    <aside className="self-start rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_18px_50px_rgba(26,73,112,0.08)] lg:sticky lg:top-6">
                        <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.22em] text-sky-700">Chế độ chơi</p><h2 className="mt-2 text-xl font-black text-[#0b1f3a]">Chọn cách bắt đầu</h2><p className="mt-1 text-sm leading-6 text-slate-500">Chọn một hoạt động phù hợp với bộ câu hỏi.</p></div>{loadingTemplates ? <Loader2 className="mt-1 h-4 w-4 animate-spin text-sky-600" /> : <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">{allTemplates.length} chế độ</span>}</div>
                        {templatesError ? <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{templatesError}</span></div> : null}
                        <div className="mt-5 space-y-4">{allTemplates.map((template) => <TemplateCard key={template.id} template={template} active={template.id === activeGame.id} onSelect={setActiveGame} reduceMotion={reduceMotion} />)}</div>
                    </aside>
                </div>
            </main>
        </div>
    );
}
