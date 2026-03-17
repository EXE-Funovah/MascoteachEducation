import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Copy,
    Loader2,
    Play,
    RefreshCw,
    Users,
    Radio,
    ArrowLeft,
    Link as LinkIcon,
    AlertCircle,
} from 'lucide-react';
import { getParticipantsBySession } from '@/services/sessionParticipantService';
import { getSessionById, updateSession } from '@/services/liveSessionService';
import { createLiveSessionConnection } from '@/services/liveSessionRealtime';

function formatPin(session) {
    return session?.gamePin || session?.pin || session?.pinCode || '------';
}

function formatTitle(session) {
    return session?.title || session?.quizTitle || `Treasure Hunt #${session?.id || ''}`;
}

export default function TreasureHuntHostPage() {
    const navigate = useNavigate();
    const { sessionId } = useParams();
    const numericSessionId = Number(sessionId);

    const [session, setSession] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [starting, setStarting] = useState(false);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState('');
    const [realtimeStatus, setRealtimeStatus] = useState('dang-ket-noi');

    const joinLink = useMemo(() => {
        const pin = formatPin(session);
        return `${window.location.origin}/play?pin=${encodeURIComponent(pin)}`;
    }, [session]);

    const loadRoom = useCallback(async (showSpinner = false) => {
        if (!numericSessionId) return;

        try {
            if (showSpinner) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const [sessionData, participantData] = await Promise.all([
                getSessionById(numericSessionId),
                getParticipantsBySession(numericSessionId),
            ]);

            setSession(sessionData);
            setParticipants(Array.isArray(participantData) ? participantData : []);
            setError(null);
        } catch (err) {
            setError(err.message || 'Không thể tải phòng chờ. Vui lòng thử lại.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [numericSessionId]);

    useEffect(() => {
        loadRoom();
    }, [loadRoom]);

    useEffect(() => {
        if (!numericSessionId) return undefined;

        const timer = window.setInterval(() => {
            loadRoom(true);
        }, 5000);

        return () => window.clearInterval(timer);
    }, [loadRoom, numericSessionId]);

    useEffect(() => {
        if (!numericSessionId) return undefined;

        const realtime = createLiveSessionConnection({
            sessionId: numericSessionId,
            onEvent: () => {
                setRealtimeStatus('da-ket-noi');
                loadRoom(true);
            },
            onError: () => {
                setRealtimeStatus('fallback-polling');
            },
        });

        realtime?.startPromise
            ?.then((connection) => {
                if (connection) {
                    setRealtimeStatus('da-ket-noi');
                }
            })
            .catch(() => {
                setRealtimeStatus('fallback-polling');
            });

        return () => {
            realtime?.stop();
        };
    }, [loadRoom, numericSessionId]);

    async function handleStartGame() {
        if (!session?.id) return;

        try {
            setStarting(true);
            await updateSession(session.id, { status: 'Active' });
            navigate('/teacher/treasure-hunt', {
                state: {
                    sessionId: session.id,
                    quizId: session.quizId,
                    quizTitle: formatTitle(session),
                    gamePin: formatPin(session),
                    hostMode: true,
                },
            });
        } catch (err) {
            setError(err.message || 'Không thể bắt đầu game lúc này.');
        } finally {
            setStarting(false);
        }
    }

    async function handleCopy(value, type) {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(type);
            window.setTimeout(() => setCopied(''), 1800);
        } catch {
            setCopied('');
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
                <div className="flex items-center gap-3 text-white/70">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Đang tải phòng chờ...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,#1e3a8a_0%,#0f172a_45%,#020617_100%)] text-white">
            <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <button
                        onClick={() => navigate('/teacher/sessions')}
                        className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Về danh sách phiên
                    </button>

                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm">
                        <Radio className="w-4 h-4 text-emerald-300" />
                        {realtimeStatus === 'da-ket-noi' ? 'Realtime đang hoạt động' : 'Đang theo dõi bằng polling'}
                    </div>
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                    <section className="rounded-[32px] border border-white/10 bg-white/8 p-6 shadow-2xl backdrop-blur-xl md:p-8">
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div>
                                <p className="text-sm uppercase tracking-[0.3em] text-amber-200/70">Treasure Hunt Live</p>
                                <h1 className="mt-3 text-3xl font-black md:text-5xl">{formatTitle(session)}</h1>
                                <p className="mt-3 max-w-2xl text-sm text-white/65 md:text-base">
                                    Giáo viên đang ở phòng chờ. Học sinh hoặc guest có thể vào ngay bằng PIN này.
                                </p>
                            </div>

                            <button
                                onClick={() => loadRoom(true)}
                                disabled={refreshing}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white/85 hover:bg-white/15 disabled:opacity-60"
                            >
                                {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                                Làm mới
                            </button>
                        </div>

                        <div className="mt-8 rounded-[28px] border border-amber-300/20 bg-slate-950/35 p-6 text-center">
                            <p className="text-sm uppercase tracking-[0.4em] text-amber-200/70">Game PIN</p>
                            <div className="mt-4 flex flex-col items-center gap-4 md:flex-row md:justify-center">
                                <span className="font-mono text-5xl font-black tracking-[0.35em] text-amber-100 md:text-7xl">
                                    {formatPin(session)}
                                </span>
                                <button
                                    onClick={() => handleCopy(formatPin(session), 'pin')}
                                    className="rounded-2xl border border-white/15 bg-white/10 p-3 hover:bg-white/15"
                                    aria-label="Copy PIN"
                                >
                                    <Copy className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="mt-3 text-sm text-white/55">
                                {copied === 'pin' ? 'Đã copy PIN.' : 'Học sinh vào /play và nhập PIN để tham gia.'}
                            </p>
                        </div>

                        <div className="mt-6 grid gap-4 md:grid-cols-3">
                            <div className="rounded-3xl border border-white/10 bg-slate-950/30 p-5">
                                <p className="text-sm text-white/55">Người đã vào phòng</p>
                                <p className="mt-2 text-4xl font-black">{participants.length}</p>
                            </div>
                            <div className="rounded-3xl border border-white/10 bg-slate-950/30 p-5">
                                <p className="text-sm text-white/55">Trạng thái</p>
                                <p className="mt-2 text-xl font-bold">{session?.status || 'Pending'}</p>
                            </div>
                            <div className="rounded-3xl border border-white/10 bg-slate-950/30 p-5">
                                <p className="text-sm text-white/55">Quiz ID</p>
                                <p className="mt-2 text-xl font-bold">{session?.quizId || '--'}</p>
                            </div>
                        </div>

                        {error && (
                            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="mt-6 flex flex-col gap-3 md:flex-row">
                            <button
                                onClick={handleStartGame}
                                disabled={starting}
                                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-amber-300 px-5 py-4 text-sm font-bold text-slate-950 hover:bg-amber-200 disabled:opacity-60"
                            >
                                {starting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                                Bắt đầu Game
                            </button>
                            <button
                                onClick={() => handleCopy(joinLink, 'link')}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-5 py-4 text-sm font-semibold hover:bg-white/15"
                            >
                                <LinkIcon className="w-4 h-4" />
                                {copied === 'link' ? 'Đã copy link join' : 'Copy link join'}
                            </button>
                        </div>
                    </section>

                    <aside className="rounded-[32px] border border-white/10 bg-slate-950/45 p-6 shadow-2xl backdrop-blur-xl md:p-7">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm uppercase tracking-[0.25em] text-white/45">Phòng chờ</p>
                                <h2 className="mt-2 text-2xl font-black">Danh sách người chơi</h2>
                            </div>
                            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-sm">
                                <Users className="w-4 h-4" />
                                {participants.length}
                            </div>
                        </div>

                        <div className="mt-6 space-y-3">
                            {participants.length === 0 ? (
                                <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 px-5 py-10 text-center text-sm text-white/55">
                                    Chưa có học sinh nào join. Giáo viên có thể chia sẻ PIN ở bên trái.
                                </div>
                            ) : (
                                participants.map((participantItem, index) => (
                                    <motion.div
                                        key={participantItem.id || `${participantItem.studentName}-${index}`}
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/6 px-4 py-4"
                                    >
                                        <div>
                                            <p className="font-semibold text-white">
                                                {participantItem.studentName || participantItem.name || `Người chơi ${index + 1}`}
                                            </p>
                                            <p className="mt-1 text-xs uppercase tracking-[0.25em] text-white/40">
                                                {participantItem.role || 'Player'}
                                            </p>
                                        </div>
                                        <div className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-200">
                                            Sẵn sàng
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
