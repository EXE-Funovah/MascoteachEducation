import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthInput from '@/components/auth/AuthInput';
import GoogleLogo from '@/components/auth/GoogleLogo';
import { useAuth } from '@/contexts/AuthContext';

export default function SignUpPage() {
    const [form, setForm] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [localError, setLocalError] = useState('');

    const { register, error, clearError } = useAuth();
    const navigate = useNavigate();

    function update(field) {
        return (e) => {
            setForm((prev) => ({ ...prev, [field]: e.target.value }));
            setLocalError('');
            clearError();
        };
    }

    async function handleSubmit(e) {
        e.preventDefault();
        clearError();
        setLocalError('');

        // Client-side validation
        if (!form.fullName || !form.email || !form.password) {
            setLocalError('Vui lòng điền đầy đủ thông tin.');
            return;
        }

        if (form.password !== form.confirmPassword) {
            setLocalError('Mật khẩu xác nhận không khớp.');
            return;
        }

        if (form.password.length < 6) {
            setLocalError('Mật khẩu phải có ít nhất 6 ký tự.');
            return;
        }

        setSubmitting(true);
        try {
            await register({
                fullName: form.fullName,
                email: form.email,
                password: form.password,
                role: 'Teacher',
            });
            // Registration successful — navigate to login
            navigate('/login', {
                state: { message: 'Đăng ký thành công! Vui lòng đăng nhập.' }
            });
        } catch {
            // Error is already set in AuthContext
        } finally {
            setSubmitting(false);
        }
    }

    const displayError = localError || error;

    return (
        <AuthLayout>
            <header className="text-center mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                    Start your journey with Mascoteach
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                    Tạo tài khoản để trải nghiệm lớp học thông minh.
                </p>
            </header>

            {/* Error message */}
            {displayError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-600 text-center"
                    role="alert">
                    {displayError}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <AuthInput
                    id="signup-fullname"
                    label="Full Name"
                    placeholder="Nguyễn Văn A"
                    value={form.fullName}
                    onChange={update('fullName')}
                    required
                />

                <AuthInput
                    id="signup-email"
                    label="Email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={update('email')}
                    required
                />

                <AuthInput
                    id="signup-password"
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={update('password')}
                    required
                />

                <AuthInput
                    id="signup-confirm"
                    label="Confirm Password"
                    type="password"
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={update('confirmPassword')}
                    required
                />

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
                            Đang tạo tài khoản...
                        </span>
                    ) : (
                        'Create Account'
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

            {/* Terms */}
            <p className="mt-6 text-center text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                By signing up, you agree to our{' '}
                <a href="#" className="underline hover:text-brand-blue transition-colors">Terms of Service</a>{' '}
                and{' '}
                <a href="#" className="underline hover:text-brand-blue transition-colors">Privacy Policy</a>.
            </p>

            {/* Login nudge */}
            <p className="mt-4 text-center text-sm text-slate-500">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-brand-blue hover:text-brand-navy transition-colors">
                    Login
                </Link>
            </p>
        </AuthLayout>
    );
}
