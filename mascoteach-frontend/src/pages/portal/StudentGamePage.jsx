import { useState, useEffect, useCallback } from 'react';
import { studentGameState } from '@/data/mockData';
import { Flame, Star, Trophy } from 'lucide-react';

/**
 * StudentGamePage — Minimal student-facing game view
 * Design: question centered, large answer buttons, timer bar,
 * score display, and mascot encouragement bubble
 * Kept minimal and touch-friendly per Blooket-style conventions
 */
const optionColors = [
    { bg: 'bg-blue-500 hover:bg-blue-600', shadow: 'shadow-blue-500/30' },
    { bg: 'bg-rose-500 hover:bg-rose-600', shadow: 'shadow-rose-500/30' },
    { bg: 'bg-amber-500 hover:bg-amber-600', shadow: 'shadow-amber-500/30' },
    { bg: 'bg-emerald-500 hover:bg-emerald-600', shadow: 'shadow-emerald-500/30' },
];

const optionLabels = ['A', 'B', 'C', 'D'];

export default function StudentGamePage() {
    const [state] = useState(studentGameState);
    const [timeLeft, setTimeLeft] = useState(state.timeLeft);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showMascot, setShowMascot] = useState(true);

    // Timer simulation
    useEffect(() => {
        if (timeLeft <= 0 || selectedAnswer !== null) return;
        const timer = setInterval(() => {
            setTimeLeft((t) => Math.max(0, t - 1));
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft, selectedAnswer]);

    const handleAnswer = useCallback((idx) => {
        if (selectedAnswer !== null) return;
        setSelectedAnswer(idx);
        setShowMascot(true);
    }, [selectedAnswer]);

    const timerPercent = (timeLeft / state.timeTotal) * 100;
    const isUrgent = timeLeft <= 5;

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-brand-navy to-brand-blue flex flex-col">
            {/* ── Top Bar: Score + Streak + Timer ── */}
            <header className="px-6 py-4">
                <div className="flex items-center justify-between max-w-3xl mx-auto">
                    {/* Score */}
                    <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-amber-400" />
                        <span className="text-lg font-bold text-white">{state.score}</span>
                    </div>

                    {/* Question counter */}
                    <div className="text-sm font-semibold text-white/70">
                        {state.questionNumber} / {state.totalQuestions}
                    </div>

                    {/* Streak */}
                    <div className="flex items-center gap-1.5">
                        <Flame className="w-5 h-5 text-orange-400" />
                        <span className="text-sm font-bold text-orange-300">{state.streak}x</span>
                    </div>
                </div>

                {/* Timer bar */}
                <div className="max-w-3xl mx-auto mt-3">
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-1000 ease-linear
                          ${isUrgent ? 'bg-rose-500 animate-pulse' : 'bg-gradient-to-r from-brand-mid to-brand-light'}`}
                            style={{ width: `${timerPercent}%` }}
                        />
                    </div>
                    <div className="flex justify-end mt-1">
                        <span className={`text-xs font-bold ${isUrgent ? 'text-rose-400' : 'text-white/60'}`}>
                            {timeLeft}s
                        </span>
                    </div>
                </div>
            </header>

            {/* ── Question ── */}
            <main className="flex-1 flex flex-col items-center justify-center px-6 py-8 max-w-3xl mx-auto w-full">
                <h1 className="text-2xl md:text-3xl font-bold text-white text-center leading-relaxed mb-10">
                    {state.question}
                </h1>

                {/* ── Answer Buttons ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                    {state.options.map((option, idx) => {
                        const isSelected = selectedAnswer === idx;
                        const isCorrect = idx === 0; // mock: first option is always correct

                        return (
                            <button
                                key={idx}
                                onClick={() => handleAnswer(idx)}
                                disabled={selectedAnswer !== null}
                                className={`relative flex items-center gap-4 px-6 py-5 rounded-2xl text-left
                           text-white font-semibold text-lg
                           transition-all duration-300 shadow-lg
                           ${selectedAnswer !== null
                                        ? isSelected
                                            ? isCorrect
                                                ? 'bg-emerald-500 scale-105 ring-4 ring-emerald-300/40'
                                                : 'bg-rose-600 scale-95 opacity-70'
                                            : isCorrect
                                                ? 'bg-emerald-500 opacity-80'
                                                : 'opacity-40 scale-95'
                                        : `${optionColors[idx].bg} ${optionColors[idx].shadow} hover:scale-[1.02] hover:shadow-xl active:scale-95`
                                    }`}
                                aria-label={`Option ${optionLabels[idx]}: ${option}`}
                            >
                                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-base font-bold flex-shrink-0">
                                    {optionLabels[idx]}
                                </div>
                                <span>{option}</span>

                                {selectedAnswer !== null && isSelected && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        {isCorrect ? (
                                            <Trophy className="w-6 h-6 text-white" />
                                        ) : (
                                            <span className="text-2xl">✗</span>
                                        )}
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </main>

            {/* ── Mascot Bubble ── */}
            {showMascot && selectedAnswer !== null && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-bounce">
                    <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white shadow-gamma-float">
                        <span className="text-3xl">
                            {selectedAnswer === 0 ? '🎉' : '💪'}
                        </span>
                        <div>
                            <p className="text-sm font-bold text-ink">
                                {selectedAnswer === 0 ? 'Correct! Amazing!' : "Don't worry!"}
                            </p>
                            <p className="text-xs text-ink-muted">
                                {selectedAnswer === 0 ? "You're on a roll! Keep it going! 🔥" : "You'll get the next one! Stay focused."}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
