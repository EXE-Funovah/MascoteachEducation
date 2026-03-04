import * as LucideIcons from 'lucide-react';
import { Clock, Users, ArrowRight } from 'lucide-react';

/**
 * GameModeCard — Individual game mode display card
 * Rich visual with gradient accent, play style tag, and duration estimate
 */
export default function GameModeCard({ mode, onSelect }) {
    const IconComponent = LucideIcons[mode.icon] || LucideIcons.Gamepad2;

    return (
        <article
            className="group relative overflow-hidden rounded-2xl bg-white border border-slate-100
                 transition-all duration-300 ease-out cursor-pointer
                 hover:shadow-gamma-hover hover:-translate-y-1"
            onClick={() => onSelect?.(mode)}
            role="button"
            tabIndex={0}
            aria-label={`Select ${mode.name} game mode`}
            onKeyDown={(e) => e.key === 'Enter' && onSelect?.(mode)}
        >
            {/* ── Gradient Top Bar ── */}
            <div className={`h-2 bg-gradient-to-r ${mode.color}`} />

            <div className="p-6">
                {/* Icon + Title */}
                <div className="flex items-start gap-4 mb-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${mode.color}
                          flex items-center justify-center shadow-lg
                          group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                        <IconComponent className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-ink group-hover:text-brand-navy transition-colors">
                            {mode.name}
                        </h3>
                        {/* Play style badge */}
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold mt-1
                             ${mode.bgColor} ${mode.borderColor} border`}>
                            {mode.playStyle}
                        </span>
                    </div>
                </div>

                {/* Description */}
                <p className="text-sm text-ink-secondary leading-relaxed mb-5">{mode.description}</p>

                {/* Meta info */}
                <div className="flex items-center gap-4 mb-5">
                    <div className="flex items-center gap-1.5 text-xs text-ink-muted">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{mode.duration}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-ink-muted">
                        <Users className="w-3.5 h-3.5" />
                        <span>{mode.players} players</span>
                    </div>
                </div>

                {/* Select button */}
                <button
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
                     text-sm font-semibold text-brand-blue
                     bg-brand-light/15 border border-brand-light/30
                     group-hover:bg-gradient-to-r group-hover:from-brand-navy group-hover:to-brand-blue
                     group-hover:text-white group-hover:border-transparent group-hover:shadow-gamma-btn
                     transition-all duration-300"
                >
                    Select Mode
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
            </div>
        </article>
    );
}
