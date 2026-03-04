import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

/**
 * EngagementChart — Area chart showing daily engagement time
 * Uses brand gradient fill for visual consistency
 */
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
        return (
            <div className="bg-white/95 backdrop-blur-sm px-4 py-3 rounded-xl border border-slate-200 shadow-gamma-card">
                <p className="text-xs font-bold text-ink mb-1">{label}</p>
                <p className="text-sm font-semibold text-brand-blue">{payload[0].value} min</p>
            </div>
        );
    }
    return null;
};

export default function EngagementChart({ data }) {
    return (
        <section className="bg-white rounded-2xl border border-slate-100 p-6">
            <h3 className="text-sm font-bold text-ink mb-6">Engagement Time</h3>
            <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="engagementGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2B7AB5" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#2B7AB5" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                        <XAxis
                            dataKey="day"
                            tick={{ fontSize: 12, fill: '#94A3B8' }}
                            axisLine={{ stroke: '#E2E8F0' }}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fontSize: 12, fill: '#94A3B8' }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(v) => `${v}m`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="minutes"
                            stroke="#2B7AB5"
                            strokeWidth={2.5}
                            fill="url(#engagementGrad)"
                            dot={{ fill: '#2B7AB5', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, fill: '#1B3A6B', stroke: '#2B7AB5', strokeWidth: 2 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </section>
    );
}
