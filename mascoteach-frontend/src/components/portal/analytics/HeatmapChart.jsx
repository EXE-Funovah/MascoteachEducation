/**
 * HeatmapChart — Custom heatmap showing question difficulty distribution
 * Each cell is colored by score value: green (high) → red (low)
 */
const getHeatColor = (value) => {
    if (value >= 85) return 'bg-emerald-400 text-emerald-950';
    if (value >= 70) return 'bg-emerald-300 text-emerald-900';
    if (value >= 55) return 'bg-amber-300 text-amber-900';
    if (value >= 40) return 'bg-orange-400 text-orange-950';
    return 'bg-rose-400 text-rose-950';
};

export default function HeatmapChart({ data }) {
    const difficulties = ['easy', 'medium', 'hard'];

    return (
        <section className="bg-white rounded-2xl border border-slate-100 p-6">
            <h3 className="text-sm font-bold text-ink mb-6">Difficulty Heatmap</h3>

            {/* Column headers */}
            <div className="grid gap-1.5" style={{ gridTemplateColumns: '80px repeat(3, 1fr)' }}>
                <div />
                {difficulties.map((d) => (
                    <div key={d} className="text-center text-xs font-semibold text-ink-muted uppercase tracking-wider py-2 capitalize">
                        {d}
                    </div>
                ))}

                {/* Rows */}
                {data.map((row) => (
                    <div key={row.question} className="contents">
                        <div className="flex items-center text-xs font-semibold text-ink-secondary py-2 px-2">
                            {row.question}
                        </div>
                        {difficulties.map((d) => (
                            <div
                                key={`${row.question}-${d}`}
                                className={`flex items-center justify-center rounded-lg py-3 text-sm font-bold
                           transition-all duration-200 hover:scale-105 hover:shadow-md cursor-default
                           ${getHeatColor(row[d])}`}
                            >
                                {row[d]}%
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-slate-50">
                <div className="flex items-center gap-6 text-xs text-ink-muted">
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded bg-emerald-400" />
                        <span>High (85%+)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded bg-amber-300" />
                        <span>Medium (55-84%)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded bg-rose-400" />
                        <span>Low (&lt;55%)</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
