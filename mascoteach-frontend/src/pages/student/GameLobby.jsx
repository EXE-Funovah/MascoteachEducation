import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    Gamepad2,
    Hash,
    Loader2,
    ShieldCheck,
    Sparkles,
    UserRound,
} from 'lucide-react';
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
                throw new Error('Không tìm thấy phiên học với mã PIN này.');
            }

            const participant = await joinGame(session.id, trimmedName);
            const resolvedPin = getSessionPin(session) || trimmedPin;
            saveLiveGameIdentity(session, participant);

            navigate(`/play/waiting?pin=${encodeURIComponent(resolvedPin)}&name=${encodeURIComponent(trimmedName)}`, {
                state: { session, participant },
            });
        } catch (requestError) {
            setError(requestError.message || 'Không thể tham gia phiên lúc này. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={`relative overflow-hidden bg-[#f8fbff] text-slate-900 ${isStudentPortal ? 'min-h-[calc(100dvh-4rem)]' : 'min-h-dvh'}`}>
            <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-brand-light/30 blur-3xl" />
                <div className="absolute -bottom-40 right-0 h-[28rem] w-[28rem] rounded-full bg-brand-blue/10 blur-3xl" />
                <div className="absolute inset-0 opacity-[0.28] [background-image:radial-gradient(#5BAED4_1px,transparent_1px)] [background-size:24px_24px]" />
            </div>

            {!isStudentPortal && (
                <header className="relative z-10 mx-auto flex w-full max-w-[1200px] items-center justify-between px-5 py-5 sm:px-8">
                    <Link to="/" className="rounded-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-light/50" aria-label="Về trang chủ Mascoteach">
                        <img src="/images/Logo_Redesign_Text.webp" alt="Mascoteach" className="h-11 w-auto object-contain" />
                    </Link>
                    <Link to="/signin" className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-4 text-sm font-extrabold text-slate-700 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-brand-light hover:text-brand-navy focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-light/40 active:translate-y-0">
                        <ArrowLeft className="h-4 w-4" />
                        Đăng nhập
                    </Link>
                </header>
            )}

            <main className="relative z-10 mx-auto flex w-full max-w-[1200px] items-center px-5 py-8 sm:px-8 lg:min-h-[calc(100dvh-7rem)] lg:py-12">
                <motion.section
                    className="grid w-full overflow-hidden rounded-[30px] border border-white/90 bg-white/90 shadow-[0_28px_90px_rgba(27,58,107,0.13)] backdrop-blur lg:grid-cols-[minmax(0,0.9fr)_minmax(420px,1.1fr)]"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                >
                    <div className="relative overflow-hidden bg-brand-navy px-6 py-9 text-white sm:px-9 sm:py-12 lg:flex lg:min-h-[590px] lg:flex-col lg:justify-between lg:px-11">
                        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                            <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full border-[42px] border-white/[0.05]" />
                            <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-brand-mid/20 blur-2xl" />
                        </div>

                        <div className="relative">
                            <span className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-brand-light">
                                <Sparkles className="h-3.5 w-3.5" />
                                Mascoteach Live
                            </span>
                            <h1 className="mt-6 max-w-md text-3xl font-black leading-[1.12] tracking-[-0.04em] text-balance sm:text-4xl">
                                Sẵn sàng vào phiên học cùng cả lớp?
                            </h1>
                            <p className="mt-4 max-w-md text-sm font-semibold leading-6 text-slate-300 sm:text-base">
                                Nhập mã PIN giáo viên cung cấp và tên bạn muốn hiển thị trong trò chơi.
                            </p>
                        </div>

                        <div className="relative mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                            <InfoItem icon={ShieldCheck} title="Vào đúng phòng" description="Mã PIN giúp kết nối bạn với phiên học của giáo viên." />
                            <InfoItem icon={CheckCircle2} title="Chờ giáo viên bắt đầu" description="Sau khi tham gia, bạn sẽ được chuyển thẳng đến phòng chờ." />
                        </div>
                    </div>

                    <div className="flex items-center px-6 py-9 sm:px-10 sm:py-12 lg:px-14">
                        <div className="w-full">
                            <div className="flex items-center gap-4">
                                <span className="grid h-12 w-12 flex-none place-items-center rounded-2xl bg-brand-light/25 text-brand-blue shadow-sm">
                                    <Gamepad2 className="h-6 w-6" strokeWidth={2.2} />
                                </span>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-[0.12em] text-brand-blue">Tham gia nhanh</p>
                                    <h2 className="mt-1 text-2xl font-black tracking-[-0.025em] text-slate-950">Nhập thông tin phiên</h2>
                                </div>
                            </div>

                            <form onSubmit={handleJoin} className="mt-8 space-y-5">
                                <Field
                                    id="session-pin"
                                    label="Mã PIN phiên học"
                                    icon={Hash}
                                    value={pin}
                                    onChange={(event) => {
                                        setPin(event.target.value.toUpperCase().replace(/\s/g, ''));
                                        if (error) setError(null);
                                    }}
                                    placeholder="Ví dụ: 482915"
                                    maxLength={12}
                                    autoFocus
                                    inputMode="text"
                                    autoComplete="off"
                                    className="font-mono text-lg font-black uppercase tracking-[0.16em]"
                                />

                                <Field
                                    id="player-name"
                                    label="Tên hiển thị"
                                    icon={UserRound}
                                    value={playerName}
                                    onChange={(event) => {
                                        setPlayerName(event.target.value);
                                        if (error) setError(null);
                                    }}
                                    placeholder="Nhập tên của bạn"
                                    maxLength={30}
                                    autoComplete="nickname"
                                />

                                <AnimatePresence initial={false}>
                                    {error && (
                                        <motion.div
                                            role="alert"
                                            aria-live="polite"
                                            className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3.5 text-sm font-bold leading-5 text-rose-700"
                                            initial={{ opacity: 0, y: -6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -6 }}
                                        >
                                            <AlertCircle className="mt-0.5 h-4 w-4 flex-none" />
                                            <span>{error}</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <button
                                    type="submit"
                                    disabled={loading || !canSubmit}
                                    className="group inline-flex h-14 w-full items-center justify-center gap-2.5 rounded-2xl bg-brand-navy px-5 text-sm font-black text-white shadow-[0_14px_32px_rgba(27,58,107,0.24)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-blue hover:shadow-[0_18px_38px_rgba(43,122,181,0.3)] focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-light/60 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Đang kiểm tra phiên...
                                        </>
                                    ) : (
                                        <>
                                            Vào phòng chờ
                                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </>
                                    )}
                                </button>
                            </form>

                            <p className="mt-5 text-center text-xs font-semibold leading-5 text-slate-500">
                                Hãy kiểm tra lại mã PIN nếu bạn chưa thể vào phiên.
                            </p>
                        </div>
                    </div>
                </motion.section>
            </main>
        </div>
    );
}

function Field({ id, label, icon: Icon, className = '', ...inputProps }) {
    return (
        <label htmlFor={id} className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.08em] text-slate-600">{label}</span>
            <span className="relative block">
                <Icon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-blue" strokeWidth={2.1} />
                <input
                    id={id}
                    required
                    {...inputProps}
                    className={`h-14 w-full rounded-2xl border border-slate-200 bg-slate-50/80 pl-12 pr-4 text-sm font-bold text-slate-950 outline-none transition placeholder:font-semibold placeholder:tracking-normal placeholder:text-slate-400 hover:border-brand-light focus:border-brand-mid focus:bg-white focus:ring-4 focus:ring-brand-light/25 ${className}`}
                />
            </span>
        </label>
    );
}

function InfoItem({ icon: Icon, title, description }) {
    return (
        <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.07] p-4">
            <span className="grid h-9 w-9 flex-none place-items-center rounded-xl bg-white/10 text-brand-light">
                <Icon className="h-4.5 w-4.5" />
            </span>
            <span>
                <strong className="block text-sm font-extrabold text-white">{title}</strong>
                <span className="mt-1 block text-xs font-semibold leading-5 text-slate-300">{description}</span>
            </span>
        </div>
    );
}
