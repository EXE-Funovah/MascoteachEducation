import { FileQuestion } from 'lucide-react';

/**
 * EmptyState — Shown when a section has no data
 * Provides a clear message and optional action button
 */
export default function EmptyState({
    icon: Icon = FileQuestion,
    title = 'Nothing here yet',
    description = 'Get started by creating your first item.',
    actionLabel,
    onAction,
}) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-light/30 to-brand-mid/10 flex items-center justify-center mb-5">
                <Icon className="w-8 h-8 text-brand-blue" />
            </div>
            <h3 className="text-lg font-semibold text-ink mb-2">{title}</h3>
            <p className="text-sm text-ink-muted max-w-sm mb-6">{description}</p>
            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white
                     bg-gradient-to-r from-brand-navy to-brand-blue
                     shadow-gamma-btn hover:shadow-gamma-btn-hover
                     transition-all duration-300 hover:brightness-110"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
}
