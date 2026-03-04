import { cn } from '@/lib/utils';

/**
 * Minimalist input field for auth forms.
 * Supports label above, placeholder inside, and focus-glow effect.
 */
export default function AuthInput({
    id,
    label,
    type = 'text',
    placeholder,
    required = true,
    className,
    ...props
}) {
    return (
        <div className={cn('space-y-2', className)}>
            {label && (
                <label
                    htmlFor={id}
                    className="block text-sm font-medium text-slate-700"
                >
                    {label}
                </label>
            )}
            <input
                id={id}
                name={id}
                type={type}
                placeholder={placeholder}
                required={required}
                className={cn(
                    'auth-input',
                )}
                {...props}
            />
        </div>
    );
}
