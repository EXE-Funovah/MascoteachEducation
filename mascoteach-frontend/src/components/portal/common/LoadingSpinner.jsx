import { Loader2 } from 'lucide-react';

/**
 * LoadingSpinner — Reusable loading indicator
 * Uses brand gradient for the spinner color
 */
export default function LoadingSpinner({ size = 'md', text = 'Loading...' }) {
    const sizes = {
        sm: 'w-5 h-5',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
    };

    return (
        <div className="flex flex-col items-center justify-center gap-3 py-12" role="status" aria-label="Loading">
            <Loader2 className={`${sizes[size]} text-brand-blue animate-spin`} />
            {text && <p className="text-sm text-ink-muted font-medium">{text}</p>}
        </div>
    );
}
