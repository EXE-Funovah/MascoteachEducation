import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthInput from '@/components/auth/AuthInput';
import GoogleLogo from '@/components/auth/GoogleLogo';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const { login, error, clearError } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Where to redirect after login
    const from = location.state?.from?.pathname || '/portal';

    async function handleSubmit(e) {
        e.preventDefault();
        clearError();

        if (!email || !password) return;

        setSubmitting(true);
        try {
            await login(email, password);
            navigate(from, { replace: true });
        } catch {
            // Error is already set in AuthContext
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <AuthLayout>
            <header className="text-center mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                    Welcome Mascoteach
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                    Đăng nhập để tiếp tục trải nghiệm lớp học thông minh.
                </p>
            </header>

            {/* Error message */}
            {error && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-600 text-center"
                    role="alert">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <AuthInput
                    id="login-email"
                    label="Email Address"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <AuthInput
                    id="login-password"
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                {/* Remember + Forgot */}
                <div className="flex items-center justify-between">
                    <label htmlFor="remember-me" className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                            id="remember-me"
                            type="checkbox"
                            checked={remember}
                            onChange={(e) => setRemember(e.target.checked)}
                            className="auth-checkbox"
                        />
                        <span className="text-sm text-slate-500">Remember me</span>
                    </label>

                    <Link
                        to="/forgot-password"
                        className="text-sm font-semibold text-brand-blue hover:text-brand-navy transition-colors"
                    >
                        Forgot password?
                    </Link>
                </div>

                {/* Primary CTA */}
                <motion.button
                    type="submit"
                    className="auth-btn auth-btn--primary disabled:opacity-60 disabled:cursor-not-allowed"
                    whileHover={!submitting ? { scale: 1.015, y: -1 } : {}}
                    whileTap={!submitting ? { scale: 0.98 } : {}}
                    disabled={submitting}
                >
                    {submitting ? (
                        <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Đang đăng nhập...
                        </span>
                    ) : (
                        'Login'
                    )}
                </motion.button>

                {/* Divider */}
                <div className="flex items-center gap-4">
                    <span className="flex-1 h-px bg-slate-200" />
                    <span className="text-xs text-slate-400 font-medium">or</span>
                    <span className="flex-1 h-px bg-slate-200" />
                </div>

                {/* Google */}
                <motion.button
                    type="button"
                    className="auth-btn auth-btn--google"
                    whileHover={{ scale: 1.015, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <GoogleLogo />
                    Continue with Google
                </motion.button>
            </form>

            {/* Sign up nudge */}
            <p className="mt-8 text-center text-sm text-slate-500">
                Don't have an account?{' '}
                <Link to="/signup" className="font-semibold text-brand-blue hover:text-brand-navy transition-colors">
                    Sign up
                </Link>
            </p>
        </AuthLayout>
    );
}
