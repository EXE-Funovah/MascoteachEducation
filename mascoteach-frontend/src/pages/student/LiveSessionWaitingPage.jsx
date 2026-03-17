import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Hourglass, Loader2, Users, Sparkles, ArrowRight, AlertCircle } from 'lucide-react';
import { getSessionByPin } from '@/services/liveSessionService';
import { createLiveSessionConnection } from '@/services/liveSessionRealtime';

function getSessionPin(session) {
    return session?.gamePin || session?.pin || session?.pinCode || '';
}

export default function LiveSessionWaitingPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    const initialSession = location.state?.session || null;
    const participant = location.state?.participant || null;

    const pin = useMemo(
        () => searchParams.get('pin') || getSessionPin(initialSession),
        [initialSession, searchParams]
    );
    const playerName = useMemo(
        () => searchParams.get('name') || participant?.studentName || participant?.name || 'Guest',
        [participant, searchParams]
    );

    const [session, setSession] = useState(initialSession);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(!initialSession);
    const [statusText, setStatusText] = useState('Đang chờ giáo viên bắt đầu');

    useEffect(() => {
        if (!pin) {
            navigate('/play');
            return undefined;
        }

        let cancelled = false;

        async function syncSession() {
            try {
                const latest = await getSessionByPin(pin, { skipAuth: true });
                if (cancelled || !latest) return;

                setSession(latest);
                setLoading(false);

                if (latest.status === 'Active') {
                    setStatusText('Game đang bắt đầu...');

                    /* Navigate to the new student live game page */
                    if (!cancelled) {
                        navigate('/play/live-game', {
                            replace: true,
                            state: {
                                session: latest,
                                participant,
                                playerName,
                            },
                        });
                    }
                    return;
                }

                if (latest.status === 'Ended') {
                    setStatusText('Phòng đã kết thúc');
                } else {
                    setStatusText('Đang chờ giáo viên bắt đầu');
                }
            } catch (err) {
                if (!cancelled) {
                    setLoading(false);
                    setError(err.message || 'Không thể đồng bộ trạng thái phòng.');
                }
            }
        }

        syncSession();
        const intervalId = window.setInterval(syncSession, 4000);

        return () => {
            cancelled = true;
            window.clearInterval(intervalId);
        };
    }, [navigate, participant, pin, playerName]);

    useEffect(() => {
        if (!pin) return undefined;

        let navigated = false;

        const realtime = createLiveSessionConnection({
            gamePin: pin,
            sessionId: session?.id,
            role: 'student',
            studentName: playerName,
            onEvent: (eventName, payload) => {
                console.log('[WaitingPage] SignalR event:', eventName, payload);

                if (eventName === 'GameStarted' || eventName === 'NewQuestion') {
                    if (!navigated) {
                        navigated = true;
                        setStatusText('Game đang bắt đầu...');
                        navigate('/play/live-game', {
                            replace: true,
                            state: {
                                session: session,
                                participant,
                                playerName,
                            },
                        });
                    }
                }

                if (eventName === 'HostJoined') {
                    setStatusText('Giáo viên đã vào phòng!');
                }

                if (eventName === 'PlayerJoined' || eventName === 'ParticipantJoined') {
                    setStatusText('Có người chơi mới vào phòng');
                }
            },
            onError: (err) => {
                console.warn('[WaitingPage] SignalR error:', err);
            },
        });

        return () => {
            realtime?.stop();
        };
    }, [pin, session, participant, playerName, navigate]);

    return (
        <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#1d4ed8_0%,#0f172a_42%,#020617_100%)] px-4 py-8 text-white">
            <div className="absolute left-[-10%] top-[-5%] h-72 w-72 rounded-full bg-amber-300/20 blur-3xl" />
            <div className="absolute bottom-[-10%] right-[-8%] h-80 w-80 rounded-full bg-sky-400/20 blur-3xl" />

            <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-4xl items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full rounded-[36px] border border-white/10 bg-slate-950/55 p-6 shadow-2xl backdrop-blur-xl md:p-10"
                >
                    <div className="text-center">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] bg-amber-300 text-slate-950 shadow-xl shadow-amber-300/20">
                            <Hourglass className="h-9 w-9" />
                        </div>
                        <p className="mt-6 text-sm uppercase tracking-[0.35em] text-white/45">Mascoteach Live</p>
                        <h1 className="mt-3 text-3xl font-black md:text-5xl">Phòng chờ đang mở</h1>
                        <p className="mx-auto mt-3 max-w-2xl text-sm text-white/65 md:text-base">
                            {session?.title || session?.quizTitle || 'Bạn đã vào phòng thành công.'}
                        </p>
                    </div>

                    <div className="mt-8 grid gap-4 md:grid-cols-3">
                        <div className="rounded-3xl border border-white/10 bg-white/6 p-5 text-center">
                            <p className="text-sm text-white/55">PIN</p>
                            <p className="mt-2 font-mono text-3xl font-black tracking-[0.28em]">{pin || '------'}</p>
                        </div>
                        <div className="rounded-3xl border border-white/10 bg-white/6 p-5 text-center">
                            <p className="text-sm text-white/55">Tên hiển thị</p>
                            <p className="mt-2 text-2xl font-black">{playerName}</p>
                        </div>
                        <div className="rounded-3xl border border-white/10 bg-white/6 p-5 text-center">
                            <p className="text-sm text-white/55">Trạng thái</p>
                            <p className="mt-2 text-lg font-bold text-amber-100">{statusText}</p>
                        </div>
                    </div>

                    {error && (
                        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="mt-8 rounded-[32px] border border-emerald-300/15 bg-emerald-300/10 p-6">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-sm text-white/80">
                                    <Sparkles className="h-4 w-4 text-amber-200" />
                                    Đã join thành công
                                </div>
                                <p className="mt-4 text-sm text-white/70">
                                    Màn hình này sẽ tự động vào game khi giáo viên bắt đầu phiên.
                                </p>
                            </div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/35 px-4 py-3 text-sm">
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
                                {loading ? 'Đang kết nối phòng...' : 'Sẵn sàng chờ lệnh start'}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate(`/play?pin=${encodeURIComponent(pin)}`)}
                        className="mt-8 inline-flex items-center gap-2 text-sm text-white/55 hover:text-white"
                    >
                        Đổi tên hoặc vào phòng khác
                        <ArrowRight className="h-4 w-4" />
                    </button>
                </motion.div>
            </div>
        </div>
    );
}
