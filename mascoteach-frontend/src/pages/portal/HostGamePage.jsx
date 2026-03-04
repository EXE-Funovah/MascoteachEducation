import { useState } from 'react';
import HostHeader from '@/components/portal/host/HostHeader';
import HostLeaderboard from '@/components/portal/host/HostLeaderboard';
import HostControls from '@/components/portal/host/HostControls';
import { hostPlayers, currentHostQuestion } from '@/data/mockData';
import { CheckCircle2, Clock } from 'lucide-react';

/**
 * HostGamePage — Teacher's live game control panel
 * Layout: Header → [Question Preview | Leaderboard] → Controls
 * This is the teacher's view during an active game session
 */
export default function HostGamePage() {
    const [gameStarted, setGameStarted] = useState(true);
    const q = currentHostQuestion;

    return (
        <div className="space-y-6">
            {/* ── Header: PIN + Players + Start ── */}
            <HostHeader
                pin="482 915"
                playerCount={hostPlayers.length}
                totalPlayers={40}
                isLive={gameStarted}
                onStart={() => setGameStarted(true)}
            />

            {/* ── Main Content: Question + Leaderboard ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Current Question Preview (2 cols) */}
                <section className="lg:col-span-2 space-y-6">
                    {/* Progress bar */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-5">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
                                Game Progress
                            </span>
                            <span className="text-sm font-bold text-ink">
                                Question {q.number} <span className="text-ink-muted font-normal">of {q.total}</span>
                            </span>
                        </div>
                        <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-brand-navy to-brand-mid transition-all duration-700"
                                style={{ width: `${(q.number / q.total) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Question card */}
                    <article className="bg-white rounded-2xl border border-slate-100 p-8">
                        <div className="flex items-center justify-between mb-6">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-brand-navy/10 text-xs font-semibold text-brand-navy">
                                <span>Q{q.number}</span>
                            </span>
                            <div className="flex items-center gap-4 text-sm text-ink-muted">
                                <div className="flex items-center gap-1.5">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                    <span className="font-semibold text-ink">{q.answeredCount}</span>/{q.totalPlayers} answered
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Clock className="w-4 h-4 text-amber-500" />
                                    <span className="font-semibold text-ink">{q.timeLimit}s</span>
                                </div>
                            </div>
                        </div>

                        <h2 className="text-xl font-bold text-ink mb-6 leading-relaxed">
                            {q.question}
                        </h2>

                        {/* Answer options grid */}
                        <div className="grid grid-cols-2 gap-3">
                            {q.options.map((option, idx) => {
                                const optionColors = [
                                    'bg-blue-50 border-blue-200 text-blue-800',
                                    'bg-rose-50 border-rose-200 text-rose-800',
                                    'bg-amber-50 border-amber-200 text-amber-800',
                                    'bg-emerald-50 border-emerald-200 text-emerald-800',
                                ];
                                const optionLabels = ['A', 'B', 'C', 'D'];

                                return (
                                    <div
                                        key={idx}
                                        className={`flex items-center gap-3 px-5 py-4 rounded-xl border-2 
                                ${idx === q.correctAnswer ? 'ring-2 ring-emerald-400 ring-offset-2' : ''}
                                ${optionColors[idx]} transition-all duration-200`}
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-white/60 flex items-center justify-center text-sm font-bold">
                                            {optionLabels[idx]}
                                        </div>
                                        <span className="font-semibold text-sm">{option}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </article>
                </section>

                {/* Right: Leaderboard (1 col) */}
                <HostLeaderboard players={hostPlayers} />
            </div>

            {/* ── Bottom Controls ── */}
            <HostControls
                onPause={(paused) => console.log('Paused:', paused)}
                onSkip={() => console.log('Skipped question')}
                onEnd={() => console.log('Game ended')}
            />
        </div>
    );
}
