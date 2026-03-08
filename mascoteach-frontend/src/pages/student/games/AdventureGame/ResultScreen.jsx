import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Trophy, RotateCcw, Home, CheckCircle2, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function calcStars(correctCount, total) {
    if (!total) return 1;
    const ratio = correctCount / total;
    if (ratio >= 0.85) return 3;
    if (ratio >= 0.55) return 2;
    return 1;
}

const STAR_MESSAGES = {
    3: ['🎉 Xuất sắc!', 'Bạn thật tuyệt vời — không bỏ sót câu nào!'],
    2: ['👍 Tốt lắm!', 'Tiếp tục luyện tập để đạt điểm tuyệt đối nhé!'],
    1: ['💪 Cố lên!', 'Hãy thử lại, bạn sẽ làm được thôi!'],
};

/**
 * ResultScreen — Full-screen result overlay shown when the game ends.
 * Includes a scrollable question review section.
 */
export default function ResultScreen({ score, correctCount, wrongCount, questionsTotal, questions = [], answerHistory = [], onPlayAgain }) {
    const navigate = useNavigate();
    const stars = calcStars(correctCount, questionsTotal);
    const [headline, subtitle] = STAR_MESSAGES[stars];
    const [showReview, setShowReview] = useState(false);

    // Build a lookup: questionIdx → isCorrect
    const answerMap = {};
    answerHistory.forEach((a) => { answerMap[a.questionIdx] = a.isCorrect; });

    return (
        <motion.div
            className="absolute inset-0 z-40 flex items-center justify-center bg-slate-900/96 backdrop-blur-sm overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            {/* Confetti-like background spots for 3-star */}
            {stars === 3 && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {Array.from({ length: 24 }).map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute rounded-full"
                            style={{
                                width: Math.random() * 10 + 4,
                                height: Math.random() * 10 + 4,
                                background: ['#fbbf24', '#34d399', '#60a5fa', '#f472b6'][i % 4],
                                top: `${Math.random() * 100}%`,
                                left: `${Math.random() * 100}%`,
                            }}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: [0, 1, 0], y: 60 }}
                            transition={{ delay: Math.random() * 1.5, duration: 2 + Math.random(), repeat: Infinity }}
                        />
                    ))}
                </div>
            )}

            <div className="relative w-full max-w-lg px-6 py-10 my-auto">
                <motion.div
                    className="text-center"
                    initial={{ scale: 0.82, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 22, delay: 0.1 }}
                >
                    {/* Trophy icon */}
                    <motion.div
                        initial={{ y: -24, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.25, type: 'spring' }}
                        className="mb-5"
                    >
                        <div className="relative inline-block">
                            <Trophy className="w-16 h-16 text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]" />
                        </div>
                        <h2 className="text-2xl font-black text-white mt-3">{headline}</h2>
                        <p className="text-white/45 text-sm mt-1">{subtitle}</p>
                    </motion.div>

                    {/* Stars */}
                    <div className="flex justify-center gap-3 mb-6">
                        {[1, 2, 3].map((s, i) => (
                            <motion.div
                                key={s}
                                initial={{ scale: 0, rotate: -35 }}
                                animate={{
                                    scale: s <= stars ? 1 : 0.7,
                                    rotate: 0,
                                    opacity: s <= stars ? 1 : 0.2,
                                }}
                                transition={{
                                    delay: 0.4 + i * 0.15,
                                    type: 'spring',
                                    stiffness: 300,
                                    damping: 18,
                                }}
                            >
                                <Star
                                    className={`w-11 h-11 ${
                                        s <= stars
                                            ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                                            : 'text-slate-600 fill-slate-700'
                                    }`}
                                />
                            </motion.div>
                        ))}
                    </div>

                    {/* Big score */}
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.75, type: 'spring', stiffness: 280 }}
                        className="mb-1"
                    >
                        <span className="text-6xl font-black text-white tabular-nums drop-shadow-[0_0_24px_rgba(91,174,212,0.4)]">
                            {score.toLocaleString()}
                        </span>
                    </motion.div>
                    <p className="text-white/35 text-sm mb-7">điểm</p>

                    {/* Stat cards */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <motion.div
                            className="bg-emerald-500/12 border border-emerald-500/25 rounded-2xl p-4 flex flex-col items-center gap-1"
                            initial={{ opacity: 0, x: -16 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.9 }}
                        >
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 mb-0.5" />
                            <span className="text-3xl font-black text-emerald-400 tabular-nums">{correctCount}</span>
                            <span className="text-xs text-white/40 font-medium">Câu đúng</span>
                        </motion.div>
                        <motion.div
                            className="bg-rose-500/12 border border-rose-500/25 rounded-2xl p-4 flex flex-col items-center gap-1"
                            initial={{ opacity: 0, x: 16 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.9 }}
                        >
                            <XCircle className="w-5 h-5 text-rose-400 mb-0.5" />
                            <span className="text-3xl font-black text-rose-400 tabular-nums">{wrongCount}</span>
                            <span className="text-xs text-white/40 font-medium">Câu sai</span>
                        </motion.div>
                    </div>

                    {/* Review toggle button */}
                    {questions.length > 0 && answerHistory.length > 0 && (
                        <motion.button
                            onClick={() => setShowReview((v) => !v)}
                            className="flex items-center justify-center gap-2 mx-auto mb-5 px-5 py-2.5 rounded-xl
                                       bg-white/8 border border-white/15 text-white/70 text-sm font-semibold
                                       hover:bg-white/12 hover:text-white transition-all"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 }}
                        >
                            {showReview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            {showReview ? 'Ẩn chi tiết' : 'Xem lại câu hỏi'}
                        </motion.button>
                    )}

                    {/* Question review list */}
                    <AnimatePresence>
                        {showReview && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                className="overflow-hidden mb-6"
                            >
                                <div className="space-y-3 text-left max-h-[40vh] overflow-y-auto pr-1 hide-scrollbar">
                                    {questions.map((q, idx) => {
                                        const answered = answerMap[idx];
                                        const isCorrect = answered === true;
                                        const isWrong = answered === false;
                                        const notAnswered = answered === undefined;

                                        return (
                                            <div
                                                key={q.id || idx}
                                                className={`rounded-xl border p-4 ${
                                                    isCorrect
                                                        ? 'bg-emerald-500/8 border-emerald-500/25'
                                                        : isWrong
                                                            ? 'bg-rose-500/8 border-rose-500/25'
                                                            : 'bg-white/5 border-white/10'
                                                }`}
                                            >
                                                <div className="flex items-start gap-3 mb-2">
                                                    <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                                        isCorrect
                                                            ? 'bg-emerald-500/25 text-emerald-400'
                                                            : isWrong
                                                                ? 'bg-rose-500/25 text-rose-400'
                                                                : 'bg-white/15 text-white/50'
                                                    }`}>
                                                        {idx + 1}
                                                    </span>
                                                    <p className="text-sm text-white/85 font-medium leading-relaxed flex-1">
                                                        {q.text}
                                                    </p>
                                                    {isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />}
                                                    {isWrong && <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />}
                                                </div>
                                                {/* Show options with correct answer highlighted */}
                                                <div className="grid grid-cols-2 gap-1.5 ml-9">
                                                    {q.options.map((opt, optIdx) => (
                                                        <div
                                                            key={optIdx}
                                                            className={`text-xs px-2.5 py-1.5 rounded-lg border ${
                                                                optIdx === q.correctIndex
                                                                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300 font-semibold'
                                                                    : 'bg-white/5 border-white/8 text-white/45'
                                                            }`}
                                                        >
                                                            {opt}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Action buttons */}
                    <motion.div
                        className="flex gap-3"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.05 }}
                    >
                        <button
                            onClick={() => navigate(-1)}
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 border border-white/8 text-white text-sm font-semibold transition-all active:scale-98"
                        >
                            <Home className="w-4 h-4" />
                            Quay lại
                        </button>
                        <button
                            onClick={onPlayAgain}
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-brand-blue to-brand-mid text-white text-sm font-semibold shadow-lg shadow-brand-blue/25 hover:opacity-90 transition-all active:scale-98"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Chơi lại
                        </button>
                    </motion.div>
                </motion.div>
            </div>
        </motion.div>
    );
}
