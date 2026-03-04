import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthInput from '@/components/auth/AuthInput';
import GoogleLogo from '@/components/auth/GoogleLogo';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);

    function handleSubmit(e) {
        e.preventDefault();
        // TODO: integrate real auth
        console.log('Login →', { email, password, remember });
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

            <form onSubmit={handleSubmit} className="space-y-5">
                <AuthInput
                    id="login-email"
                    label="Email Address"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <AuthInput
                    id="login-password"
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                    className="auth-btn auth-btn--primary"
                    whileHover={{ scale: 1.015, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                >
                    Login
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
