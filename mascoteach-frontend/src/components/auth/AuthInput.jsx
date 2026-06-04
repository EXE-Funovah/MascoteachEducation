import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
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
    showPasswordToggle = false,
    className,
    ...props
}) {
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordToggle = showPasswordToggle && type === 'password';
    const inputType = isPasswordToggle && showPassword ? 'text' : type;

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
            <div className={cn(isPasswordToggle && 'auth-password-field')}>
                <input
                    id={id}
                    name={id}
                    type={inputType}
                    placeholder={placeholder}
                    required={required}
                    className={cn(
                        'auth-input',
                        isPasswordToggle && 'auth-input--password',
                    )}
                    {...props}
                />
                {isPasswordToggle && (
                    <button
                        type="button"
                        className="auth-password-toggle"
                        onClick={() => setShowPassword((value) => !value)}
                        aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                        title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                        {showPassword ? (
                            <EyeOff size={19} strokeWidth={2.1} />
                        ) : (
                            <Eye size={19} strokeWidth={2.1} />
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}
