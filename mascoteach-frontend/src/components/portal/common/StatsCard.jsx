import { TrendingUp, TrendingDown } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

/**
 * StatsCard — Dashboard metric card
 * Features: gradient icon background, trend indicator, hover lift
 */
export default function StatsCard({ label, value, change, trend, icon }) {
    const IconComponent = LucideIcons[icon] || LucideIcons.BarChart3;

    return (
        <article
            className="relative overflow-hidden rounded-2xl bg-white border border-slate-100
                 p-6 transition-all duration-300 ease-out
                 hover:shadow-gamma-hover hover:-translate-y-0.5 group"
        >
            {/* Decorative gradient corner */}
            <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br from-brand-light/20 to-brand-mid/10 
                      group-hover:scale-125 transition-transform duration-500" />

            <div className="relative flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-ink-muted mb-1">{label}</p>
                    <p className="text-3xl font-bold text-ink tracking-tight">{value}</p>
                    <div className="flex items-center gap-1.5 mt-2">
                        {trend === 'up' ? (
                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                        ) : (
                            <TrendingDown className="w-4 h-4 text-rose-500" />
                        )}
                        <span className={`text-xs font-semibold ${trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {change}
                        </span>
                        <span className="text-xs text-ink-muted">vs last month</span>
                    </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-navy to-brand-blue flex items-center justify-center shadow-md">
                    <IconComponent className="w-6 h-6 text-white" />
                </div>
            </div>
        </article>
    );
}
