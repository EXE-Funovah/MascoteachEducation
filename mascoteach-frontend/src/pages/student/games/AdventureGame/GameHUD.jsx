import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Star } from 'lucide-react';

/**
 * GameHUD — Lives, score, and question progress overlay
 * Rendered as an absolute overlay on top of the Kaplay canvas.
 */
export default function GameHUD({ lives, score, questionsDone, questionsTotal }) {
    return (
        <div className="absolute inset-x-0 top-0 z-20 pointer-events-none">
            <div className="flex items-center justify-between px-4 py-2.5 bg-black/55 backdrop-blur-sm border-b border-white/5">

                {/* ── Lives ── */}
                <div className="flex items-center gap-1.5">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <motion.div
                            key={i}
                            animate={{
                                scale: i < lives ? [1, 1.15, 1] : 0.65,
                                opacity: i < lives ? 1 : 0.25,
                            }}
                            transition={{ duration: 0.3 }}
                        >
                            <Heart
                                className={`w-5 h-5 ${
                                    i < lives
                                        ? 'text-rose-500 fill-rose-500 drop-shadow-[0_0_4px_rgba(244,63,94,0.6)]'
                                        : 'text-slate-600 fill-slate-600'
                                }`}
                            />
                        </motion.div>
                    ))}
                </div>

                {/* ── Question progress dots ── */}
                <div className="flex flex-col items-center gap-1.5">
                    <span className="text-[10px] text-white/40 font-semibold uppercase tracking-wider">
                        {questionsDone} / {questionsTotal} câu
                    </span>
                    <div className="flex gap-1">
                        {Array.from({ length: questionsTotal }).map((_, i) => (
                            <motion.div
                                key={i}
                                className={`h-1.5 rounded-full transition-all duration-400 ${
                                    i < questionsDone
                                        ? 'bg-emerald-400 w-4 shadow-[0_0_4px_rgba(52,211,153,0.7)]'
                                        : 'bg-white/15 w-2.5'
                                }`}
                                layout
                            />
                        ))}
                    </div>
                </div>

                {/* ── Score ── */}
                <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.6)]" />
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={score}
                            className="text-white font-bold text-sm min-w-[36px] text-right tabular-nums"
                            initial={{ y: -8, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 8, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {score.toLocaleString()}
                        </motion.span>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
