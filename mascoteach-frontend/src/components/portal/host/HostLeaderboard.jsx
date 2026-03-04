import { Trophy, Flame } from 'lucide-react';

/**
 * HostLeaderboard — Right panel showing live player rankings
 * Features: medal icons for top 3, streak flames, and score bars
 */
const medalColors = ['text-amber-500', 'text-slate-400', 'text-amber-700'];
const medalBg = ['bg-amber-50', 'bg-slate-50', 'bg-amber-50/60'];

export default function HostLeaderboard({ players }) {
    const maxScore = Math.max(...players.map((p) => p.score), 1);

    return (
        <section className="bg-white rounded-2xl border border-slate-100 overflow-hidden h-full">
            <header className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-bold text-ink">Leaderboard</h3>
            </header>

            <div className="divide-y divide-slate-50 max-h-[480px] overflow-y-auto">
                {players.map((player, idx) => (
                    <div
                        key={player.id}
                        className={`flex items-center gap-3 px-5 py-3 transition-colors hover:bg-slate-50/50
                        ${idx < 3 ? medalBg[idx] : ''}`}
                    >
                        {/* Rank */}
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold
                            ${idx < 3
                                ? `bg-gradient-to-br from-brand-navy to-brand-blue text-white`
                                : 'bg-slate-100 text-ink-muted'
                            }`}>
                            {idx + 1}
                        </div>

                        {/* Avatar */}
                        <span className="text-xl" role="img" aria-label={`${player.name}'s avatar`}>
                            {player.avatar}
                        </span>

                        {/* Name + score bar */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-semibold text-ink truncate">{player.name}</span>
                                <div className="flex items-center gap-1.5">
                                    {player.streak >= 3 && (
                                        <div className="flex items-center gap-0.5">
                                            <Flame className="w-3.5 h-3.5 text-orange-500" />
                                            <span className="text-[10px] font-bold text-orange-600">{player.streak}</span>
                                        </div>
                                    )}
                                    <span className="text-xs font-bold text-ink-secondary">{player.score}</span>
                                </div>
                            </div>
                            {/* Score progress bar */}
                            <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-brand-navy to-brand-mid transition-all duration-500"
                                    style={{ width: `${(player.score / maxScore) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
