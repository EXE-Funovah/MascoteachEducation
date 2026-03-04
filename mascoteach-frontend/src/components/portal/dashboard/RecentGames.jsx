import { Clock, Users, Trophy, ArrowRight } from 'lucide-react';
import { recentGames } from '@/data/mockData';

/**
 * RecentGames — Table of recent game sessions on the dashboard
 * Clean, scannable layout with status badges and quick actions
 */
const modeColors = {
    'Quiz Battle': 'bg-blue-100 text-blue-700',
    'Speed Rush': 'bg-amber-100 text-amber-700',
    'Team Arena': 'bg-emerald-100 text-emerald-700',
    'Treasure Mode': 'bg-purple-100 text-purple-700',
    'Survival Mode': 'bg-rose-100 text-rose-700',
};

export default function RecentGames() {
    return (
        <section className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <header className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <h2 className="text-base font-bold text-ink">Recent Games</h2>
                <button className="flex items-center gap-1.5 text-sm font-semibold text-brand-blue hover:text-brand-navy transition-colors">
                    View all <ArrowRight className="w-4 h-4" />
                </button>
            </header>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-slate-50/80">
                            <th className="text-left px-6 py-3 font-semibold text-ink-muted text-xs uppercase tracking-wider">Game</th>
                            <th className="text-left px-6 py-3 font-semibold text-ink-muted text-xs uppercase tracking-wider">Mode</th>
                            <th className="text-left px-6 py-3 font-semibold text-ink-muted text-xs uppercase tracking-wider">Players</th>
                            <th className="text-left px-6 py-3 font-semibold text-ink-muted text-xs uppercase tracking-wider">Avg Score</th>
                            <th className="text-left px-6 py-3 font-semibold text-ink-muted text-xs uppercase tracking-wider">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {recentGames.map((game) => (
                            <tr key={game.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer group">
                                <td className="px-6 py-4">
                                    <p className="font-semibold text-ink group-hover:text-brand-blue transition-colors">{game.title}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold ${modeColors[game.mode] || 'bg-slate-100 text-slate-700'}`}>
                                        {game.mode}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1.5 text-ink-secondary">
                                        <Users className="w-3.5 h-3.5" />
                                        {game.players}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1.5">
                                        <Trophy className="w-3.5 h-3.5 text-amber-500" />
                                        <span className="font-semibold text-ink">{game.avgScore}%</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1.5 text-ink-muted text-xs">
                                        <Clock className="w-3.5 h-3.5" />
                                        {new Date(game.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
