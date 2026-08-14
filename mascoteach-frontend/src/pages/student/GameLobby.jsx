import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, ArrowRight, Hash, Loader2, UserRound } from 'lucide-react';
import { getSessionByPin } from '@/services/liveSessionService';
import { joinGame } from '@/services/gameService';
import { saveLiveGameIdentity } from '@/services/liveGameIdentity';

function getSessionPin(session) {
    return session?.gamePin || session?.pin || session?.pinCode || '';
}

export default function GameLobby() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const [pin, setPin] = useState(searchParams.get('pin') || '');
    const [playerName, setPlayerName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const isStudentPortal = location.pathname.startsWith('/student/');

    const canSubmit = useMemo(() => pin.trim() && playerName.trim(), [pin, playerName]);

    async function handleJoin(event) {
        event.preventDefault();
        const trimmedPin = pin.trim().toUpperCase();
        const trimmedName = playerName.trim();
        if (!trimmedPin || !trimmedName) return;

        setLoading(true);
        setError(null);

        try {
            const session = await getSessionByPin(trimmedPin, { skipAuth: true });
            if (!session?.id) {
                throw new Error('Không tìm thấy phòng chơi với mã PIN này.');
            }

            const participant = await joinGame(session.id, trimmedName, { skipAuth: false });
            const resolvedPin = getSessionPin(session) || trimmedPin;
            saveLiveGameIdentity(session, participant);

            navigate(`/play/waiting?pin=${encodeURIComponent(resolvedPin)}&name=${encodeURIComponent(trimmedName)}`, {
                state: { session, participant },
            });
        } catch (requestError) {
            setError(requestError.message || 'Không thể vào phòng chơi lúc này. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    }

    function updatePin(event) {
        setPin(event.target.value.toUpperCase().replace(/\s/g, ''));
        if (error) setError(null);
    }

    function updatePlayerName(event) {
        setPlayerName(event.target.value);
        if (error) setError(null);
    }

    return (
        <div className={`relative grid overflow-hidden bg-[#eef7fd] px-5 py-8 text-slate-900 ${isStudentPortal ? 'min-h-[calc(100dvh-4rem)] lg:min-h-dvh' : 'min-h-dvh'}`}>
            <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                <div className="absolute -left-24 -top-32 h-[30rem] w-[30rem] rounded-full bg-brand-light/35 blur-3xl" />
                <div className="absolute -bottom-48 right-[-8rem] h-[36rem] w-[36rem] rounded-full bg-brand-blue/15 blur-3xl" />
                <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(#5BAED4_1px,transparent_1px)] [background-size:26px_26px]" />
            </div>

            {!isStudentPortal && (
                <Link
                    to="/signin"
                    className="absolute left-5 top-5 z-20 inline-flex h-11 items-center gap-2 rounded-xl bg-white/80 px-4 text-sm font-extrabold text-slate-700 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:text-brand-navy focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-light/50 active:translate-y-0 sm:left-8 sm:top-8"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Đăng nhập
                </Link>
            )}

            <main className="relative z-10 m-auto w-full max-w-[440px] py-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
                >
                    <img
                        src="/images/Logo_Redesign_Text.webp"
                        alt="Mascoteach"
                        className="mx-auto h-auto w-[230px] max-w-[72vw] object-contain"
                    />
                    <h1 className="mt-6 text-2xl font-black tracking-[-0.03em] text-brand-navy sm:text-[28px]">
                        Tham gia phòng chơi
                    </h1>
                    <p className="mt-2 text-sm font-semibold text-slate-500">
                        Nhập mã PIN và tên của bạn để bắt đầu.
                    </p>

                    <form
                        onSubmit={handleJoin}
                        className="mt-7 rounded-[22px] bg-white p-5 text-left shadow-[0_20px_60px_rgba(27,58,107,0.14)] ring-1 ring-white sm:p-6"
                    >
                        <LobbyField
                            id="game-pin"
                            label="Mã PIN"
                            icon={Hash}
                            value={pin}
                            onChange={updatePin}
                            placeholder="Nhập mã PIN"
                            maxLength={12}
                            autoFocus
                            inputMode="text"
                            autoComplete="off"
                            className="font-mono text-lg font-black uppercase tracking-[0.14em]"
                        />

                        <LobbyField
                            id="player-name"
                            label="Tên hiển thị"
                            icon={UserRound}
                            value={playerName}
                            onChange={updatePlayerName}
                            placeholder="Nhập tên của bạn"
                            maxLength={30}
                            autoComplete="nickname"
                            wrapperClassName="mt-4"
                        />

                        <AnimatePresence initial={false}>
                            {error && (
                                <motion.div
                                    role="alert"
                                    aria-live="polite"
                                    className="mt-4 flex items-start gap-2.5 rounded-xl bg-rose-50 px-3.5 py-3 text-sm font-bold leading-5 text-rose-700 ring-1 ring-rose-200"
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                >
                                    <AlertCircle className="mt-0.5 h-4 w-4 flex-none" />
                                    <span>{error}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button
                            type="submit"
                            disabled={loading || !canSubmit}
                            className="group mt-5 inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-brand-navy px-5 text-sm font-black text-white shadow-[0_6px_0_#10294f] transition-all duration-150 hover:-translate-y-0.5 hover:bg-brand-blue hover:shadow-[0_7px_0_#1B3A6B] focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-light/60 active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-[0_5px_0_#94a3b8]"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Đang kiểm tra...
                                </>
                            ) : (
                                <>
                                    Vào phòng
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-5 text-xs font-semibold text-slate-500">
                        Mã PIN được giáo viên hiển thị khi mở phòng chơi.
                    </p>
                </motion.div>
            </main>
        </div>
    );
}

function LobbyField({ id, label, icon: Icon, className = '', wrapperClassName = '', ...inputProps }) {
    return (
        <label htmlFor={id} className={`block ${wrapperClassName}`}>
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.08em] text-slate-600">{label}</span>
            <span className="relative block">
                <Icon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-blue" strokeWidth={2.2} />
                <input
                    id={id}
                    required
                    {...inputProps}
                    className={`h-14 w-full rounded-xl border-2 border-slate-200 bg-white pl-12 pr-4 text-sm font-bold text-slate-950 outline-none transition placeholder:font-semibold placeholder:tracking-normal placeholder:text-slate-400 hover:border-brand-light focus:border-brand-blue focus:ring-4 focus:ring-brand-light/25 ${className}`}
                />
            </span>
        </label>
    );
}
