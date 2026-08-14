import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Hourglass, Loader2, Users, Sparkles, ArrowRight, AlertCircle } from 'lucide-react';
import { getSessionByPin } from '@/services/liveSessionService';
import { createLiveSessionConnection } from '@/services/liveSessionRealtime';
import { loadLiveGameIdentity } from '@/services/liveGameIdentity';
import { useAuth } from '@/contexts/AuthContext';
import { getGameExitPath, getGameLobbyPath } from '@/utils/navigation';

function getSessionPin(session) {
    return session?.gamePin || session?.pin || session?.pinCode || '';
}

export default function LiveSessionWaitingPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, loading: authLoading } = useAuth();
    const [searchParams] = useSearchParams();
    const reduceMotion = useReducedMotion();
    const exitPath = getGameExitPath(user);
    const lobbyPath = getGameLobbyPath(user);

    const storedIdentity = useMemo(() => loadLiveGameIdentity(), []);
    const initialSession = location.state?.session || storedIdentity?.session || null;
    const participant = location.state?.participant || storedIdentity?.participant || null;

    const pin = useMemo(
        () => searchParams.get('pin') || getSessionPin(initialSession),
        [initialSession, searchParams]
    );
    const playerName = useMemo(
        () => searchParams.get('name') || participant?.studentName || participant?.name || 'Guest',
        [participant, searchParams]
    );

    const [session, setSession] = useState(initialSession);
    const sessionRef = useRef(initialSession);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(!initialSession);
    const [statusText, setStatusText] = useState('Đang chờ giáo viên bắt đầu');

    useEffect(() => {
        if (!pin || !participant?.id || !participant?.joinToken) {
            if (authLoading) return undefined;
            navigate(exitPath, { replace: true });
            return undefined;
        }

        let cancelled = false;

        async function syncSession() {
            try {
                const latest = await getSessionByPin(pin, { skipAuth: true });
                if (cancelled || !latest) return;

                setSession(latest);
                sessionRef.current = latest;
                setLoading(false);

                if (latest.status === 'Active') {
                    setStatusText('Trò chơi đang bắt đầu...');

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
                    setError(err.message || 'Không thể cập nhật trạng thái phòng.');
                }
            }
        }

        syncSession();
        const intervalId = window.setInterval(syncSession, 4000);

        return () => {
            cancelled = true;
            window.clearInterval(intervalId);
        };
    }, [navigate, participant, pin, playerName, exitPath, authLoading]);

    useEffect(() => {
        if (!pin || !participant?.id || !participant?.joinToken) return undefined;

        let navigated = false;

        const realtime = createLiveSessionConnection({
            gamePin: pin,
            sessionId: sessionRef.current?.id,
            role: 'student',
            participantId: participant?.id,
            joinToken: participant?.joinToken,
            onEvent: (eventName, payload) => {
                console.log('[WaitingPage] SignalR event:', eventName, payload);

                if (eventName === 'GameStarted' || eventName === 'NewQuestion') {
                    if (!navigated) {
                        navigated = true;
                        setStatusText('Trò chơi đang bắt đầu...');
                        navigate('/play/live-game', {
                            replace: true,
                            state: {
                                session: sessionRef.current,
                                participant,
                                playerName,
                            },
                        });
                    }
                }

                if (eventName === 'HostJoined') {
                    setStatusText('Giáo viên đã vào phòng');
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
    }, [pin, participant, playerName, navigate]);

    return (
        <div className="relative min-h-dvh overflow-hidden bg-[#f4f8ff] px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,rgba(84,183,230,0.20),transparent_30%),radial-gradient(circle_at_88%_86%,rgba(30,94,148,0.10),transparent_34%)]" />
            <div className="pointer-events-none absolute inset-0 opacity-35 [background-image:radial-gradient(#8fcceb_1px,transparent_1px)] [background-size:34px_34px]" />
            <main className="relative mx-auto flex min-h-[calc(100dvh-3rem)] max-w-6xl items-center">
                <motion.section
                    initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.28, ease: 'easeOut' }}
                    className="grid w-full overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_24px_70px_rgba(26,73,112,0.12)] lg:grid-cols-[1.05fr_0.95fr]"
                >
                    <div className="relative overflow-hidden bg-[#17375f] p-7 text-white sm:p-10 lg:p-12">
                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(99,200,238,0.28),transparent_36%),radial-gradient(circle_at_100%_100%,rgba(255,255,255,0.10),transparent_36%)]" />
                        <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(#ffffff_1px,transparent_1px)] [background-size:30px_30px]" />
                        <div className="relative flex h-full min-h-[340px] flex-col justify-between">
                            <div>
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-sky-200 ring-1 ring-white/15"><Hourglass className="h-8 w-8" /></div>
                                <p className="mt-8 text-xs font-black uppercase tracking-[0.24em] text-sky-200">Mascoteach Live</p>
                                <h1 className="mt-3 max-w-lg text-4xl font-black tracking-tight sm:text-5xl">Bạn đã vào phòng</h1>
                                <p className="mt-4 max-w-md text-base leading-7 text-sky-100/80">{session?.title || session?.quizTitle || 'Giữ màn hình này mở. Trò chơi sẽ tự động bắt đầu theo điều khiển của giáo viên.'}</p>
                            </div>
                            <div className="mt-10 flex items-center gap-3 rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                                {loading ? <Loader2 className="h-5 w-5 animate-spin text-sky-200" /> : <Sparkles className="h-5 w-5 text-sky-200" />}
                                <div><p className="font-bold">{loading ? 'Đang kết nối phòng...' : 'Kết nối thành công'}</p><p className="mt-1 text-sm text-sky-100/70">Không cần tải lại trang trong lúc chờ.</p></div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12">
                        <div className="flex items-center gap-2 text-sm font-bold text-emerald-700"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_5px_rgba(16,185,129,0.12)]" />Phòng đang hoạt động</div>
                        <h2 className="mt-4 text-2xl font-black tracking-tight text-[#0b1f3a]">Chờ giáo viên bắt đầu</h2>
                        <p className="mt-2 text-sm leading-6 text-slate-500">Kiểm tra lại thông tin của bạn trước khi trò chơi bắt đầu.</p>
                        <dl className="mt-7 space-y-3">
                            <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-5 py-4"><dt className="text-sm font-semibold text-slate-500">Mã PIN</dt><dd className="font-mono text-2xl font-black tracking-[0.18em] text-[#17375f]">{pin || '------'}</dd></div>
                            <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-5 py-4"><dt className="text-sm font-semibold text-slate-500">Tên hiển thị</dt><dd className="truncate text-lg font-black text-[#17375f]">{playerName}</dd></div>
                            <div className="rounded-2xl border border-sky-100 bg-sky-50 px-5 py-4"><dt className="text-sm font-semibold text-sky-700">Trạng thái</dt><dd className="mt-1 font-bold text-[#17375f]">{statusText}</dd></div>
                        </dl>
                        {error ? <div className="mt-5 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{error}</span></div> : null}
                        <div className="mt-7 flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                            <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500"><Users className="h-4 w-4 text-sky-600" />Sẵn sàng nhận câu hỏi</div>
                            <button onClick={() => navigate(`${lobbyPath}?pin=${encodeURIComponent(pin)}`)} className="inline-flex items-center gap-2 text-sm font-bold text-[#236b9d] transition-colors hover:text-[#17375f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2">Đổi tên hoặc vào phòng khác<ArrowRight className="h-4 w-4" /></button>
                        </div>
                    </div>
                </motion.section>
            </main>
        </div>
    );
}
