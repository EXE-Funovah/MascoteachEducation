import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthInput from '@/components/auth/AuthInput';
import GoogleLogo from '@/components/auth/GoogleLogo';

export default function SignUpPage() {
    const [form, setForm] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    function update(field) {
        return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
    }

    function handleSubmit(e) {
        e.preventDefault();
        // TODO: integrate real auth
        console.log('Sign Up →', form);
    }

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

            <form onSubmit={handleSubmit} className="space-y-5">
                <AuthInput
                    id="signup-fullname"
                    label="Full Name"
                    placeholder="Nguyễn Văn A"
                    value={form.fullName}
                    onChange={update('fullName')}
                />

                <AuthInput
                    id="signup-email"
                    label="Email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={update('email')}
                />

                <AuthInput
                    id="signup-password"
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={update('password')}
                />

                <AuthInput
                    id="signup-confirm"
                    label="Confirm Password"
                    type="password"
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={update('confirmPassword')}
                />

                {/* Primary CTA */}
                <motion.button
                    type="submit"
                    className="auth-btn auth-btn--primary"
                    whileHover={{ scale: 1.015, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                >
                    Create Account
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
