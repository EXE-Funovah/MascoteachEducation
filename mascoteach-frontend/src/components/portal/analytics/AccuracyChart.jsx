import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

/**
 * AccuracyChart — Bar chart showing accuracy percentage per question
 * Color-coded: green (>80%), amber (60-80%), red (<60%)
 */
const getBarColor = (accuracy) => {
    if (accuracy >= 80) return '#059669';
    if (accuracy >= 60) return '#D97706';
    return '#DC2626';
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
        return (
            <div className="bg-white/95 backdrop-blur-sm px-4 py-3 rounded-xl border border-slate-200 shadow-gamma-card">
                <p className="text-xs font-bold text-ink mb-1">{label}</p>
                <p className="text-sm font-semibold" style={{ color: getBarColor(payload[0].value) }}>
                    {payload[0].value}% accuracy
                </p>
            </div>
        );
    }
    return null;
};

export default function AccuracyChart({ data }) {
    return (
        <section className="bg-white rounded-2xl border border-slate-100 p-6">
            <h3 className="text-sm font-bold text-ink mb-6">Accuracy by Question</h3>
            <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} barCategoryGap="20%">
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                        <XAxis
                            dataKey="question"
                            tick={{ fontSize: 12, fill: '#94A3B8' }}
                            axisLine={{ stroke: '#E2E8F0' }}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fontSize: 12, fill: '#94A3B8' }}
                            axisLine={false}
                            tickLine={false}
                            domain={[0, 100]}
                            ticks={[0, 25, 50, 75, 100]}
                            tickFormatter={(v) => `${v}%`}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)', radius: 8 }} />
                        <Bar dataKey="accuracy" radius={[6, 6, 0, 0]}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={getBarColor(entry.accuracy)} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </section>
    );
}
