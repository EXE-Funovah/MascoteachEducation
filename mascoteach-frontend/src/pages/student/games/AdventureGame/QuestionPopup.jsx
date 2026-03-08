import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Clock, Zap } from 'lucide-react';

const TIME_LIMIT = 30;

const OPTION_STYLES = [
    {
        idle: 'from-blue-600 to-blue-700 border-blue-500/40 hover:from-blue-500 hover:to-blue-600 hover:border-blue-400/60',
        label: 'bg-blue-500/40',
    },
    {
        idle: 'from-rose-600 to-rose-700 border-rose-500/40 hover:from-rose-500 hover:to-rose-600 hover:border-rose-400/60',
        label: 'bg-rose-500/40',
    },
    {
        idle: 'from-amber-600 to-amber-700 border-amber-500/40 hover:from-amber-500 hover:to-amber-600 hover:border-amber-400/60',
        label: 'bg-amber-500/40',
    },
    {
        idle: 'from-emerald-600 to-emerald-700 border-emerald-500/40 hover:from-emerald-500 hover:to-emerald-600 hover:border-emerald-400/60',
        label: 'bg-emerald-500/40',
    },
];

const LABELS = ['A', 'B', 'C', 'D'];

/**
 * QuestionPopup — Full-screen React overlay for answering questions.
 * Appears when Kaplay triggers a question block collision.
 *
 * @param {object} props
 * @param {object} props.question       Normalized question { text, options, correctIndex, explanation }
 * @param {number} props.questionNumber 1-based display number
 * @param {number} props.total          Total question count
 * @param {(isCorrect: boolean) => void} props.onAnswer  Called after reveal delay
 */
export default function QuestionPopup({ question, questionNumber, total, onAnswer }) {
    const [selected, setSelected] = useState(null);   // index of chosen option
    const [revealed, setRevealed] = useState(false);  // true after student picks
    const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);

    // Countdown timer
    useEffect(() => {
        if (revealed) return;
        if (timeLeft <= 0) {
            triggerAnswer(-1); // timed out → wrong
            return;
        }
        const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
        return () => clearInterval(id);
    }, [timeLeft, revealed]);

    const triggerAnswer = useCallback(
        (idx) => {
            if (revealed) return;
            setSelected(idx);
            setRevealed(true);
            const isCorrect = idx === question.correctIndex;
            // Short delay so student can see correct answer highlight
            setTimeout(() => onAnswer(isCorrect), 1300);
        },
        [revealed, question.correctIndex, onAnswer],
    );

    const timerPct = (timeLeft / TIME_LIMIT) * 100;
    const isUrgent = timeLeft <= 6;

    return (
        <motion.div
            className="absolute inset-0 z-30 flex items-end justify-center p-4 bg-black/65 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="w-full max-w-2xl bg-slate-900/95 border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
                initial={{ y: 48, scale: 0.96 }}
                animate={{ y: 0, scale: 1 }}
                exit={{ y: 48, scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            >
                {/* Timer bar */}
                <div className="h-1.5 bg-slate-700/80">
                    <motion.div
                        className={`h-full transition-colors duration-300 ${
                            isUrgent ? 'bg-rose-500' : 'bg-gradient-to-r from-brand-mid to-brand-light'
                        }`}
                        style={{ width: `${timerPct}%` }}
                        transition={{ duration: 1, ease: 'linear' }}
                    />
                </div>

                <div className="p-5">
                    {/* Header row */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-1.5 bg-brand-blue/20 border border-brand-mid/30 px-2.5 py-1 rounded-full">
                            <Zap className="w-3 h-3 text-brand-mid" />
                            <span className="text-xs font-semibold text-brand-mid">
                                Câu {questionNumber} / {total}
                            </span>
                        </div>
                        <div
                            className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
                                isUrgent
                                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse'
                                    : 'bg-slate-700/60 text-white/55 border border-white/10'
                            }`}
                        >
                            <Clock className="w-3.5 h-3.5" />
                            {timeLeft}s
                        </div>
                    </div>

                    {/* Question text */}
                    <p className="text-white font-semibold text-base md:text-lg leading-relaxed text-center mb-5 px-2">
                        {question.text}
                    </p>

                    {/* Answer options */}
                    <div className="grid grid-cols-2 gap-2.5">
                        {question.options.map((opt, i) => {
                            let variant = 'idle';
                            if (revealed) {
                                if (i === question.correctIndex) variant = 'correct';
                                else if (i === selected) variant = 'wrong';
                                else variant = 'dim';
                            }

                            return (
                                <motion.button
                                    key={i}
                                    onClick={() => triggerAnswer(i)}
                                    disabled={revealed}
                                    whileHover={!revealed ? { scale: 1.025 } : {}}
                                    whileTap={!revealed ? { scale: 0.97 } : {}}
                                    className={`
                                        relative flex items-center gap-2.5 px-3.5 py-3 rounded-xl
                                        text-white text-sm font-medium text-left
                                        bg-gradient-to-br border transition-all duration-200
                                        ${variant === 'idle' ? OPTION_STYLES[i].idle : ''}
                                        ${variant === 'correct' ? 'from-emerald-500 to-emerald-600 border-emerald-400/60 ring-2 ring-emerald-400/80 ring-offset-1 ring-offset-slate-900' : ''}
                                        ${variant === 'wrong' ? 'from-rose-700 to-rose-800 border-rose-500/30 opacity-75' : ''}
                                        ${variant === 'dim' ? 'from-slate-700 to-slate-800 border-slate-600/30 opacity-40' : ''}
                                    `}
                                >
                                    {/* Label badge */}
                                    <span
                                        className={`flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ${
                                            variant === 'idle' ? OPTION_STYLES[i].label : 'bg-white/15'
                                        }`}
                                    >
                                        {LABELS[i]}
                                    </span>

                                    <span className="flex-1 leading-snug">{opt}</span>

                                    {/* Result icon */}
                                    {variant === 'correct' && (
                                        <CheckCircle2 className="w-4 h-4 text-emerald-200 flex-shrink-0" />
                                    )}
                                    {variant === 'wrong' && (
                                        <XCircle className="w-4 h-4 text-rose-300 flex-shrink-0" />
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* Explanation (shown after reveal) */}
                    <AnimatePresence>
                        {revealed && question.explanation && (
                            <motion.div
                                className="mt-4 flex items-start gap-2 bg-white/5 border border-white/8 rounded-xl px-3.5 py-2.5"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                <span className="text-base flex-shrink-0">💡</span>
                                <p className="text-xs text-white/60 leading-relaxed">{question.explanation}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </motion.div>
    );
}
