import { History, Users, Trophy, Clock, Calendar, Search, Filter, BarChart3 } from 'lucide-react';
import { sessionsHistory } from '@/data/mockData';
import { Link } from 'react-router-dom';

/**
 * SessionsPage — History of past game sessions
 * Searchable, filterable list with key metrics per session
 */
const modeColors = {
    'Quiz Battle': 'bg-blue-100 text-blue-700',
    'Speed Rush': 'bg-amber-100 text-amber-700',
    'Team Arena': 'bg-emerald-100 text-emerald-700',
    'Treasure Mode': 'bg-purple-100 text-purple-700',
    'Survival Mode': 'bg-rose-100 text-rose-700',
};

export default function SessionsPage() {
    return (
        <div className="space-y-8">
            {/* ── Page Header ── */}
            <header className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-navy to-brand-blue flex items-center justify-center shadow-md">
                        <History className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-ink">Sessions</h1>
                        <p className="text-sm text-ink-muted">Review past game sessions and performance</p>
                    </div>
                </div>

                <Link
                    to="/portal/analytics"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                     text-brand-blue bg-brand-light/15 border border-brand-light/30
                     hover:bg-brand-light/25 transition-colors"
                >
                    <BarChart3 className="w-4 h-4" /> View Analytics
                </Link>
            </header>

            {/* ── Search & Filter Bar ── */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
                    <input
                        type="text"
                        placeholder="Search sessions..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-ink
                       placeholder:text-ink-muted focus:outline-none focus:border-brand-mid
                       focus:ring-2 focus:ring-brand-mid/20 transition-all duration-200"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white
                           text-sm font-medium text-ink-secondary hover:bg-slate-50 transition-colors">
                    <Filter className="w-4 h-4" /> Filter
                </button>
            </div>

            {/* ── Sessions List ── */}
            <div className="space-y-3">
                {sessionsHistory.map((session) => (
                    <article
                        key={session.id}
                        className="rounded-2xl bg-white border border-slate-100 p-5
                       hover:shadow-gamma-card hover:border-slate-200
                       transition-all duration-200 cursor-pointer group"
                    >
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            {/* Left: Title & mode */}
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-bold text-ink group-hover:text-brand-navy transition-colors truncate">
                                    {session.title}
                                </h3>
                                <div className="flex items-center gap-3 mt-2">
                                    <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold ${modeColors[session.mode]}`}>
                                        {session.mode}
                                    </span>
                                    <span className="flex items-center gap-1 text-xs text-ink-muted">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                </div>
                            </div>

                            {/* Right: Stats */}
                            <div className="flex items-center gap-6">
                                <div className="text-center">
                                    <div className="flex items-center gap-1 text-sm font-bold text-ink">
                                        <Users className="w-4 h-4 text-brand-mid" />
                                        {session.players}
                                    </div>
                                    <p className="text-[10px] text-ink-muted mt-0.5">Players</p>
                                </div>
                                <div className="text-center">
                                    <div className="flex items-center gap-1 text-sm font-bold text-ink">
                                        <Trophy className="w-4 h-4 text-amber-500" />
                                        {session.avgScore}%
                                    </div>
                                    <p className="text-[10px] text-ink-muted mt-0.5">Avg Score</p>
                                </div>
                                <div className="text-center">
                                    <div className="flex items-center gap-1 text-sm font-bold text-ink">
                                        <Clock className="w-4 h-4 text-emerald-500" />
                                        {session.duration}
                                    </div>
                                    <p className="text-[10px] text-ink-muted mt-0.5">Duration</p>
                                </div>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
}
