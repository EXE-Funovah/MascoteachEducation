import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    ArrowRight,
    Check,
    ChevronLeft,
    ChevronRight,
    Clock3,
    Layers3,
    Loader2,
    RotateCcw,
    Sparkles,
    X,
} from 'lucide-react';
import {
    getFlashcardStudy,
    updateFlashcardProgress,
} from '@/services/flashcardClassService';

export default function FlashcardStudyPage() {
    const { assignmentId } = useParams();
    const navigate = useNavigate();
    const [study, setStudy] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const controller = new AbortController();
        getFlashcardStudy(assignmentId, { signal: controller.signal })
            .then(setStudy)
            .catch((requestError) => {
                if (!controller.signal.aborted) setError(requestError?.message || 'Không thể tải bộ flashcard.');
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });
        return () => controller.abort();
    }, [assignmentId]);

    const cards = Array.isArray(study?.cards) ? study.cards : [];
    const currentCard = cards[currentIndex];
    const masteredCount = useMemo(
        () => cards.filter((card) => card.status === 'Mastered').length,
        [cards]
    );
    const percent = cards.length ? Math.round((masteredCount / cards.length) * 100) : 0;

    function goTo(index) {
        if (!cards.length) return;
        setCurrentIndex(Math.max(0, Math.min(index, cards.length - 1)));
        setFlipped(false);
    }

    async function review(isKnown) {
        if (!currentCard || saving) return;
        setSaving(true);
        setError('');
        try {
            const progress = await updateFlashcardProgress(
                assignmentId,
                currentCard.questionId,
                isKnown
            );
            setStudy((current) => ({
                ...current,
                cards: current.cards.map((card) => card.questionId === currentCard.questionId
                    ? { ...card, ...progress }
                    : card),
            }));
            if (currentIndex < cards.length - 1) goTo(currentIndex + 1);
            else setFlipped(false);
        } catch (requestError) {
            setError(requestError?.message || 'Không thể lưu tiến độ học.');
        } finally {
            setSaving(false);
        }
    }

    if (loading) return <CenteredState><Loader2 className="h-8 w-8 animate-spin text-brand-blue" /><span>Đang chuẩn bị bộ thẻ...</span></CenteredState>;
    if (error && !study) return <CenteredState><X className="h-9 w-9 text-rose-500" /><strong>Không thể mở bộ thẻ</strong><span>{error}</span><button type="button" onClick={() => navigate('/student/flashcards')} className="mt-2 rounded-xl bg-brand-navy px-5 py-3 text-sm font-black text-white">Quay lại</button></CenteredState>;

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#edf8ff_0,_#f8fbff_38%,_#f8fbff_100%)] px-4 py-5 text-slate-900 sm:px-7 sm:py-7">
            <div className="mx-auto max-w-[1200px]">
                <header className="flex flex-col gap-4 rounded-[24px] border border-white/80 bg-white/90 p-5 shadow-[0_18px_55px_rgba(15,23,42,0.06)] sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <div className="flex min-w-0 items-center gap-4">
                        <button type="button" onClick={() => navigate('/student/flashcards')} className="grid h-11 w-11 flex-none place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 hover:text-brand-blue" aria-label="Quay lại"><ArrowLeft className="h-5 w-5" /></button>
                        <div className="min-w-0"><p className="text-xs font-black uppercase tracking-[0.12em] text-brand-blue">{study?.className}</p><h1 className="mt-1 truncate text-xl font-black text-slate-950 sm:text-2xl">{study?.title}</h1></div>
                    </div>
                    <div className="flex items-center gap-3"><span className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-600">{currentIndex + 1} / {cards.length}</span><span className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700">{masteredCount} đã thuộc</span></div>
                </header>

                <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-white shadow-inner"><div className="h-full rounded-full bg-gradient-to-r from-brand-blue via-sky-400 to-cyan-400 transition-all duration-500" style={{ width: `${percent}%` }} /></div>

                {error && <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{error}</div>}

                {!currentCard ? <CenteredState><Layers3 className="h-9 w-9 text-brand-blue" /><strong>Bộ thẻ chưa có nội dung</strong></CenteredState> : (
                    <main className="mx-auto mt-8 max-w-[850px]">
                        {study?.instructions && <p className="mb-5 text-center text-sm font-semibold text-slate-500">{study.instructions}</p>}
                        <button type="button" onClick={() => setFlipped((value) => !value)} className="group relative block min-h-[390px] w-full [perspective:1400px]" aria-label={flipped ? 'Xem mặt trước' : 'Lật xem đáp án'}>
                            <div className={`relative min-h-[390px] w-full transition-transform duration-500 [transform-style:preserve-3d] ${flipped ? '[transform:rotateY(180deg)]' : ''}`}>
                                <CardFace label="Mặt trước" tone="front" text={currentCard.front} hint="Nhấn vào thẻ để xem mặt sau" />
                                <CardFace label="Mặt sau" tone="back" text={currentCard.back} hint="Bạn đã nhớ đáp án này chưa?" back />
                            </div>
                        </button>

                        <div className="mt-6 flex items-center justify-center gap-3">
                            <button type="button" onClick={() => goTo(currentIndex - 1)} disabled={currentIndex === 0 || saving} className="grid h-12 w-12 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-brand-mid hover:text-brand-blue disabled:opacity-35"><ChevronLeft className="h-5 w-5" /></button>
                            <button type="button" onClick={() => review(false)} disabled={saving} className="inline-flex h-12 min-w-[150px] items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-5 text-sm font-black text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"><RotateCcw className="h-4 w-4" /> Chưa thuộc</button>
                            <button type="button" onClick={() => review(true)} disabled={saving} className="inline-flex h-12 min-w-[150px] items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-black text-white shadow-[0_14px_30px_rgba(5,150,105,0.2)] transition hover:bg-emerald-700 disabled:opacity-50">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Đã thuộc</button>
                            <button type="button" onClick={() => goTo(currentIndex + 1)} disabled={currentIndex === cards.length - 1 || saving} className="grid h-12 w-12 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-brand-mid hover:text-brand-blue disabled:opacity-35"><ChevronRight className="h-5 w-5" /></button>
                        </div>

                        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-slate-500"><span className="inline-flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-brand-blue" /> Lật thẻ để kiểm tra đáp án</span>{study?.dueAt && <span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" /> Có hạn hoàn thành</span>}</div>
                    </main>
                )}
            </div>
        </div>
    );
}

function CardFace({ label, text, hint, tone, back = false }) {
    return <div className={`absolute inset-0 flex min-h-[390px] flex-col items-center justify-center overflow-hidden rounded-[30px] border p-8 text-center shadow-[0_28px_80px_rgba(15,23,42,0.11)] [backface-visibility:hidden] ${back ? '[transform:rotateY(180deg)] border-emerald-200 bg-gradient-to-br from-white to-emerald-50' : 'border-brand-light bg-gradient-to-br from-white to-[#eef8ff]'}`}><span className={`absolute left-6 top-6 rounded-full px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.12em] ${tone === 'back' ? 'bg-emerald-100 text-emerald-700' : 'bg-brand-light/30 text-brand-blue'}`}>{label}</span><p className="max-w-2xl whitespace-pre-wrap text-2xl font-black leading-relaxed text-slate-950 sm:text-3xl">{text}</p><span className="absolute bottom-6 inline-flex items-center gap-2 text-xs font-bold text-slate-400">{back ? <ArrowLeft className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}{hint}</span></div>;
}
function CenteredState({ children }) { return <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#f8fbff] px-6 text-center text-sm font-semibold text-slate-500">{children}</div>; }
