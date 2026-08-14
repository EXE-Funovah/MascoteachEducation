import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { AlertCircle, ArrowLeft, Copy, Link as LinkIcon, Loader2, Play, Radio, RefreshCw, Users } from 'lucide-react';
import { getParticipantsBySession } from '@/services/sessionParticipantService';
import { getSessionById } from '@/services/liveSessionService';
import { createLiveSessionConnection } from '@/services/liveSessionRealtime';

function formatPin(session) {
    return session?.gamePin || session?.pin || session?.pinCode || '------';
}

function formatTitle(session) {
    return session?.title || session?.quizTitle || `Treasure Hunt #${session?.id || ''}`;
}

function formatStatus(status) {
    const value = String(status || '').toLowerCase();
    if (['active', 'playing', 'inprogress'].includes(value)) return 'Đang chơi';
    if (['completed', 'finished', 'ended'].includes(value)) return 'Đã kết thúc';
    if (['cancelled', 'canceled'].includes(value)) return 'Đã hủy';
    return 'Đang chờ';
}

function formatRole(role) {
    const value = String(role || '').toLowerCase();
    if (value === 'student') return 'Học sinh';
    if (value === 'guest') return 'Khách';
    if (value === 'teacher' || value === 'host') return 'Giáo viên';
    return 'Người chơi';
}

export default function TreasureHuntHostPage() {
    const navigate = useNavigate();
    const { sessionId } = useParams();
    const reduceMotion = useReducedMotion();
    const numericSessionId = Number(sessionId);
    const [session, setSession] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [starting, setStarting] = useState(false);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState('');
    const [realtimeStatus] = useState('dang-ket-noi');

    const joinLink = useMemo(() => `${window.location.origin}/play?pin=${encodeURIComponent(formatPin(session))}`, [session]);

    const loadRoom = useCallback(async (showSpinner = false) => {
        if (!numericSessionId) return;
        try {
            if (showSpinner) setRefreshing(true); else setLoading(true);
            const [sessionData, participantData] = await Promise.all([getSessionById(numericSessionId), getParticipantsBySession(numericSessionId)]);
            setSession(sessionData);
            setParticipants(Array.isArray(participantData) ? participantData : []);
            setError(null);
        } catch (err) {
            setError(err.message || 'Không thể tải phòng chờ. Vui lòng thử lại.');
        } finally {
            setLoading(false); setRefreshing(false);
        }
    }, [numericSessionId]);

    useEffect(() => { loadRoom(); }, [loadRoom]);
    useEffect(() => {
        if (!numericSessionId) return undefined;
        const timer = window.setInterval(() => loadRoom(true), 5000);
        return () => window.clearInterval(timer);
    }, [loadRoom, numericSessionId]);

    async function handleStartGame() {
        if (!session?.id) return;
        let realtime = null;
        try {
            setStarting(true);
            const gamePin = formatPin(session);
            realtime = createLiveSessionConnection({
                gamePin, sessionId: session.id, role: 'host',
                onError: (realtimeError) => console.warn('[HostLobby] SignalR error:', realtimeError),
            });
            const connection = await realtime?.startPromise;
            if (!connection) throw new Error('Không thể kết nối máy chủ trò chơi.');
            await connection.invoke('StartGame', gamePin);
            await realtime.stop();
            navigate('/teacher/treasure-hunt', { state: { sessionId: session.id, quizId: session.quizId, quizTitle: formatTitle(session), gamePin, hostMode: true } });
        } catch (err) {
            await realtime?.stop();
            setError(err.message || 'Không thể bắt đầu trò chơi lúc này.');
        } finally { setStarting(false); }
    }

    async function handleCopy(value, type) {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(type);
            window.setTimeout(() => setCopied(''), 1800);
        } catch { setCopied(''); }
    }

    if (loading) {
        return <div className="flex min-h-dvh items-center justify-center bg-[#f4f8ff] text-slate-600"><div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm"><Loader2 className="h-5 w-5 animate-spin text-sky-600" /><span className="font-semibold">Đang tải phòng chờ...</span></div></div>;
    }

    return (
        <div className="relative min-h-dvh overflow-hidden bg-[#f4f8ff] text-slate-900">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_12%,rgba(84,183,230,0.18),transparent_28%),radial-gradient(circle_at_90%_78%,rgba(30,94,148,0.10),transparent_32%)]" />
            <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:radial-gradient(#8fcceb_1px,transparent_1px)] [background-size:34px_34px]" />
            <main className="relative mx-auto max-w-[1380px] px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
                <header className="flex flex-col gap-4 rounded-[24px] border border-slate-200/80 bg-white/95 p-4 shadow-[0_14px_40px_rgba(26,73,112,0.08)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
                    <button type="button" onClick={() => navigate('/teacher/sessions')} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:border-sky-200 hover:bg-sky-50 hover:text-[#17375f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2"><ArrowLeft className="h-4 w-4" />Lịch sử lượt chơi</button>
                    <div className="inline-flex items-center gap-2 self-start rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700 sm:self-auto"><Radio className="h-4 w-4" />{realtimeStatus === 'da-ket-noi' ? 'Phòng đang kết nối trực tiếp' : 'Phòng đang được cập nhật'}</div>
                </header>

                <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
                    <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_22px_60px_rgba(26,73,112,0.10)] sm:p-7 lg:p-8">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                            <div><p className="text-sm font-black uppercase tracking-[0.22em] text-sky-700">Treasure Hunt · Phòng trực tiếp</p><h1 className="mt-2 text-3xl font-black tracking-tight text-[#071a33] sm:text-5xl">{formatTitle(session)}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">Chia sẻ mã PIN để học sinh vào phòng. Bạn có thể bắt đầu khi cả lớp đã sẵn sàng.</p></div>
                            <button type="button" onClick={() => loadRoom(true)} disabled={refreshing} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 transition-colors hover:border-sky-200 hover:bg-sky-50 hover:text-[#17375f] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400">{refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}Làm mới</button>
                        </div>

                        <div className="relative mt-7 overflow-hidden rounded-[24px] bg-[#17375f] p-6 text-center text-white sm:p-8">
                            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(99,200,238,0.28),transparent_35%),radial-gradient(circle_at_100%_100%,rgba(255,255,255,0.10),transparent_36%)]" />
                            <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(#ffffff_1px,transparent_1px)] [background-size:28px_28px]" />
                            <div className="relative"><p className="text-xs font-black uppercase tracking-[0.32em] text-sky-200">Mã PIN phòng chơi</p><div className="mt-4 flex flex-col items-center justify-center gap-4 sm:flex-row"><span className="font-mono text-4xl font-black tracking-[0.18em] text-white sm:text-6xl md:text-7xl">{formatPin(session)}</span><button type="button" onClick={() => handleCopy(formatPin(session), 'pin')} aria-label="Sao chép mã PIN" className="rounded-xl border border-white/20 bg-white/10 p-3 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"><Copy className="h-5 w-5" /></button></div><p aria-live="polite" className="mt-4 text-sm text-sky-100">{copied === 'pin' ? 'Đã sao chép mã PIN.' : 'Học sinh mở trang tham gia và nhập mã PIN này.'}</p></div>
                        </div>

                        <div className="mt-5 grid gap-3 sm:grid-cols-3">
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><p className="text-sm font-semibold text-slate-500">Đã vào phòng</p><p className="mt-2 text-3xl font-black text-[#17375f]">{participants.length}</p></div>
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><p className="text-sm font-semibold text-slate-500">Trạng thái</p><p className="mt-2 text-xl font-black text-[#17375f]">{formatStatus(session?.status)}</p></div>
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><p className="text-sm font-semibold text-slate-500">Mã bài kiểm tra</p><p className="mt-2 text-xl font-black text-[#17375f]">{session?.quizId || '--'}</p></div>
                        </div>

                        {error ? <div className="mt-5 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{error}</span></div> : null}

                        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                            <motion.button type="button" onClick={handleStartGame} disabled={starting} whileHover={!reduceMotion && !starting ? { y: -2 } : undefined} whileTap={!reduceMotion && !starting ? { scale: 0.99 } : undefined} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#17375f] px-5 py-4 text-sm font-black text-white shadow-sm transition-colors hover:bg-[#0f2c4e] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2">{starting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-current" />}Bắt đầu trò chơi</motion.button>
                            <button type="button" onClick={() => handleCopy(joinLink, 'link')} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm font-bold text-[#17375f] transition-colors hover:border-sky-200 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2"><LinkIcon className="h-4 w-4" />{copied === 'link' ? 'Đã sao chép liên kết' : 'Sao chép liên kết'}</button>
                        </div>
                    </section>

                    <aside className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_18px_50px_rgba(26,73,112,0.08)] sm:p-7">
                        <div className="flex items-center justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.22em] text-sky-700">Phòng chờ</p><h2 className="mt-2 text-2xl font-black text-[#0b1f3a]">Danh sách người chơi</h2></div><div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-2 text-sm font-black text-sky-700"><Users className="h-4 w-4" />{participants.length}</div></div>
                        <div className="mt-6 space-y-3">
                            {participants.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-sky-600 shadow-sm"><Users className="h-6 w-6" /></div><p className="mt-4 font-bold text-slate-700">Chưa có học sinh tham gia</p><p className="mt-2 text-sm leading-6 text-slate-500">Chia sẻ mã PIN hoặc liên kết để mời học sinh vào phòng.</p></div> : participants.map((participantItem, index) => (
                                <motion.div key={participantItem.id || `${participantItem.studentName}-${index}`} initial={reduceMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: reduceMotion ? 0 : Math.min(index * 0.035, 0.2) }} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                                    <div className="flex min-w-0 items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#dff2fb] font-black text-[#236b9d]">{String(participantItem.studentName || participantItem.name || index + 1).charAt(0).toUpperCase()}</div><div className="min-w-0"><p className="truncate font-bold text-[#17375f]">{participantItem.studentName || participantItem.name || `Người chơi ${index + 1}`}</p><p className="mt-1 text-xs font-semibold text-slate-500">{formatRole(participantItem.role)}</p></div></div><span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Sẵn sàng</span>
                                </motion.div>
                            ))}
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}
