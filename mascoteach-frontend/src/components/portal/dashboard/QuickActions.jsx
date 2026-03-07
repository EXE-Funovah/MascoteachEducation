import { Link } from 'react-router-dom';
import { Sparkles, Gamepad2, Upload, ArrowRight } from 'lucide-react';

/**
 * QuickActions — Dashboard shortcut cards for common flows
 * Each card links to a specific portal page
 */
const actions = [
    {
        to: '/teacher/create',
        icon: Sparkles,
        title: 'Tạo với AI',
        description: 'Tải lên tài liệu và tạo câu hỏi tức thì',
        gradient: 'from-violet-500 to-purple-600',
        bgGlow: 'bg-violet-100',
    },
    {
        to: '/teacher/games',
        icon: Gamepad2,
        title: 'Bắt đầu trò chơi',
        description: 'Chọn chế độ chơi và tổ chức phiên trực tiếp',
        gradient: 'from-brand-navy to-brand-blue',
        bgGlow: 'bg-blue-100',
    },
    {
        to: '/teacher/create',
        icon: Upload,
        title: 'Tải lên câu hỏi',
        description: 'Nhập bộ câu hỏi có sẵn từ file của bạn',
        gradient: 'from-emerald-500 to-teal-600',
        bgGlow: 'bg-emerald-100',
    },
];

export default function QuickActions() {
    return (
        <section>
            <h2 className="text-base font-bold text-ink mb-4">Hành động nhanh</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {actions.map((action) => (
                    <Link
                        key={action.title}
                        to={action.to}
                        className="group relative overflow-hidden rounded-2xl bg-white border border-slate-100
                       p-5 transition-all duration-300 ease-out
                       hover:shadow-gamma-hover hover:-translate-y-0.5"
                    >
                        {/* Decorative glow */}
                        <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full ${action.bgGlow} opacity-50
                            group-hover:opacity-80 group-hover:scale-150 transition-all duration-500`} />

                        <div className="relative">
                            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${action.gradient}
                              flex items-center justify-center mb-4 shadow-md
                              group-hover:scale-105 transition-transform duration-300`}>
                                <action.icon className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-sm font-bold text-ink mb-1 group-hover:text-brand-navy transition-colors">
                                {action.title}
                            </h3>
                            <p className="text-xs text-ink-muted leading-relaxed">{action.description}</p>
                            <div className="flex items-center gap-1 mt-3 text-xs font-semibold text-brand-blue opacity-0 
                              group-hover:opacity-100 transition-all duration-300 translate-x-[-8px] 
                              group-hover:translate-x-0">
                                Bắt đầu <ArrowRight className="w-3.5 h-3.5" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>

    );
}
