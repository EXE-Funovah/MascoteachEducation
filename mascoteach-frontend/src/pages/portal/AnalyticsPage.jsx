import { BarChart3, Trophy, TrendingUp } from 'lucide-react';
import AccuracyChart from '@/components/portal/analytics/AccuracyChart';
import EngagementChart from '@/components/portal/analytics/EngagementChart';
import HeatmapChart from '@/components/portal/analytics/HeatmapChart';
import {
    accuracyByQuestion,
    studentRankings,
    engagementData,
    difficultyHeatmap,
} from '@/data/mockData';

/**
 * AnalyticsPage — Data visualization dashboard
 * Charts: Accuracy by question, Student ranking table,
 * Engagement time, and Difficulty heatmap
 */
const medalColors = {
    '🏆': 'bg-amber-100 text-amber-800',
    '🥈': 'bg-slate-100 text-slate-700',
    '🥉': 'bg-amber-50 text-amber-700',
};

export default function AnalyticsPage() {
    return (
        <div className="space-y-8">
            {/* ── Page Header ── */}
            <header>
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-navy to-brand-blue flex items-center justify-center shadow-md">
                        <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-ink">Analytics</h1>
                        <p className="text-sm text-ink-muted">Track performance and engagement across your sessions</p>
                    </div>
                </div>
            </header>

            {/* ── Summary Stats ── */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: 'Avg Accuracy', value: '78%', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-100' },
                    { label: 'Top Student', value: 'Alex T.', icon: Trophy, color: 'text-amber-600', bg: 'bg-amber-100' },
                    { label: 'Total Questions', value: '156', icon: BarChart3, color: 'text-brand-blue', bg: 'bg-blue-100' },
                ].map((s) => (
                    <div key={s.label} className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-slate-100">
                        <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center`}>
                            <s.icon className={`w-5 h-5 ${s.color}`} />
                        </div>
                        <div>
                            <p className="text-xs text-ink-muted font-medium">{s.label}</p>
                            <p className="text-xl font-bold text-ink">{s.value}</p>
                        </div>
                    </div>
                ))}
            </section>

            {/* ── Charts Row 1 ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AccuracyChart data={accuracyByQuestion} />
                <EngagementChart data={engagementData} />
            </div>

            {/* ── Charts Row 2 ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Student Rankings Table */}
                <section className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                    <header className="flex items-center gap-2 px-6 py-4 border-b border-slate-100">
                        <Trophy className="w-5 h-5 text-amber-500" />
                        <h3 className="text-sm font-bold text-ink">Student Rankings</h3>
                    </header>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50/80">
                                    <th className="text-left px-6 py-2.5 text-xs font-semibold text-ink-muted uppercase tracking-wider">Rank</th>
                                    <th className="text-left px-6 py-2.5 text-xs font-semibold text-ink-muted uppercase tracking-wider">Student</th>
                                    <th className="text-left px-6 py-2.5 text-xs font-semibold text-ink-muted uppercase tracking-wider">Avg Score</th>
                                    <th className="text-left px-6 py-2.5 text-xs font-semibold text-ink-muted uppercase tracking-wider">Games</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {studentRankings.map((student) => (
                                    <tr key={student.rank} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-2">
                                                {student.badge ? (
                                                    <span className="text-lg">{student.badge}</span>
                                                ) : (
                                                    <span className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-ink-muted">
                                                        {student.rank}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 font-semibold text-ink">{student.name}</td>
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-ink">{student.avgScore}%</span>
                                                <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full bg-gradient-to-r from-brand-navy to-brand-mid"
                                                        style={{ width: `${student.avgScore}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 text-ink-secondary">{student.gamesPlayed}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Difficulty Heatmap */}
                <HeatmapChart data={difficultyHeatmap} />
            </div>
        </div>
    );
}
