import { useState } from 'react';
import { Gamepad2, Search } from 'lucide-react';
import GameModeCard from '@/components/portal/games/GameModeCard';
import { gameModes } from '@/data/mockData';

/**
 * GameModesPage — Grid selection of available game modes
 * Filter by play style, search by name
 */
const playStyles = ['All', 'Individual', 'Team', 'Strategy'];

export default function GameModesPage() {
    const [activeFilter, setActiveFilter] = useState('All');
    const [search, setSearch] = useState('');

    const filtered = gameModes.filter((m) => {
        const matchesFilter = activeFilter === 'All' || m.playStyle === activeFilter;
        const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const handleSelect = (mode) => {
        // In a real app, this would navigate to a game config screen
        alert(`Selected: ${mode.name}\n\nThis would open the game configuration screen.`);
    };

    return (
        <div className="space-y-8">
            {/* ── Page Header ── */}
            <header>
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-navy to-brand-blue flex items-center justify-center shadow-md">
                        <Gamepad2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-ink">Choose Game Mode</h1>
                        <p className="text-sm text-ink-muted">Select a game mode to create a live session for your students</p>
                    </div>
                </div>
            </header>

            {/* ── Filters & Search ── */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                {/* Play style tabs */}
                <div className="flex items-center gap-2">
                    {playStyles.map((style) => (
                        <button
                            key={style}
                            onClick={() => setActiveFilter(style)}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200
                          ${activeFilter === style
                                    ? 'bg-brand-navy text-white shadow-gamma-btn'
                                    : 'bg-white text-ink-secondary border border-slate-200 hover:border-brand-mid hover:text-brand-blue'
                                }`}
                        >
                            {style}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search game modes..."
                        className="pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-ink
                       placeholder:text-ink-muted focus:outline-none focus:border-brand-mid
                       focus:ring-2 focus:ring-brand-mid/20 transition-all duration-200 w-64"
                    />
                </div>
            </div>

            {/* ── Game Mode Grid ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map((mode) => (
                    <GameModeCard key={mode.id} mode={mode} onSelect={handleSelect} />
                ))}
            </div>

            {/* Empty state */}
            {filtered.length === 0 && (
                <div className="flex flex-col items-center py-16">
                    <Gamepad2 className="w-12 h-12 text-ink-muted/40 mb-4" />
                    <p className="text-sm text-ink-muted">No game modes match your search.</p>
                </div>
            )}
        </div>
    );
}
