import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Hash, ArrowRight, Loader2, AlertCircle, UserRound, Gamepad2 } from 'lucide-react';
import { getSessionByPin } from '@/services/liveSessionService';
import { joinGame } from '@/services/gameService';

function getSessionPin(session) {
    return session?.gamePin || session?.pin || session?.pinCode || '';
}

export default function GameLobby() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [pin, setPin] = useState(searchParams.get('pin') || '');
    const [playerName, setPlayerName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const canSubmit = useMemo(() => pin.trim() && playerName.trim(), [pin, playerName]);

    async function handleJoin(e) {
        e.preventDefault();
        const trimmedPin = pin.trim().toUpperCase();
        const trimmedName = playerName.trim();
        if (!trimmedPin || !trimmedName) return;

        setLoading(true);
        setError(null);

        try {
            const session = await getSessionByPin(trimmedPin, { skipAuth: true });
            if (!session?.id) {
                throw new Error('Không tìm thấy phòng với mã PIN này.');
            }

            const participant = await joinGame(session.id, trimmedName);
            const resolvedPin = getSessionPin(session) || trimmedPin;

            navigate(`/play/waiting?pin=${encodeURIComponent(resolvedPin)}&name=${encodeURIComponent(trimmedName)}`, {
                state: { session, participant },
            });
        } catch (err) {
            setError(err.message || 'Không thể vào phòng lúc này. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="relative min-h-screen bg-gradient-to-b from-[#0a1230] via-[#0f1a40] to-slate-900 flex items-center justify-center px-4 overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
                {Array.from({ length: 55 }).map((_, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full bg-white"
                        style={{
                            width: Math.random() * 2.2 + 0.6,
                            height: Math.random() * 2.2 + 0.6,
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            opacity: Math.random() * 0.65 + 0.1,
                        }}
                    />
                ))}
            </div>

            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-amber-300/15 rounded-full blur-3xl pointer-events-none" />

            <motion.div
                className="relative w-full max-w-md"
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
            >
                <div className="text-center mb-7">
                    <motion.div
                        className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-300 to-orange-500 text-4xl shadow-xl shadow-amber-500/30 mb-4"
                        animate={{ y: [0, -7, 0] }}
                        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        <Gamepad2 className="w-10 h-10 text-slate-950" />
                    </motion.div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Mascoteach Live</h1>
                    <p className="text-white/45 text-sm mt-1.5">Nhập PIN và tên để vào phòng chờ của giáo viên</p>
                </div>

                <div className="bg-slate-800/70 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-2xl">
                    <form onSubmit={handleJoin} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-white/55 uppercase tracking-wider mb-2">
                                Mã PIN phòng chơi
                            </label>
                            <div className="relative">
                                <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-white/35" />
                                <input
                                    type="text"
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value.toUpperCase())}
                                    placeholder="VD: 482915"
                                    maxLength={12}
                                    autoFocus
                                    className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-slate-700/80 border border-white/10 text-white text-xl font-mono font-bold tracking-[0.25em] placeholder:text-white/20 placeholder:font-normal placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-sky-400 transition"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-white/55 uppercase tracking-wider mb-2">
                                Tên hiển thị
                            </label>
                            <div className="relative">
                                <UserRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-white/35" />
                                <input
                                    type="text"
                                    value={playerName}
                                    onChange={(e) => setPlayerName(e.target.value)}
                                    placeholder="Nhập tên của bạn"
                                    maxLength={30}
                                    className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-slate-700/80 border border-white/10 text-white text-base font-semibold placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-sky-400 transition"
                                />
                            </div>
                        </div>

                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    className="flex items-start gap-2 text-rose-400 text-sm bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2.5"
                                    initial={{ opacity: 0, y: -6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }}
                                >
                                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                    <span>{error}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button
                            type="submit"
                            disabled={loading || !canSubmit}
                            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-sky-500/30 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Vào phòng chờ
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-white/25 text-xs mt-5">
                    Sau khi join, màn hình sẽ tự động chờ giáo viên start game.
                </p>
            </motion.div>
        </div>
    );
}
